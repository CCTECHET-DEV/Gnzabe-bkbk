import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morogan from 'morgan';
import path from 'path';
import globalErrorHandler from './controllers/error.controller';
import { sanitizeInputs } from './middlewares/middlewares';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { validationErrorLogger } from './middlewares/validationErrorLogger.middleware';
import authRouter from './routes/auth.routes';
import companyRouter from './routes/company.routes';
import userRouter from './routes/user.routes';

// import companyRouter from './routes/companyRoutes';
// import courseRouter from './routes/courseRoutes';
// import TutorialRouter from './routes/tutorialRoutes';
// import QuizRouter from './routes/quizRoutes';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://192.168.2.249:5173',
  'https://gnzabe.com',
  'https://gnzabe-security-training.netlify.app',
  'https://gnzabe-security-training1.netlify.app',
  'https://gnzabe-security-training2.netlify.app',
  'https://gnezabe-expo-ft.onrender.com',
  // 'http://192.168.1.100:5173'
  // 'http://your-production-frontend.com',
];

const app = express();

// Add request logging middleware
app.use(requestLogger);

app.use(morogan('dev'));
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/images/', express.static(process.env.UPLOAD_DIR!));
app.use('/videos', express.static(path.resolve(__dirname, '../public/videos')));

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, false);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  mongoSanitize.sanitize(req.query);
  next();
});
app.use(sanitizeInputs);
app.use(compression());

const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request! Try again after an hour',
});

app.use(limiter);
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/companies', companyRouter);
app.use('/api/v1/authentication', authRouter);

// app.use('/api/v1/courses', courseRouter);
// app.use('/api/v1/tutorials', TutorialRouter);
// app.use('/api/v1/quizzes', QuizRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.originalUrl, 'error');
  res.status(404).json({
    status: 'fail',
    message: `Couldnot find this ${req.originalUrl} on this server`,
  });
});

// Add validation error logging before global error handler
app.use(validationErrorLogger);
app.use(globalErrorHandler);

export default app;
