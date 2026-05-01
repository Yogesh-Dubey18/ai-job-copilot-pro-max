import 'server-only';
import { cookies } from 'next/headers';
import {
  AdminOverview,
  AnalyticsSummary,
  Application,
  ApplicationStats,
  DailyDigest,
  Job,
  ScoreBreakdown,
  Portfolio,
  RecommendedJob,
  Resume,
  UserProfile
} from '@/types';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const authHeaders = async () => {
  const token = (await cookies()).get('session')?.value;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getSessionToken = async () => (await cookies()).get('session')?.value;

export async function getCurrentUser() {
  const response = await backendFetch<{ success: boolean; user: UserProfile }>('/api/auth/me');
  return response.user;
}

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

export async function getApplication(id: string) {
  const response = await backendFetch<ApiEnvelope<Application>>(`/api/applications/${id}`);
  return response.data;
}

export async function getSavedJobs(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: Array<{ _id: string; jobId: Job; createdAt?: string }>; pagination: PaginationMeta }>>(`/api/saved-jobs${query}`);
  return response.data;
}

export async function getAnalytics() {
  const response = await backendFetch<ApiEnvelope<AnalyticsSummary>>('/api/applications/analytics');
  return response.data;
}

export async function getAdminOverview() {
  const response = await backendFetch<ApiEnvelope<AdminOverview>>('/api/admin/overview');
  return response.data;
}

export async function getProfile() {
  const response = await backendFetch<ApiEnvelope<UserProfile>>('/api/profile');
  return response.data;
}

export async function getTodayJobs() {
  const response = await backendFetch<ApiEnvelope<Job[]>>('/api/jobs/today');
  return response.data;
}

export async function getJobs(query = '') {
  const response = await backendFetch<ApiEnvelope<Job[] | { items: Job[] }>>(`/api/jobs${query}`);
  return Array.isArray(response.data) ? response.data : response.data.items;
}

export async function getJobsPage(query = '') {
  const response = await backendFetch<ApiEnvelope<Job[] | { items: Job[]; pagination: PaginationMeta }>>(`/api/jobs${query}`);
  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      pagination: {
        page: 1,
        limit: response.data.length || 10,
        total: response.data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
  return response.data;
}

export async function getRecommendedJobs() {
  const response = await backendFetch<ApiEnvelope<RecommendedJob[]>>('/api/jobs/recommended');
  return response.data;
}

export async function getJob(id: string) {
  const response = await backendFetch<ApiEnvelope<Job>>(`/api/jobs/${id}`);
  return response.data;
}

export async function getJobScore(id: string) {
  const response = await backendFetch<ApiEnvelope<ScoreBreakdown & { nextActions?: string[] }>>(`/api/jobs/${id}/score`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  return response.data;
}

export async function getResumes() {
  const response = await backendFetch<ApiEnvelope<Resume[]>>('/api/resumes');
  return response.data;
}

export async function getResume(id: string) {
  const response = await backendFetch<ApiEnvelope<Resume>>(`/api/resumes/${id}`);
  return response.data;
}

export async function getDailyDigest() {
  const response = await backendFetch<ApiEnvelope<DailyDigest>>('/api/daily-digest');
  return response.data;
}

export async function getPortfolio() {
  const response = await backendFetch<ApiEnvelope<Portfolio | null>>('/api/portfolio');
  return response.data;
}

export async function getPublicPortfolio(username: string) {
  const response = await backendFetch<ApiEnvelope<Portfolio>>(`/api/portfolio/public/${username}`);
  return response.data;
}

export async function getMyCompany() {
  const response = await backendFetch<ApiEnvelope<any>>('/api/company/me');
  return response.data;
}

export async function getEmployerJobs(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: Job[]; pagination: PaginationMeta }>>(`/api/employer/jobs${query}`);
  return response.data;
}

export async function getEmployerJob(id: string) {
  const response = await backendFetch<ApiEnvelope<Job>>(`/api/employer/jobs/${id}`);
  return response.data;
}

export async function getEmployerCandidates(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: Application[]; pagination: PaginationMeta }>>(`/api/employer/candidates${query}`);
  return response.data;
}

export async function getEmployerCandidate(id: string) {
  const response = await backendFetch<ApiEnvelope<Application>>(`/api/employer/candidates/${id}`);
  return response.data;
}

export async function getAdminStats() {
  const response = await backendFetch<ApiEnvelope<any>>('/api/admin/stats');
  return response.data;
}

export async function getAdminUsers(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: any[]; pagination: PaginationMeta }>>(`/api/admin/users${query}`);
  return response.data;
}

export async function getAdminCompanies(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: any[]; pagination: PaginationMeta }>>(`/api/admin/companies${query}`);
  return response.data;
}

export async function getAdminJobs(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: any[]; pagination: PaginationMeta }>>(`/api/admin/jobs${query}`);
  return response.data;
}

export async function getAdminApplications(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: Application[]; pagination: PaginationMeta }>>(`/api/admin/applications${query}`);
  return response.data;
}

export async function getAdminAuditLogs(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: any[]; pagination: PaginationMeta }>>(`/api/admin/audit-logs${query}`);
  return response.data;
}

export async function getNotifications(query = '') {
  const response = await backendFetch<ApiEnvelope<{ items: any[]; pagination: PaginationMeta; unreadCount: number }>>(`/api/notifications${query}`);
  return response.data;
}
