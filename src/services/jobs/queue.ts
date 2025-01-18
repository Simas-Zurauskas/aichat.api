import { MAX_JOBS } from '@conf/env';
import { genUxId } from '@util/misc';
import { Job, JobDef } from 'src/types';

export const jobsQueue: Job[] = [];

type AddJobToQueue = (def: JobDef) => Job;

export const addJobToQueue: AddJobToQueue = (def) => {
  const newJob: Job = {
    id: genUxId(),
    initDate: new Date(),
    status: 'pending',
    def,
  };

  jobsQueue.push(newJob);
  console.log('jobsQueue', jobsQueue);
  return newJob;
};

export const getJobById = (jobId: string): Job | undefined => {
  return jobsQueue.find((job) => job.id === jobId);
};

export const getNextPendingJob = (): Job | undefined => {
  const runningJobsCount = jobsQueue.filter((job) => job.status === 'processing').length;
  if (runningJobsCount >= MAX_JOBS) {
    return;
  }
  return jobsQueue.find((job) => job.status === 'pending');
};
