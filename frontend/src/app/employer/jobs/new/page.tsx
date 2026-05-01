import { redirect } from 'next/navigation';
import { saveEmployerJobAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getSessionToken } from '@/lib/server/backend';

export default async function NewEmployerJobPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Post a Job" description="Create a draft first. Publish after reviewing details." />
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={saveEmployerJobAction} buttonLabel="Save draft" className="grid gap-4">
            <input name="title" placeholder="Job title" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="location" placeholder="Location" className="rounded-md border border-slate-200 px-3 py-2" />
            <select name="workplaceType" className="rounded-md border border-slate-200 px-3 py-2"><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select>
            <select name="employmentType" className="rounded-md border border-slate-200 px-3 py-2"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option></select>
            <input name="skills" placeholder="Skills, comma-separated" className="rounded-md border border-slate-200 px-3 py-2" />
            <input name="experienceLevel" placeholder="Experience level" className="rounded-md border border-slate-200 px-3 py-2" />
            <textarea name="description" rows={10} placeholder="Job description" className="rounded-md border border-slate-200 px-3 py-2" />
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
