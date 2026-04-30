import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

const redact = (value: string) => value.replace(/token=([^&]+)/gi, 'token=[redacted]').replace(/password=([^&]+)/gi, 'password=[redacted]');

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
        path: redact(req.originalUrl),
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      })
    );
  });

  next();
};
