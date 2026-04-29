import { z } from 'zod';
import Application, { applicationStatuses } from '../models/Application';
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
  status: z.enum(applicationStatuses).default('saved'),
  appliedDate: z.string().optional(),
  followUpDate: z.string().optional(),
  matchScore: z.number().min(0).max(100).optional(),
  resumeVersionUsed: z.string().optional(),
  tailoredResume: z.string().optional(),
  coverLetter: z.string().optional(),
  recruiterEmail: z.string().optional(),
  missingSkills: z.array(z.string()).optional()
});

export const listJobs = asyncHandler(async (req, res) => {
  const query: Record<string, any> = {};
  const search = String(req.query.role || req.query.q || '').trim();
  const location = String(req.query.location || '').trim();
  const source = String(req.query.source || '').trim();
  const remote = String(req.query.remote || '').trim();
  const fresher = String(req.query.fresher || '').trim() === 'true';
  const internship = String(req.query.internship || '').trim() === 'true';
  const postedToday = String(req.query.postedToday || '').trim() === 'true';

  if (search) query.$text = { $search: search };
  if (location) query.location = new RegExp(location, 'i');
  if (source) query.source = source;
  if (remote === 'true') query.remote = true;
  if (remote === 'false') query.remote = false;
  if (fresher) query.description = new RegExp('fresher|entry|junior|0-1|0 to 1', 'i');
  if (internship) query.title = new RegExp('intern|internship', 'i');
  if (postedToday) query.createdAt = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };

  const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(100);
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
    status: z.enum(applicationStatuses),
    note: z.string().optional(),
    source: z.string().optional(),
    nextAction: z.string().optional()
  });
  const { status, note, source, nextAction } = schema.parse(req.body);

  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  application.status = status;
  application.timeline.push({
    status,
    note: note || `Status changed to ${status}`,
    source: source || 'user',
    nextAction: nextAction || getNextAction(status),
    date: new Date()
  });

  if (status === 'applied' && !application.appliedDate) {
    application.appliedDate = new Date();
  }
  if (['interview_round_1', 'interview_round_2', 'hr_round'].includes(status)) {
    application.followUpDate = application.followUpDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  }

  await application.save();
  res.json({ success: true, data: application });
});

export const applicationStats = asyncHandler(async (req: any, res) => {
  const [saved, applied, screening, interviews, offers, rejected, joined, total] = await Promise.all([
    Application.countDocuments({ userId: req.user.id, status: 'saved' }),
    Application.countDocuments({ userId: req.user.id, status: 'applied' }),
    Application.countDocuments({ userId: req.user.id, status: { $in: ['recruiter_viewed', 'shortlisted', 'assessment'] } }),
    Application.countDocuments({ userId: req.user.id, status: { $in: ['interview_round_1', 'interview_round_2', 'hr_round'] } }),
    Application.countDocuments({ userId: req.user.id, status: 'offered' }),
    Application.countDocuments({ userId: req.user.id, status: 'rejected' }),
    Application.countDocuments({ userId: req.user.id, status: 'joined' }),
    Application.countDocuments({ userId: req.user.id })
  ]);

  res.json({
    success: true,
    data: { saved, applied, screening, interviews, offers, rejected, joined, total }
  });
});

export const applicationAnalytics = asyncHandler(async (req: any, res) => {
  const applications = await Application.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const total = applications.length;
  const interviews = applications.filter((item) => ['interview_round_1', 'interview_round_2', 'hr_round'].includes(item.status)).length;
  const offers = applications.filter((item) => item.status === 'offered').length;
  const responses = applications.filter((item) => !['saved', 'resume_tailored', 'applied', 'rejected'].includes(item.status)).length;
  const avgMatchScore = total
    ? Math.round(applications.reduce((sum, item) => sum + (item.matchScore || 0), 0) / total)
    : 0;

  res.json({
    success: true,
    data: {
      total,
      responseRate: total ? Math.round((responses / total) * 100) : 0,
      interviewRate: total ? Math.round((interviews / total) * 100) : 0,
      offerRate: total ? Math.round((offers / total) * 100) : 0,
      avgMatchScore,
      bestResumeVersion: applications.find((item) => item.resumeVersionUsed)?.resumeVersionUsed || 'Base resume',
      bestJobSource: 'demo/manual',
      recentCompanies: applications.slice(0, 8).map((item) => item.company)
    }
  });
});

const getNextAction = (status: string) => {
  const actions: Record<string, string> = {
    saved: 'Tailor resume before applying.',
    resume_tailored: 'Apply with the tailored resume and track the link.',
    applied: 'Schedule a follow-up in 3-5 business days.',
    recruiter_viewed: 'Prepare a concise value follow-up.',
    shortlisted: 'Start interview prep for the role.',
    assessment: 'Practice the most likely technical tasks.',
    interview_round_1: 'Review projects and role fundamentals.',
    interview_round_2: 'Prepare deeper system/project stories.',
    hr_round: 'Prepare salary range and joining constraints.',
    offered: 'Compare offer, negotiate respectfully, and verify details.',
    rejected: 'Run rejection analysis and improve the next application.',
    joined: 'Archive the search and capture lessons learned.'
  };
  return actions[status] || 'Review this application.';
};
