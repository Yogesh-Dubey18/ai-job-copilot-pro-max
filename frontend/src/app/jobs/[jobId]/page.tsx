import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { JobActions } from '@/components/JobActions';
import { getJob, getSessionToken } from '@/lib/server/backend';

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const { jobId } = await params;
  const job = await getJob(jobId);
  const hasOperationalUrl = Boolean(job.url && !/^https?:\/\/(www\.)?example\.com/i.test(job.url));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{job.source || 'job board'}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{job.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{job.company} · {job.location || 'Flexible'}</p>
        <div className="mt-6">
          <JobActions jobId={job._id} />
        </div>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Job description</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description}</p>
          {hasOperationalUrl ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm font-semibold text-slate-950 underline">
              Open original job
            </a>
          ) : null}
        </section>
      </main>
    </AppShell>
  );
}
