import 'server-only';
import { cookies } from 'next/headers';
import { AnalyticsSummary, Application, ApplicationStats } from '@/types';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

const authHeaders = async () => {
  const token = (await cookies()).get('session')?.value;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getSessionToken = async () => (await cookies()).get('session')?.value;

export async function backendFetch<T>(path: string, init: RequestInit = {}) {
  const headers = await authHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {})
    },
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Backend request failed: ${path}`);
  }

  return payload as T;
}

export async function getDashboardData() {
  const [stats, applications] = await Promise.all([
    backendFetch<ApiEnvelope<ApplicationStats>>('/api/applications/stats'),
    backendFetch<ApiEnvelope<Application[]>>('/api/applications')
  ]);

  return {
    stats: stats.data,
    applications: applications.data
  };
}

export async function getApplications() {
  const response = await backendFetch<ApiEnvelope<Application[]>>('/api/applications');
  return response.data;
}

export async function getAnalytics() {
  const response = await backendFetch<ApiEnvelope<AnalyticsSummary>>('/api/applications/analytics');
  return response.data;
}
