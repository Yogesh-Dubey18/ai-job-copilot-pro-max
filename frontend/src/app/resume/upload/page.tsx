import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResumeUploadClient } from '@/components/ResumeUploadClient';
import { getSessionToken } from '@/lib/server/backend';

export default async function ResumeUploadPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Upload Resume</h1>
        <p className="mt-2 text-slate-600">
          Upload PDF, DOCX, DOC, or TXT. The app validates size/type and never invents experience; it only improves wording from your truth.
        </p>
        <div className="mt-8">
          <ResumeUploadClient />
        </div>
      </main>
    </AppShell>
  );
}
