import { describe, expect, it, vi } from 'vitest';
import { requireAdmin, requireRole } from './auth';

const req = (role?: 'job_seeker' | 'employer' | 'admin') =>
  ({
    user: role
      ? {
          id: 'user1',
          name: 'Test User',
          email: 'test@example.com',
          role
        }
      : undefined
  }) as any;

describe('auth role guards', () => {
  it('allows admins through the admin guard', () => {
    const next = vi.fn();
    requireAdmin(req('admin'), {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks non-admin users from admin guard', () => {
    const next = vi.fn();
    requireAdmin(req('job_seeker'), {} as any, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('allows matching roles through role guard', () => {
    const next = vi.fn();
    requireRole('employer')(req('employer'), {} as any, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks missing or mismatched roles', () => {
    const missingNext = vi.fn();
    const mismatchNext = vi.fn();
    requireRole('job_seeker')(req(), {} as any, missingNext);
    requireRole('employer')(req('job_seeker'), {} as any, mismatchNext);
    expect(missingNext.mock.calls[0][0].statusCode).toBe(403);
    expect(mismatchNext.mock.calls[0][0].statusCode).toBe(403);
  });
});
