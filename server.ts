import dotenv from 'dotenv';
dotenv.config({
  path: './config.env',
});
import connectToDatabase from './config/dbConfig';

process.on('uncaughtException', (error: Error) => {
  console.log('UncaughtException shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

let server: any;

(async () => {
  await connectToDatabase();
  // setupCronJobs();

  // Import app only after DB connection is established
  const app = (await import('./app')).default;
  const setupCronJobs = (await import('./jobs')).default;
  const watchUserChanges = (await import('./watchers/userWatchers'))
    .watchUserChanges;
  const watchDepartmentChanges = (await import('./watchers/departmentWatcher'))
    .watchDepartmentChanges;
  setupCronJobs();
  watchUserChanges();
  watchDepartmentChanges();

  server = app.listen(process.env.PORT!, () => {
    console.log(`server is running on port ${process.env.PORT}`);
  });
})();

process.on('unhandledRejection', (error: unknown) => {
  if (error instanceof Error) {
    console.log('Unhandled Rejection shutting down...');
    console.log(error.name, error.message);
  } else console.log(error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('💣❌SIGTERM received, shutting down...');
  if (server) {
    server.close(() => {
      console.log('💣❌Process terminated!');
    });
  }
});
