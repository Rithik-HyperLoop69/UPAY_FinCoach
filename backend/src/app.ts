import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/logger.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import apiRouter from './routes';
import { sendSuccess } from './utils/response';

const app: Express = express();

// Security & Header Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      const configuredClient = (env.CLIENT_URL || '').replace(/\/$/, '');
      if (
        cleanOrigin === configuredClient ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Rate Limiting
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'operational',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      service: 'upay-fincoach-api',
      currency: env.DEFAULT_CURRENCY,
    },
    'upay FinCoach API is healthy and operational'
  );
});

// Mount Central API Router
app.use('/api', apiRouter);

// 404 Catch-All
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
