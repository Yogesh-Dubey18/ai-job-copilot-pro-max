import { redirect } from 'next/navigation';
import { interviewPrepAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { getApplications, getSessionToken } from '@/lib/server/backend';

export default async function InterviewPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const applications = await getApplications();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Interview AI</h1>
        <p className="mt-2 text-slate-600">Role-specific questions, rounds, and preparation plan for tracked applications.</p>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={interviewPrepAction} buttonLabel="Generate prep plan" className="grid gap-4">
            <select name="applicationId" className="rounded-md border border-slate-200 px-3 py-2 text-sm">
              {applications.map((application) => (
                <option key={application._id} value={application._id}>{application.title} · {application.company}</option>
              ))}
              {applications.length === 0 ? <option value="fallback">Create a practice interview plan</option> : null}
            </select>
            {applications.length === 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                <input name="role" placeholder="Role, for example Full Stack Developer" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <input name="company" placeholder="Company name" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <textarea name="jobDescription" rows={5} placeholder="Paste job description for a manual practice plan" className="rounded-md border border-slate-200 px-3 py-2 text-sm md:col-span-2" />
              </div>
            ) : null}
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
