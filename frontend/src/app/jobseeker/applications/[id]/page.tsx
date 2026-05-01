import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getApplication, getSessionToken } from '@/lib/server/backend';

export default async function JobSeekerApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const { id } = await params;
  const application = await getApplication(id);

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title={application.title} description={`${application.company} application timeline and materials.`} actions={<StatusBadge status={application.status} />} />
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-500">Applied date</dt><dd>{application.appliedDate ? new Date(application.appliedDate).toLocaleDateString() : 'Not applied yet'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Follow-up date</dt><dd>{application.followUpDate ? new Date(application.followUpDate).toLocaleDateString() : 'Not scheduled'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Source</dt><dd>{application.portalSource || 'Manual / tracked'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Match score</dt><dd>{application.matchScore ?? 'Not calculated'}</dd></div>
          </dl>
          {application.coverLetterUsed ? <p className="mt-6 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">{application.coverLetterUsed}</p> : null}
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Timeline</h2>
          <div className="mt-4 grid gap-3">
            {(application.timeline || []).map((item, index) => (
              <div key={`${item.date}-${index}`} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-xs text-slate-500">{new Date(item.date).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{item.note}</p>
                {item.nextAction ? <p className="mt-1 text-xs font-semibold text-slate-500">Next: {item.nextAction}</p> : null}
              </div>
            ))}
          </div>
        </section>
        <Link href="/jobseeker/applications" className="mt-6 inline-flex text-sm font-semibold underline">Back to applications</Link>
      </main>
    </AppShell>
  );
}
