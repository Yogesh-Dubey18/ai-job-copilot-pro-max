import { redirect } from 'next/navigation';
import { coverLetterAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getProfile, getResumes, getSessionToken } from '@/lib/server/backend';

export default async function CoverLetterPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const [profile, resumes] = await Promise.all([getProfile(), getResumes()]);
  const resumeText = resumes[0]?.parsedText || resumes[0]?.manualText || profile.profile?.resumeBaseText || '';

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="AI Cover Letter Generator" description="Generate an editable role-specific cover letter using your profile and resume text." />
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <ActionForm action={coverLetterAction} buttonLabel="Generate cover letter" className="grid gap-4">
            <input type="hidden" name="profileText" value={`${profile.name} ${profile.profile?.skills?.join(', ') || ''}`} />
            <label className="grid gap-1 text-sm font-medium">Company<input name="company" className="rounded-md border border-slate-200 px-3 py-2" /></label>
            <label className="grid gap-1 text-sm font-medium">Tone<select name="tone" className="rounded-md border border-slate-200 px-3 py-2"><option value="professional">Professional</option><option value="confident">Confident</option><option value="concise">Concise</option></select></label>
            <label className="grid gap-1 text-sm font-medium">Resume text<textarea name="resumeText" rows={8} defaultValue={resumeText} className="rounded-md border border-slate-200 px-3 py-2" /></label>
            <label className="grid gap-1 text-sm font-medium">Job description<textarea name="jobDescription" rows={10} className="rounded-md border border-slate-200 px-3 py-2" /></label>
          </ActionForm>
        </section>
      </main>
    </AppShell>
  );
}
