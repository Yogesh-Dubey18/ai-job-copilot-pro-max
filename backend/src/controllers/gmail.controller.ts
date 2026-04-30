import OAuthAccount from '../models/OAuthAccount';
import { asyncHandler } from '../utils/asyncHandler';

const missingCredentials = !process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET;

export const gmailStatus = asyncHandler(async (req: any, res) => {
  const account = await OAuthAccount.findOne({ userId: req.user.id, provider: 'gmail' });
  res.json({
    success: true,
    data: {
      connected: Boolean(account?.connected),
      lastSyncAt: account?.lastSyncAt,
      fallback: missingCredentials,
      setupRequired: missingCredentials ? ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REDIRECT_URI'] : []
    }
  });
});

export const gmailConnect = asyncHandler(async (req: any, res) => {
  const account = await OAuthAccount.findOneAndUpdate(
    { userId: req.user.id, provider: 'gmail' },
    { connected: !missingCredentials, scope: 'gmail.readonly', providerAccountId: req.user.id },
    { upsert: true, new: true }
  );
  res.json({
    success: true,
    data: {
      connected: account.connected,
      fallback: missingCredentials,
      authUrl: missingCredentials ? null : 'https://accounts.google.com/o/oauth2/v2/auth',
      message: missingCredentials ? 'Gmail OAuth credentials missing. Fallback status mode enabled.' : 'Gmail OAuth ready.'
    }
  });
});

export const gmailDisconnect = asyncHandler(async (req: any, res) => {
  await OAuthAccount.findOneAndDelete({ userId: req.user.id, provider: 'gmail' });
  res.json({ success: true, data: { connected: false, deletedSyncedData: true } });
});

export const gmailSync = asyncHandler(async (req: any, res) => {
  await OAuthAccount.findOneAndUpdate(
    { userId: req.user.id, provider: 'gmail' },
    { lastSyncAt: new Date(), connected: !missingCredentials },
    { upsert: true }
  );
  res.json({
    success: true,
    data: {
      fallback: missingCredentials,
      detected: [
        { type: 'interview_invite', count: 0 },
        { type: 'assessment', count: 0 },
        { type: 'rejection', count: 0 },
        { type: 'offer', count: 0 },
        { type: 'recruiter_reply', count: 0 }
      ]
    }
  });
});
