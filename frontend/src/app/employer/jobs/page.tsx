import Link from 'next/link';
import { redirect } from 'next/navigation';
import { employerJobStatusAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { getEmployerJobs, getSessionToken } from '@/lib/server/backend';

export default async function EmployerJobsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const jobs = await getEmployerJobs('?limit=20');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Employer Jobs" description="Create, edit, publish, and archive company job posts." actions={<Link href="/employer/jobs/new" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">New job</Link>} />
        <section className="mt-8 grid gap-4">
          {jobs.items.length === 0 ? <EmptyState title="No jobs posted" description="Create your first draft job to start hiring." /> : jobs.items.map((job) => (
            <article key={job._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="text-xl font-bold">{job.title}</h2><p className="text-sm text-slate-600">{job.location || 'Flexible'} · {job.status}</p></div>
                <Link href={`/employer/jobs/${job._id}/edit`} className="rounded-md border px-3 py-2 text-sm font-semibold">Edit</Link>
              </div>
              <ActionForm action={employerJobStatusAction} buttonLabel={job.status === 'published' ? 'Archive' : 'Publish'} className="mt-4">
                <input type="hidden" name="jobId" value={job._id} />
                <input type="hidden" name="action" value={job.status === 'published' ? 'archive' : 'publish'} />
              </ActionForm>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
