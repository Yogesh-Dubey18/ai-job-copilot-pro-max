import Link from 'next/link';
import { fetchDailyJobsAction, importJobAction } from '@/app/actions/product-actions';
import { ActionForm } from '@/components/ActionForm';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { PageHeader } from '@/components/PageHeader';
import { ServerActionButton } from '@/components/ServerActionButton';
import { getJobsPage, getRecommendedJobs, getSessionToken } from '@/lib/server/backend';

const toQueryString = (params: Record<string, string | undefined>, page: number) => {
  const next = new URLSearchParams();
  Object.entries({ ...params, page: String(page) }).forEach(([key, value]) => {
    if (value) next.set(key, value);
  });
  return next.toString();
};

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const token = await getSessionToken();
  const params = await searchParams;
  const hasFilters = Object.entries(params).some(([key, value]) => key !== 'page' && Boolean(value));
  const page = Math.max(1, Number(params.page || 1));
  const queryParams = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  if (!queryParams.get('limit')) queryParams.set('limit', '10');

  const publicJobs = await getJobsPage(`?${queryParams.toString()}`);
  const jobs =
    token && !hasFilters
      ? await getRecommendedJobs()
      : publicJobs.items.map((job) => ({ job, score: { finalScore: null, applyPriority: 'Profile incomplete' as const } }));

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="AI Job Discovery"
          description={token ? 'Search public jobs and see AI fit signals from your profile.' : 'Browse public jobs. Sign in to save jobs, apply, and see AI match scores.'}
          actions={
            token ? (
              <ServerActionButton action={fetchDailyJobsAction}>Sync daily jobs</ServerActionButton>
            ) : (
              <Link href="/login" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                Sign in
              </Link>
            )
          }
        />

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-4">
            <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
              <input name="query" defaultValue={params.query || params.role || ''} placeholder="Role / keyword" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input name="location" defaultValue={params.location || ''} placeholder="Location" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <select name="workplaceType" defaultValue={params.workplaceType || ''} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option value="">Any workplace</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
              <select name="employmentType" defaultValue={params.employmentType || ''} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option value="">Any job type</option>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
              <input name="skills" defaultValue={params.skills || ''} placeholder="Skills, comma-separated" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <input name="experienceLevel" defaultValue={params.experienceLevel || ''} placeholder="Experience level" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              <select name="sortBy" defaultValue={params.sortBy || 'recent'} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option value="recent">Recent</option>
                <option value="salaryHigh">Salary high</option>
                <option value="salaryLow">Salary low</option>
                <option value="relevance">Relevance</option>
              </select>
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Apply filters</button>
            </form>

            {jobs.length === 0 ? (
              <EmptyState title="No jobs found" description="Try a broader keyword, location, or skill filter." />
            ) : (
              jobs.map(({ job, score }) => (
                <Link key={job._id} href={`/jobs/${job._id}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-400">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{job.title}</h2>
                      <p className="text-sm text-slate-600">{job.company} · {job.location || 'Flexible'} · {job.source || 'job board'}</p>
                    </div>
                    <MatchScoreBadge score={score.finalScore} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(job.skills || []).slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            )}

            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <span>
                Page {publicJobs.pagination.page} of {publicJobs.pagination.totalPages}
              </span>
              <div className="flex gap-2">
                {publicJobs.pagination.hasPrevPage ? (
                  <Link className="rounded-md border px-3 py-1 font-semibold" href={`/jobs?${toQueryString(params, page - 1)}`}>
                    Previous
                  </Link>
                ) : null}
                {publicJobs.pagination.hasNextPage ? (
                  <Link className="rounded-md border px-3 py-1 font-semibold" href={`/jobs?${toQueryString(params, page + 1)}`}>
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Manual import</h2>
            <p className="mt-1 text-sm text-slate-600">Signed-in users can save a job from any source and track it through applications.</p>
            {token ? (
              <ActionForm action={importJobAction} buttonLabel="Import job" className="mt-4 grid gap-3">
                <input name="url" placeholder="Job URL" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <input name="title" placeholder="Title" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <input name="company" placeholder="Company" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
                <textarea name="description" rows={5} placeholder="Job description" className="rounded-md border border-slate-200 px-3 py-2 text-sm" />
              </ActionForm>
            ) : (
              <Link href="/login" className="mt-4 inline-flex rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800">
                Sign in to import
              </Link>
            )}
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
