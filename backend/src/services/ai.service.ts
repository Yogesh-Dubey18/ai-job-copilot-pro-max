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
