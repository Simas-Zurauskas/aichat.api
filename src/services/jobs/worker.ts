import { MAX_JOBS } from '@conf/env';
import { getNextPendingJob, jobsQueue } from './queue';
import { processAndStoreFile } from './tasks/processAndStoreFile';
import { updateFileTask } from './tasks/updateFileTask';
import { LimitFunction } from './types';

export let limit: LimitFunction | undefined;
(async () => {
  const { default: pLimit } = await import('p-limit');
  limit = pLimit(MAX_JOBS);
})();

export const processJobs = async () => {
  if (!limit) return;

  const job = getNextPendingJob();
  if (!job) {
    return;
  }

  job.status = 'processing';
  job.startedDate = new Date();

  console.log(`Processing job ${job.id} - (${job.def.type})`.bgMagenta);

  try {
    await limit(async () => {
      if (job.def.type === 'processAndStoreFile') {
        await processAndStoreFile(job.def.payload).catch((err) => console.error(`Job ${job.id} failed:`.bgRed, err));
      }
      if (job.def.type === 'updateFile') {
        await updateFileTask(job.def.payload).catch((err) => console.error(`Job ${job.id} failed:`.bgRed, err));
      }
    });

    console.log({
      pendingCount: limit.pendingCount,
      activeCount: limit.activeCount,
      length: limit.length,
    });

    console.log(`Job ${job.def.type} ${job.id} completed.`.bgGreen);
  } catch (err: any) {
    console.error(`Job ${job.def.type} ${job.id} failed:`.bgRed, err);
  }

  const jobIndex = jobsQueue.findIndex((j) => j.id === job.id);
  if (jobIndex !== -1) {
    jobsQueue.splice(jobIndex, 1);
  }

  console.log('jobsQueue', jobsQueue);
};
