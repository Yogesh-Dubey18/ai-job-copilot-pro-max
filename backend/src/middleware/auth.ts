import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User, { normalizeUserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'job_seeker' | 'employer' | 'admin';
  };
}

export const protect = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new AppError('Authentication token is required.', 401);
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
  const user = await User.findById(decoded.userId).select('name email role');

  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  req.user = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: normalizeUserRole(user.role)
  };

  next();
});

export const requireAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required.', 403));
  }

  return next();
};

export const requireRole = (...roles: Array<'job_seeker' | 'employer' | 'admin'>) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to access this resource.', 403));
    }

    return next();
  };
};
