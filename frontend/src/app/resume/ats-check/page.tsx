import { redirect } from 'next/navigation';
import { atsCheckAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { getResumes, getSessionToken } from '@/lib/server/backend';

export default async function AtsCheckPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const resumes = await getResumes();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">ATS Check</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={atsCheckAction} buttonLabel="Run ATS check" className="grid gap-4">
            <select name="resumeId" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              {resumes.map((resume) => (
                <option key={resume._id} value={resume._id}>{resume.title}</option>
              ))}
            </select>
            <textarea name="jobDescription" rows={12} placeholder="Paste job description" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
