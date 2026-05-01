import { z } from 'zod';
import {
  analyzeRejection,
  evaluateInterviewAnswer,
  generateApplyPack,
  generateCoverLetter,
  generateInterviewQuestions,
  generateJobMatch,
  generateResumeFeedback,
  generateWorkflow
} from '../services/ai.service';
import { asyncHandler } from '../utils/asyncHandler';

const applyPackSchema = z.object({
  profileText: z.string().min(1),
  jobDescription: z.string().min(1)
});

export const createApplyPack = asyncHandler(async (req, res) => {
  const { profileText, jobDescription } = applyPackSchema.parse(req.body);
  const pack = await generateApplyPack(profileText, jobDescription, (req as any).user?.id);
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
  const data = await generateWorkflow(payload.kind, payload, (req as any).user?.id);
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
    'portfolio',
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
    portfolio: 'portfolio',
    today: 'next-step'
  } as const;
  const workflow = await generateWorkflow(kindMap[payload.action], payload, (req as any).user?.id);
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

export const companyReply = asyncHandler(async (req, res) => {
  const schema = z.object({
    incomingMessage: z.string().min(1),
    intent: z.string().default('request_more_info'),
    tone: z.string().default('professional')
  });
  const data = schema.parse(req.body);
  const shortReply = `Thank you for your message. I appreciate the update and would like to proceed thoughtfully.`;
  const body = `${shortReply}\n\nRegarding: "${data.incomingMessage.slice(
    0,
    500
  )}"\n\nPlease share the next steps and any details required from my side.`;
  res.json({
    success: true,
    data: {
      subject: 'Re: Hiring process',
      body,
      replyBody: body,
      tone: data.tone,
      factsUsed: ['Incoming company message supplied by the user'],
      requiresUserInput: ['Verify dates, salary numbers, notice period, and names before sending'],
      riskFlags: ['Do not invent experience, availability, compensation, or personal details'],
      intent: data.intent,
      followUpNeeded: true,
      suggestedNextAction: 'Review the draft, verify facts, and send manually.',
      fallback: true
    }
  });
});

export const jobMatch = asyncHandler(async (req, res) => {
  const schema = z.object({
    profileText: z.string().optional(),
    resumeText: z.string().optional(),
    jobDescription: z.string().min(1),
    skills: z.array(z.string()).optional()
  });
  const data = schema.parse(req.body);
  const result = await generateJobMatch(data, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});

export const resumeFeedback = asyncHandler(async (req, res) => {
  const schema = z.object({ resumeText: z.string().min(1) });
  const data = schema.parse(req.body);
  const result = await generateResumeFeedback(data.resumeText, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});

export const coverLetter = asyncHandler(async (req, res) => {
  const schema = z.object({
    profileText: z.string().optional(),
    resumeText: z.string().optional(),
    jobDescription: z.string().min(1),
    company: z.string().optional(),
    tone: z.string().optional()
  });
  const data = schema.parse(req.body);
  const result = await generateCoverLetter(data, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});

export const interviewQuestions = asyncHandler(async (req, res) => {
  const schema = z.object({
    role: z.string().optional(),
    company: z.string().optional(),
    jobDescription: z.string().optional(),
    resumeText: z.string().optional()
  });
  const data = schema.parse(req.body);
  const result = await generateInterviewQuestions(data, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});

export const interviewEvaluate = asyncHandler(async (req, res) => {
  const schema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    role: z.string().optional()
  });
  const data = schema.parse(req.body);
  const result = await evaluateInterviewAnswer(data, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});

export const rejectionAnalysis = asyncHandler(async (req, res) => {
  const schema = z.object({
    rejectionText: z.string().min(1),
    role: z.string().optional()
  });
  const data = schema.parse(req.body);
  const result = await analyzeRejection(data, { userId: (req as any).user?.id });
  res.json({ success: true, data: result });
});
