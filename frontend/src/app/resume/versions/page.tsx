import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getResumes, getSessionToken } from '@/lib/server/backend';

export default async function ResumeVersionsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const resumes = await getResumes();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Resume Versions</h1>
        <div className="mt-8 grid gap-4">
          {resumes.flatMap((resume) => resume.versions.map((version) => ({ resume, version }))).map(({ resume, version }) => (
            <article key={`${resume._id}-${version.title}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{version.title}</h2>
              <p className="mt-2 text-sm text-slate-600">ATS {version.atsScore} · Keywords: {version.keywords.join(', ') || 'none'}</p>
              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-sm text-white">{version.content}</pre>
              <button className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold">Export PDF/DOCX placeholder</button>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
