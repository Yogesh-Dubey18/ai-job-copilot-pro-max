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
            ['Remote jobs', digest.remoteJobs || 0],
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
          <h2 className="text-xl font-bold">Today&apos;s mission</h2>
          <ul className="mt-4 grid gap-3">
            {digest.mission.map((item) => (
              <li key={item} className="rounded-md bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{item}</li>
            ))}
          </ul>
        </section>
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Top high-fit jobs</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {(digest.topJobs || []).slice(0, 10).map((job) => (
                <li key={job._id} className="rounded-md bg-slate-50 px-3 py-2 font-medium">{job.title} · {job.company}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Urgent apply jobs</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {(digest.urgentApplyJobs || []).map((job) => (
                <li key={job} className="rounded-md bg-amber-50 px-3 py-2 font-medium text-amber-800">{job}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Missing skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(digest.missingSkills || []).map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">{skill}</span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Resume improvements</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {(digest.resumeImprovements || []).map((item) => (
                <li key={item} className="rounded-md bg-slate-50 px-3 py-2 font-medium">{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold">Notifications</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              {(digest.notifications || []).map((item) => (
                <li key={item.type} className="rounded-md bg-slate-50 px-3 py-2">
                  <span className="font-semibold">{item.title}</span>
                  <span className="block text-slate-600">{item.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
