# Deployment Guide

This guide covers the production setup for AI Job Copilot Portal Pro MAX.

## MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with a strong password.
3. Add the backend hosting provider IPs to network access, or temporarily allow `0.0.0.0/0` only if your provider requires dynamic egress.
4. Copy the connection string into `MONGODB_URI`.
5. Do not commit the URI.

## Backend Deployment

Use the current backend deployment target or Render.

Render settings:

```text
Root directory: backend
Build command: npm install && npm run build
Start command: npm start
Health check: /api/health
```

Production environment:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
COOKIE_NAME=ai_job_token
CORS_ORIGIN=https://your-frontend-url
FRONTEND_URL=https://your-frontend-url
GEMINI_API_KEY=
OPENAI_API_KEY=
AI_PROVIDER=gemini
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@aijobportal.com
ADMIN_PASSWORD=Admin@12345
```

Notes:

- Use a long random `JWT_SECRET`.
- In production, cookies must be secure and cross-domain compatible.
- `CORS_ORIGIN` and `FRONTEND_URL` must be the exact frontend origin.
- Do not run seed scripts on production unless intentionally setting `ALLOW_PRODUCTION_SEED=true`.

## Frontend Deployment

Use Vercel with:

```text
Root directory: frontend
Framework: Next.js
Build command: npm run build
```

Production environment:

```text
NEXT_PUBLIC_API_URL=https://your-backend-url
BACKEND_URL=https://your-backend-url
NEXT_PUBLIC_APP_NAME=AI Job Copilot Portal Pro MAX
```

After deployment:

1. Update backend `FRONTEND_URL` and `CORS_ORIGIN` to the Vercel URL.
2. Redeploy the backend.
3. Verify login sets and reads the secure session correctly.

## Chrome Extension

The extension defaults to the current production backend URL. For another deployment:

1. Load unpacked extension from `extension/`.
2. Open extension options.
3. Set backend URL to the deployed backend origin, for example `https://api.example.com`.
4. Sign in to the web app as a job seeker.
5. Save a real job page.

The save endpoint is authenticated and job-seeker-only. This is intentional; do not expose unauthenticated job writes.

## Verification Checklist

Backend:

- `GET /api/health` returns success.
- Register/login/logout work.
- `/api/auth/me` returns a safe user without `passwordHash`.
- Public jobs list returns paginated results.
- Resume upload rejects invalid files and accepts PDF/DOCX/TXT.
- AI endpoints return fallback without provider keys.

Frontend:

- `/`, `/login`, `/register`, `/jobs`, and `/jobs/[id]` load.
- Protected dashboards redirect or show an unauthorized state correctly.
- Job seeker, employer, and admin pages load with the correct roles.
- Notifications page loads and mark-read actions work.

Security:

- No `.env` or `.env.local` files are tracked.
- HTTPS is enabled.
- CORS only allows the frontend origin.
- Rate limiting is enabled.
- Admin seed credentials are changed for real production use.

Commands before release:

```bash
npm run lint --prefix frontend
npm run build --prefix backend
npm test --prefix backend
npm run build --prefix frontend
npm test --prefix frontend
npm run build
npm run test
```
