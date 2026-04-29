import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { backendFetch, getSessionToken } from '@/lib/server/backend';

export default async function AdminJobSourcesPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const status = await backendFetch<{ success: boolean; data: Record<string, string> }>('/api/integrations/jobs/status').catch((error) => ({
    success: false,
    data: { error: error instanceof Error ? error.message : 'Admin access required' }
  }));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Job Sources</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Source status</h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(status.data).map(([key, value]) => (
              <div key={key} className="flex justify-between rounded-md bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold">{key}</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
