import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminStats, moderateJob, updateUserStatus, verifyCompany } from './admin.controller';
import { requireAdmin } from '../middleware/auth';

const mocks = vi.hoisted(() => ({
  userCount: vi.fn(),
  userFind: vi.fn(),
  userFindByIdAndUpdate: vi.fn(),
  companyCount: vi.fn(),
  companyFindByIdAndUpdate: vi.fn(),
  jobCount: vi.fn(),
  jobFindByIdAndUpdate: vi.fn(),
  applicationCount: vi.fn(),
  auditCreate: vi.fn()
}));

vi.mock('../models/User', () => ({
  normalizeUserRole: (role?: string) => (role === 'admin' || role === 'employer' ? role : 'job_seeker'),
  default: {
    countDocuments: mocks.userCount,
    find: mocks.userFind,
    findByIdAndUpdate: mocks.userFindByIdAndUpdate
  }
}));

vi.mock('../models/Company', () => ({
  default: {
    countDocuments: mocks.companyCount,
    findByIdAndUpdate: mocks.companyFindByIdAndUpdate
  }
}));

vi.mock('../models/Job', () => ({
  default: {
    countDocuments: mocks.jobCount,
    findByIdAndUpdate: mocks.jobFindByIdAndUpdate
  }
}));

vi.mock('../models/Application', () => ({ default: { countDocuments: mocks.applicationCount } }));
vi.mock('../models/EventLog', () => ({ default: { find: vi.fn() } }));
vi.mock('../models/AuditLog', () => ({ default: { create: mocks.auditCreate } }));
vi.mock('../services/event.service', () => ({ recordEvent: vi.fn() }));
vi.mock('../services/jobSource.service', () => ({ getSourceStatus: vi.fn(), syncAllJobSources: vi.fn() }));

const req = (body = {}, params = { id: 'entity1' }, user = { id: 'admin1', role: 'admin' }) =>
  ({ body, params, user, query: {}, headers: {}, ip: '127.0.0.1' }) as any;

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

describe('admin backend APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auditCreate.mockResolvedValue({});
    mocks.userFind.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([{ _id: 'user1', name: 'Seeker', email: 'seeker@example.com', role: 'job_seeker' }])
    });
  });

  it('blocks non-admin users from admin routes', () => {
    const next = vi.fn();
    requireAdmin(req({}, { id: 'user1' }, { id: 'user1', role: 'job_seeker' }), {} as any, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('returns admin platform stats', async () => {
    mocks.userCount.mockResolvedValueOnce(10).mockResolvedValueOnce(6).mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    mocks.companyCount.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
    mocks.jobCount.mockResolvedValueOnce(20).mockResolvedValueOnce(4);
    mocks.applicationCount.mockResolvedValueOnce(30);
    const response = res();
    const next = await run(adminStats, req(), response);

    expect(next).not.toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({ totalUsers: 10, totalJobSeekers: 6, totalEmployers: 3 })
      })
    );
  });

  it('updates user status without returning passwordHash', async () => {
    const safeUser = { _id: 'user1', name: 'A', email: 'a@example.com', role: 'job_seeker', status: 'suspended' };
    mocks.userFindByIdAndUpdate.mockReturnValue({ select: vi.fn().mockResolvedValue(safeUser) });
    const response = res();
    const next = await run(updateUserStatus, req({ status: 'suspended' }), response);

    expect(next).not.toHaveBeenCalled();
    expect(response.json.mock.calls[0][0].data.passwordHash).toBeUndefined();
    expect(mocks.auditCreate).toHaveBeenCalled();
  });

  it('verifies companies and moderates jobs', async () => {
    mocks.companyFindByIdAndUpdate.mockResolvedValue({ _id: 'company1', verificationStatus: 'verified' });
    mocks.jobFindByIdAndUpdate.mockResolvedValue({ _id: 'job1', moderationStatus: 'approved' });

    await run(verifyCompany, req({ verificationStatus: 'verified' }), res());
    await run(moderateJob, req({ moderationStatus: 'approved' }), res());

    expect(mocks.companyFindByIdAndUpdate).toHaveBeenCalledWith('entity1', { verificationStatus: 'verified' }, { new: true });
    expect(mocks.jobFindByIdAndUpdate).toHaveBeenCalledWith('entity1', { moderationStatus: 'approved' }, { new: true });
  });
});
