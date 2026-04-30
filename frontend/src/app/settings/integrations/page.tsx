import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { GmailControls } from '@/components/GmailControls';
import { backendFetch, getSessionToken } from '@/lib/server/backend';

export default async function IntegrationsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const status = await backendFetch<{
    success: boolean;
    data: Record<string, string>;
  }>('/api/integrations/jobs/status').catch(() => ({
    success: true,
    data: {
      adzuna: 'Needs API credentials',
      remotive: 'Ready through curated sync',
      greenhouse: 'Ready through configured company URLs',
      lever: 'Ready through configured company URLs',
      ashby: 'Ready through configured company URLs',
      lastSync: new Date().toISOString()
    }
  }));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Integrations</h1>
        <p className="mt-2 text-slate-600">Connect job sources and Gmail safely. Missing credentials show a clear setup status instead of breaking the app.</p>
        <div className="mt-8 grid gap-4">
          <GmailControls />
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Job source status</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Object.entries(status.data).map(([key, value]) => (
                <div key={key} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-semibold capitalize">{key.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-slate-600">{String(value).replaceAll('_', ' ')}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">What data is used</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Job sources provide role title, company, location, description, skills, salary when available, and apply URL.
              Gmail sync only reads hiring-related message signals after you connect OAuth, and you can disconnect and delete synced data anytime.
            </p>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
