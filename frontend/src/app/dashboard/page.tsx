import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { BentoGrid } from '@/components/BentoGrid';
import { StatusBadge } from '@/components/StatusBadge';
import { getDashboardData, getSessionToken } from '@/lib/server/backend';

export default async function DashboardPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  const { stats, applications } = await getDashboardData();
  const recent = applications.slice(0, 5);

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Mission Control</h1>
            <p className="mt-2 text-slate-600">Server-rendered pipeline summary with secure cookie-backed auth.</p>
          </div>
        </div>

        <BentoGrid stats={stats} />

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <span className="text-sm text-slate-500">{recent.length} latest applications</span>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-slate-500">No tracked applications yet.</p>
            ) : (
              recent.map((application) => (
                <div key={application._id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                  <div>
                    <p className="font-semibold">{application.title}</p>
                    <p className="text-sm text-slate-500">{application.company}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
