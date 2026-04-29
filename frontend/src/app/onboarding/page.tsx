import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResumeUploadClient } from '@/components/ResumeUploadClient';
import { getProfile, getSessionToken } from '@/lib/server/backend';

export default async function OnboardingPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const user = await getProfile();
  const profile = user.profile || {};
  const readiness = Math.min(100, 20 + (profile.resumeBaseText ? 30 : 0) + ((profile.skills || []).length ? 25 : 0) + ((profile.preferredRoles || []).length ? 25 : 0));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Resume-first onboarding</h1>
        <p className="mt-2 text-slate-600">Complete personal info, target role, skills, resume, preferences, and readiness score.</p>
        <section className="mt-8 grid gap-4 md:grid-cols-5">
          {['Personal info', 'Target role', 'Skills', 'Resume upload', 'Preferences'].map((step) => (
            <a key={step} href={step === 'Resume upload' ? '/resume/upload' : '/profile'} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold shadow-sm hover:bg-slate-50">
              {step}
            </a>
          ))}
        </section>
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">AI readiness score</h2>
          <p className="mt-3 text-5xl font-black">{readiness}%</p>
          <p className="mt-2 text-sm text-slate-600">Next action: upload a resume, add target roles, and list your strongest skills.</p>
        </section>
        <div className="mt-6">
          <ResumeUploadClient />
        </div>
      </main>
    </AppShell>
  );
}
