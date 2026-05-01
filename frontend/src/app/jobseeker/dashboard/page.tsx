import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { getApplications, getDashboardData, getResumes, getSavedJobs, getSessionToken } from '@/lib/server/backend';

export default async function JobSeekerDashboardPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const [{ stats }, applications, savedJobs, resumes] = await Promise.all([
    getDashboardData(),
    getApplications(),
    getSavedJobs('?limit=1'),
    getResumes()
  ]);
  const activeApplications = applications.filter((item) => !['rejected', 'withdrawn', 'joined'].includes(item.status)).length;
  const resumeScore = resumes.find((resume) => resume.atsScore !== null)?.atsScore ?? null;

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Job Seeker Dashboard" description="Track applications, resume readiness, saved jobs, and the next best action." />
        <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Applications" value={stats.total ?? applications.length} />
          <StatCard label="Active" value={activeApplications} />
          <StatCard label="Interviews" value={stats.interviews} />
          <StatCard label="Offers" value={stats.offers} />
          <StatCard label="Saved jobs" value={savedJobs.pagination.total} />
          <StatCard label="Resume score" value={resumeScore === null ? 'Needs text' : `${resumeScore}%`} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Recent applications</h2>
            <div className="mt-4 grid gap-3">
              {applications.length === 0 ? (
                <EmptyState title="No applications yet" description="Save or apply to a public job to start your timeline." />
              ) : (
                applications.slice(0, 6).map((application) => (
                  <Link key={application._id} href={`/jobseeker/applications/${application._id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 p-4 hover:bg-slate-50">
                    <div>
                      <p className="font-semibold">{application.title}</p>
                      <p className="text-sm text-slate-500">{application.company}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </Link>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">AI next best action</h2>
            <p className="mt-2 text-sm text-slate-600">
              {resumes.length === 0
                ? 'Upload a resume so match scoring and resume analysis can use your real data.'
                : savedJobs.pagination.total === 0
                  ? 'Find and save 3 high-fit jobs to build your application pipeline.'
                  : 'Generate an application kit for your highest-fit saved job.'}
            </p>
            <Link href={resumes.length === 0 ? '/resume/upload' : '/jobs'} className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
              Continue
            </Link>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
