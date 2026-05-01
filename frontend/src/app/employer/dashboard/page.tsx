import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { getEmployerCandidates, getEmployerJobs, getSessionToken } from '@/lib/server/backend';

export default async function EmployerDashboardPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const [jobs, candidates] = await Promise.all([getEmployerJobs('?limit=5'), getEmployerCandidates('?limit=5')]);
  const activeJobs = jobs.items.filter((job) => job.status === 'published').length;
  const shortlisted = candidates.items.filter((item) => item.status === 'shortlisted').length;
  const interviews = candidates.items.filter((item) => item.status.includes('interview') || item.status === 'hr_round').length;
  const offers = candidates.items.filter((item) => item.status === 'offered').length;

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Employer Dashboard" description="Hiring pipeline, active jobs, candidates, and interview actions." actions={<Link href="/employer/jobs/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Post job</Link>} />
        <section className="mt-8 grid gap-4 md:grid-cols-5">
          <StatCard label="Active jobs" value={activeJobs} />
          <StatCard label="Applicants" value={candidates.pagination.total} />
          <StatCard label="Shortlisted" value={shortlisted} />
          <StatCard label="Interviews" value={interviews} />
          <StatCard label="Offers" value={offers} />
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Recent candidates</h2>
          <div className="mt-4 grid gap-3">
            {candidates.items.length === 0 ? <EmptyState title="No applicants yet" description="Publish a job and applicants will appear here." /> : candidates.items.map((candidate) => (
              <Link key={candidate._id} href={`/employer/candidates/${candidate._id}`} className="flex items-center justify-between rounded-md border border-slate-200 p-4 hover:bg-slate-50">
                <span className="font-semibold">{candidate.title} · {candidate.company}</span>
                <StatusBadge status={candidate.status} />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
