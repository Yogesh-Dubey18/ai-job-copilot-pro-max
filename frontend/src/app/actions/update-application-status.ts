'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/server/backend';
import { ApplicationStatus } from '@/types';

export async function createApplication(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const company = String(formData.get('company') || '').trim();
  const status = String(formData.get('status') || 'saved') as ApplicationStatus;
  const matchScoreRaw = String(formData.get('matchScore') || '').trim();
  const matchScore = matchScoreRaw ? Number(matchScoreRaw) : undefined;

  if (!title || !company) {
    throw new Error('Title and company are required.');
  }

  await backendFetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify({
      title,
      company,
      status,
      matchScore: Number.isFinite(matchScore) ? matchScore : undefined,
      appliedDate: String(formData.get('appliedDate') || '') || undefined,
      followUpDate: String(formData.get('followUpDate') || '') || undefined,
      resumeVersionUsed: String(formData.get('resumeVersionUsed') || '') || undefined,
      recruiterEmail: String(formData.get('recruiterContact') || '') || undefined,
      sourcePlatform: String(formData.get('sourcePlatform') || '') || undefined,
      notes: String(formData.get('notes') || '') || undefined
    })
  });

  revalidatePath('/dashboard');
  revalidatePath('/applications');
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  await backendFetch(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  revalidatePath('/dashboard');
  revalidatePath('/applications');
}
