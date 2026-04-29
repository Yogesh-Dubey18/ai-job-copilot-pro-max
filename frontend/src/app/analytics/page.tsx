import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getAnalytics, getSessionToken } from '@/lib/server/backend';

export default async function AnalyticsPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  const analytics = await getAnalytics();

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Analytics</h1>
        <p className="mt-2 text-slate-600">Conversion, match quality, and recent company focus.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['Total roles', analytics.total],
            ['Response rate', `${analytics.responseRate || 0}%`],
            ['Interview rate', `${analytics.interviewRate}%`],
            ['Offer rate', `${analytics.offerRate}%`],
            ['Avg match', `${analytics.avgMatchScore}%`]
          ].map(([label, value]) => (
            <section key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Best resume version</h2>
            <p className="mt-3 text-sm font-medium text-slate-600">{analytics.bestResumeVersion || 'Base resume'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">Best job source</h2>
            <p className="mt-3 text-sm font-medium text-slate-600">{analytics.bestJobSource || 'Not enough data yet'}</p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Recent Companies</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {analytics.recentCompanies.length === 0 ? (
              <p className="text-sm text-slate-500">Add applications to see company focus.</p>
            ) : (
              analytics.recentCompanies.map((company) => (
                <span key={company} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {company}
                </span>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
