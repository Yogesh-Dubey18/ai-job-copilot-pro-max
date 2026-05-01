import { asyncHandler } from '../utils/asyncHandler';
import EventLog from '../models/EventLog';
import Job from '../models/Job';
import Application from '../models/Application';
import User from '../models/User';
import Company from '../models/Company';
import AuditLog from '../models/AuditLog';
import { AppError } from '../utils/AppError';
import { auditLog } from '../utils/audit';
import { getPagination, paginated } from '../utils/pagination';
import { serializeUser } from '../utils/safeUser';
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

const searchRegex = (value: unknown) => {
  const text = String(value || '').trim();
  return text ? new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
};

export const adminStats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalJobSeekers,
    totalEmployers,
    totalCompanies,
    totalJobs,
    totalApplications,
    suspendedUsers,
    pendingCompanies,
    pendingJobs,
    recentSignups
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ['job_seeker', 'user'] } }),
    User.countDocuments({ role: 'employer' }),
    Company.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ status: 'suspended' }),
    Company.countDocuments({ verificationStatus: 'pending' }),
    Job.countDocuments({ moderationStatus: { $in: ['pending', 'suspicious'] } }),
    User.find().sort({ createdAt: -1 }).limit(8).select('-passwordHash -emailVerificationTokenHash -passwordResetTokenHash')
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalCompanies,
      totalJobs,
      totalApplications,
      suspendedUsers,
      pendingCompanies,
      pendingJobs,
      recentSignups: recentSignups.map(serializeUser)
    }
  });
});

export const adminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const regex = searchRegex(req.query.search);
  const query = regex ? { $or: [{ name: regex }, { email: regex }, { role: regex }] } : {};
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash -emailVerificationTokenHash -passwordResetTokenHash'),
    User.countDocuments(query)
  ]);
  res.json({ success: true, data: paginated(users.map(serializeUser), page, limit, total) });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '');
  if (!['active', 'suspended'].includes(status)) throw new AppError('Invalid user status.', 400);
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select(
    '-passwordHash -emailVerificationTokenHash -passwordResetTokenHash'
  );
  if (!user) throw new AppError('User not found.', 404);
  await auditLog(req, 'admin.user.status_update', 'User', String(req.params.id), { status });
  res.json({ success: true, data: serializeUser(user) });
});

export const adminCompanies = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const regex = searchRegex(req.query.search);
  const query = {
    ...(regex ? { $or: [{ name: regex }, { industry: regex }, { location: regex }] } : {}),
    ...(req.query.verificationStatus ? { verificationStatus: req.query.verificationStatus } : {})
  };
  const [companies, total] = await Promise.all([
    Company.find(query).populate('ownerId', 'name email role status').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Company.countDocuments(query)
  ]);
  res.json({ success: true, data: paginated(companies, page, limit, total) });
});

export const verifyCompany = asyncHandler(async (req, res) => {
  const verificationStatus = String(req.body.verificationStatus || req.body.status || '');
  if (!['pending', 'verified', 'rejected'].includes(verificationStatus)) throw new AppError('Invalid company verification status.', 400);
  const company = await Company.findByIdAndUpdate(req.params.id, { verificationStatus }, { new: true });
  if (!company) throw new AppError('Company not found.', 404);
  await auditLog(req, 'admin.company.verify', 'Company', String(req.params.id), { verificationStatus });
  res.json({ success: true, data: company });
});

export const adminJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const regex = searchRegex(req.query.search);
  const query = {
    ...(regex ? { $or: [{ title: regex }, { company: regex }, { description: regex }] } : {}),
    ...(req.query.moderationStatus ? { moderationStatus: req.query.moderationStatus } : {}),
    ...(req.query.status ? { status: req.query.status } : {})
  };
  const [jobs, total] = await Promise.all([
    Job.find(query).populate('companyId').populate('employerId', 'name email role status').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(query)
  ]);
  res.json({ success: true, data: paginated(jobs, page, limit, total) });
});

export const moderateJob = asyncHandler(async (req, res) => {
  const moderationStatus = String(req.body.moderationStatus || req.body.status || '');
  if (!['pending', 'approved', 'rejected', 'suspicious'].includes(moderationStatus)) throw new AppError('Invalid job moderation status.', 400);
  const job = await Job.findByIdAndUpdate(req.params.id, { moderationStatus }, { new: true });
  if (!job) throw new AppError('Job not found.', 404);
  await auditLog(req, 'admin.job.moderation', 'Job', String(req.params.id), { moderationStatus });
  res.json({ success: true, data: job });
});

export const adminApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const query = {
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.jobId ? { jobId: req.query.jobId } : {})
  };
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('userId', 'name email role status profile')
      .populate('jobId')
      .populate('resumeId')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(query)
  ]);
  res.json({ success: true, data: paginated(applications, page, limit, total) });
});

export const adminAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req);
  const regex = searchRegex(req.query.search);
  const query = regex ? { $or: [{ action: regex }, { entityType: regex }, { entityId: regex }] } : {};
  const [logs, total] = await Promise.all([
    AuditLog.find(query).populate('actorId', 'name email role status').sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(query)
  ]);
  res.json({ success: true, data: paginated(logs, page, limit, total) });
});
