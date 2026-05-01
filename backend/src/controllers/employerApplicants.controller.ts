import { z } from 'zod';
import Application, { applicationStatuses } from '../models/Application';
import Interview from '../models/Interview';
import Job from '../models/Job';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { auditLog } from '../utils/audit';
import { createNotification } from '../utils/notify';
import { getPagination, paginated } from '../utils/pagination';

const interviewStatusAliases: Record<string, string> = {
  interview: 'interview_round_1',
  offered: 'offered',
  rejected: 'rejected',
  shortlisted: 'shortlisted',
  viewed: 'viewed',
  applied: 'applied',
  withdrawn: 'withdrawn',
  joined: 'joined'
};

export const normalizeEmployerApplicationStatus = (status: string) => {
  const normalized = interviewStatusAliases[status] || status;
  if (!applicationStatuses.includes(normalized as (typeof applicationStatuses)[number])) {
    throw new AppError('Invalid application status.', 400);
  }
  return normalized as (typeof applicationStatuses)[number];
};

const findOwnedJob = async (jobId: string, employerId: string) => {
  const job = await Job.findOne({ _id: jobId, employerId });
  if (!job) throw new AppError('Employer job not found.', 404);
  return job;
};

const getOwnedApplication = async (applicationId: string, employerId: string) => {
  const application = await Application.findById(applicationId)
    .populate('userId', 'name email profile')
    .populate('resumeId')
    .populate('jobId');
  if (!application || !application.jobId) throw new AppError('Application not found.', 404);
  const job = await Job.findOne({ _id: application.jobId, employerId });
  if (!job) throw new AppError('Application not found.', 404);
  return { application, job };
};

export const listJobApplicants = asyncHandler(async (req: any, res) => {
  const job = await findOwnedJob(req.params.jobId, req.user.id);
  const { page, limit, skip } = getPagination(req);
  const status = String(req.query.status || '').trim();
  const query: Record<string, unknown> = { jobId: job._id };
  if (status) query.status = normalizeEmployerApplicationStatus(status);

  const [items, total] = await Promise.all([
    Application.find(query)
      .populate('userId', 'name email profile')
      .populate('resumeId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(query)
  ]);

  res.json({ success: true, message: 'Applicants fetched', data: paginated(items, page, limit, total) });
});

export const listEmployerCandidates = asyncHandler(async (req: any, res) => {
  const { page, limit, skip } = getPagination(req);
  const jobs = await Job.find({ employerId: req.user.id }).select('_id');
  const jobIds = jobs.map((job) => job._id);
  const status = String(req.query.status || '').trim();
  const query: Record<string, unknown> = { jobId: { $in: jobIds } };
  if (req.query.jobId) {
    await findOwnedJob(String(req.query.jobId), req.user.id);
    query.jobId = req.query.jobId;
  }
  if (status) query.status = normalizeEmployerApplicationStatus(status);
  if (req.query.minScore || req.query.maxScore) {
    query.matchScore = {
      ...(req.query.minScore ? { $gte: Number(req.query.minScore) } : {}),
      ...(req.query.maxScore ? { $lte: Number(req.query.maxScore) } : {})
    };
  }

  const [items, total] = await Promise.all([
    Application.find(query)
      .populate('userId', 'name email profile')
      .populate('resumeId')
      .populate('jobId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(query)
  ]);

  res.json({ success: true, message: 'Candidates fetched', data: paginated(items, page, limit, total) });
});

export const getEmployerCandidate = asyncHandler(async (req: any, res) => {
  const { application } = await getOwnedApplication(req.params.applicationId, req.user.id);
  res.json({ success: true, data: application });
});

export const updateEmployerApplicationStatus = asyncHandler(async (req: any, res) => {
  const schema = z.object({
    status: z.string().min(1),
    note: z.string().optional()
  });
  const data = schema.parse(req.body);
  const status = normalizeEmployerApplicationStatus(data.status);
  const { application, job } = await getOwnedApplication(req.params.id, req.user.id);
  const candidateId = (application.userId as any)._id || application.userId;

  application.status = status;
  application.timeline.push({
    status,
    note: data.note || `Employer updated status to ${status}.`,
    source: 'employer',
    nextAction: status.includes('interview') ? 'Prepare for the scheduled interview.' : '',
    date: new Date()
  });
  await application.save();

  await createNotification({
    userId: candidateId,
    type: 'application_status',
    title: `Application update: ${application.title}`,
    message: `${job.company} updated your application status to ${status}.`,
    link: `/applications/${application._id}`
  }).catch(() => undefined);
  await auditLog(req, 'employer.application.status_update', 'Application', application._id.toString(), { status });

  res.json({ success: true, data: application });
});

export const addEmployerApplicationNote = asyncHandler(async (req: any, res) => {
  const schema = z.object({ note: z.string().min(1) });
  const data = schema.parse(req.body);
  const { application } = await getOwnedApplication(req.params.id, req.user.id);
  application.employerNotes.push({ note: data.note, createdBy: req.user.id, createdAt: new Date() });
  await application.save();
  await auditLog(req, 'employer.application.note_add', 'Application', application._id.toString());
  res.status(201).json({ success: true, data: application.employerNotes[application.employerNotes.length - 1] });
});

export const scheduleEmployerInterview = asyncHandler(async (req: any, res) => {
  const schema = z.object({
    scheduledAt: z.string().min(1),
    mode: z.enum(['video', 'phone', 'onsite', 'other']).default('video'),
    meetingLink: z.string().optional(),
    notes: z.string().optional()
  });
  const data = schema.parse(req.body);
  const { application, job } = await getOwnedApplication(req.params.id, req.user.id);
  const candidateId = (application.userId as any)._id || application.userId;

  const interview = await Interview.create({
    applicationId: application._id,
    jobId: job._id,
    companyId: (job as any).companyId,
    candidateId,
    employerId: req.user.id,
    scheduledAt: new Date(data.scheduledAt),
    mode: data.mode,
    meetingLink: data.meetingLink || '',
    notes: data.notes || ''
  });

  application.status = 'interview_round_1';
  application.timeline.push({
    status: 'interview_round_1',
    note: data.notes || `Interview scheduled for ${new Date(data.scheduledAt).toISOString()}.`,
    source: 'employer',
    nextAction: 'Prepare interview stories and technical fundamentals.',
    date: new Date()
  });
  await application.save();

  await createNotification({
    userId: candidateId,
    type: 'interview_scheduled',
    title: `Interview scheduled: ${application.title}`,
    message: `${job.company} scheduled an interview.`,
    link: `/interview/${application._id}`,
    dueAt: new Date(data.scheduledAt)
  }).catch(() => undefined);
  await auditLog(req, 'employer.application.interview_schedule', 'Interview', interview._id.toString(), {
    applicationId: application._id.toString()
  });

  res.status(201).json({ success: true, data: interview });
});
