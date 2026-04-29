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
        <h1 className="text-4xl font-black tracking-tight">Today’s Jobs</h1>
        <div className="mt-8 grid gap-4">
          {jobs.map((job) => (
            <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">{job.title}</h2>
              <p className="text-sm text-slate-600">{job.company} · {job.location || 'Flexible'}</p>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
