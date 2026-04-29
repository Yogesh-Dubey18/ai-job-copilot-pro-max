'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/server/backend';
import { ApplicationStatus } from '@/types';

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  await backendFetch(`/api/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  revalidatePath('/dashboard');
  revalidatePath('/applications');
}
