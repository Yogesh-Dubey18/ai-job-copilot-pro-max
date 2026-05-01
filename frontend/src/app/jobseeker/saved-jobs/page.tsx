import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { getSavedJobs, getSessionToken } from '@/lib/server/backend';

export default async function SavedJobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const savedJobs = await getSavedJobs(`?page=${page}&limit=10`);

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Saved Jobs" description="Review roles you saved before generating application kits." />
        <section className="mt-8 grid gap-4">
          {savedJobs.items.length === 0 ? (
            <EmptyState title="No saved jobs yet" description="Browse jobs and save promising roles to build your shortlist." action={<Link href="/jobs" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Browse jobs</Link>} />
          ) : (
            savedJobs.items.map((saved) => (
              <Link key={saved._id} href={`/jobs/${saved.jobId._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
                <h2 className="text-xl font-bold">{saved.jobId.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{saved.jobId.company} · {saved.jobId.location || 'Flexible'}</p>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{saved.jobId.description}</p>
              </Link>
            ))
          )}
        </section>
      </main>
    </AppShell>
  );
}
