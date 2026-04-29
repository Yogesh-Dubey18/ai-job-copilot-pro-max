# Live Smoke Test

Run after each deployment:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/smoke-live.ps1
```

Checks:

- Backend `/api/health`
- Frontend `/`, `/login`, `/register`, `/dashboard`, `/resume/upload`, `/jobs`, `/jobs/today`, `/applications`, `/analytics`, `/tools`, `/admin`

Authenticated pages may render login redirects when no session cookie is present; the smoke check verifies the routes respond.
