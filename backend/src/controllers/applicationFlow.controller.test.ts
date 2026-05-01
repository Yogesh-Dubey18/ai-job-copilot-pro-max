import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApplication } from './jobs.controller';
import { saveJobForUser } from './savedJobs.controller';

const mocks = vi.hoisted(() => ({
  jobFindOne: vi.fn(),
  savedFindOneAndUpdate: vi.fn(),
  applicationFindOne: vi.fn(),
  applicationCreate: vi.fn()
}));

vi.mock('../models/Job', () => ({
  default: {
    findOne: mocks.jobFindOne
  }
}));

vi.mock('../models/SavedJob', () => ({
  default: {
    findOneAndUpdate: mocks.savedFindOneAndUpdate,
    deleteOne: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn()
  }
}));

vi.mock('../models/Application', () => ({
  applicationStatuses: [
    'saved',
    'preparing',
    'manually_applied',
    'resume_tailored',
    'applied',
    'viewed',
    'recruiter_viewed',
    'shortlisted',
    'assessment',
    'interview_round_1',
    'interview_round_2',
    'hr_round',
    'offered',
    'rejected',
    'joined',
    'withdrawn'
  ],
  default: {
    findOne: mocks.applicationFindOne,
    create: mocks.applicationCreate
  }
}));

const res = () => {
  const response: any = {};
  response.status = vi.fn().mockReturnValue(response);
  response.json = vi.fn().mockReturnValue(response);
  return response;
};

const run = async (handler: any, req: any, response: any) => {
  const next = vi.fn();
  handler(req, response, next);
  await new Promise((resolve) => setTimeout(resolve, 0));
  return next;
};

describe('saved jobs and application flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves a public job idempotently for the current user', async () => {
    mocks.jobFindOne.mockReturnValue({ select: vi.fn().mockResolvedValue({ _id: 'job1' }) });
    mocks.savedFindOneAndUpdate.mockResolvedValue({ _id: 'saved1', userId: 'user1', jobId: 'job1' });
    const response = res();
    const next = await run(saveJobForUser, { params: { jobId: 'job1' }, user: { id: 'user1' } }, response);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.savedFindOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user1', jobId: 'job1' },
      { userId: 'user1', jobId: 'job1' },
      expect.objectContaining({ upsert: true, new: true })
    );
  });

  it('blocks duplicate active job applications', async () => {
    mocks.jobFindOne.mockResolvedValue({ _id: 'job1', company: 'Acme', title: 'Engineer' });
    mocks.applicationFindOne.mockResolvedValue({ _id: 'app1' });
    const next = await run(createApplication, { body: { jobId: 'job1' }, user: { id: 'user1' } }, res());
    expect(next.mock.calls[0][0].statusCode).toBe(409);
  });

  it('creates an application for a public job', async () => {
    mocks.jobFindOne.mockResolvedValue({ _id: 'job1', company: 'Acme', title: 'Engineer' });
    mocks.applicationFindOne.mockResolvedValue(null);
    mocks.applicationCreate.mockResolvedValue({ _id: 'app1', jobId: 'job1', company: 'Acme', title: 'Engineer' });
    const response = res();
    const next = await run(createApplication, { body: { jobId: 'job1', coverLetter: 'Hello' }, user: { id: 'user1' } }, response);
    expect(next).not.toHaveBeenCalled();
    expect(mocks.applicationCreate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user1', company: 'Acme', title: 'Engineer' }));
    expect(response.status).toHaveBeenCalledWith(201);
  });
});
