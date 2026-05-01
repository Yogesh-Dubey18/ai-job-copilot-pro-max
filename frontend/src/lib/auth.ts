export type PortalRole = 'job_seeker' | 'employer' | 'admin' | 'user';

export function normalizeRole(role?: string): Exclude<PortalRole, 'user'> {
  if (role === 'employer') return 'employer';
  if (role === 'admin') return 'admin';
  return 'job_seeker';
}

export function dashboardPathForRole(role?: string) {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return '/admin';
  if (normalized === 'employer') return '/employer/dashboard';
  return '/dashboard';
}

export function canAccessRole(userRole: string | undefined, allowed: PortalRole[]) {
  const normalized = normalizeRole(userRole);
  return allowed.map(normalizeRole).includes(normalized);
}
