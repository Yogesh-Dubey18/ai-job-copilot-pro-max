import { z } from 'zod';
import User from '../models/User';
import Application from '../models/Application';
import Resume from '../models/Resume';
import Portfolio from '../models/Portfolio';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { isReadableResumeText, sanitizeResumeText } from '../utils/resumeText';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  skills: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  resumeBaseText: z.string().optional(),
  preferredRoles: z.array(z.string()).optional(),
  expectedSalary: z.number().optional(),
  recoveryEmail: z.string().email().optional()
});

export const getProfile = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: any, res) => {
  const data = profileSchema.parse(req.body);
  const cleanResumeText = sanitizeResumeText(data.resumeBaseText || '');
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(data.name ? { name: data.name } : {}),
      ...(data.recoveryEmail ? { recoveryEmail: data.recoveryEmail } : {}),
      profile: {
        skills: data.skills || [],
        experienceLevel: data.experienceLevel || '',
        resumeBaseText: cleanResumeText && isReadableResumeText(cleanResumeText) ? cleanResumeText : '',
        preferredRoles: data.preferredRoles || [],
        expectedSalary: data.expectedSalary || 0
      }
    },
    { new: true }
  ).select('-passwordHash');

  res.json({ success: true, data: user });
});

export const updateProfileResumeText = asyncHandler(async (req: any, res) => {
  const schema = z.object({ text: z.string().min(200) });
  const { text } = schema.parse(req.body);
  const clean = sanitizeResumeText(text);
  if (!isReadableResumeText(clean)) {
    throw new AppError('Paste at least 200 characters of clean, readable resume text.', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 'profile.resumeBaseText': clean },
    { new: true }
  ).select('-passwordHash');

  res.json({ success: true, data: user });
});

export const deleteAccount = asyncHandler(async (req: any, res) => {
  await Promise.all([
    Resume.deleteMany({ userId: req.user.id }),
    Application.deleteMany({ userId: req.user.id }),
    User.findByIdAndDelete(req.user.id)
  ]);
  res.json({ success: true, data: { deleted: true } });
});

export const exportMyData = asyncHandler(async (req: any, res) => {
  const [user, resumes, applications, portfolio] = await Promise.all([
    User.findById(req.user.id).select('-passwordHash').lean(),
    Resume.find({ userId: req.user.id }).lean(),
    Application.find({ userId: req.user.id }).lean(),
    Portfolio.findOne({ userId: req.user.id }).lean()
  ]);

  res.json({
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      user,
      resumes,
      applications,
      portfolio
    }
  });
});
