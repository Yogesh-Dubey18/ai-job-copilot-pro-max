import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getSessionToken } from '@/lib/server/backend';
import { SecurityPanel } from '@/components/SecurityPanel';
import { PrivacyControls } from '@/components/PrivacyControls';
import { GmailControls } from '@/components/GmailControls';

export default async function SettingsPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your account, connected services, privacy, preferences, and job-search reminders.</p>

        <div className="mt-8 grid gap-4">
          <SecurityPanel />
          <GmailControls />
          <PrivacyControls />
          {[
            ['Account', 'Update your sign-in recovery details and keep your profile current.'],
            ['Connected Services', 'Live job and email sync are not connected yet. You can still use curated jobs, manual import, and manual tracking.'],
            ['AI Preferences', 'Choose how concise, detailed, or Hinglish-friendly your career assistant should be.'],
            ['Notifications', 'Control follow-up reminders, interview alerts, and daily digest nudges.'],
            ['Job Preferences', 'Keep target roles, locations, salary expectations, and workplace preferences up to date.']
          ].map(([title, body]) => (
            <section key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
