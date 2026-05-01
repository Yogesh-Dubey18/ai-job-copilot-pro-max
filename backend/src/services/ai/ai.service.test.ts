import { describe, expect, it } from 'vitest';
import { generateApplyPack, generateJobMatch } from './ai.service';
import { safeParseJson } from './jsonParser';

describe('ai service fallback and JSON parsing', () => {
  it('parses markdown-wrapped JSON safely', () => {
    expect(safeParseJson<{ score: number }>('```json\n{"score":82}\n```')).toEqual({ score: 82 });
  });

  it('returns required job-match shape without an AI key', async () => {
    const result = await generateJobMatch({
      resumeText: 'React Node MongoDB TypeScript project experience building APIs',
      jobDescription: 'We need React, Node.js, MongoDB, Docker and AWS experience.'
    });

    expect(result).toEqual(
      expect.objectContaining({
        fallback: true,
        matchedSkills: expect.any(Array),
        missingSkills: expect.any(Array),
        strengths: expect.any(Array),
        improvements: expect.any(Array),
        learningRoadmap: expect.any(Array),
        atsTips: expect.any(Array),
        summary: expect.any(String)
      })
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('keeps apply-pack compatibility in fallback mode', async () => {
    const result = await generateApplyPack('React Node MongoDB resume text', 'React Node job description');
    expect(result).toEqual(
      expect.objectContaining({
        fallback: true,
        matchScore: expect.any(Number),
        missingSkills: expect.any(Array),
        tailoredResume: expect.any(String),
        coverLetter: expect.any(String),
        recruiterEmail: expect.any(String)
      })
    );
  });
});
