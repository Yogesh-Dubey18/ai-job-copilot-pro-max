import { notFound, redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ManualApplyForm } from '@/components/ManualApplyForm';
import { ResponseAssistantForm } from '@/components/ResponseAssistantForm';
import { StatusBadge } from '@/components/StatusBadge';
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
              <dd className="mt-1"><StatusBadge status={application.status} /></dd>
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
        <section className="mt-8 grid gap-6">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Next-best action</h2>
            <p className="mt-3 text-sm text-slate-600">
              {application.status === 'rejected'
                ? 'Run rejection analysis, adjust resume keywords, and apply to stronger-fit jobs.'
                : application.status.includes('interview')
                  ? 'Prepare role stories, project explanations, HR answers, and follow-up notes.'
                  : 'Complete the manual apply checklist and set a follow-up reminder.'}
            </p>
          </div>
          <ManualApplyForm applicationId={application._id} />
          <ResponseAssistantForm applicationId={application._id} />
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Timeline</h2>
            <div className="mt-4 grid gap-3">
              {(application.timeline || []).map((item, index) => (
                <div key={`${item.date}-${index}`} className="rounded-md bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{item.status.replaceAll('_', ' ')}</p>
                  <p className="text-slate-600">{item.note}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.source || 'user'} · {item.nextAction || 'Review next action'}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
