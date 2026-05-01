# AI Job Copilot Portal Pro MAX

AI Job Copilot Portal Pro MAX is a production-oriented AI job search and hiring SaaS. It combines a job seeker career operating system, employer hiring portal, admin moderation console, AI assistance, resume parsing, and a Manifest V3 Chrome extension.

## Features

- Job seekers: secure auth, profile, resume upload/parsing, AI resume feedback, public job search, saved jobs, applications, match scoring, cover letters, interview prep, notifications, and extension job capture.
- Employers: company profile, job drafts, publish/archive workflow, applicant lists, candidate notes, status updates, interview scheduling, and hiring dashboard pages.
- Admins: platform stats, users, companies, jobs, applications, moderation, audit logs, and system settings.
- AI: Gemini/OpenAI-style provider abstraction with strict JSON parsing, one retry path, AI usage tracking, and rule-based fallback when keys are missing.
- Security: httpOnly cookie/BFF auth pattern, backend JWT validation, RBAC, ownership checks, Helmet, rate limiting, CORS/origin checks, Zod validation, and safe resume upload validation.
- Extension: Manifest V3 scraper that captures title, company, location, description, and URL, then saves jobs through the authenticated backend endpoint.

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, reusable SaaS UI components.
- Backend: Node.js, Express, TypeScript, MongoDB Atlas, Mongoose, JWT, bcryptjs, Zod, Helmet, express-rate-limit.
- AI: Gemini or OpenAI provider abstraction with fallback.
- Files: PDF, DOCX, and TXT resume parsing with MIME/extension/size checks.
- Deployment: Vercel frontend, Render or current backend deployment, MongoDB Atlas.

## Folder Structure

```text
ai-job-copilot-monorepo/
  backend/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      scripts/
      services/
      utils/
  frontend/
    src/
      app/
      components/
      lib/
      types/
  extension/
  docs/
  package.json
  README.md
```

## Local Setup

Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Minimum backend values:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<at-least-24-characters>
COOKIE_NAME=ai_job_token
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
AI_PROVIDER=gemini
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
```

Minimum frontend values:

```text
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=AI Job Copilot Portal Pro MAX
```

## Run Locally

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Full dev mode:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Seed Data

The seed script is idempotent and creates demo users, companies, jobs, resumes, applications, saved jobs, notifications, interviews, and audit logs. It requires `MONGODB_URI`. It refuses to run in production unless `ALLOW_PRODUCTION_SEED=true`.

```bash
npm run seed
npm run seed --prefix backend
```

Demo credentials:

```text
Admin: admin@aijobportal.com / Admin@12345
Employer: employer@aijobportal.com / Employer@12345
Job seeker: seeker@aijobportal.com / Seeker@12345
```

## Test And Build

```bash
npm run build --prefix backend
npm test --prefix backend
npm run build --prefix frontend
npm test --prefix frontend
npm run build
npm run test
```

Frontend lint:

```bash
npm run lint --prefix frontend
```

## Chrome Extension

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select the `extension/` folder.
5. Log in to the web app as a job seeker.
6. Open a job page and click the extension popup.
7. Use Save job.

The extension uses `https://backend-steel-three-33.vercel.app` by default and allows an override in the extension options page. Saving requires an authenticated job seeker session; this prevents public spam writes.

## Deployment

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Environment:
  - `NEXT_PUBLIC_API_URL=https://your-backend-url`
  - `BACKEND_URL=https://your-backend-url`
  - `NEXT_PUBLIC_APP_NAME=AI Job Copilot Portal Pro MAX`

Backend on Render:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URI=<MongoDB Atlas URI>`
  - `JWT_SECRET=<strong secret>`
  - `JWT_EXPIRES_IN=7d`
  - `COOKIE_NAME=ai_job_token`
  - `CORS_ORIGIN=https://your-frontend-url`
  - `FRONTEND_URL=https://your-frontend-url`
  - `AI_PROVIDER=gemini`
  - `GEMINI_API_KEY=<optional>`
  - `OPENAI_API_KEY=<optional>`
  - `UPLOAD_DIR=uploads`
  - `MAX_FILE_SIZE_MB=5`

More deployment details are in [docs/deployment.md](docs/deployment.md).

## Common Errors

- Cookie login fails cross-domain: verify `FRONTEND_URL`, `CORS_ORIGIN`, production cookie `sameSite/secure`, and HTTPS on both apps.
- Seed does not run: set `MONGODB_URI`; production requires `ALLOW_PRODUCTION_SEED=true`.
- Resume upload rejected: use PDF, DOCX, or TXT under `MAX_FILE_SIZE_MB`; scanned/image-only PDFs may not extract readable text.
- AI returns fallback: configure the selected provider key or keep fallback mode for no-cost demos.
- Extension cannot save: sign in as a job seeker and set the backend URL in extension options.

## Production Checklist

- `JWT_SECRET` is strong and not committed.
- `MONGODB_URI` points to MongoDB Atlas.
- `CORS_ORIGIN` and `FRONTEND_URL` match the live frontend.
- `NEXT_PUBLIC_API_URL` and `BACKEND_URL` match the live backend.
- `NODE_ENV=production`.
- Health route works.
- Register/login/logout work.
- Dashboards, jobs, applications, resume upload, AI fallback, and extension save flow are verified.
- No real `.env`, `.env.local`, `.vercel`, `node_modules`, `.next`, or `dist` folders are tracked.
