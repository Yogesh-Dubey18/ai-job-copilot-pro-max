import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ApplicationBoard } from '@/components/ApplicationBoard';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function ApplicationsKanbanPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const applications = await getApplications();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Application Kanban</h1>
        <div className="mt-8">
          <ApplicationBoard applications={applications} />
        </div>
      </main>
    </AppShell>
  );
}
