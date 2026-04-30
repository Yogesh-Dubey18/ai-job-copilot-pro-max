import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { WorkflowLab } from '@/components/WorkflowLab';
import { getSessionToken } from '@/lib/server/backend';

export default async function AssistantPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">AI Assistant</h1>
        <p className="mt-2 text-slate-600">Get page-aware help for resumes, jobs, replies, interviews, portfolio, and today&apos;s plan.</p>
        <WorkflowLab />
      </main>
    </AppShell>
  );
}
