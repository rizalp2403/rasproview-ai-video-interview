# Project Requirements Document (PRD)

## 1. Project Overview

RasproView AI is a full-stack web platform designed to modernize and automate video-based job screening. It offers recruiters a way to create and manage interview templates, invite candidates, and receive AI-powered analysis of candidate responses. Candidates can record answers to interview questions via their browser, submit videos, and receive a seamless, guided experience. Under the hood, RasproView AI analyzes facial expressions, voice tone, and gestures to generate structured insights—helping recruiters make more objective, data-driven hiring decisions.

This project exists to reduce bias, speed up the screening process, and scale candidate assessment. By automating parts of the initial interview stage, companies can handle larger applicant pools while ensuring a consistent evaluation standard. Success will be measured by: 1) recruiter adoption and usage metrics, 2) candidate completion rates of recorded interviews, 3) accuracy and relevance of AI-derived insights compared to human review, and 4) system performance under peak load (e.g., concurrent recordings).

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- User and role management (Candidates vs. Recruiters) with secure sign-up/sign-in flows and session handling.
- Recruiter dashboard: create/edit interview templates (questions list), invite candidates.
- Candidate interface: guided recording of video responses question-by-question.
- Video upload pipeline: client-to-cloud storage (e.g., AWS S3) integration and server-side handling.
- Background worker queue for asynchronous AI processing.
- AI analysis integration for facial expression, voice sentiment, and gesture detection via third-party APIs.
- Results dashboard: playback of candidate videos alongside synchronized AI insights (emotion timeline, transcript highlights).
- Basic error handling and validations (camera access, file size/type limits).
- Light/dark theme support and responsive UI built with shadcn/ui and Tailwind CSS.
- Containerized development environment (Docker & docker-compose).

### Out-of-Scope (Later Phases)
- Advanced recruiting features (job postings, applicant tracking beyond video screening).
- Custom AI model training or on-premise AI solutions.
- Multi-language support and localization.
- In-depth analytics dashboards (beyond basic AI scores and timelines).
- Video editing or retake features mid-interview.
- Mobile-native apps (iOS/Android) or offline access.
- Third-party ATS (applicant tracking system) integrations.

## 3. User Flow

A recruiter signs up or logs in on the home page. They land on their dashboard, which shows existing interview templates and invitations. From there, the recruiter clicks “Create Interview,” enters a title and list of questions, and sends email invites to candidates. Each invitation contains a secure link tied to that candidate’s account and interview template.

When a candidate clicks their invite link, they sign in (or sign up) and arrive at a question-by-question interface. The browser’s camera and microphone are requested once. Candidates see one question at a time, record their video response using the `VideoRecorder` component, and review before submitting. Upon completion, the video is uploaded to cloud storage, enqueued for AI analysis, and the candidate sees a confirmation screen. Meanwhile, background workers process the video and store analysis results. The recruiter can refresh their dashboard to view completed submissions, watch videos, and see the AI insights side by side.

## 4. Core Features

- **Authentication & Authorization**: Role-based sign-up, login, and protected routes via Better Auth library.
- **Recruiter Dashboard**: CRUD (Create, Read, Update, Delete) interview templates; send candidate invites.
- **Candidate Interview Flow**: Guided steps for recording and submitting video answers using MediaStream API.
- **Video Upload API**: Endpoint to accept signed URLs or direct client uploads to AWS S3 (or equivalent).
- **Background Processing**: Queue system (e.g., BullMQ) and worker service to handle video transcoding and AI API requests asynchronously.
- **AI Analysis Service**: Module(s) wrapping third-party APIs for: facial recognition (e.g., AWS Rekognition), speech-to-text (e.g., AWS Transcribe), sentiment analysis (e.g., AssemblyAI).
- **Results Dashboard**: Video player component synchronized with AI data (emotion timelines, keyword highlights).
- **Database Schema**: Drizzle ORM models for Users, Interviews, Questions, VideoResponses, AIAnalysisResults in PostgreSQL.
- **Theming & UI Components**: Light/dark mode via `next-themes`, reusable shadcn/ui components styled with Tailwind CSS.
- **Error & Validation**: Client/server checks for camera permissions, file size (e.g., ≤100MB), format (e.g., MP4), and upload success.

## 5. Tech Stack & Tools

- **Frontend**: Next.js (App Router) + React + TypeScript; UI with shadcn/ui + Tailwind CSS; theming with `next-themes`.
- **Backend**: Next.js API Routes (TypeScript); Drizzle ORM for PostgreSQL; Better Auth for session management.
- **AI & Media**: Node.js services for MediaStream API; AWS S3 for storage; BullMQ (or preferred queue) for job management; third-party AI services (AWS Rekognition, Transcribe, AssemblyAI).
- **Containerization**: Docker & docker-compose for local dev and CI consistency.
- **Deployment**: Vercel (standalone build output) or container platform of choice.
- **Development Tools**: VS Code; optional AI pair-programming with Cursor or Windsurf plugins.

## 6. Non-Functional Requirements

- **Performance**: Pages and recordings should load within 1–2 seconds; AI job queue should pick up jobs within 5 seconds of upload.
- **Scalability**: System must handle at least 100 concurrent candidate recordings without downtime.
- **Security**: Enforce HTTPS, secure JWT sessions, server-side input validation, least-privilege IAM roles for S3.
- **Reliability**: Automatic retries for transient upload/AI failures; monitoring and alerting on queue backlogs.
- **Usability**: Intuitive one-question-at-a-time flow; clear progress indicators; accessible (WCAG 2.1 AA) UI components.

## 7. Constraints & Assumptions

- Third-party AI APIs are available and within rate limits for expected volume.
- Candidates have modern browsers supporting MediaStream API and HTTPS.
- AWS (or equivalent cloud provider) credentials and environment variables are configured securely.
- PostgreSQL instance is provisioned and reachable by the application.
- Team will maintain TypeScript strict mode for type safety.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: AI service quotas may throttle analysis. Mitigation: implement exponential backoff and local caching of small requests.
- **Video Upload Timeouts**: Large files can exceed default server timeouts. Mitigation: use direct-to-S3 uploads with presigned URLs.
- **Browser Compatibility**: Older browsers may not support MediaStream. Mitigation: detect support and show fallback or user-friendly error.
- **Data Privacy**: Storing video and biometric data has legal implications (GDPR, CCPA). Mitigation: obtain candidate consent, purge old data, and secure storage.
- **Queue Backlog**: A sudden surge of uploads can swamp workers. Mitigation: autoscale worker pool or set queue rate limits.

---
This PRD provides a clear, unambiguous guide for building the first version of RasproView AI. It lays out the functional scope, user flow, tech stack, and important non-functional requirements so that detailed technical documents can be drafted without additional clarification.