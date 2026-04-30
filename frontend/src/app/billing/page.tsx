import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { backendFetch, getSessionToken } from '@/lib/server/backend';

export default async function BillingPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');
  const plans = await backendFetch<{ success: boolean; data: Array<{ id: string; name: string; aiCredits: number; resumeVersions: number; gmailSync: boolean }> }>('/api/billing/plans');

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Billing and Usage</h1>
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
