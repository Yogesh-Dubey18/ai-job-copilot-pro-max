import { redirect } from 'next/navigation';
import { saveEmployerJobAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getEmployerJob, getSessionToken } from '@/lib/server/backend';

export default async function EditEmployerJobPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const { id } = await params;
  const job = await getEmployerJob(id);
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Edit Job" description={job.title} />
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={saveEmployerJobAction} buttonLabel="Save changes" className="grid gap-4">
            <input type="hidden" name="jobId" value={job._id} />
            <input name="title" defaultValue={job.title} className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="location" defaultValue={job.location || ''} className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="skills" defaultValue={(job.skills || []).join(', ')} className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="experienceLevel" defaultValue={job.experienceLevel || ''} className="rounded-md border border-slate-200 px-3 py-2" />
            <textarea name="description" rows={10} defaultValue={job.description} className="rounded-md border border-slate-200 px-3 py-2" />
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
