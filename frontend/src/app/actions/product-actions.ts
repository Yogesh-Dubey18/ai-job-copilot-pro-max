'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/server/backend';

type ActionState = {
  ok: boolean;
  message: string;
};

const splitCsv = (value: FormDataEntryValue | null) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await backendFetch('/api/profile', {
    method: 'PUT',
    body: JSON.stringify({
      name: String(formData.get('name') || ''),
      recoveryEmail: String(formData.get('recoveryEmail') || ''),
      skills: splitCsv(formData.get('skills')),
      preferredRoles: splitCsv(formData.get('preferredRoles')),
      experienceLevel: String(formData.get('experienceLevel') || ''),
      expectedSalary: Number(formData.get('expectedSalary') || 0),
      resumeBaseText: String(formData.get('resumeBaseText') || '')
    })
  });
  revalidatePath('/profile');
  return { ok: true, message: 'Profile saved.' };
}

export async function uploadResumeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await backendFetch('/api/resumes/upload', {
    method: 'POST',
    body: JSON.stringify({
      title: String(formData.get('title') || 'Base Resume'),
      parsedText: String(formData.get('parsedText') || '')
    })
  });
  revalidatePath('/resume');
  return { ok: true, message: 'Resume uploaded and stored.' };
}

export async function atsCheckAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const resumeId = String(formData.get('resumeId') || '');
  const result = await backendFetch<{ success: boolean; data: { atsScore: number; missingSkills: string[]; breakdown?: Record<string, number>; formattingIssues?: string[] } }>(
    `/api/resumes/${resumeId}/ats-check`,
    {
      method: 'POST',
      body: JSON.stringify({ jobDescription: String(formData.get('jobDescription') || '') })
    }
  );
  const breakdown = result.data.breakdown
    ? Object.entries(result.data.breakdown).map(([key, value]) => `${key}: ${value}`).join(' | ')
    : '';
  return {
    ok: true,
    message: `ATS score ${result.data.atsScore}. Missing: ${result.data.missingSkills.join(', ') || 'none'}. ${breakdown}`
  };
}

export async function tailorResumeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const resumeId = String(formData.get('resumeId') || '');
  const jobId = String(formData.get('jobId') || '');
  const result = await backendFetch<{ success: boolean; data: { atsScore: number } }>(`/api/resumes/${resumeId}/tailor/${jobId}`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  revalidatePath('/resume');
  return { ok: true, message: `Tailored resume version created with ATS score ${result.data.atsScore}.` };
}

export async function fetchDailyJobsAction(): Promise<ActionState> {
  await backendFetch('/api/jobs/fetch-daily', { method: 'POST', body: JSON.stringify({}) });
  revalidatePath('/jobs');
  revalidatePath('/jobs/today');
  return { ok: true, message: 'Daily jobs synced.' };
}

export async function saveJobAction(jobId: string): Promise<ActionState> {
  await backendFetch(`/api/jobs/${jobId}/save`, { method: 'POST', body: JSON.stringify({}) });
  revalidatePath('/applications');
  return { ok: true, message: 'Job saved to tracker.' };
}

export async function analyzeJobAction(jobId: string): Promise<ActionState> {
  const result = await backendFetch<{ success: boolean; data: { finalScore: number; applyPriority: string } }>(`/api/jobs/${jobId}/analyze`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  return { ok: true, message: `Fit score ${result.data.finalScore}. Priority: ${result.data.applyPriority}.` };
}

export async function importJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await backendFetch('/api/jobs/import-url', {
    method: 'POST',
    body: JSON.stringify({
      url: String(formData.get('url') || ''),
      title: String(formData.get('title') || ''),
      company: String(formData.get('company') || ''),
      description: String(formData.get('description') || '')
    })
  });
  revalidatePath('/jobs');
  return { ok: true, message: 'Job imported.' };
}

export async function generatePortfolioAction(): Promise<ActionState> {
  await backendFetch('/api/portfolio/generate', { method: 'POST', body: JSON.stringify({}) });
  revalidatePath('/portfolio');
  return { ok: true, message: 'Portfolio generated and published.' };
}

export async function interviewPrepAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const applicationId = String(formData.get('applicationId') || 'demo');
  const result = await backendFetch<{ success: boolean; data: { preparationPlan: string[] } }>(
    `/api/interviews/prep/${applicationId}`,
    {
      method: 'POST',
      body: JSON.stringify({})
    }
  );
  return { ok: true, message: `Prep plan: ${result.data.preparationPlan.join(' | ')}` };
}
