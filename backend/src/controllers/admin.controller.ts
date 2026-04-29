import { asyncHandler } from '../utils/asyncHandler';
import EventLog from '../models/EventLog';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/User';
import { normalizeScrapedJob } from '../services/scraper.service';
import { recordEvent } from '../services/event.service';

export const adminOverview = asyncHandler(async (_req, res) => {
  const [users, jobs, applications, events] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    EventLog.find().sort({ createdAt: -1 }).limit(20)
  ]);

  res.json({ success: true, data: { users, jobs, applications, events } });
});

export const syncJobs = asyncHandler(async (req: any, res) => {
  const samples = [
    {
      title: 'AI Product Engineer',
      company: 'Signal Works',
      location: 'Remote',
      description: 'Build TypeScript, React, Node.js and AI workflow products.',
      url: '',
      source: 'admin-sync'
    },
    {
      title: 'Full Stack SaaS Developer',
      company: 'CloudPilot',
      location: 'Bengaluru',
      description: 'Own Next.js dashboards, Express APIs, MongoDB models, and analytics.',
      url: '',
      source: 'admin-sync'
    }
  ];

  const jobs = [];
  for (const sample of samples) {
    const normalized = normalizeScrapedJob(sample);
    const job = await Job.findOneAndUpdate(
      { source: normalized.source, sourceJobId: normalized.sourceJobId || normalized.url },
      normalized,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    jobs.push(job);
  }

  await recordEvent({
    type: 'admin.job_sync',
    message: 'Admin sync imported sample jobs.',
    userId: req.user?.id,
    metadata: { count: jobs.length }
  });

  res.json({ success: true, data: jobs });
});
