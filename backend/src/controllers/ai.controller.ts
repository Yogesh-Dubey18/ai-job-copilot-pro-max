import { z } from 'zod';
import { generateApplyPack, generateWorkflow } from '../services/ai.service';
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

const workflowSchema = z.object({
  kind: z.enum(['next-step', 'mock-interview', 'salary', 'portfolio', 'networking', 'gmail']),
  role: z.string().optional(),
  company: z.string().optional(),
  profileText: z.string().optional(),
  jobDescription: z.string().optional()
});

export const createWorkflow = asyncHandler(async (req, res) => {
  const payload = workflowSchema.parse(req.body);
  const data = await generateWorkflow(payload.kind, payload);
  res.json({ success: true, data });
});
