import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { getAdminOverview, getSessionToken } from '@/lib/server/backend';
import { AdminSyncButton } from '@/components/AdminSyncButton';

export default async function AdminPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  const overview = await getAdminOverview().catch((error) => {
    const message = error instanceof Error ? error.message : 'Admin access failed.';
    return { error: message };
  });

  if ('error' in overview) {
    return (
      <AppShell>
        <div className="mx-auto grid min-h-screen max-w-3xl place-items-center px-4">
          <section className="rounded-lg border border-amber-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-3xl font-black tracking-tight">Admin Access Required</h1>
            <p className="mt-3 text-slate-600">
              This page is working, but your current session is not an admin session.
            </p>
            <p className="mt-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{overview.error}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white">
                Login as admin
              </Link>
              <Link href="/dashboard" className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                Back to dashboard
              </Link>
            </div>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Admin Ops</h1>
            <p className="mt-2 text-slate-600">Protected operations, sync controls, and event trail.</p>
          </div>
          <AdminSyncButton />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Users', overview.users],
            ['Jobs', overview.jobs],
            ['Applications', overview.applications]
          ].map(([label, value]) => (
            <section key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </section>
          ))}
        </div>
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Recent Events</h2>
          <div className="mt-4 space-y-3">
            {overview.events.map((event) => (
              <div key={event._id} className="rounded-md bg-slate-50 p-3 text-sm">
                <p className="font-semibold">{event.type}</p>
                <p className="text-slate-600">{event.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
