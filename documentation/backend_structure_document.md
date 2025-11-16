# Backend Structure Document for RasproView AI

## 1. Backend Architecture

### Overall Design
- The backend is built on **Next.js** (App Router) running on Node.js. It uses a file-based routing structure to organize API routes and pages. 
- We follow a **modular** pattern: API logic lives under `/app/api`, user interface under `/components`, business rules in `/lib`, and data handling in `/db`.
- **Drizzle ORM** is used as a thin layer between the application code and the PostgreSQL database, providing type-safe queries and migrations.
- **Docker** and **docker-compose** define the local and production environments, ensuring consistency.

### Support for Scalability, Maintainability, and Performance
- **Serverless Functions** (via Vercel) or containerized Node.js instances allow the backend to scale automatically under load.
- **TypeScript** everywhere enforces strong typing, reducing bugs and making the code easier to maintain.
- The clear **separation of concerns** (routing, UI components, business logic, data access) helps developers work in parallel without conflicts.
- **Caching at the edge** (Vercel’s CDN) and optimized server-side rendering (SSR) ensure fast responses for video pages and dashboards.

## 2. Database Management

### Technologies Used
- Relational database: **PostgreSQL**
- ORM: **Drizzle ORM** for type-safe database interactions
- Migration management: Drizzle’s built-in migration tooling under `/db/migrations`

### Data Handling Practices
- Data is structured in tables representing users, roles, interviews, questions, video responses, and AI analysis results.
- **Connection pooling** is configured in `db/client.ts` to efficiently reuse database connections.
- Environment variables (`.env`) store sensitive credentials (DB URL, AI API keys) outside the codebase.
- Regular **backups** of the PostgreSQL database are scheduled (daily or hourly depending on volume).

## 3. Database Schema

The database is relational and organized into several key tables. Below is a human-readable overview followed by a PostgreSQL schema.

### Human-Readable Schema
- **Users**: Stores user profiles, hashed passwords, and role references (candidate or recruiter).
- **Roles**: Defines available roles and their permissions.
- **Interviews**: Templates created by recruiters, linking to questions and tracking status.
- **Questions**: Individual questions assigned to an interview template.
- **VideoResponses**: Records of candidate-uploaded video answers, linked to a user, interview, and question.
- **AIAnalysisResults**: Structured JSON results of facial, voice, and gesture analysis, linked to a specific video response.
- **Sessions**: Manages user sessions for authentication.

### PostgreSQL Schema (SQL)
```sql
-- Roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Interviews table
CREATE TABLE interviews (
  id SERIAL PRIMARY KEY,
  recruiter_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  order_index INTEGER NOT NULL
);

-- VideoResponses table
CREATE TABLE video_responses (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIAnalysisResults table
CREATE TABLE ai_analysis_results (
  id SERIAL PRIMARY KEY,
  response_id INTEGER NOT NULL REFERENCES video_responses(id) ON DELETE CASCADE,
  result_json JSONB NOT NULL,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. API Design and Endpoints

### RESTful Approach
- We use REST-style endpoints under `/app/api`. Each endpoint handles a single resource or action.
- JSON is the standard request and response format.

### Key Endpoints

| Endpoint                         | Method | Purpose                                                |
| -------------------------------- | ------ | ------------------------------------------------------ |
| `/api/auth/signup`              | POST   | Register a new user (candidate or recruiter)          |
| `/api/auth/login`               | POST   | Authenticate user and create a session token          |
| `/api/auth/logout`              | POST   | Invalidate the user session                            |
| `/api/interviews`               | GET    | List interviews for the recruiter                      |
| `/api/interviews`               | POST   | Create a new interview template                        |
| `/api/interviews/[id]`          | GET    | Get details of a specific interview                    |
| `/api/interviews/[id]/questions`| POST   | Add questions to an interview                          |
| `/api/videos/upload`            | POST   | Handle video file uploads (offloaded to S3)            |
| `/api/videos/[id]/analyze`      | POST   | Trigger AI analysis for a specific video response      |
| `/api/results/[response_id]`    | GET    | Fetch AI analysis results for display                  |

### Communication Flow
1. Frontend calls `/api/auth/login` with credentials.  
2. Upon success, a session token is set in an HTTP-only cookie.  
3. Recruiters create interviews with POST `/api/interviews`.  
4. Candidates fetch questions, record video, and call `/api/videos/upload`.  
5. Backend enqueues a job (BullMQ) for AI analysis.  
6. Worker processes the job, calls third-party AI services, saves results to `ai_analysis_results`.  
7. Recruiter fetches results via `/api/results/[response_id]`.

## 5. Hosting Solutions

- **Primary platform**: Vercel (serverless functions + global edge network)  
  • Automatic scaling under load  
  • Built-in CDN for static assets and SSR responses  
  • Zero-downtime deployments with preview URLs

- **Container setup**: Docker + docker-compose for local development and alternative self-managed deployments  
  • Can be deployed on AWS ECS, DigitalOcean, or any Kubernetes cluster  
  • Ensures consistency between environments

## 6. Infrastructure Components

- **Load Balancer / Edge Network**: Vercel’s global edge network distributes traffic, reducing latency worldwide.  
- **Queue and Workers**: BullMQ (backed by Redis) manages asynchronous video processing and AI analysis jobs. Workers run in separate containers or serverless functions.  
- **Storage**: AWS S3 (or equivalent) stores raw video files, offloading large file handling from the API server.  
- **CDN**: Vercel’s CDN caches static content (scripts, UI assets) and can also cache interview pages.  
- **Cache Layer** (optional): Redis can be used to cache frequently accessed data like interview templates or AI summary snippets.

## 7. Security Measures

- **Authentication & Authorization**  
  • Better Auth handles sign-up, login, and session management.  
  • Role-Based Access Control (RBAC) ensures recruiters only manage their own interviews and candidates only see their own responses.  
  • HTTP-only, secure cookies store session tokens to prevent XSS.

- **Data Encryption**  
  • TLS (HTTPS) encrypts data in transit.  
  • PostgreSQL’s encryption-at-rest (managed by the cloud provider or self-managed tools) protects stored data.

- **Environment Variables**  
  • Sensitive keys (database URL, S3 credentials, AI API keys) are stored in `.env` files or in Vercel’s environment settings.

- **Input Validation & Rate Limiting**  
  • Server-side validation checks file size, format, and video length.  
  • Rate limiting on critical endpoints (login, upload) protects against brute-force and abuse.

- **CORS and CSRF Protection**  
  • CORS is configured to allow only approved origins.  
  • CSRF tokens are used on sensitive POST routes.

## 8. Monitoring and Maintenance

- **Logging & Error Tracking**  
  • Integrated with Sentry (or similar) to capture runtime errors and performance issues.  
  • API logs (via Vercel or a centralized logger) record request details and response times.

- **Performance Monitoring**  
  • Vercel Analytics provides latency metrics for each endpoint.  
  • Database performance is monitored with tools like pgAdmin or a managed DB dashboard.

- **Automated Testing & CI/CD**  
  • GitHub Actions or Vercel’s built-in pipeline runs ESLint, unit tests, and end-to-end tests (Playwright/Cypress) on every pull request.  
  • Successful builds auto-deploy to staging or production.

- **Maintenance Tasks**  
  • Regular database migrations and schema reviews.  
  • Dependency updates via automated tools (Dependabot).  
  • Routine backups of database and S3 buckets.

## 9. Conclusion and Overall Backend Summary

The RasproView AI backend is designed as a scalable, maintainable, and secure foundation for a video-powered interview platform. By leveraging Next.js serverless functions, PostgreSQL with Drizzle ORM, and a clear modular structure, the system supports rapid feature development and stable operations. Containerization with Docker ensures consistency across environments, while hosting on Vercel provides global performance and ease of deployment. 

Key strengths of this backend include:
- Strong type safety and code organization via TypeScript and well-separated modules.  
- Robust data management with relational schemas and migration tooling.  
- Elastic scalability using serverless functions, queues, and worker processes.  
- Comprehensive security controls covering authentication, encryption, and input validation.  

This setup aligns with the goals of RasproView AI by ensuring a reliable, high-performing service for both recruiters and candidates, and lays the groundwork for building advanced AI-driven video analysis features with confidence.