import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { JobActions } from '@/components/JobActions';
import { getJob, getSessionToken, getTodayJobs } from '@/lib/server/backend';

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const token = await getSessionToken();
  if (!token) redirect('/login');

  const { jobId } = await params;
  const [job, jobs] = await Promise.all([getJob(jobId), getTodayJobs()]);
  const hasOperationalUrl = Boolean(job.url && !/^https?:\/\/(www\.)?example\.com/i.test(job.url));
  const similarJobs = jobs.filter((item) => item._id !== job._id && (item.title.includes(job.title.split(' ')[0]) || item.company !== job.company)).slice(0, 3);
  const scoreCards = [
    ['Job Fit Score', 'Run analysis'],
    ['ATS Match', 'Keyword-based'],
    ['Skill Gap', 'See AI result'],
    ['Competition Level', 'Medium'],
    ['Apply Priority', 'Tailor first'],
    ['Deadline Risk', 'Normal'],
    ['Scam Risk', job.description.match(/fee|deposit|payment/i) ? 'High' : 'Low']
  ];

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{job.source || 'job board'}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{job.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{job.company} · {job.location || 'Flexible'}</p>
        <div className="mt-6">
          <JobActions jobId={job._id} />
        </div>
        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scoreCards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-black">{value}</p>
            </div>
          ))}
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Job description</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-500">Salary</dt><dd>{job.salaryMin || job.salaryMax ? `${job.salaryMin || 0} - ${job.salaryMax || 'open'}` : 'Not listed'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Job type</dt><dd>{job.remote ? 'Remote / hybrid' : 'Onsite or unspecified'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Experience</dt><dd>{/senior|lead|5\+/i.test(job.description) ? 'Experienced' : 'Fresher-friendly / general'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Source</dt><dd>{job.source || 'manual'}</dd></div>
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description}</p>
          {hasOperationalUrl ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm font-semibold text-slate-950 underline">
              Open original job
            </a>
          ) : null}
        </section>
        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Similar jobs</h2>
          <div className="mt-4 grid gap-3">
            {similarJobs.map((item) => (
              <a key={item._id} href={`/jobs/${item._id}`} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50">
                {item.title} · {item.company}
              </a>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
