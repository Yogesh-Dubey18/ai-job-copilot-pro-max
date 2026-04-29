import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id']?.toString() || randomUUID();
  const startedAt = Date.now();

  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    console.log(
      JSON.stringify({
        level: 'info',
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      })
    );
  });

  next();
};
