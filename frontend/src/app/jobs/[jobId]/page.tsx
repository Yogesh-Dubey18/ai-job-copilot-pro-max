import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { EmptyState } from '@/components/EmptyState';
import { JobActions } from '@/components/JobActions';
import { ManualApplyForm } from '@/components/ManualApplyForm';
import { MatchScoreBadge } from '@/components/MatchScoreBadge';
import { StatCard } from '@/components/StatCard';
import { getJob, getJobScore, getJobs, getSessionToken } from '@/lib/server/backend';
import { ScoreBreakdown } from '@/types';

const incompleteScore: ScoreBreakdown = {
  profileIncomplete: true,
  finalScore: null,
  jobFitScore: null,
  atsMatchScore: null,
  skillMatchScore: null,
  experienceFitScore: null,
  locationFitScore: null,
  salaryFitScore: null,
  companyQualityScore: 0,
  scamRiskScore: 0,
  matchedSkills: [],
  missingSkills: [],
  applyPriority: 'Profile incomplete',
  aiRecommendation: 'Sign in and complete your profile to calculate an AI match score.'
};

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const token = await getSessionToken();
  const { jobId } = await params;
  const [job, jobs, score] = await Promise.all([
    getJob(jobId),
    getJobs('?limit=4'),
    token ? getJobScore(jobId).catch(() => incompleteScore) : Promise.resolve(incompleteScore)
  ]);
  const hasOperationalUrl = Boolean(job.url && !/^https?:\/\/(www\.)?example\.com/i.test(job.url));
  const similarJobs = jobs
    .filter((item) => item._id !== job._id && (item.title.includes(job.title.split(' ')[0]) || item.company !== job.company))
    .slice(0, 3);
  const scoreCards = [
    ['Job fit', score.jobFitScore === null ? 'Profile needed' : `${score.jobFitScore}%`],
    ['ATS match', score.atsMatchScore === null ? 'Profile needed' : `${score.atsMatchScore}%`],
    ['Skills', score.skillMatchScore === null ? 'Profile needed' : `${score.skillMatchScore}%`],
    ['Experience', score.experienceFitScore === null ? 'Profile needed' : `${score.experienceFitScore}%`],
    ['Location', score.locationFitScore === null ? 'Profile needed' : `${score.locationFitScore}%`],
    ['Salary', score.salaryFitScore === null ? 'Profile needed' : `${score.salaryFitScore}%`]
  ];

  return (
    <AppShell>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{job.source || 'job board'}</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{job.title}</h1>
            <p className="mt-2 text-lg text-slate-600">{job.company} · {job.location || 'Flexible'}</p>
          </div>
          <MatchScoreBadge score={score.finalScore} />
        </div>

        <div className="mt-6">{token ? <JobActions jobId={job._id} /> : <Link href="/login" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Sign in to save or apply</Link>}</div>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scoreCards.map(([label, value]) => (
            <StatCard key={label} label={label} value={value} />
          ))}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Job description</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-semibold text-slate-500">Salary</dt><dd>{job.salaryMin || job.salaryMax ? `${job.salaryMin || 0} - ${job.salaryMax || 'open'}` : 'Not listed'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Workplace</dt><dd>{job.workplaceType || (job.remote ? 'remote' : 'unspecified')}</dd></div>
            <div><dt className="font-semibold text-slate-500">Employment</dt><dd>{job.employmentType?.replaceAll('_', ' ') || 'Not listed'}</dd></div>
            <div><dt className="font-semibold text-slate-500">Experience</dt><dd>{job.experienceLevel || 'General'}</dd></div>
          </dl>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{job.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-bold">Matched skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(score.matchedSkills.length ? score.matchedSkills : ['Complete profile for matching']).map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{skill}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Missing skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {(score.missingSkills.length ? score.missingSkills : ['No major gaps detected']).map((skill) => (
                  <span key={skill} className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-md bg-slate-50 p-4">
            <h3 className="font-bold">AI reason and next actions</h3>
            <p className="mt-2 text-sm text-slate-700">{score.aiRecommendation}</p>
            <ul className="mt-3 grid gap-2 text-sm text-slate-700">
              {(score.nextActions || ['Save this job', 'Generate Application Kit', 'Track manual application after submitting']).map((action) => (
                <li key={action}>- {action}</li>
              ))}
            </ul>
          </div>

          {hasOperationalUrl ? (
            <a href={job.url} target="_blank" rel="noreferrer" className="mt-6 inline-flex text-sm font-semibold text-slate-950 underline">
              Open original job
            </a>
          ) : null}
        </section>

        {token ? <section className="mt-8"><ManualApplyForm jobId={job._id} /></section> : null}

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Similar jobs</h2>
          <div className="mt-4 grid gap-3">
            {similarJobs.length === 0 ? (
              <EmptyState title="No similar roles yet" description="Check back after more public jobs are indexed." />
            ) : (
              similarJobs.map((item) => (
                <Link key={item._id} href={`/jobs/${item._id}`} className="rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50">
                  {item.title} · {item.company}
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
