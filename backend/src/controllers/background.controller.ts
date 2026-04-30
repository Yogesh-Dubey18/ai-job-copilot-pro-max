import { asyncHandler } from '../utils/asyncHandler';

const queues = [
  'jobs.sync.adzuna',
  'jobs.sync.remotive',
  'jobs.sync.greenhouse',
  'jobs.sync.ashby',
  'jobs.sync.lever',
  'jobs.normalize',
  'jobs.dedupe',
  'jobs.skillExtract',
  'resumes.parse',
  'resumes.ats',
  'gmail.sync',
  'replies.generate',
  'interviews.plan',
  'notifications.dailyDigest',
  'analytics.rollup',
  'reminders.followup',
  'cleanup.expired'
];

export const queueStatus = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      driver: process.env.REDIS_URL ? 'bullmq' : 'Redis not connected',
      queues: queues.map((name) => ({ name, status: process.env.REDIS_URL ? 'ready' : 'manual safe mode' }))
    }
  });
});
