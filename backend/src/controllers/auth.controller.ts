import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateToken } from '../utils/generateToken';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const formatUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile
});

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });

  if (existing) {
    throw new AppError('Email is already registered.', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id.toString()),
    user: formatUser(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  res.json({
    success: true,
    token: generateToken(user._id.toString()),
    user: formatUser(user)
  });
});

export const me = asyncHandler(async (req: any, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ success: true, user });
});
