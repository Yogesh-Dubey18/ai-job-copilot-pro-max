import { z } from 'zod';
import { generateApplyPack } from '../services/ai.service';
import { asyncHandler } from '../utils/asyncHandler';

const applyPackSchema = z.object({
  profileText: z.string().min(1),
  jobDescription: z.string().min(1)
});

export const createApplyPack = asyncHandler(async (req, res) => {
  const { profileText, jobDescription } = applyPackSchema.parse(req.body);
  const pack = await generateApplyPack(profileText, jobDescription);
  res.json({ success: true, data: pack });
});
