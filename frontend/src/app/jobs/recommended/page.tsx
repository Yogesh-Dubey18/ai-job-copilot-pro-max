import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getRecommendedJobs, getSessionToken } from '@/lib/server/backend';

export default async function RecommendedJobsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const jobs = await getRecommendedJobs();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Recommended Jobs</h1>
        <div className="mt-8 grid gap-4">
          {jobs.map(({ job, score }) => (
            <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{job.title}</h2>
                  <p className="text-sm text-slate-600">{job.company} · {job.location || 'Flexible'}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">{score.finalScore}% · {score.applyPriority}</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">Missing skills: {score.missingSkills.join(', ') || 'none'}</p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
