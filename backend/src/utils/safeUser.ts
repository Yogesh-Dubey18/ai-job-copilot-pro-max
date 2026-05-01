import { normalizeUserRole } from '../models/User';

export function serializeUser(user: any) {
  if (!user) return null;
  const source = typeof user.toObject === 'function' ? user.toObject() : user;
  const { passwordHash: _passwordHash, emailVerificationTokenHash: _emailVerificationTokenHash, passwordResetTokenHash: _passwordResetTokenHash, ...safe } = source;
  return {
    ...safe,
    id: source._id?.toString?.() || source.id,
    role: normalizeUserRole(source.role)
  };
}
