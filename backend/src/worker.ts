import 'dotenv/config';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from './config/env';
import { connectDB } from './config/db';
import { queueNames } from './services/queue.service';
import { syncAllJobSources } from './services/jobSource.service';

const run = async () => {
  if (!env.REDIS_URL) {
    console.log('REDIS_URL missing. Worker not started; API manual fallback remains active.');
    return;
  }

  await connectDB();
  const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

  for (const name of queueNames) {
    new Worker(
      name,
      async () => {
        if (name === 'jobs.sync') return syncAllJobSources();
        return { ok: true, name, mode: 'no-op-ready' };
      },
      { connection }
    );
  }

  console.log(`Workers ready: ${queueNames.join(', ')}`);
};

void run();
