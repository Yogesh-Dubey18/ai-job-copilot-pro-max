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

const copilotSchema = z.object({
  action: z.enum([
    'analyze-job',
    'tailor-resume',
    'cover-letter',
    'interview',
    'follow-up',
    'rejection',
    'today'
  ]),
  route: z.string().optional(),
  mentorMode: z.enum(['english', 'hinglish']).default('english'),
  role: z.string().optional(),
  company: z.string().optional(),
  profileText: z.string().optional(),
  jobDescription: z.string().optional()
});

export const createCopilot = asyncHandler(async (req, res) => {
  const payload = copilotSchema.parse(req.body);
  const kindMap = {
    'analyze-job': 'next-step',
    'tailor-resume': 'next-step',
    'cover-letter': 'gmail',
    interview: 'mock-interview',
    'follow-up': 'gmail',
    rejection: 'next-step',
    today: 'next-step'
  } as const;
  const workflow = await generateWorkflow(kindMap[payload.action], payload);
  const prefix =
    payload.mentorMode === 'hinglish'
      ? 'Hinglish mentor note: Seedha focus rakho, next best action yeh hai.'
      : 'Mentor note: focus on the next highest-leverage action.';

  res.json({
    success: true,
    data: {
      ...workflow,
      summary: `${prefix} ${workflow.summary}`,
      context: { route: payload.route || '/', action: payload.action, mentorMode: payload.mentorMode }
    }
  });
});
