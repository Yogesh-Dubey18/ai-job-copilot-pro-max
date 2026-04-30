import { redirect } from 'next/navigation';
import { uploadResumeAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { getResumes, getSessionToken } from '@/lib/server/backend';

export default async function ResumePage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const resumes = await getResumes();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Resume Manager</h1>
        <p className="mt-2 text-slate-600">Store base resumes, check ATS fit, and generate job-targeted versions.</p>
        <section className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Upload parsed resume</h2>
            <ActionForm action={uploadResumeAction} buttonLabel="Save resume" className="mt-4 grid gap-3">
              <input name="title" placeholder="Resume title" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <textarea name="parsedText" rows={12} placeholder="Paste resume text here" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </ActionForm>
          </div>
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <article key={resume._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold">{resume.title}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">ATS {resume.atsScore}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{resume.parsedText}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm font-semibold">Parsed preview</p>
                    <p className="mt-1 line-clamp-4 text-sm text-slate-600">{resume.sections?.summary || resume.parsedText}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <p className="text-sm font-semibold">Detected skills</p>
                    <p className="mt-1 text-sm text-slate-600">{resume.sections?.skills?.join(', ') || 'Add more resume text to detect skills.'}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span>{resume.versions.length} tailored versions</span>
                  <span>Applied 0</span>
                  <span>Responses 0</span>
                  <span>Response rate 0%</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/api/resumes/${resume._id}/export/pdf`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Export PDF</a>
                  <a href={`/api/resumes/${resume._id}/export/docx`} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">Export DOCX</a>
                </div>
              </article>
            ))}
            {resumes.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">No resumes yet.</p> : null}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
