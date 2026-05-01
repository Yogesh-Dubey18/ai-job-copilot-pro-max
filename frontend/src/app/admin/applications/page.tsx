import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getAdminApplications, getSessionToken } from '@/lib/server/backend';

export default async function AdminApplicationsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const applications = await getAdminApplications('?limit=25');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Admin Applications" description="Platform-wide application visibility for support and moderation." />
        <section className="mt-8 grid gap-3">
          {applications.items.map((application) => (
            <article key={application._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
              <div><p className="font-semibold">{application.title}</p><p className="text-sm text-slate-600">{application.company}</p></div>
              <StatusBadge status={application.status} />
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
