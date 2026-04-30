import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getResumes, getSessionToken } from '@/lib/server/backend';

export default async function ResumeVersionsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const resumes = await getResumes();
  const versions = resumes.flatMap((resume) => resume.versions.map((version) => ({ resume, version })));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Resume Versions</h1>
        <p className="mt-2 text-slate-600">Track tailored versions, ATS scores, and export-ready resume content.</p>
        <div className="mt-8 grid gap-4">
          {versions.map(({ resume, version }) => (
            <article key={`${resume._id}-${version.title}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{version.title}</h2>
              <p className="mt-2 text-sm text-slate-600">ATS {version.atsScore} - Keywords: {version.keywords.join(', ') || 'none'}</p>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-white">{version.content}</pre>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-md bg-slate-50 px-3 py-2 font-semibold">Applied 0</span>
                <span className="rounded-md bg-slate-50 px-3 py-2 font-semibold">Responses 0</span>
                <span className="rounded-md bg-slate-50 px-3 py-2 font-semibold">Response rate 0%</span>
                <a href={`/api/resumes/${resume._id}/export/pdf`} className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Export PDF</a>
                <a href={`/api/resumes/${resume._id}/export/docx`} className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Export DOCX</a>
              </div>
            </article>
          ))}
          {versions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">No tailored versions yet. Open a job detail page and tailor your resume for that role.</p>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}
