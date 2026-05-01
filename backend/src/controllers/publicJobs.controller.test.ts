import { describe, expect, it } from 'vitest';
import { buildPublicJobFilter, publicJobSort } from './jobs.controller';

describe('public jobs filters and pagination foundation', () => {
  it('requires published or legacy-compatible public jobs', () => {
    const filter = buildPublicJobFilter({});
    expect(filter.$and[0].$or).toContainEqual({ status: 'published' });
    expect(filter.$and[1].$or).toContainEqual({ moderationStatus: 'approved' });
  });

  it('builds basic filters for search, location, skills, and salary', () => {
    const filter = buildPublicJobFilter({
      query: 'react developer',
      location: 'Delhi',
      skills: 'React,Node.js',
      salaryMin: '500000',
      workplaceType: 'remote',
      employmentType: 'full_time'
    });
    expect(filter.$and.length).toBeGreaterThan(5);
    expect(filter.$and).toContainEqual({ workplaceType: 'remote' });
    expect(filter.$and).toContainEqual({ employmentType: 'full_time' });
    expect(filter.$and).toContainEqual({ salaryMax: { $gte: 500000 } });
  });

  it('sorts by salary when requested', () => {
    expect(publicJobSort('salaryHigh')).toEqual({ salaryMax: -1, salaryMin: -1, createdAt: -1 });
    expect(publicJobSort('salaryLow')).toEqual({ salaryMin: 1, salaryMax: 1, createdAt: -1 });
  });
});
