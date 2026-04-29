import { z } from 'zod';
import User from '../models/User';
import Application from '../models/Application';
import Resume from '../models/Resume';
import { asyncHandler } from '../utils/asyncHandler';

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
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      ...(data.name ? { name: data.name } : {}),
      ...(data.recoveryEmail ? { recoveryEmail: data.recoveryEmail } : {}),
      profile: {
        skills: data.skills || [],
        experienceLevel: data.experienceLevel || '',
        resumeBaseText: data.resumeBaseText || '',
        preferredRoles: data.preferredRoles || [],
        expectedSalary: data.expectedSalary || 0
      }
    },
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
