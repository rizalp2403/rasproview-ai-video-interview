# Tech Stack Document

This document outlines the technology choices for the **RasproView AI** video interview platform. It explains each component in everyday language so that anyone—technical or not—can understand why we chose these tools and how they work together.

---

## 1. Frontend Technologies
These technologies power what users see and interact with in their browser.

- **Next.js (App Router)**
  - A React-based framework that handles both server-side rendering (fast first loads) and client-side navigation (smooth page transitions).
  - Ensures video recording and dashboard pages load quickly and feel responsive.

- **React & TypeScript**
  - React lets us build reusable UI components (buttons, forms, tables).
  - TypeScript adds checks that catch errors early (e.g., making sure data types match), which leads to fewer bugs.

- **shadcn/ui**
  - A library of prebuilt, accessible components (cards, inputs, modals) that look professional out of the box.
  - Speeds up UI development and keeps the design consistent.

- **Tailwind CSS**
  - A utility-first styling tool that lets us rapidly customize the look and feel (colors, spacing, typography).
  - Makes it easy to match both light and dark themes to the RasproView AI brand.

- **next-themes**
  - Handles switching between light and dark modes automatically, remembering user preferences.

- **MediaStream API / react-webcam**
  - Built into modern browsers to access the candidate’s camera for recording.
  - We’ll wrap it in a React component (`VideoRecorder`) that guides users through recording.

- **ESLint & Prettier**
  - Automated tools to keep our code style consistent (indenting, quotes, spacing).

- **Accessibility (a11y)**
  - We follow standards (ARIA attributes, keyboard navigation) so that the platform is usable by everyone.

---

## 2. Backend Technologies
These tools handle data storage, business logic, and connecting the frontend to databases and AI services.

- **Node.js & TypeScript**
  - Node.js runs JavaScript on the server.
  - TypeScript ensures our server code is strongly typed, reducing runtime errors.

- **Next.js API Routes**
  - Built-in endpoints under `/app/api` that handle authentication, video uploads, and data fetching.
  - Keeps frontend and backend in the same codebase for easier maintenance.

- **Better Auth**
  - Manages user sign-up, sign-in, and session handling for different roles (Candidates, Recruiters).
  - Protects routes so each user sees only what they’re allowed to see.

- **PostgreSQL**
  - A reliable relational database for storing users, interviews, questions, video responses, and AI analysis results.

- **Drizzle ORM**
  - A tool that generates TypeScript types from our database schema and simplifies queries.
  - Provides compile-time checks, so database queries are less error-prone.

- **Video Upload Pipeline**
  - API endpoints accept video files from the browser.
  - Files are sent directly to a cloud storage service (e.g., AWS S3) for scalability.

- **Background Job Queue (BullMQ or RabbitMQ)**
  - When a video is uploaded, we enqueue a job instead of processing immediately.
  - A separate worker picks up the job to run AI analysis—this keeps the app responsive.

- **AI Analysis Services**
  - A `/services/ai_analyzer.ts` module that talks to third-party AI APIs (facial expression, speech analysis, gesture detection).
  - Structured results are stored back in PostgreSQL.

---

## 3. Infrastructure and Deployment
How we host, deploy, and manage the project in development and production.

- **Docker & Docker Compose**
  - Containerizes the entire application (Node.js, database) so everyone runs the same environment.
  - Simplifies onboarding and eliminates "works on my machine" issues.

- **Version Control: Git & GitHub**
  - We track all code changes, collaborate via pull requests, and review each other’s work before merging.

- **CI/CD: GitHub Actions & Vercel**
  - **GitHub Actions** automatically runs tests, linting, and builds on every commit.
  - **Vercel** hosts the Next.js app with zero-configuration deployments. It handles scaling, SSL, and global CDN out of the box.

- **Environment Variables**
  - Sensitive keys (database passwords, AI API secrets) are kept out of the codebase in `.env` files and Vercel’s secret settings.

---

## 4. Third-Party Integrations
External services that extend the app’s capabilities.

- **AWS S3 / Google Cloud Storage / Cloudinary**
  - Stores raw video files reliably and serves them efficiently.

- **AI Providers**
  - **Facial Expression**: AWS Rekognition or Azure Face API
  - **Speech-to-Text & Sentiment**: AWS Transcribe, Deepgram, or AssemblyAI
  - **Gesture Detection**: Custom third-party or open-source services

- **Queue Services**
  - **BullMQ** with Redis or **RabbitMQ** for reliable job processing.

- **Analytics & Monitoring** (optional)
  - Tools like Google Analytics or Sentry for tracking user behavior and error reporting.

---

## 5. Security and Performance Considerations
Steps taken to keep data safe and the app fast.

- **Authentication & Role-Based Access Control (RBAC)**
  - Better Auth ensures candidates and recruiters see only their own data.

- **Data Protection**
  - All traffic runs over HTTPS.
  - Environment variables keep secrets out of the code.

- **Input Validation**
  - Server-side checks on video uploads (file size, format, duration).
  - Prevents malicious files or oversized uploads.

- **Error Handling & User Feedback**
  - Friendly messages for camera access denial, upload failures, or AI processing delays.

- **Performance Optimizations**
  - **Server-Side Rendering (SSR)** for critical pages to speed up the initial load.
  - **Code-Splitting & Lazy Loading** of heavy components (e.g., video player).
  - **Caching** of static assets (images, UI components) via CDN.

---

## 6. Conclusion and Overall Tech Stack Summary

RasproView AI’s stack is carefully chosen to balance developer productivity, user experience, and future scalability:

- A **Next.js + React + TypeScript** frontend that’s fast, responsive, and themeable.
- A **Node.js + Next.js API + Better Auth** backend that keeps data secure and organized by user role.
- **PostgreSQL + Drizzle ORM** for reliable, type-safe data storage.
- A **containerized, CI/CD-driven** infrastructure (Docker, GitHub Actions, Vercel) for consistent builds and smooth releases.
- An **asynchronous video pipeline** with cloud storage and background workers for robust performance under load.
- **Third-party AI services** that bring powerful analysis of facial expressions, speech, and gestures without reinventing the wheel.

By combining these technologies, RasproView AI will deliver a polished, reliable, and scalable video interview platform—ready to grow and adapt as we build out its advanced AI features.