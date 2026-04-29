import { createHash, randomBytes } from 'crypto';

export const createSecureToken = () => randomBytes(32).toString('hex');

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createRecoveryCodes = () =>
  Array.from({ length: 8 }, () => randomBytes(4).toString('hex').toUpperCase());
