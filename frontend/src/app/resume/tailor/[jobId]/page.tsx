import { redirect } from 'next/navigation';
import { tailorResumeAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { getJob, getResumes, getSessionToken } from '@/lib/server/backend';

export default async function TailorResumePage({ params }: { params: Promise<{ jobId: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const { jobId } = await params;
  const [job, resumes] = await Promise.all([getJob(jobId), getResumes()]);

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Tailor Resume</h1>
        <p className="mt-2 text-slate-600">{job.title} at {job.company}</p>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={tailorResumeAction} buttonLabel="Create tailored version" className="grid gap-4">
            <input type="hidden" name="jobId" value={job._id} />
            <select name="resumeId" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              {resumes.map((resume) => (
                <option key={resume._id} value={resume._id}>{resume.title}</option>
              ))}
            </select>
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
