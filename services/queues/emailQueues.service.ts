import { Queue } from 'bullmq';

export const emailQueue = new Queue('emailQueue', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});
