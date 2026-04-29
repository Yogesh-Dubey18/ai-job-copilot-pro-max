import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const { applicationId } = await params;
  const application = (await getApplications()).find((item) => item._id === applicationId);
  if (!application) notFound();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">{application.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{application.company}</p>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-slate-500">Status</dt>
              <dd className="mt-1 text-lg font-bold capitalize">{application.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Match score</dt>
              <dd className="mt-1 text-lg font-bold">{application.matchScore || 0}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Applied date</dt>
              <dd className="mt-1">{application.appliedDate || 'Not applied yet'}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">Follow up</dt>
              <dd className="mt-1">{application.followUpDate || 'No follow-up scheduled'}</dd>
            </div>
          </dl>
        </section>
      </main>
    </AppShell>
  );
}
