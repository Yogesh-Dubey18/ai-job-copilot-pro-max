import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResponseAssistantForm } from '@/components/ResponseAssistantForm';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function ResponsesPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const applications = await getApplications();
  const first = applications[0];

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Company Reply Assistant</h1>
        <p className="mt-2 text-slate-600">Paste a company message and generate safe professional replies for email, WhatsApp, or LinkedIn.</p>
        <div className="mt-8">
          {first ? (
            <ResponseAssistantForm applicationId={first._id} />
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">Add an application first, then generate reply drafts.</p>
          )}
        </div>
      </main>
    </AppShell>
  );
}
