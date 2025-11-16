# RasproView AI Security Guidelines

This document provides prescriptive security best practices tailored to the **rasproview-ai-video-interview** codebase. It aligns with core security principles—Security by Design, Defense in Depth, Least Privilege—and covers authentication, data protection, API security, infrastructure hardening, and dependency management.

---
## 1. Security by Design & Secure Defaults

- Embed security considerations at every layer from day one.  
- Enable secure settings by default:  
  - Disable verbose error messages in production.  
  - Enforce HTTPS (TLS 1.2+) for all endpoints.  
- Conduct regular threat modeling sessions as features (e.g., video upload, AI analysis) are added.

---
## 2. Authentication & Access Control

### 2.1 Robust Authentication
- Continue using **Better Auth** for role-based sign-in flows.  
- Enforce strong password policies: minimum length, complexity, rotation.  
- Store passwords with Argon2 or bcrypt + per-user salt.

### 2.2 Session Management
- Use secure, HttpOnly, SameSite=Strict cookies for session tokens.  
- Enforce idle logout (e.g., 15 minutes) and absolute session expiry (e.g., 24 hours).  
- Protect against session fixation by regenerating session IDs on privilege changes.

### 2.3 Role-Based Access Control (RBAC)
- Define explicit roles: `candidate`, `recruiter`, `admin`.  
- Enforce server-side authorization on all API routes (`/app/api/**`).  
- Restrict queries so candidates can only access their own interviews; recruiters only their organization’s data.

### 2.4 Multi-Factor Authentication (MFA)
- Offer optional TOTP or SMS-based MFA for recruiter accounts.  
- Store MFA secrets securely in a vault, not in environment variables.

---
## 3. Input Handling & File Upload Security

### 3.1 Prevent Injection
- Use Drizzle ORM’s parameterized queries exclusively; avoid raw SQL.  
- Validate and sanitize all JSON inputs with a schema library (e.g., Zod).

### 3.2 Video File Validation
- Enforce server-side checks on video format (e.g., MP4), duration (e.g., ≤ 15 minutes), and size (e.g., ≤ 200 MB).  
- Reject files containing embedded scripts or non-media payloads.  
- Store uploads outside webroot; use signed URLs (AWS S3 presigned PUT) with least-privilege IAM roles.

### 3.3 Path Traversal & Filename Sanitization
- Generate deterministic, random object keys for storage (UUID).  
- Never use user-supplied filenames to build file paths.

### 3.4 Malware Scanning
- Integrate a virus/malware scanner (e.g., ClamAV or third-party) in the upload pipeline before processing.

---
## 4. Data Protection & Privacy

### 4.1 Encryption
- Enforce TLS 1.2+ for all client–server and inter-service communications.  
- Enable transparent data encryption for PostgreSQL at rest.  
- Encrypt sensitive fields (e.g., PII) in the database using AES-256.

### 4.2 Secrets Management
- Remove hardcoded secrets; use a dedicated secrets manager (AWS Secrets Manager, HashiCorp Vault).  
- Mount secrets at runtime via environment or volume, not in source or Docker images.

### 4.3 Logging & Monitoring
- Strip PII from logs; log only anonymized user IDs.  
- Monitor authentication failures and video upload errors for anomaly detection.

### 4.4 Privacy Compliance
- Provide data deletion workflows (GDPR Right to Erasure) for candidate records.  
- Display a clear privacy policy outlining how video/analysis data is used and stored.

---
## 5. API & Service Security

### 5.1 HTTPS & CORS
- Enforce HTTPS redirect at the edge (Vercel or custom load balancer).  
- Configure CORS to allow only trusted origins (e.g., `https://app.rasproview.ai`).

### 5.2 Rate Limiting & Throttling
- Apply per-IP and per-user rate limits on public endpoints (login, video upload) using a middleware (e.g., rate-limiter-flexible).

### 5.3 Versioning & Verb Use
- Version all AI and interview endpoints (`/api/v1/interviews/...`).  
- Use appropriate HTTP verbs: GET for reads, POST for creations, PUT/PATCH for updates, DELETE for removals.

### 5.4 Minimal Data Exposure
- Return only necessary fields (avoid including internal IDs or debugging info).  
- Implement response schemas to whitelist allowed properties.

---
## 6. Web Application Security Hygiene

- Enable and configure security headers:  
  - Content-Security-Policy: restrict scripts, styles, frame-ancestors.  
  - X-Frame-Options: DENY.  
  - X-Content-Type-Options: nosniff.  
  - Referrer-Policy: strict-origin-when-cross-origin.

- Protect against CSRF: implement synchronizer tokens for state-changing requests.  
- Use Subresource Integrity (SRI) for any third-party scripts.

---
## 7. Infrastructure & Configuration Management

- Harden Docker images:  
  - Use minimal base images (e.g., `node:alpine`).  
  - Remove build-time tools in final images.  
  - Run processes as non-root user.

- Secure `docker-compose.yaml`:  
  - Do not commit `.env` files.  
  - Reference secrets via Docker Secrets or external vault.

- Disable debug flags and verbose logging in production.  
- Regularly patch OS, Node.js, dependencies.

---
## 8. Dependency Management

- Maintain lockfiles (`package-lock.json`) and enforce `npm ci` for reproducible builds.  
- Integrate SCA tooling (e.g., GitHub Dependabot, Snyk) to detect vulnerable packages.  
- Remove unused dependencies to reduce attack surface.

---
## 9. Continuous Integration & Deployment

- Run linters, type checks, and automated security scans in CI (GitHub Actions).  
- Automate end-to-end tests (Playwright or Cypress) to validate secure flows:  
  - Authentication, video upload, AI analysis pipeline.  
- Deploy only from tagged commits; enforce branch protection rules.

---
## 10. Ongoing Security Practices

- Schedule periodic penetration tests and vulnerability assessments.  
- Conduct code reviews with a focus on security implications.  
- Train the team on emerging threats (e.g., supply-chain attacks).

By following these guidelines, the RasproView AI platform will maintain a robust security posture as it evolves from this starter template into a production-grade, AI-powered video interviewing solution.