import { redirect } from 'next/navigation';
import { analyzeResumeAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { getResume, getSessionToken } from '@/lib/server/backend';

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const { id } = await params;
  const resume = await getResume(id);
  const suggestions = resume.aiSuggestions;

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title={resume.title} description="Review extracted text, ATS score, and AI resume suggestions." />
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard label="ATS score" value={resume.atsScore === null ? 'Needs text' : `${resume.atsScore}%`} />
          <StatCard label="Detected skills" value={resume.detectedSkills?.length || 0} />
          <StatCard label="Versions" value={resume.versions.length} />
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={analyzeResumeAction} buttonLabel="Analyze resume" className="mb-6">
            <input type="hidden" name="resumeId" value={resume._id} />
          </ActionForm>
          {resume.extractionStatus === 'needs_manual_text' ? (
            <EmptyState title="Readable text needed" description="Readable resume text could not be extracted. Paste clean resume text manually." />
          ) : (
            <pre className="max-h-[520px] whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">{resume.parsedText || resume.manualText}</pre>
          )}
        </section>
        {suggestions ? (
          <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">AI suggestions</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div><h3 className="font-semibold">ATS tips</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{suggestions.atsTips?.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
              <div><h3 className="font-semibold">Weak sections</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{suggestions.weakSections?.map((tip) => <li key={tip}>{tip}</li>)}</ul></div>
            </div>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}
