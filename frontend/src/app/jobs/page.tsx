import Link from 'next/link';
import { redirect } from 'next/navigation';
import { fetchDailyJobsAction, importJobAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { ServerActionButton } from '@/components/ServerActionButton';
import { getRecommendedJobs, getSessionToken } from '@/lib/server/backend';

export default async function JobsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const jobs = await getRecommendedJobs();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">AI Job Discovery</h1>
            <p className="mt-2 text-slate-600">Aggregated jobs from safe sources, scored against your profile.</p>
          </div>
          <ServerActionButton action={fetchDailyJobsAction}>Sync daily jobs</ServerActionButton>
        </div>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            {jobs.map(({ job, score }) => (
              <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{job.title}</h2>
                    <p className="text-sm text-slate-600">{job.company} · {job.location || 'Flexible'} · {job.source || 'job board'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{score.finalScore}%</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">Priority: {score.applyPriority}</p>
              </Link>
            ))}
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Manual import</h2>
            <ActionForm action={importJobAction} buttonLabel="Import job" className="mt-4 grid gap-3">
              <input name="url" placeholder="Job URL" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input name="title" placeholder="Title" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input name="company" placeholder="Company" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="description" rows={5} placeholder="Job description" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </ActionForm>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
