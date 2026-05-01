import { redirect } from 'next/navigation';
import { evaluateInterviewAnswerAction, interviewQuestionsAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getResumes, getSessionToken } from '@/lib/server/backend';

export default async function JobSeekerInterviewPrepPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const resumes = await getResumes();
  const resumeText = resumes[0]?.parsedText || resumes[0]?.manualText || '';

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="AI Interview Preparation" description="Generate role-specific interview questions and evaluate your practice answers." />
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Generate questions</h2>
            <ActionForm action={interviewQuestionsAction} buttonLabel="Generate questions" className="mt-4 grid gap-3">
              <input name="role" placeholder="Role" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input name="company" placeholder="Company" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="resumeText" rows={5} defaultValue={resumeText} className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="jobDescription" rows={6} placeholder="Job description" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </ActionForm>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Evaluate answer</h2>
            <ActionForm action={evaluateInterviewAnswerAction} buttonLabel="Evaluate answer" className="mt-4 grid gap-3">
              <input name="role" placeholder="Role" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="question" rows={4} placeholder="Interview question" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="answer" rows={8} placeholder="Your answer" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </ActionForm>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
