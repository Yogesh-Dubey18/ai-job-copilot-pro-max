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

const manualApplySchema = z.object({
  jobId: z.string().optional(),
  applicationId: z.string().optional(),
  dateApplied: z.string().optional(),
  portalSource: z.string().optional(),
  resumeVersionUsed: z.string().optional(),
  coverLetterUsed: z.string().optional(),
  contactName: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  checklist: z
    .object({
      resumeTailored: z.boolean().default(false),
      coverLetterReady: z.boolean().default(false),
      portfolioReady: z.boolean().default(false),
      formSubmitted: z.boolean().default(true),
      confirmationSaved: z.boolean().default(false),
      followUpReminderSet: z.boolean().default(false)
    })
    .optional()
});

const responseSchema = z.object({
  companyMessage: z.string().min(1),
  intent: z.enum(['accept', 'negotiate', 'ask_question', 'decline_politely', 'request_more_info']),
  tone: z.enum(['professional', 'confident', 'polite', 'hinglish-friendly', 'short']).default('professional')
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

export const manualApply = asyncHandler(async (req: any, res) => {
  const data = manualApplySchema.parse(req.body);
  let application = data.applicationId
    ? await Application.findOne({ _id: data.applicationId, userId: req.user.id })
    : null;
  const job = data.jobId ? await Job.findById(data.jobId) : null;

  if (!application) {
    application = await Application.create({
      userId: req.user.id,
      jobId: job?._id,
      title: job?.title || 'Manual Application',
      company: job?.company || 'Company',
      status: 'manually_applied'
    });
  }

  application.status = 'manually_applied';
  application.appliedDate = data.dateApplied ? new Date(data.dateApplied) : new Date();
  application.followUpDate = data.followUpDate ? new Date(data.followUpDate) : application.followUpDate;
  application.portalSource = data.portalSource || application.portalSource;
  application.resumeVersionUsed = data.resumeVersionUsed || application.resumeVersionUsed;
  application.coverLetterUsed = data.coverLetterUsed || application.coverLetterUsed;
  application.contactName = data.contactName || application.contactName;
  application.notes = data.notes || application.notes;
  application.manualChecklist = {
    resumeTailored: Boolean(data.checklist?.resumeTailored),
    coverLetterReady: Boolean(data.checklist?.coverLetterReady),
    portfolioReady: Boolean(data.checklist?.portfolioReady),
    formSubmitted: data.checklist?.formSubmitted ?? true,
    confirmationSaved: Boolean(data.checklist?.confirmationSaved),
    followUpReminderSet: Boolean(data.checklist?.followUpReminderSet || data.followUpDate)
  };
  application.timeline.push({
    status: 'manually_applied',
    note: data.notes || 'User confirmed manual application submission.',
    source: data.portalSource || 'manual_apply',
    nextAction: 'Track response and follow up on schedule.',
    date: new Date()
  });
  await application.save();

  res.json({ success: true, data: application });
});

export const generateCompanyResponse = asyncHandler(async (req: any, res) => {
  const data = responseSchema.parse(req.body);
  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
  if (!application) throw new AppError('Application not found.', 404);

  const subject = `${application.title} - Response to ${application.company}`;
  const shortReply =
    data.intent === 'negotiate'
      ? 'Thank you for the update. I am interested and would like to discuss the details so we can find a fair fit.'
      : data.intent === 'decline_politely'
        ? 'Thank you for considering me. I appreciate the opportunity, but I will not be moving forward at this time.'
        : 'Thank you for reaching out. I am interested and happy to continue the process.';
  const response = {
    type: 'company_reply',
    companyMessage: data.companyMessage,
    intent: data.intent,
    tone: data.tone,
    subject,
    shortReply,
    detailedReply: `${shortReply}\n\nRegarding your message: "${data.companyMessage.slice(0, 500)}"\n\nPlease let me know the next step, timeline, and any details you need from my side.`,
    shortChannelReply: shortReply,
    warnings: ['Do not share Aadhaar/PAN, bank details, passwords, OTPs, or original documents before verifying the employer.']
  };
  application.responses.push(response);
  application.timeline.push({
    status: application.status,
    note: `Generated ${data.tone} company reply.`,
    source: 'ai_response_assistant',
    nextAction: 'Review and send manually after checking accuracy.',
    date: new Date()
  });
  await application.save();
  res.json({ success: true, data: response });
});

export const listCompanyResponses = asyncHandler(async (req: any, res) => {
  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
  if (!application) throw new AppError('Application not found.', 404);
  res.json({ success: true, data: application.responses || [] });
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

export const getApplication = asyncHandler(async (req: any, res) => {
  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id }).populate('jobId');
  if (!application) throw new AppError('Application not found.', 404);
  res.json({ success: true, data: application });
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

export const addApplicationTimeline = asyncHandler(async (req: any, res) => {
  const schema = z.object({ type: z.string().default('note'), note: z.string().min(1), nextAction: z.string().optional() });
  const data = schema.parse(req.body);
  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
  if (!application) throw new AppError('Application not found.', 404);
  application.timeline.push({
    status: application.status,
    note: data.note,
    source: data.type,
    nextAction: data.nextAction || getNextAction(application.status),
    date: new Date()
  });
  await application.save();
  res.json({ success: true, data: application });
});

export const setFollowUp = asyncHandler(async (req: any, res) => {
  const schema = z.object({ followUpDate: z.string(), note: z.string().optional() });
  const data = schema.parse(req.body);
  const application = await Application.findOne({ _id: req.params.id, userId: req.user.id });
  if (!application) throw new AppError('Application not found.', 404);
  application.followUpDate = new Date(data.followUpDate);
  application.timeline.push({
    status: application.status,
    note: data.note || 'Follow-up reminder scheduled.',
    source: 'follow_up',
    nextAction: 'Send a concise follow-up on the scheduled date.',
    date: new Date()
  });
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
  const responses = applications.filter((item) => !['saved', 'preparing', 'resume_tailored', 'applied', 'manually_applied', 'rejected'].includes(item.status)).length;
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
    preparing: 'Finish the manual apply checklist.',
    manually_applied: 'Save confirmation and set a follow-up reminder.',
    resume_tailored: 'Apply with the tailored resume and track the link.',
    applied: 'Schedule a follow-up in 3-5 business days.',
    viewed: 'Prepare a concise value follow-up.',
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
