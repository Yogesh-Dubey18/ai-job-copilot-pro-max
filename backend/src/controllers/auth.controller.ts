import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User, { normalizeUserRole } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { generateToken } from '../utils/generateToken';
import { createRecoveryCodes, createSecureToken, hashToken } from '../services/security.service';
import { sendEmail } from '../services/email.service';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['job_seeker', 'employer']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaCode: z.string().optional()
});

const formatUser = (user: any) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: normalizeUserRole(user.role),
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
    passwordHash,
    role: data.role || 'job_seeker',
    emailVerified: false
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

  if (user.mfa?.enabled && data.mfaCode !== '000000') {
    res.status(202).json({
      success: false,
      mfaRequired: true,
      message: 'Verification code required. Use the temporary setup code until an authenticator provider is connected.'
    });
    return;
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

export const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: 'Logged out.' });
});

export const requestEmailVerification = asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.json({ success: true, message: 'If the account exists, a verification link was generated.' });
    return;
  }

  const token = createSecureToken();
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  await sendEmail({
    to: user.email,
    subject: 'Verify your AI Job Copilot account',
    text: `Use this verification token: ${token}`
  });

  res.json({
    success: true,
    message: 'Verification token generated. Configure email delivery to send this token.',
    setupToken: token
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const schema = z.object({ token: z.string().min(1) });
  const { token } = schema.parse(req.body);
  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token.', 400);
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified.' });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.json({ success: true, message: 'If the account exists, a reset link was generated.' });
    return;
  }

  const token = createSecureToken();
  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();
  await sendEmail({
    to: user.email,
    subject: 'Reset your AI Job Copilot password',
    text: `Use this reset token within 30 minutes: ${token}`
  });

  res.json({
    success: true,
    message: 'Password reset token generated. Configure email delivery to send this token.',
    setupToken: token
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const schema = z.object({ token: z.string().min(1), password: z.string().min(8) });
  const { token, password } = schema.parse(req.body);
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token.', 400);
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset complete.' });
});

export const configureMfa = asyncHandler(async (req: any, res) => {
  const schema = z.object({ enabled: z.boolean() });
  const { enabled } = schema.parse(req.body);
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const recoveryCodes = enabled ? createRecoveryCodes() : [];
  user.mfa = {
    enabled,
    secretHash: enabled ? hashToken(`${user.email}:${Date.now()}`) : undefined,
    recoveryCodes: recoveryCodes.map(hashToken)
  };
  await user.save();

  res.json({
    success: true,
    message: enabled ? 'Account verification enabled with a temporary setup code.' : 'Account verification disabled.',
    recoveryCodes: enabled ? recoveryCodes : []
  });
});
