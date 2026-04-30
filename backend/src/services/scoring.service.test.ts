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
    expect(result.applyPriority).toMatch(/Apply Now|Tailor First|Improve First|Skip/);
    expect(result.matchedSkills.map((skill) => skill.toLowerCase())).toContain('react');
    expect(result).toHaveProperty('scamRiskScore');
    expect(result).toHaveProperty('atsMatchScore');
  });

  it('does not invent a score when profile and resume are missing', () => {
    const result = scoreJob('', '', 'React Node.js fresher internship with MongoDB and APIs.');
    expect(result.profileIncomplete).toBe(true);
    expect(result.finalScore).toBeNull();
    expect(result.applyPriority).toBe('Profile incomplete');
  });

  it('does not always skip fresher-friendly jobs when skills match', () => {
    const result = scoreJob(
      'fresher React Node.js MongoDB JavaScript',
      'Projects in React, Node.js, MongoDB, JavaScript and REST APIs with Git.',
      'Full Stack Developer Intern fresher friendly role using React Node.js MongoDB JavaScript REST APIs.',
      { experienceLevel: 'fresher', targetRoles: ['Full Stack Developer'] }
    );
    expect(result.finalScore ?? 0).toBeGreaterThan(50);
    expect(result.applyPriority).not.toBe('Skip');
  });
});
