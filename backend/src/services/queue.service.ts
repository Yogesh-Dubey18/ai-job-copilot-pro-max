import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { syncAllJobSources } from './jobSource.service';

export const queueNames = [
  'jobs.sync',
  'jobs.normalize',
  'jobs.dedupe',
  'resumes.parse',
  'resumes.ats',
  'notifications.dailyDigest',
  'reminders.followup'
] as const;

const connection = env.REDIS_URL
  ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null })
  : null;

const queues = connection
  ? Object.fromEntries(queueNames.map((name) => [name, new Queue(name, { connection })]))
  : {};

export const getQueueStatus = () => ({
  redisConnected: Boolean(connection),
  driver: connection ? 'bullmq' : 'manual safe mode',
  queues: queueNames.map((name) => ({ name, status: connection ? 'ready' : 'Redis not connected' }))
});

export const enqueueJob = async (name: (typeof queueNames)[number], payload: Record<string, unknown> = {}) => {
  if (!connection) {
    if (name === 'jobs.sync') {
      return { mode: 'manual', result: await syncAllJobSources() };
    }
    return { mode: 'manual', skipped: true, reason: 'REDIS_URL is not configured.' };
  }
  const queue = queues[name] as Queue;
  const job = await queue.add(name, payload, { attempts: 3, backoff: { type: 'exponential', delay: 3000 } });
  return { mode: 'queued', jobId: job.id };
};
