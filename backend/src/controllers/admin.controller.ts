import { asyncHandler } from '../utils/asyncHandler';
import EventLog from '../models/EventLog';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/User';
import { recordEvent } from '../services/event.service';
import { getSourceStatus, syncAllJobSources } from '../services/jobSource.service';

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
  const results = await syncAllJobSources();

  await recordEvent({
    type: 'admin.job_sync',
    message: 'Admin sync completed job source imports.',
    userId: req.user?.id,
    metadata: { results }
  });

  res.json({ success: true, data: results });
});

export const jobSourceStatus = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await getSourceStatus() });
});
