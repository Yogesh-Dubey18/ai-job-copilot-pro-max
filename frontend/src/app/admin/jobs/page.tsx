import { redirect } from 'next/navigation';
import { adminJobModerationAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getAdminJobs, getSessionToken } from '@/lib/server/backend';

export default async function AdminJobsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const jobs = await getAdminJobs('?limit=25');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Admin Jobs" description="Moderate suspicious or pending job posts." />
        <section className="mt-8 grid gap-3">
          {jobs.items.map((job) => (
            <article key={job._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
              <div><p className="font-semibold">{job.title}</p><p className="text-sm text-slate-600">{job.company} · {job.status} · {job.moderationStatus}</p></div>
              <ActionForm action={adminJobModerationAction} buttonLabel="Approve">
                <input type="hidden" name="jobId" value={job._id} />
                <input type="hidden" name="moderationStatus" value="approved" />
              </ActionForm>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
