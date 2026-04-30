import { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import { recordEvent } from '../services/event.service';
import { captureError } from '../services/observability.service';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = env.NODE_ENV === 'production';
  const requestId = res.getHeader('x-request-id')?.toString();

  void recordEvent({
    level: statusCode >= 500 ? 'error' : 'warn',
    type: 'http.error',
    message: error.message || 'Internal server error',
    requestId,
    metadata: { statusCode }
  });
  captureError(error, requestId);

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    requestId,
    stack: isProduction ? undefined : error.stack
  });
};
