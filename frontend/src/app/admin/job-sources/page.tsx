import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { backendFetch, getSessionToken } from '@/lib/server/backend';

export default async function AdminJobSourcesPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const status = await backendFetch<{ success: boolean; data: { credentials?: Record<string, boolean>; logs?: Array<{ _id: string; source: string; status: string; importedCount: number; duplicateCount: number; failedCount: number; message: string }> } }>('/api/admin/job-sources/status').catch((error) => ({
    success: false,
    data: { credentials: { error: false }, logs: [{ _id: 'error', source: 'admin', status: 'blocked', importedCount: 0, duplicateCount: 0, failedCount: 0, message: error instanceof Error ? error.message : 'Admin access required' }] }
  }));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Job Sources</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Source status</h2>
          <div className="mt-4 grid gap-3">
            {Object.entries(status.data.credentials || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between rounded-md bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold">{key}</span>
                <span>{value ? 'Configured' : 'Needs setup'}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Recent sync logs</h2>
          <div className="mt-4 grid gap-3">
            {(status.data.logs || []).map((log) => (
              <div key={log._id} className="rounded-md bg-slate-50 px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <span className="font-semibold">{log.source}</span>
                  <span>{log.status}</span>
                </div>
                <p className="mt-1 text-slate-600">{log.message}</p>
                <p className="mt-1 text-xs text-slate-500">Imported {log.importedCount}, duplicates {log.duplicateCount}, failed {log.failedCount}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
