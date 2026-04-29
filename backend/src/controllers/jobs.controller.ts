import { z } from 'zod';
import Application from '../models/Application';
import Job from '../models/Job';
import { normalizeScrapedJob } from '../services/scraper.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  url: z.string().optional(),
  description: z.string().min(1),
  skills: z.array(z.string()).optional(),
  source: z.string().optional(),
  sourceJobId: z.string().optional()
});

const applicationSchema = z.object({
  jobId: z.string().optional(),
  company: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined']).default('saved'),
  appliedDate: z.string().optional(),
  followUpDate: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  tailoredResume: z.string().optional(),
  coverLetter: z.string().optional(),
  recruiterEmail: z.string().optional(),
  missingSkills: z.array(z.string()).optional()
});

export const listJobs = asyncHandler(async (_req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: jobs });
});

export const createJob = asyncHandler(async (req: any, res) => {
  const data = jobSchema.parse(req.body);
  const job = await Job.create({ ...data, createdBy: req.user?.id });
  res.status(201).json({ success: true, data: job });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found.', 404);
  }

  res.json({ success: true, data: job });
});

export const saveFromExtension = asyncHandler(async (req, res) => {
  const normalized = normalizeScrapedJob(req.body);
  const job = await Job.findOneAndUpdate(
    { source: normalized.source, sourceJobId: normalized.sourceJobId },
    normalized,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: job });
});

export const listApplications = asyncHandler(async (req: any, res) => {
  const applications = await Application.find({ userId: req.user.id })
    .populate('jobId')
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: applications });
});

export const createApplication = asyncHandler(async (req: any, res) => {
  const data = applicationSchema.parse(req.body);
  const application = await Application.create({
    ...data,
    userId: req.user.id,
    appliedDate: data.appliedDate ? new Date(data.appliedDate) : undefined,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
    timeline: [{ status: data.status, note: 'Application created.' }]
  });

  res.status(201).json({ success: true, data: application });
});

export const updateApplicationStatus = asyncHandler(async (req: any, res) => {
  const schema = z.object({
    status: z.enum(['saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'joined']),
    note: z.string().optional()
  });
  const { status, note } = schema.parse(req.body);

  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  application.status = status;
  application.timeline.push({ status, note: note || `Status changed to ${status}`, date: new Date() });

  if (status === 'applied' && !application.appliedDate) {
    application.appliedDate = new Date();
  }

  await application.save();
  res.json({ success: true, data: application });
});

export const applicationStats = asyncHandler(async (req: any, res) => {
  const [saved, applied, interviews, offers] = await Promise.all([
    Application.countDocuments({ userId: req.user.id, status: 'saved' }),
    Application.countDocuments({ userId: req.user.id, status: 'applied' }),
    Application.countDocuments({ userId: req.user.id, status: 'interview' }),
    Application.countDocuments({ userId: req.user.id, status: 'offer' })
  ]);

  res.json({
    success: true,
    data: { saved, applied, interviews, offers }
  });
});
