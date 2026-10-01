import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for Zod Validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', formattedErrors);
  }

  // Check for custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    return sendError(res, 'A unique constraint would be violated on this field', 409, 'CONFLICT');
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Requested record was not found', 404, 'NOT_FOUND');
  }

  // Fallback generic internal error
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';
  console.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);
  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR', process.env.NODE_ENV === 'development' ? err.stack : undefined);
};
