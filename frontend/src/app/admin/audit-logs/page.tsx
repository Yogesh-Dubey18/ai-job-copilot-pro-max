import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { getAdminAuditLogs, getSessionToken } from '@/lib/server/backend';

export default async function AdminAuditLogsPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const logs = await getAdminAuditLogs('?limit=50');
  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Audit Logs" description="Sensitive admin and employer actions across the platform." />
        <section className="mt-8 grid gap-3">
          {logs.items.map((log) => (
            <article key={log._id} className="rounded-lg border bg-white p-4">
              <p className="font-semibold">{log.action}</p>
              <p className="text-sm text-slate-600">{log.entityType || log.entity} · {log.entityId || 'n/a'} · {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</p>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
