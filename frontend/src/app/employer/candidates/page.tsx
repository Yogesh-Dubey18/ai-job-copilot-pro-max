import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getEmployerCandidates, getSessionToken } from '@/lib/server/backend';

export default async function EmployerCandidatesPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const candidates = await getEmployerCandidates('?limit=25');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Candidates" description="Review applicants, update status, add notes, and schedule interviews." />
        <section className="mt-8 grid gap-4">
          {candidates.items.length === 0 ? <EmptyState title="No candidates yet" description="Applicants will appear here when job seekers apply." /> : candidates.items.map((candidate) => (
            <Link key={candidate._id} href={`/employer/candidates/${candidate._id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
              <div><h2 className="text-lg font-bold">{candidate.title}</h2><p className="text-sm text-slate-600">{candidate.company}</p></div>
              <StatusBadge status={candidate.status} />
            </Link>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
