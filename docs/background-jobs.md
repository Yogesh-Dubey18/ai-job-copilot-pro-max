# Background Jobs

AI Job Copilot Pro MAX exposes queue status through `GET /api/queues/status` for admins.

## Production Driver

Set `REDIS_URL` to enable the production queue driver plan for:

- `jobs.sync.adzuna`
- `jobs.sync.remotive`
- `jobs.sync.greenhouse`
- `jobs.sync.ashby`
- `jobs.sync.lever`
- `jobs.normalize`
- `jobs.dedupe`
- `jobs.skillExtract`
- `resumes.parse`
- `resumes.ats`
- `gmail.sync`
- `replies.generate`
- `interviews.plan`
- `notifications.dailyDigest`
- `analytics.rollup`
- `reminders.followup`
- `cleanup.expired`

## Local And Demo Fallback

When `REDIS_URL` is missing, the API reports `in_memory_fallback`. User-facing flows still work synchronously, while external sync jobs remain disabled until Redis and provider credentials are configured.

## Render/Vercel Notes

For long-running queue workers, deploy the backend API as a web service and add a separate worker process with the same environment variables plus `REDIS_URL`. Vercel serverless deployments can expose queue status and synchronous fallback flows, but durable recurring jobs should run in a persistent worker environment.
