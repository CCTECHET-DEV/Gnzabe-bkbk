import cron from 'node-cron';
import deleteOldUnverifiedUsers from './deleteUnverifiedUsers';

export default function setupCronJobs() {
  console.log('executed');
  cron.schedule('0 0 * * *', () => {
    console.log(
      'Scheduling job to delete unverified users every day at midnight',
    );
    console.log('Running scheduled job to delete unverified users');
    deleteOldUnverifiedUsers();
  });
}
