import { describe, expect, it } from 'vitest';
import { scoreJob } from './scoring.service';

describe('scoreJob', () => {
  it('returns a full blueprint score contract with priority', () => {
    const result = scoreJob(
      'React TypeScript Node.js MongoDB REST API testing',
      'Built React and Node.js applications with TypeScript and MongoDB.',
      'We need a React TypeScript developer with Node.js, APIs, testing, and MongoDB experience.'
    );

    expect(result.finalScore).toBeGreaterThan(50);
    expect(result.applyPriority).toMatch(/Apply Now|Tailor Resume First|Improve Skills First|Skip/);
    expect(result.matchedSkills.map((skill) => skill.toLowerCase())).toContain('react');
    expect(result).toHaveProperty('scamRiskScore');
    expect(result).toHaveProperty('atsMatchScore');
  });
});
