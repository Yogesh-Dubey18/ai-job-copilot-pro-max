import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ApplicationBoard } from '@/components/ApplicationBoard';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function ApplicationsPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  const applications = await getApplications();

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight">Applications</h1>
          <p className="mt-2 text-slate-600">Server-loaded pipeline data with client-side status controls.</p>
        </div>

        <ApplicationBoard applications={applications} />
      </div>
    </AppShell>
  );
}
