import { getNextPendingJob, jobsQueue } from './queue';
import { processAndStoreFile } from './tasks/processAndStoreFile';
import { updateFileTask } from './tasks/updateFileTask';

export const processJobs = async () => {
  const job = getNextPendingJob();
  if (!job) {
    return;
  }

  job.status = 'processing';
  job.startedDate = new Date();

  console.log(`Processing job ${job.id} - (${job.def.type})`.bgMagenta);

  try {
    if (job.def.type === 'processAndStoreFile') {
      await processAndStoreFile(job.def.payload).catch((err) => console.error(`Job ${job.id} failed:`.bgRed, err));
    }
    if (job.def.type === 'updateFile') {
      await updateFileTask(job.def.payload).catch((err) => console.error(`Job ${job.id} failed:`.bgRed, err));
    }

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
