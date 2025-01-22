import dotenv from 'dotenv';
dotenv.config();
import 'tsconfig-paths/register';
import express from 'express';
import { errorHandler } from '@middleware/errorMiddleware';
import helmet from 'helmet';
import cors from 'cors';
import { authRoutes } from '@routes/authRoutes';
import connectDB from '@conf/mongo';
import { JOB_INTERVAL, PORT } from '@conf/env';
import { instancesRoutes } from '@routes/instancesRoutes';
import { limit, processJobs } from '@services/jobs/worker';
import { jobsQueue } from '@services/jobs/queue';
import { crearInstances } from './scripts';
import { resetUserUsage } from './scripts/resetUserUsage';
import { accountRoutes } from '@routes/accountRoutes';
import _ from 'lodash';
import mt from 'moment-timezone';
mt.tz.setDefault('UTC');

connectDB().finally(() => {
  setInterval(() => {
    processJobs();
  }, JOB_INTERVAL);

  setInterval(() => {
    crearInstances();
  }, 1000 * 60 * 1);

  setInterval(() => {
    resetUserUsage();
  }, 1000 * 60 * 1.1);
});

const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));

app.get('/_health', (req, res) => {
  res.send('ok');
});

app.get('/', (req, res) => {
  res.send('ok');
});

app.use('/api/account', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/instances', instancesRoutes);

app.use('/debug/jobsqueue', (req, res) => {
  res.send({
    jobsQueue,
    limit: {
      pendingCount: limit?.pendingCount,
      activeCount: limit?.activeCount,
      length: limit?.length,
    },
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`.bgCyan);
});
