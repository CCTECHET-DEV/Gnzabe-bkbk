import dotenv from 'dotenv';
dotenv.config({
  path: './config.env',
});

import app from './app';
import connectToDatabase from './config/dbConfig';

connectToDatabase();

process.on('uncaughtException', (error: Error) => {
  console.log('UncaughtException shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

const server = app.listen(process.env.PORT!, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (error: unknown) => {
  if (error instanceof Error) {
    console.log('Unhandled Rejection shutting down...');
    console.log(error.name, error.message);
  } else console.log(error);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('💣❌SIGTERM received, shutting down...');
  server.close(() => {
    console.log('💣❌Process terminated!');
  });
});
