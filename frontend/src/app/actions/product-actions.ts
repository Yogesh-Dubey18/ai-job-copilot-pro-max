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
  const result = await backendFetch<{ success: boolean; data: { extractionStatus?: string; atsScore?: number | null } }>('/api/resumes/upload', {
    method: 'POST',
    body: JSON.stringify({
      title: String(formData.get('title') || 'Base Resume'),
      parsedText: String(formData.get('parsedText') || '')
    })
  });
  revalidatePath('/resume');
  if (result.data.extractionStatus === 'needs_manual_text') {
    return { ok: true, message: 'Readable resume text could not be extracted. Paste clean resume text manually.' };
  }
  return { ok: true, message: `Resume uploaded and analyzed. ATS score ${result.data.atsScore ?? 'not available yet'}.` };
}

export async function analyzeResumeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const resumeId = String(formData.get('resumeId') || '');
  const result = await backendFetch<{ success: boolean; data: { aiScore: number | null; aiSuggestions?: { atsTips?: string[]; weakSections?: string[] } }; message?: string }>(
    `/api/resumes/${resumeId}/analyze`,
    { method: 'POST', body: JSON.stringify({}) }
  );
  revalidatePath('/jobseeker/resumes');
  revalidatePath(`/jobseeker/resumes/${resumeId}`);
  if (result.data.aiScore === null) return { ok: false, message: result.message || 'Paste clean resume text manually before analysis.' };
  return {
    ok: true,
    message: `Resume score ${result.data.aiScore}. Tips: ${(result.data.aiSuggestions?.atsTips || []).slice(0, 2).join(' | ')}`
  };
}

export async function atsCheckAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const resumeId = String(formData.get('resumeId') || '');
  const result = await backendFetch<{ success: boolean; data: { atsScore: number | null; unavailable?: boolean; message?: string; missingSkills: string[]; breakdown?: Record<string, number | null>; formattingIssues?: string[] } }>(
    `/api/resumes/${resumeId}/ats-check`,
    {
      method: 'POST',
      body: JSON.stringify({ jobDescription: String(formData.get('jobDescription') || '') })
    }
  );
  if (result.data.unavailable) {
    return { ok: false, message: result.data.message || 'Paste clean resume text manually before ATS analysis.' };
  }
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
  const result = await backendFetch<{ success: boolean; data: { finalScore: number | null; applyPriority: string; profileIncomplete?: boolean } }>(`/api/jobs/${jobId}/analyze`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  if (result.data.profileIncomplete) {
    return { ok: false, message: 'Complete your profile and upload a readable resume to calculate a real job score.' };
  }
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
  const applicationId = String(formData.get('applicationId') || 'practice');
  const result = await backendFetch<{ success: boolean; data: { preparationPlan: string[] } }>(
    `/api/interviews/prep/${applicationId}`,
    {
      method: 'POST',
      body: JSON.stringify({})
    }
  );
  return { ok: true, message: `Prep plan: ${result.data.preparationPlan.join(' | ')}` };
}

export async function coverLetterAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await backendFetch<{ success: boolean; data: { coverLetter: string; fallback?: boolean } }>('/api/ai/cover-letter', {
    method: 'POST',
    body: JSON.stringify({
      profileText: String(formData.get('profileText') || ''),
      resumeText: String(formData.get('resumeText') || ''),
      jobDescription: String(formData.get('jobDescription') || ''),
      company: String(formData.get('company') || ''),
      tone: String(formData.get('tone') || 'professional')
    })
  });
  return { ok: true, message: result.data.coverLetter };
}

export async function interviewQuestionsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await backendFetch<{ success: boolean; data: { questions: Array<{ question: string; idealAnswer: string; skillArea: string }>; fallback?: boolean } }>(
    '/api/ai/interview/questions',
    {
      method: 'POST',
      body: JSON.stringify({
        role: String(formData.get('role') || ''),
        company: String(formData.get('company') || ''),
        jobDescription: String(formData.get('jobDescription') || ''),
        resumeText: String(formData.get('resumeText') || '')
      })
    }
  );
  return { ok: true, message: result.data.questions.map((item) => `${item.question} — ${item.idealAnswer}`).join('\n\n') };
}

export async function evaluateInterviewAnswerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const result = await backendFetch<{ success: boolean; data: { score: number; strengths: string[]; improvements: string[]; idealAnswerOutline: string } }>(
    '/api/ai/interview/evaluate',
    {
      method: 'POST',
      body: JSON.stringify({
        role: String(formData.get('role') || ''),
        question: String(formData.get('question') || ''),
        answer: String(formData.get('answer') || '')
      })
    }
  );
  return {
    ok: true,
    message: `Score ${result.data.score}. Strengths: ${result.data.strengths.join(', ')}. Improvements: ${result.data.improvements.join(', ')}. Ideal outline: ${result.data.idealAnswerOutline}`
  };
}

export async function saveCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const body = {
    name: String(formData.get('name') || ''),
    website: String(formData.get('website') || ''),
    industry: String(formData.get('industry') || ''),
    size: String(formData.get('size') || ''),
    description: String(formData.get('description') || ''),
    location: String(formData.get('location') || '')
  };
  const method = String(formData.get('mode') || 'create') === 'update' ? 'PUT' : 'POST';
  await backendFetch('/api/company' + (method === 'PUT' ? '/me' : ''), { method, body: JSON.stringify(body) });
  revalidatePath('/employer/company');
  return { ok: true, message: 'Company profile saved.' };
}

export async function saveEmployerJobAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const jobId = String(formData.get('jobId') || '');
  const body = {
    title: String(formData.get('title') || ''),
    location: String(formData.get('location') || ''),
    workplaceType: String(formData.get('workplaceType') || 'onsite'),
    employmentType: String(formData.get('employmentType') || 'full_time'),
    salaryMin: Number(formData.get('salaryMin') || 0) || undefined,
    salaryMax: Number(formData.get('salaryMax') || 0) || undefined,
    skills: splitCsv(formData.get('skills')),
    experienceLevel: String(formData.get('experienceLevel') || ''),
    description: String(formData.get('description') || ''),
    responsibilities: splitCsv(formData.get('responsibilities')),
    requirements: splitCsv(formData.get('requirements')),
    benefits: splitCsv(formData.get('benefits')),
    deadline: String(formData.get('deadline') || '') || undefined
  };
  await backendFetch(jobId ? `/api/employer/jobs/${jobId}` : '/api/employer/jobs', {
    method: jobId ? 'PUT' : 'POST',
    body: JSON.stringify(body)
  });
  revalidatePath('/employer/jobs');
  return { ok: true, message: 'Job saved.' };
}

export async function employerJobStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const jobId = String(formData.get('jobId') || '');
  const action = String(formData.get('action') || 'publish');
  await backendFetch(`/api/employer/jobs/${jobId}/${action}`, { method: 'POST', body: JSON.stringify({}) });
  revalidatePath('/employer/jobs');
  return { ok: true, message: action === 'archive' ? 'Job archived.' : 'Job published.' };
}

export async function employerApplicationStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const applicationId = String(formData.get('applicationId') || '');
  const status = String(formData.get('status') || 'shortlisted');
  await backendFetch(`/api/employer/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note: String(formData.get('note') || '') })
  });
  revalidatePath('/employer/candidates');
  return { ok: true, message: 'Candidate status updated.' };
}

export async function employerApplicationNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const applicationId = String(formData.get('applicationId') || '');
  await backendFetch(`/api/employer/applications/${applicationId}/note`, {
    method: 'POST',
    body: JSON.stringify({ note: String(formData.get('note') || '') })
  });
  revalidatePath(`/employer/candidates/${applicationId}`);
  return { ok: true, message: 'Private note added.' };
}

export async function scheduleInterviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const applicationId = String(formData.get('applicationId') || '');
  await backendFetch(`/api/employer/applications/${applicationId}/interview`, {
    method: 'POST',
    body: JSON.stringify({
      scheduledAt: String(formData.get('scheduledAt') || ''),
      mode: String(formData.get('mode') || 'video'),
      meetingLink: String(formData.get('meetingLink') || ''),
      notes: String(formData.get('notes') || '')
    })
  });
  revalidatePath(`/employer/candidates/${applicationId}`);
  return { ok: true, message: 'Interview scheduled.' };
}

export async function adminUserStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const userId = String(formData.get('userId') || '');
  const status = String(formData.get('status') || 'active');
  await backendFetch(`/api/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  revalidatePath('/admin/users');
  return { ok: true, message: `User ${status}.` };
}

export async function adminCompanyVerifyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const companyId = String(formData.get('companyId') || '');
  const verificationStatus = String(formData.get('verificationStatus') || 'verified');
  await backendFetch(`/api/admin/companies/${companyId}/verify`, { method: 'PATCH', body: JSON.stringify({ verificationStatus }) });
  revalidatePath('/admin/companies');
  return { ok: true, message: `Company ${verificationStatus}.` };
}

export async function adminJobModerationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const jobId = String(formData.get('jobId') || '');
  const moderationStatus = String(formData.get('moderationStatus') || 'approved');
  await backendFetch(`/api/admin/jobs/${jobId}/moderation`, { method: 'PATCH', body: JSON.stringify({ moderationStatus }) });
  revalidatePath('/admin/jobs');
  return { ok: true, message: `Job marked ${moderationStatus}.` };
}

export async function markNotificationReadAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const notificationId = String(formData.get('notificationId') || '');
  await backendFetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH', body: JSON.stringify({}) });
  revalidatePath('/notifications');
  return { ok: true, message: 'Notification marked read.' };
}

export async function markAllNotificationsReadAction(): Promise<ActionState> {
  await backendFetch('/api/notifications/read-all', { method: 'PATCH', body: JSON.stringify({}) });
  revalidatePath('/notifications');
  return { ok: true, message: 'All notifications marked read.' };
}
