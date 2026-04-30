import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getSessionToken, getTodayJobs } from '@/lib/server/backend';

export default async function TodayJobsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const jobs = await getTodayJobs();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Today&apos;s Jobs</h1>
        <p className="mt-2 text-slate-600">Fresh roles from connected sources and curated sources.</p>
        <div className="mt-8 grid gap-4">
          {jobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              No jobs found yet. Use Sync daily jobs from the Jobs page to load today&apos;s roles.
            </div>
          ) : (
            jobs.map((job) => (
              <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">{job.title}</h2>
                <p className="text-sm text-slate-600">{job.company} - {job.location || 'Flexible'}</p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
              </Link>
            ))
          )}
        </div>
      </main>
    </AppShell>
  );
}
