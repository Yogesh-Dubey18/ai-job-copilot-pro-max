import { env } from '../../config/env';
import AIUsage from '../../models/AIUsage';
import { extractSkills } from '../scoring.service';
import { sanitizeForAiContext } from '../../utils/resumeText';
import { GeminiProvider } from './geminiProvider';
import { safeParseJson } from './jsonParser';
import { OpenAIProvider } from './openaiProvider';
import {
  answerEvaluationPrompt,
  coverLetterPrompt,
  interviewQuestionsPrompt,
  jobMatchPrompt,
  rejectionAnalysisPrompt,
  resumeFeedbackPrompt
} from './prompts';
import { AiCallOptions, AiProvider } from './provider';

export interface ApplyPack {
  matchScore: number;
  missingSkills: string[];
  tailoredResume: string;
  coverLetter: string;
  recruiterEmail: string;
  fallback: boolean;
}

export interface JobMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  learningRoadmap: string[];
  atsTips: string[];
  summary: string;
  fallback: boolean;
}

export interface ResumeFeedbackResult {
  score: number;
  missingSkills: string[];
  weakSections: string[];
  atsTips: string[];
  keywordImprovements: string[];
  summaryImprovement: string;
  projectBulletImprovements: string[];
  fallback: boolean;
}

const getProvider = (): AiProvider | null => {
  if (env.AI_PROVIDER === 'openai' && env.OPENAI_API_KEY) return new OpenAIProvider();
  if (env.GEMINI_API_KEY) return new GeminiProvider();
  return null;
};

const estimateTokens = (text: string) => Math.ceil(text.length / 4);

const trackUsage = async (options: AiCallOptions, provider: string, prompt: string, output: string, success: boolean, errorMessage = '') => {
  if (!options.userId) return;
  await AIUsage.create({
    userId: options.userId,
    feature: options.feature,
    provider,
    inputTokens: estimateTokens(prompt),
    outputTokens: estimateTokens(output),
    costEstimate: 0,
    success,
    errorMessage
  }).catch(() => undefined);
};

const runJson = async <T>(prompt: string, fallback: T, options: AiCallOptions): Promise<T & { fallback: boolean }> => {
  const provider = getProvider();
  if (!provider) {
    await trackUsage(options, 'fallback', prompt, JSON.stringify(fallback), true);
    return { ...fallback, fallback: true };
  }

  try {
    const output = await provider.generateJson(prompt);
    const parsed = safeParseJson<T>(output);
    await trackUsage(options, provider.name, prompt, output, true);
    return { ...parsed, fallback: false };
  } catch (firstError) {
    try {
      const output = await provider.generateJson(`${prompt}\n\nYour previous response was invalid. Return strict JSON only.`);
      const parsed = safeParseJson<T>(output);
      await trackUsage(options, provider.name, prompt, output, true);
      return { ...parsed, fallback: false };
    } catch (secondError) {
      const message = secondError instanceof Error ? secondError.message : 'AI provider failed.';
      await trackUsage(options, provider.name, prompt, JSON.stringify(fallback), false, message);
      return { ...fallback, fallback: true };
    }
  }
};

const normalizeList = (value: unknown) => (Array.isArray(value) ? value.map(String).filter(Boolean) : []);

const fallbackJobMatch = (input: { resumeText?: string; jobDescription: string; skills?: string[] }): Omit<JobMatchResult, 'fallback'> => {
  const resumeSkills = new Set([...(input.skills || []), ...extractSkills(`${input.resumeText || ''}`)].map((skill) => skill.toLowerCase()));
  const jobSkills = extractSkills(input.jobDescription);
  const matchedSkills = jobSkills.filter((skill) => resumeSkills.has(skill.toLowerCase()));
  const missingSkills = jobSkills.filter((skill) => !resumeSkills.has(skill.toLowerCase()));
  const score = jobSkills.length ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 45;

  return {
    score,
    matchedSkills,
    missingSkills,
    strengths: matchedSkills.length ? [`Matched ${matchedSkills.length} required skills.`] : ['Profile can still be tailored with stronger job keywords.'],
    improvements: missingSkills.slice(0, 5).map((skill) => `Add truthful evidence for ${skill} if you have it.`),
    learningRoadmap: missingSkills.slice(0, 4),
    atsTips: ['Use exact role keywords naturally.', 'Keep plain headings and reverse chronological sections.', 'Add measurable impact bullets.'],
    summary: score >= 70 ? 'Strong fit after tailoring.' : 'Improve skill evidence before applying.'
  };
};

export const generateJobMatch = async (
  input: { profileText?: string; resumeText?: string; jobDescription: string; skills?: string[] },
  options: Partial<AiCallOptions> = {}
): Promise<JobMatchResult> => {
  const fallback = fallbackJobMatch(input);
  const result = await runJson<Omit<JobMatchResult, 'fallback'>>(jobMatchPrompt(input), fallback, {
    feature: 'job-match',
    ...options
  });

  return {
    score: Math.max(0, Math.min(100, Number(result.score) || fallback.score)),
    matchedSkills: normalizeList(result.matchedSkills),
    missingSkills: normalizeList(result.missingSkills),
    strengths: normalizeList(result.strengths),
    improvements: normalizeList(result.improvements),
    learningRoadmap: normalizeList(result.learningRoadmap),
    atsTips: normalizeList(result.atsTips),
    summary: String(result.summary || fallback.summary),
    fallback: result.fallback
  };
};

const fallbackResumeFeedback = (resumeText: string): Omit<ResumeFeedbackResult, 'fallback'> => {
  const skills = extractSkills(resumeText);
  const weakSections = [
    !/summary|profile/i.test(resumeText) ? 'Add a concise professional summary.' : '',
    !/projects?/i.test(resumeText) ? 'Add project bullets with measurable outcomes.' : '',
    !/\d+%|\d+x|improved|reduced|launched/i.test(resumeText) ? 'Add quantified achievements.' : ''
  ].filter(Boolean);

  return {
    score: Math.min(100, Math.max(35, Math.round(resumeText.length / 35))),
    missingSkills: skills.length >= 5 ? [] : ['Add more role-specific technical skills.'],
    weakSections,
    atsTips: ['Avoid tables and graphics.', 'Use clear headings.', 'Keep reverse chronological order.'],
    keywordImprovements: skills,
    summaryImprovement: 'Mention target role, core stack, and strongest proof in 2-3 lines.',
    projectBulletImprovements: ['Use Action + Technology + Result.', 'Add scale, users, latency, or business impact.']
  };
};

export const generateResumeFeedback = async (resumeText: string, options: Partial<AiCallOptions> = {}): Promise<ResumeFeedbackResult> => {
  const clean = sanitizeForAiContext(resumeText);
  const fallback = fallbackResumeFeedback(clean);
  const result = await runJson<Omit<ResumeFeedbackResult, 'fallback'>>(resumeFeedbackPrompt(clean), fallback, {
    feature: 'resume-feedback',
    ...options
  });

  return {
    score: Math.max(0, Math.min(100, Number(result.score) || fallback.score)),
    missingSkills: normalizeList(result.missingSkills),
    weakSections: normalizeList(result.weakSections),
    atsTips: normalizeList(result.atsTips),
    keywordImprovements: normalizeList(result.keywordImprovements),
    summaryImprovement: String(result.summaryImprovement || fallback.summaryImprovement),
    projectBulletImprovements: normalizeList(result.projectBulletImprovements),
    fallback: result.fallback
  };
};

export const generateCoverLetter = async (
  input: { profileText?: string; resumeText?: string; jobDescription: string; company?: string; tone?: string },
  options: Partial<AiCallOptions> = {}
) => {
  const fallback = {
    coverLetter: `Dear Hiring Team,\n\nI am excited to apply for this role. My background aligns with the responsibilities described, and I would welcome the opportunity to contribute with practical execution, clear communication, and continuous learning.\n\nThank you for your consideration.`
  };
  return runJson<typeof fallback>(coverLetterPrompt(input), fallback, { feature: 'cover-letter', ...options });
};

export const generateInterviewQuestions = async (
  input: { role?: string; company?: string; jobDescription?: string; resumeText?: string },
  options: Partial<AiCallOptions> = {}
) => {
  const fallback = {
    questions: [
      { question: 'Tell me about your most relevant project.', idealAnswer: 'Use STAR, name the stack, and quantify the result.', skillArea: 'projects' },
      { question: 'How do you debug production issues?', idealAnswer: 'Discuss logs, reproduction, isolation, tests, and rollback safety.', skillArea: 'engineering' }
    ]
  };
  return runJson<typeof fallback>(interviewQuestionsPrompt(input), fallback, { feature: 'interview-questions', ...options });
};

export const evaluateInterviewAnswer = async (
  input: { question: string; answer: string; role?: string },
  options: Partial<AiCallOptions> = {}
) => {
  const fallback = {
    score: input.answer.length > 120 ? 75 : 55,
    strengths: input.answer.length > 120 ? ['Provides useful detail.'] : ['Clear starting point.'],
    improvements: ['Add a specific example and measurable outcome.'],
    idealAnswerOutline: 'Situation, task, action, result, and what you learned.'
  };
  return runJson<typeof fallback>(answerEvaluationPrompt(input), fallback, { feature: 'interview-evaluate', ...options });
};

export const analyzeRejection = async (input: { rejectionText: string; role?: string }, options: Partial<AiCallOptions> = {}) => {
  const fallback = {
    likelyReasons: ['Role fit, timing, or stronger competing candidates.'],
    resumeFixes: ['Tailor summary and project bullets to the next target role.'],
    skillFixes: ['Close the top missing skill gap before the next application.'],
    nextActions: ['Send a polite feedback request.', 'Apply learnings to the next 5 roles.'],
    summary: 'Treat this as signal, not a verdict.'
  };
  return runJson<typeof fallback>(rejectionAnalysisPrompt(input), fallback, { feature: 'rejection-analysis', ...options });
};

const fallbackApplyPack = (profileText: string, jobDescription: string): ApplyPack => {
  const match = fallbackJobMatch({ resumeText: profileText, jobDescription });
  return {
    matchScore: match.score,
    tailoredResume: sanitizeForAiContext(profileText),
    coverLetter: 'AI generation is not connected yet. Use your resume text and the job description to tailor a concise cover letter.',
    recruiterEmail: 'Hi, I found this role and believe my background aligns well. I would appreciate the chance to discuss how I can contribute.',
    missingSkills: match.missingSkills,
    fallback: true
  };
};

export const generateApplyPack = async (profileText: string, jobDescription: string, userId?: string): Promise<ApplyPack> => {
  const fallback = fallbackApplyPack(profileText, jobDescription);
  const prompt = `
Return JSON only.
Profile:
${sanitizeForAiContext(profileText)}

Job Description:
${sanitizeForAiContext(jobDescription)}

Output exactly:
{
  "matchScore": 0,
  "missingSkills": [],
  "tailoredResume": "",
  "coverLetter": "",
  "recruiterEmail": ""
}
`;
  const result = await runJson<Omit<ApplyPack, 'fallback'>>(prompt, fallback, { feature: 'apply-pack', userId });
  return {
    matchScore: Math.max(0, Math.min(100, Number(result.matchScore) || fallback.matchScore)),
    missingSkills: normalizeList(result.missingSkills),
    tailoredResume: sanitizeForAiContext(String(result.tailoredResume || fallback.tailoredResume)),
    coverLetter: String(result.coverLetter || fallback.coverLetter),
    recruiterEmail: String(result.recruiterEmail || fallback.recruiterEmail),
    fallback: result.fallback
  };
};

export type WorkflowKind = 'next-step' | 'mock-interview' | 'salary' | 'portfolio' | 'networking' | 'gmail';

export interface WorkflowResult {
  kind: WorkflowKind;
  title: string;
  summary: string;
  items: string[];
  draft?: string;
  fallback: boolean;
}

const fallbackWorkflow = (kind: WorkflowKind, role: string, company: string): WorkflowResult => {
  const target = `${role || 'target role'}${company ? ` at ${company}` : ''}`;
  const base: WorkflowResult = {
    kind,
    title: 'Next-Step Plan',
    summary: `Focus on the highest-fit applications for ${target}.`,
    items: ['Update resume keywords', 'Send a concise recruiter note', 'Move qualified roles to applied status'],
    fallback: true
  };
  if (kind === 'mock-interview') return { ...base, title: 'Mock Interview Pack', items: ['Explain your best project', 'Debugging process', 'Tradeoff decision'] };
  if (kind === 'gmail') return { ...base, title: 'Gmail-Ready Outreach Draft', draft: `Subject: Quick question about ${company || 'your team'}\n\nHi,\n\nI noticed your team is hiring for ${role || 'a role'} and the work aligns with my background. I would appreciate one quick pointer on what the team values most in strong candidates.\n\nThanks.` };
  if (kind === 'portfolio') return { ...base, title: 'Portfolio Generator', items: ['Role-focused headline', 'Case study with measurable result', 'Skills and links'] };
  if (kind === 'salary') return { ...base, title: 'Salary Guidance', items: ['Define range', 'Ask for total compensation', 'Negotiate after offer'] };
  if (kind === 'networking') return { ...base, title: 'Networking Plan', items: ['Find 5 relevant employees', 'Send value-led note', 'Follow up once'] };
  return base;
};

export const generateWorkflow = async (
  kind: WorkflowKind,
  input: { role?: string; company?: string; profileText?: string; jobDescription?: string },
  userId?: string
): Promise<WorkflowResult> => {
  const fallback = fallbackWorkflow(kind, input.role || '', input.company || '');
  const prompt = `
Return JSON only for an AI job-search SaaS workflow.
Workflow kind: ${kind}
Role: ${input.role || ''}
Company: ${input.company || ''}
Profile: ${sanitizeForAiContext(input.profileText || '')}
Job description: ${sanitizeForAiContext(input.jobDescription || '')}

Output exactly:
{
  "kind": "${kind}",
  "title": "",
  "summary": "",
  "items": [],
  "draft": ""
}
`;
  const result = await runJson<Omit<WorkflowResult, 'fallback'>>(prompt, fallback, { feature: `workflow-${kind}`, userId });
  return {
    kind,
    title: String(result.title || fallback.title),
    summary: String(result.summary || fallback.summary),
    items: normalizeList(result.items),
    draft: result.draft ? String(result.draft) : fallback.draft,
    fallback: result.fallback
  };
};
