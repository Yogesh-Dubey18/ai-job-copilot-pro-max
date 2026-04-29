import { ErrorRequestHandler } from 'express';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    stack: isProduction ? undefined : error.stack
  });
};
