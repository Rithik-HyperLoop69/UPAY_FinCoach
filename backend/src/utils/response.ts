import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Request successful',
  statusCode: number = 200
): Response => {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: any
): Response => {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(body);
};
