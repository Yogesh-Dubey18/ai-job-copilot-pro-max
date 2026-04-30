import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { backendFetch, getSessionToken } from '@/lib/server/backend';

export default async function BillingPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const [plans, status] = await Promise.all([
    backendFetch<{ success: boolean; data: Array<{ id: string; name: string; aiCredits: number; resumeVersions: number; gmailSync: boolean }> }>('/api/billing/plans'),
    backendFetch<{
      success: boolean;
      data: {
        subscription: { plan: string; status: string };
        usage: Array<{ key: string; count: number; limit?: number; period: string }>;
        fallback: boolean;
      };
    }>('/api/billing/status')
  ]);

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Billing and Usage</h1>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Current plan</h2>
          <p className="mt-2 text-sm text-slate-600">
            {status.data.subscription.plan.toUpperCase()} - {status.data.subscription.status}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Online upgrade is not available yet. Contact support to upgrade.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {(status.data.usage.length ? status.data.usage : [
              { key: 'AI credits', count: 0, limit: plans.data.find((plan) => plan.id === status.data.subscription.plan)?.aiCredits || 0, period: 'monthly' },
              { key: 'Resume versions', count: 0, limit: plans.data.find((plan) => plan.id === status.data.subscription.plan)?.resumeVersions || 0, period: 'monthly' },
              { key: 'Job matches', count: 0, limit: 10, period: 'daily' },
              { key: 'Gmail sync', count: status.data.subscription.plan === 'free' ? 0 : 1, limit: status.data.subscription.plan === 'free' ? 0 : 1, period: 'available' }
            ]).map((item) => (
              <div key={item.key} className="rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-600">{item.key}</p>
                <p className="mt-1 text-2xl font-black">{item.count}{item.limit !== undefined ? ` / ${item.limit}` : ''}</p>
                {item.limit !== undefined && item.limit > 0 ? (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-950" style={{ width: `${Math.min(100, (item.count / item.limit) * 100)}%` }} />
                  </div>
                ) : null}
                <p className="text-xs text-slate-500">{item.period}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.data.map((plan) => (
            <article key={plan.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{plan.aiCredits} AI credits · {plan.resumeVersions} resume versions</p>
              <p className="mt-2 text-sm text-slate-600">Gmail sync: {plan.gmailSync ? 'Included' : 'Not included'}</p>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
