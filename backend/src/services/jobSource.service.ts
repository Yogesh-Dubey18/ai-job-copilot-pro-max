import { env } from '../config/env';
import Job from '../models/Job';
import SourceSyncLog from '../models/SourceSyncLog';
import { normalizeScrapedJob } from './scraper.service';

type SourceJob = {
  source: string;
  sourceJobId?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
};

const splitEnvList = (value?: string) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const saveJobs = async (source: string, jobs: SourceJob[]) => {
  let importedCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;

  for (const raw of jobs) {
    try {
      const normalized = normalizeScrapedJob(raw);
      const sourceJobId =
        raw.sourceJobId ||
        normalized.sourceJobId ||
        `${normalized.source}-${normalized.title}-${normalized.company}-${normalized.location}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const existing = await Job.findOne({ source: normalized.source, sourceJobId });
      await Job.findOneAndUpdate(
        { source: normalized.source, sourceJobId },
        { ...normalized, sourceJobId },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      existing ? duplicateCount++ : importedCount++;
    } catch {
      failedCount++;
    }
  }

  await SourceSyncLog.create({
    source,
    status: failedCount && !importedCount ? 'failed' : 'success',
    importedCount,
    duplicateCount,
    failedCount,
    message: `Synced ${source}: ${importedCount} new, ${duplicateCount} duplicate, ${failedCount} failed.`
  });

  return { source, importedCount, duplicateCount, failedCount };
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Source request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

export const syncAdzuna = async () => {
  if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
    await SourceSyncLog.create({ source: 'adzuna', status: 'fallback', message: 'ADZUNA_APP_ID and ADZUNA_APP_KEY are required.' });
    return { source: 'adzuna', importedCount: 0, duplicateCount: 0, failedCount: 0, setupRequired: true };
  }

  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${encodeURIComponent(env.ADZUNA_APP_ID)}&app_key=${encodeURIComponent(env.ADZUNA_APP_KEY)}&results_per_page=25&what=full%20stack%20developer`;
  const data = await fetchJson<{ results: Array<any> }>(url);
  return saveJobs(
    'adzuna',
    data.results.map((job) => ({
      source: 'adzuna',
      sourceJobId: job.id,
      title: job.title,
      company: job.company?.display_name,
      location: job.location?.display_name,
      description: job.description,
      url: job.redirect_url
    }))
  );
};

export const syncRemotive = async () => {
  const data = await fetchJson<{ jobs: Array<any> }>('https://remotive.com/api/remote-jobs?search=developer');
  return saveJobs(
    'remotive',
    data.jobs.slice(0, 30).map((job) => ({
      source: 'remotive',
      sourceJobId: String(job.id),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location,
      description: job.description,
      url: job.url
    }))
  );
};

export const syncGreenhouse = async () => {
  const boards = splitEnvList(env.GREENHOUSE_BOARDS);
  if (!boards.length) {
    await SourceSyncLog.create({ source: 'greenhouse', status: 'fallback', message: 'GREENHOUSE_BOARDS is not configured.' });
    return { source: 'greenhouse', importedCount: 0, duplicateCount: 0, failedCount: 0, setupRequired: true };
  }
  const jobs: SourceJob[] = [];
  for (const board of boards) {
    const data = await fetchJson<{ jobs: Array<any> }>(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`);
    jobs.push(
      ...data.jobs.map((job) => ({
        source: 'greenhouse',
        sourceJobId: String(job.id),
        title: job.title,
        company: board,
        location: job.location?.name,
        description: job.content,
        url: job.absolute_url
      }))
    );
  }
  return saveJobs('greenhouse', jobs);
};

export const syncLever = async () => {
  const companies = splitEnvList(env.LEVER_COMPANIES);
  if (!companies.length) {
    await SourceSyncLog.create({ source: 'lever', status: 'fallback', message: 'LEVER_COMPANIES is not configured.' });
    return { source: 'lever', importedCount: 0, duplicateCount: 0, failedCount: 0, setupRequired: true };
  }
  const jobs: SourceJob[] = [];
  for (const company of companies) {
    const data = await fetchJson<Array<any>>(`https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`);
    jobs.push(
      ...data.map((job) => ({
        source: 'lever',
        sourceJobId: job.id,
        title: job.text,
        company,
        location: job.categories?.location,
        description: `${job.descriptionPlain || ''}\n${job.lists?.map((list: any) => `${list.text}\n${list.content}`).join('\n') || ''}`,
        url: job.hostedUrl
      }))
    );
  }
  return saveJobs('lever', jobs);
};

export const syncAshby = async () => {
  const orgs = splitEnvList(env.ASHBY_ORGANIZATIONS);
  if (!orgs.length) {
    await SourceSyncLog.create({ source: 'ashby', status: 'fallback', message: 'ASHBY_ORGANIZATIONS is not configured.' });
    return { source: 'ashby', importedCount: 0, duplicateCount: 0, failedCount: 0, setupRequired: true };
  }
  const jobs: SourceJob[] = [];
  for (const org of orgs) {
    const data = await fetchJson<{ jobs: Array<any> }>(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(org)}`);
    jobs.push(
      ...data.jobs.map((job) => ({
        source: 'ashby',
        sourceJobId: job.id,
        title: job.title,
        company: org,
        location: job.location,
        description: job.descriptionHtml,
        url: job.applyUrl || job.jobUrl
      }))
    );
  }
  return saveJobs('ashby', jobs);
};

export const syncAllJobSources = async () => {
  const results = [];
  for (const sync of [syncAdzuna, syncRemotive, syncGreenhouse, syncLever, syncAshby]) {
    try {
      results.push(await sync());
    } catch (error) {
      results.push({ source: sync.name, importedCount: 0, duplicateCount: 0, failedCount: 1, error: error instanceof Error ? error.message : 'Sync failed' });
    }
  }
  return results;
};

export const getSourceStatus = async () => {
  const logs = await SourceSyncLog.find().sort({ createdAt: -1 }).limit(25).lean();
  return {
    credentials: {
      adzuna: Boolean(env.ADZUNA_APP_ID && env.ADZUNA_APP_KEY),
      greenhouse: splitEnvList(env.GREENHOUSE_BOARDS).length > 0,
      lever: splitEnvList(env.LEVER_COMPANIES).length > 0,
      ashby: splitEnvList(env.ASHBY_ORGANIZATIONS).length > 0,
      remotive: true
    },
    logs
  };
};
