import http from 'http';
import dotenv from 'dotenv';
dotenv.config({
  path: './config.env',
});
import connectToDatabase from './config/dbConfig';
import { Server } from 'socket.io';

declare global {
  // Add the io property to globalThis
  // eslint-disable-next-line no-var
  var io: Server;
}

process.on('uncaughtException', (error: Error) => {
  console.log('UncaughtException shutting down...');
  console.log(error.name, error.message);
  process.exit(1);
});

let server: http.Server;

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

  server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://gnzabe.com',
        'https://production.gnzabe.com',
        // other origins if needed
      ],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Example: Notify user-specific messages
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  globalThis.io = io;

  setupCronJobs();
  watchUserChanges();
  watchDepartmentChanges();

  server.listen(process.env.PORT!, () => {
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
