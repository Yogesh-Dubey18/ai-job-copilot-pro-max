import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getAdminOverview, getSessionToken } from '@/lib/server/backend';
import { AdminSyncButton } from '@/components/AdminSyncButton';

export default async function AdminPage() {
  const token = await getSessionToken();

  if (!token) {
    redirect('/login');
  }

  const overview = await getAdminOverview();

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
