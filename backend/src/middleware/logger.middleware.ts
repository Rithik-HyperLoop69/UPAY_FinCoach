import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor =
      statusCode >= 500
        ? '\x1b[31m' // Red
        : statusCode >= 400
        ? '\x1b[33m' // Yellow
        : '\x1b[32m'; // Green

    // Mask any potential sensitive paths or headers
    console.log(
      `[HTTP] ${method} ${originalUrl} ${statusColor}${statusCode}\x1b[0m - ${duration}ms`
    );
  });

  next();
};
