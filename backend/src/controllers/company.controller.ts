import { z } from 'zod';
import Company from '../models/Company';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { auditLog } from '../utils/audit';
import { created, ok } from '../utils/apiResponse';
import { slugify } from '../utils/slug';

const companySchema = z.object({
  name: z.string().min(2),
  logo: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  size: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z
    .object({
      linkedin: z.string().url().optional().or(z.literal('')),
      twitter: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal(''))
    })
    .optional()
});

const publicCompanyFields = 'name slug logo website industry size description location socialLinks verificationStatus trustScore createdAt updatedAt';

const uniqueSlug = async (name: string, existingId?: string) => {
  const base = slugify(name) || 'company';
  let slug = base;
  let suffix = 1;
  while (await Company.exists({ slug, ...(existingId ? { _id: { $ne: existingId } } : {}) })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
};

export const createCompany = asyncHandler(async (req: any, res) => {
  const data = companySchema.parse(req.body);
  const existing = await Company.findOne({ ownerId: req.user.id });
  if (existing) throw new AppError('Company profile already exists for this employer.', 409);

  const company = await Company.create({
    ...data,
    ownerId: req.user.id,
    slug: await uniqueSlug(data.name),
    verificationStatus: 'pending'
  });
  await auditLog(req, 'company.create', 'Company', company._id.toString(), { name: company.name });
  created(res, 'Company profile created.', company);
});

export const getMyCompany = asyncHandler(async (req: any, res) => {
  const company = await Company.findOne({ ownerId: req.user.id });
  if (!company) throw new AppError('Company profile not found.', 404);
  ok(res, 'Company profile loaded.', company);
});

export const updateMyCompany = asyncHandler(async (req: any, res) => {
  const data = companySchema.partial().parse(req.body);
  const company = await Company.findOne({ ownerId: req.user.id });
  if (!company) throw new AppError('Company profile not found.', 404);

  Object.assign(company, data);
  if (data.name && data.name !== company.name) {
    company.slug = await uniqueSlug(data.name, company._id.toString());
  }
  await company.save();
  await auditLog(req, 'company.update', 'Company', company._id.toString(), { name: company.name });
  ok(res, 'Company profile updated.', company);
});

export const getPublicCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ slug: req.params.slug }).select(publicCompanyFields);
  if (!company) throw new AppError('Company not found.', 404);
  ok(res, 'Company profile loaded.', company);
});
