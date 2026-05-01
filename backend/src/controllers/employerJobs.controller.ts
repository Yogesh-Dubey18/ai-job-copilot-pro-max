import { z } from 'zod';
import Company from '../models/Company';
import Job from '../models/Job';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { auditLog } from '../utils/audit';
import { created, ok } from '../utils/apiResponse';
import { getPagination, paginated } from '../utils/pagination';
import { slugify } from '../utils/slug';

const jobInputSchema = z.object({
  title: z.string().min(2),
  location: z.string().optional(),
  workplaceType: z.enum(['remote', 'hybrid', 'onsite']).default('onsite'),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship']).default('full_time'),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  skills: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  description: z.string().min(20),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  deadline: z.string().optional(),
  applyUrl: z.string().url().optional().or(z.literal(''))
});

const employerCompany = async (ownerId: string) => {
  const company = await Company.findOne({ ownerId });
  if (!company) throw new AppError('Create your company profile before posting jobs.', 400);
  return company;
};

const uniqueJobSlug = async (title: string, companyId: string, existingId?: string) => {
  const base = slugify(title) || 'job';
  let slug = base;
  let suffix = 1;
  while (await Job.exists({ companyId, slug, ...(existingId ? { _id: { $ne: existingId } } : {}) })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
};

export const createEmployerJob = asyncHandler(async (req: any, res) => {
  const data = jobInputSchema.parse(req.body);
  const company = await employerCompany(req.user.id);
  const job = await Job.create({
    ...data,
    companyId: company._id,
    employerId: req.user.id,
    company: company.name,
    slug: await uniqueJobSlug(data.title, company._id.toString()),
    remote: data.workplaceType === 'remote',
    remoteType: data.workplaceType,
    status: 'draft',
    moderationStatus: 'pending',
    source: 'employer',
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    createdBy: req.user.id
  });
  await auditLog(req, 'employer.job.create', 'Job', job._id.toString(), { title: job.title });
  created(res, 'Job draft created.', job);
});

export const listEmployerJobs = asyncHandler(async (req: any, res) => {
  const { page, limit, skip } = getPagination(req);
  const filter = { employerId: req.user.id };
  const [items, total] = await Promise.all([
    Job.find(filter).populate('companyId').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter)
  ]);
  ok(res, 'Employer jobs loaded.', paginated(items, page, limit, total));
});

export const getEmployerJob = asyncHandler(async (req: any, res) => {
  const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id }).populate('companyId');
  if (!job) throw new AppError('Job not found.', 404);
  ok(res, 'Employer job loaded.', job);
});

export const updateEmployerJob = asyncHandler(async (req: any, res) => {
  const data = jobInputSchema.partial().parse(req.body);
  const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id });
  if (!job) throw new AppError('Job not found.', 404);

  Object.assign(job, {
    ...data,
    remote: data.workplaceType ? data.workplaceType === 'remote' : job.remote,
    remoteType: data.workplaceType || job.remoteType,
    deadline: data.deadline ? new Date(data.deadline) : job.deadline
  });
  if (data.title && data.title !== job.title && job.companyId) {
    job.slug = await uniqueJobSlug(data.title, job.companyId.toString(), job._id.toString());
  }
  await job.save();
  await auditLog(req, 'employer.job.update', 'Job', job._id.toString(), { title: job.title });
  ok(res, 'Job updated.', job);
});

export const deleteEmployerJob = asyncHandler(async (req: any, res) => {
  const job = await Job.findOne({ _id: req.params.id, employerId: req.user.id });
  if (!job) throw new AppError('Job not found.', 404);
  if (job.status !== 'draft') throw new AppError('Only draft jobs can be deleted.', 400);
  await job.deleteOne();
  await auditLog(req, 'employer.job.delete', 'Job', job._id.toString(), { title: job.title });
  ok(res, 'Draft job deleted.', { deleted: true });
});

export const publishEmployerJob = asyncHandler(async (req: any, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, employerId: req.user.id },
    { status: 'published', postedAt: new Date(), moderationStatus: 'approved' },
    { new: true }
  );
  if (!job) throw new AppError('Job not found.', 404);
  await auditLog(req, 'employer.job.publish', 'Job', job._id.toString(), { title: job.title });
  ok(res, 'Job published.', job);
});

export const archiveEmployerJob = asyncHandler(async (req: any, res) => {
  const job = await Job.findOneAndUpdate({ _id: req.params.id, employerId: req.user.id }, { status: 'archived' }, { new: true });
  if (!job) throw new AppError('Job not found.', 404);
  await auditLog(req, 'employer.job.archive', 'Job', job._id.toString(), { title: job.title });
  ok(res, 'Job archived.', job);
});
