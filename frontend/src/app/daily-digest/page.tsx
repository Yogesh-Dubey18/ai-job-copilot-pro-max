import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { getDailyDigest, getSessionToken } from '@/lib/server/backend';

export default async function DailyDigestPage() {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const digest = await getDailyDigest();

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black tracking-tight">Daily Digest</h1>
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Jobs found', digest.jobsFound],
            ['High match jobs', digest.highMatchJobs],
            ['Follow-ups due', digest.followUps],
            ['Interviews', digest.interviews]
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className="mt-2 text-4xl font-black">{value}</p>
            </div>
          ))}
        </section>
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Today’s mission</h2>
          <ul className="mt-4 grid gap-3">
            {digest.mission.map((item) => (
              <li key={item} className="rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
