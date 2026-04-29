import { redirect } from 'next/navigation';
import Link from 'next/link';
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
            <h1 className="text-4xl font-black tracking-tight">Job Search Dashboard</h1>
            <p className="mt-2 text-slate-600">Mission Control for your resume, jobs, manual applications, and interviews.</p>
          </div>
        </div>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">First-time checklist</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            {['Upload Resume', 'Set Target Role', 'Get Job Matches', 'Generate Application Kit', 'Track Applications'].map((item) => (
              <a key={item} href={item === 'Upload Resume' ? '/resume/upload' : item === 'Get Job Matches' ? '/jobs' : item === 'Track Applications' ? '/applications' : '/profile'} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold hover:bg-slate-100">
                {item}
              </a>
            ))}
          </div>
        </section>

        <BentoGrid stats={stats} />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <a href="/analytics" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
            <h2 className="font-bold">Analytics</h2>
            <p className="mt-1 text-sm text-slate-600">See conversion rates and match quality.</p>
          </a>
          <a href="/tools" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
            <h2 className="font-bold">AI Tools</h2>
            <p className="mt-1 text-sm text-slate-600">Generate interview, salary, portfolio, and Gmail assets.</p>
          </a>
          <a href="/settings" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:bg-slate-50">
            <h2 className="font-bold">Settings</h2>
            <p className="mt-1 text-sm text-slate-600">Review security and integration posture.</p>
          </a>
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <span className="text-sm text-slate-500">{recent.length} latest applications</span>
          </div>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
                <p className="text-slate-500">No tracked applications yet. Your dashboard will fill after you add applications.</p>
                <Link href="/applications" className="mt-3 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  Add first application
                </Link>
              </div>
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
