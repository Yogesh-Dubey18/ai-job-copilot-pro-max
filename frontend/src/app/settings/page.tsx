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
        <p className="mt-2 text-slate-600">Production security and integration posture for your workspace.</p>

        <div className="mt-8 grid gap-4">
          <SecurityPanel />
          <GmailControls />
          <PrivacyControls />
          {[
            ['Session security', 'Authenticated routes use an httpOnly cookie session through the Next.js BFF.'],
            ['AI generation', 'Gemini calls stay server-side in the Express backend and return a safe fallback on failure.'],
            ['Chrome extension', 'The extension includes an options screen so the backend URL can be changed without editing code.'],
            ['Observability', 'Backend responses include request IDs and structured request logs for production debugging.'],
            ['Testing and CI', 'GitHub Actions, typecheck, lint, unit tests, and builds are configured as repository quality gates.']
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
