import { Queue } from 'bullmq';

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
};

export const emailQueue = new Queue('emailQueue', {
  connection,
});
