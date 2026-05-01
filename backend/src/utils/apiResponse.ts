import { Response } from 'express';

export function ok<T>(res: Response, message: string, data?: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? {}
  });
}

export function created<T>(res: Response, message: string, data?: T) {
  return ok(res, message, data, 201);
}
