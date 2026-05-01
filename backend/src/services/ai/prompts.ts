import { sanitizeForAiContext } from '../../utils/resumeText';

const jsonRules = `
Return JSON only. Do not include markdown.
Act as an expert career coach, ATS optimizer, and hiring-signal analyst.
Use reverse chronological resume guidance. Do not recommend tables, graphics, columns, or hidden text.
Match keywords naturally and never invent experience.
Prefer measurable achievements and concrete next actions.
`;

export const jobMatchPrompt = (input: { profileText?: string; resumeText?: string; jobDescription: string; skills?: string[] }) => `
${jsonRules}
Candidate profile:
${sanitizeForAiContext(input.profileText || '')}

Resume:
${sanitizeForAiContext(input.resumeText || '')}

Candidate skills:
${(input.skills || []).join(', ')}

Job description:
${sanitizeForAiContext(input.jobDescription)}

Output exactly:
{
  "score": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "strengths": [],
  "improvements": [],
  "learningRoadmap": [],
  "atsTips": [],
  "summary": ""
}
`;

export const resumeFeedbackPrompt = (resumeText: string) => `
${jsonRules}
Resume:
${sanitizeForAiContext(resumeText)}

Output exactly:
{
  "score": 0,
  "missingSkills": [],
  "weakSections": [],
  "atsTips": [],
  "keywordImprovements": [],
  "summaryImprovement": "",
  "projectBulletImprovements": []
}
`;

export const coverLetterPrompt = (input: { profileText?: string; resumeText?: string; jobDescription: string; company?: string; tone?: string }) => `
${jsonRules}
Tone: ${input.tone || 'professional'}
Company: ${input.company || ''}
Profile:
${sanitizeForAiContext(input.profileText || '')}
Resume:
${sanitizeForAiContext(input.resumeText || '')}
Job:
${sanitizeForAiContext(input.jobDescription)}

Output exactly:
{ "coverLetter": "" }
`;

export const interviewQuestionsPrompt = (input: { role?: string; company?: string; jobDescription?: string; resumeText?: string }) => `
${jsonRules}
Role: ${input.role || ''}
Company: ${input.company || ''}
Resume:
${sanitizeForAiContext(input.resumeText || '')}
Job:
${sanitizeForAiContext(input.jobDescription || '')}

Output exactly:
{ "questions": [{ "question": "", "idealAnswer": "", "skillArea": "" }] }
`;

export const answerEvaluationPrompt = (input: { question: string; answer: string; role?: string }) => `
${jsonRules}
Role: ${input.role || ''}
Question: ${input.question}
Candidate answer: ${input.answer}

Output exactly:
{ "score": 0, "strengths": [], "improvements": [], "idealAnswerOutline": "" }
`;

export const rejectionAnalysisPrompt = (input: { rejectionText: string; role?: string }) => `
${jsonRules}
Role: ${input.role || ''}
Rejection or feedback:
${sanitizeForAiContext(input.rejectionText)}

Output exactly:
{ "likelyReasons": [], "resumeFixes": [], "skillFixes": [], "nextActions": [], "summary": "" }
`;
