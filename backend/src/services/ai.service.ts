import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export interface ApplyPack {
  matchScore: number;
  missingSkills: string[];
  tailoredResume: string;
  coverLetter: string;
  recruiterEmail: string;
  fallback: boolean;
}

const fallbackApplyPack = (profileText: string, reason: string): ApplyPack => ({
  matchScore: 0,
  tailoredResume: profileText,
  coverLetter: 'Please configure your GEMINI_API_KEY in the backend environment to generate this.',
  recruiterEmail: reason,
  missingSkills: [],
  fallback: true
});

const extractJson = (text: string) => {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1) {
    throw new Error('AI response did not contain JSON.');
  }

  return cleaned.slice(start, end + 1);
};

export const generateApplyPack = async (
  profileText: string,
  jobDescription: string
): Promise<ApplyPack> => {
  if (!env.GEMINI_API_KEY) {
    return fallbackApplyPack(profileText, 'AI key missing. Fallback activated.');
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert career coach and ATS optimizer.

User Profile:
${profileText}

Job Description:
${jobDescription}

Return JSON only. Do not include markdown.
The resume must be ATS-friendly and strictly reverse-chronological.
Avoid complex tables, columns, graphics, hidden text, or decorative formatting.
Use natural keywords from the job description. Include measurable achievements where possible.

Output exactly this shape:
{
  "matchScore": <number 0-100>,
  "missingSkills": ["skill1", "skill2"],
  "tailoredResume": "<resume text optimized for ATS, strictly reverse-chronological>",
  "coverLetter": "<professional cover letter>",
  "recruiterEmail": "<short cold outreach email>"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(extractJson(responseText));

    return {
      matchScore: Number(parsed.matchScore) || 0,
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      tailoredResume: String(parsed.tailoredResume || profileText),
      coverLetter: String(parsed.coverLetter || ''),
      recruiterEmail: String(parsed.recruiterEmail || ''),
      fallback: false
    };
  } catch (error) {
    console.error('AI generation error:', error);
    return fallbackApplyPack(profileText, 'AI generation failed. Fallback activated.');
  }
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
  const library: Record<WorkflowKind, WorkflowResult> = {
    'next-step': {
      kind,
      title: 'Next-Step Plan',
      summary: `Focus on the highest-fit applications for ${target}.`,
      items: ['Update resume keywords', 'Send a concise recruiter note', 'Move qualified roles to applied status'],
      fallback: true
    },
    'mock-interview': {
      kind,
      title: 'Mock Interview Pack',
      summary: `Practice role-specific answers for ${target}.`,
      items: ['Tell me about your most relevant project', 'How do you debug production issues?', 'Describe a difficult tradeoff you made'],
      fallback: true
    },
    salary: {
      kind,
      title: 'Salary Guidance',
      summary: `Use market research and your experience to set a confident range for ${target}.`,
      items: ['Define your walk-away number', 'Ask for total compensation details', 'Negotiate after offer, not before fit is proven'],
      fallback: true
    },
    portfolio: {
      kind,
      title: 'Portfolio Generator',
      summary: `Create a focused portfolio page for ${target}.`,
      items: ['Hero: role-specific value proposition', 'Case study: measurable project outcome', 'Proof: skills, links, testimonials'],
      fallback: true
    },
    networking: {
      kind,
      title: 'Networking Plan',
      summary: `Find warm paths into ${company || 'the company'}.`,
      items: ['Identify 5 relevant employees', 'Send a short value-led note', 'Follow up once after 4 business days'],
      fallback: true
    },
    gmail: {
      kind,
      title: 'Gmail-Ready Outreach Draft',
      summary: `Copy this into Gmail for ${target}.`,
      items: ['Subject: Quick question about your team', 'Keep under 120 words', 'Ask for advice, not a job'],
      draft: `Subject: Quick question about ${company || 'your team'}\n\nHi,\n\nI noticed your team is hiring for ${role || 'a role'} and the work looks closely aligned with my background. I would appreciate one quick pointer on what the team values most in strong candidates.\n\nThanks,\nYogesh`,
      fallback: true
    }
  };

  return library[kind];
};

export const generateWorkflow = async (
  kind: WorkflowKind,
  input: { role?: string; company?: string; profileText?: string; jobDescription?: string }
): Promise<WorkflowResult> => {
  if (!env.GEMINI_API_KEY) {
    return fallbackWorkflow(kind, input.role || '', input.company || '');
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
Return JSON only for an AI job-search SaaS workflow.
Workflow kind: ${kind}
Role: ${input.role || ''}
Company: ${input.company || ''}
Profile: ${input.profileText || ''}
Job description: ${input.jobDescription || ''}

Output exactly:
{
  "kind": "${kind}",
  "title": "...",
  "summary": "...",
  "items": ["...", "..."],
  "draft": "optional long-form draft"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(extractJson(result.response.text()));
    return {
      kind,
      title: String(parsed.title || fallbackWorkflow(kind, input.role || '', input.company || '').title),
      summary: String(parsed.summary || ''),
      items: Array.isArray(parsed.items) ? parsed.items.map(String) : [],
      draft: parsed.draft ? String(parsed.draft) : undefined,
      fallback: false
    };
  } catch (error) {
    console.error('AI workflow error:', error);
    return fallbackWorkflow(kind, input.role || '', input.company || '');
  }
};
