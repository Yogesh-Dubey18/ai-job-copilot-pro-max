# AI Job Copilot Pro MAX

AI Job Copilot Pro MAX is a production-ready full-stack job search mission control app. It includes a Node.js, Express, TypeScript, MongoDB backend, a Next.js App Router frontend, and a Manifest V3 Chrome extension for saving job pages into the backend.

## Tech Stack

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Helmet, rate limiting
- AI: Google Gemini through `@google/generative-ai`
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion
- Extension: Chrome Manifest V3 service worker and content script

## Folder Structure

```text
ai-job-copilot-monorepo/
├── backend/
├── frontend/
└── extension/
```

## Local Setup

```bash
npm install
```

Create backend env:

```bash
cp backend/.env.example backend/.env
```

Create frontend env:

```bash
cp frontend/.env.example frontend/.env.local
```

Update `backend/.env` with `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and optionally `GEMINI_API_KEY`.

## Run Locally

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:3000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Seed Admin

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run:

```bash
npm run seed:admin --workspace backend
```

## Chrome Extension

1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Click Load unpacked.
4. Select the `extension/` folder.
5. Open a job page and click the extension icon to save the job.

The extension sends scraped jobs to:

```text
http://localhost:5000/api/jobs/save-from-extension
```

For production, set `backendUrl` in `chrome.storage.sync` or update the default in `extension/background.js`.

## Backend Deployment on Render

Create a Render Web Service:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

The root `render.yaml` also contains a ready Render Blueprint for the backend service.

Environment variables:

```text
PORT=5000
NODE_ENV=production
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<strong secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<your Vercel frontend URL>
GEMINI_API_KEY=<your Gemini key>
ADZUNA_APP_ID=<optional>
ADZUNA_APP_KEY=<optional>
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong password>
```

## Frontend Deployment on Vercel

Create a Vercel project:

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`

The `frontend/vercel.json` file is included for Vercel project defaults.

Environment variable:

```text
NEXT_PUBLIC_API_URL=https://your-render-backend-url
```

After the frontend is deployed, update Render `FRONTEND_URL` with the Vercel URL.

## GitHub Push

```bash
git init
git branch -M main
git remote add origin <my_repo_url>
git add .
git commit -m "Initial AI Job Copilot Pro MAX"
git push -u origin main
```
