import { beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizeEmployerApplicationStatus, scheduleEmployerInterview, updateEmployerApplicationStatus } from './employerApplicants.controller';

const mocks = vi.hoisted(() => ({
  applicationFindById: vi.fn(),
  jobFindOne: vi.fn(),
  interviewCreate: vi.fn(),
  notificationCreate: vi.fn(),
  auditCreate: vi.fn()
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
  default: { findById: mocks.applicationFindById }
}));

vi.mock('../models/Job', () => ({ default: { findOne: mocks.jobFindOne } }));
vi.mock('../models/Interview', () => ({ default: { create: mocks.interviewCreate } }));
vi.mock('../models/Notification', () => ({ default: { create: mocks.notificationCreate } }));
vi.mock('../models/AuditLog', () => ({ default: { create: mocks.auditCreate } }));

const req = (body = {}, params = { id: 'app1' }) =>
  ({ body, params, user: { id: 'employer1', role: 'employer' }, headers: {}, ip: '127.0.0.1' }) as any;

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

const populatedApplication = () => {
  const application: any = {
    _id: { toString: () => 'app1' },
    userId: { _id: 'candidate1', name: 'Candidate' },
    jobId: 'job1',
    title: 'Engineer',
    status: 'applied',
    timeline: [],
    employerNotes: [],
    save: vi.fn().mockResolvedValue(undefined)
  };
  const chain: any = {
    populate: vi.fn().mockReturnThis(),
    then: (resolve: any) => resolve(application)
  };
  mocks.applicationFindById.mockReturnValue(chain);
  mocks.jobFindOne.mockResolvedValue({ _id: 'job1', company: 'Acme', employerId: 'employer1' });
  return application;
};

describe('employer applicants management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notificationCreate.mockResolvedValue({});
    mocks.auditCreate.mockResolvedValue({});
  });

  it('maps portal status aliases to existing application statuses', () => {
    expect(normalizeEmployerApplicationStatus('interview')).toBe('interview_round_1');
    expect(normalizeEmployerApplicationStatus('shortlisted')).toBe('shortlisted');
    expect(() => normalizeEmployerApplicationStatus('not-real')).toThrow('Invalid application status.');
  });

  it('updates status for an owned applicant and creates a notification', async () => {
    const application = populatedApplication();
    const response = res();
    const next = await run(updateEmployerApplicationStatus, req({ status: 'shortlisted', note: 'Strong profile' }), response);

    expect(next).not.toHaveBeenCalled();
    expect(application.status).toBe('shortlisted');
    expect(application.timeline[0]).toEqual(expect.objectContaining({ status: 'shortlisted', source: 'employer' }));
    expect(mocks.notificationCreate).toHaveBeenCalledWith(expect.objectContaining({ userId: 'candidate1', type: 'application_status' }));
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('schedules an interview for an owned applicant', async () => {
    const application = populatedApplication();
    mocks.interviewCreate.mockResolvedValue({ _id: { toString: () => 'interview1' } });
    const response = res();
    const next = await run(
      scheduleEmployerInterview,
      req({ scheduledAt: new Date(Date.now() + 86400000).toISOString(), mode: 'video', meetingLink: 'https://meet.example.com' }),
      response
    );

    expect(next).not.toHaveBeenCalled();
    expect(application.status).toBe('interview_round_1');
    expect(mocks.interviewCreate).toHaveBeenCalledWith(expect.objectContaining({ candidateId: 'candidate1', employerId: 'employer1' }));
    expect(mocks.notificationCreate).toHaveBeenCalledWith(expect.objectContaining({ type: 'interview_scheduled' }));
    expect(response.status).toHaveBeenCalledWith(201);
  });
});
