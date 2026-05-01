import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createCompany } from './company.controller';
import { createEmployerJob, updateEmployerJob } from './employerJobs.controller';
import { requireRole } from '../middleware/auth';

const mocks = vi.hoisted(() => ({
  companyFindOne: vi.fn(),
  companyExists: vi.fn(),
  companyCreate: vi.fn(),
  jobExists: vi.fn(),
  jobCreate: vi.fn(),
  jobFindOne: vi.fn()
}));

vi.mock('../models/Company', () => ({
  default: {
    findOne: mocks.companyFindOne,
    exists: mocks.companyExists,
    create: mocks.companyCreate
  }
}));

vi.mock('../models/Job', () => ({
  default: {
    exists: mocks.jobExists,
    create: mocks.jobCreate,
    findOne: mocks.jobFindOne
  }
}));

const req = (body = {}, user = { id: 'employer1', role: 'employer' }) => ({ body, user, params: {}, headers: {}, ip: '127.0.0.1' }) as any;
const res = () => {
  const response: any = {};
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  return response;
};

const run = async (handler: any, request: any, response: any) => {
  const next = vi.fn();
  handler(request, response, next);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return next;
};

describe('employer portal backend foundation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.companyExists.mockResolvedValue(null);
    mocks.jobExists.mockResolvedValue(null);
  });

  it('blocks job seekers from employer-only routes', () => {
    const next = vi.fn();
    requireRole('employer')(req({}, { id: 'user1', role: 'job_seeker' }) as any, {} as any, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows an employer to create a company profile', async () => {
    mocks.companyFindOne.mockResolvedValue(null);
    mocks.companyCreate.mockResolvedValue({ _id: { toString: () => 'company1' }, name: 'Acme Careers', slug: 'acme-careers' });
    const response = res();
    const next = await run(createCompany, req({ name: 'Acme Careers', website: '' }), response);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.companyCreate).toHaveBeenCalledWith(expect.objectContaining({ ownerId: 'employer1', slug: 'acme-careers' }));
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('allows an employer with a company to create a job draft', async () => {
    mocks.companyFindOne.mockResolvedValue({ _id: { toString: () => 'company1' }, name: 'Acme Careers' });
    mocks.jobCreate.mockResolvedValue({ _id: { toString: () => 'job1' }, title: 'Full Stack Developer', status: 'draft' });
    const response = res();
    const next = await run(
      createEmployerJob,
      req({
        title: 'Full Stack Developer',
        workplaceType: 'remote',
        employmentType: 'full_time',
        description: 'Build production-grade full stack software for hiring teams.'
      }),
      response
    );
    expect(next).not.toHaveBeenCalled();
    expect(mocks.jobCreate).toHaveBeenCalledWith(expect.objectContaining({ employerId: 'employer1', status: 'draft', company: 'Acme Careers' }));
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it('does not update another employer job', async () => {
    mocks.jobFindOne.mockResolvedValue(null);
    const request = req({ title: 'Updated title' });
    request.params = { id: 'other-job' };
    const next = await run(updateEmployerJob, request, res());
    expect(next.mock.calls[0][0].statusCode).toBe(404);
  });
});
