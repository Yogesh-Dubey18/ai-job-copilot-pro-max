import OAuthAccount from '../models/OAuthAccount';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

const clientId = env.GMAIL_CLIENT_ID || env.GOOGLE_CLIENT_ID;
const clientSecret = env.GMAIL_CLIENT_SECRET || env.GOOGLE_CLIENT_SECRET;
const redirectUri = env.GMAIL_REDIRECT_URI || env.GOOGLE_REDIRECT_URI || `${env.FRONTEND_URL}/settings/integrations`;
const missingCredentials = !clientId || !clientSecret;

const authUrl = () => {
  if (missingCredentials) return null;
  const params = new URLSearchParams({
    client_id: clientId as string,
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const gmailStatus = asyncHandler(async (req: any, res) => {
  const account = await OAuthAccount.findOne({ userId: req.user.id, provider: 'gmail' });
  res.json({
    success: true,
    data: {
      connected: Boolean(account?.connected),
      lastSyncAt: account?.lastSyncAt,
      mode: missingCredentials ? 'fallback' : 'oauth',
      fallback: missingCredentials,
      setupRequired: missingCredentials ? ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REDIRECT_URI'] : []
    }
  });
});

export const gmailConnect = asyncHandler(async (req: any, res) => {
  const code = String(req.body.code || '');
  let connected = false;
  let providerAccountId = req.user.id;
  let tokenResponse: any = null;
  if (!missingCredentials && code) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId as string,
        client_secret: clientSecret as string,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });
    tokenResponse = await response.json();
    connected = response.ok && Boolean(tokenResponse.access_token);
    providerAccountId = tokenResponse.scope || req.user.id;
  }

  const account = await OAuthAccount.findOneAndUpdate(
    { userId: req.user.id, provider: 'gmail' },
    {
      connected,
      scope: 'gmail.readonly',
      providerAccountId,
      accessTokenEncrypted: tokenResponse?.access_token,
      refreshTokenEncrypted: tokenResponse?.refresh_token,
      expiresAt: tokenResponse?.expires_in ? new Date(Date.now() + Number(tokenResponse.expires_in) * 1000) : undefined
    },
    { upsert: true, new: true }
  );
  res.json({
    success: true,
    data: {
      connected: account.connected,
      fallback: missingCredentials,
      authUrl: authUrl(),
      message: missingCredentials
        ? 'Gmail OAuth credentials missing. Add credentials to connect.'
        : code
          ? account.connected ? 'Gmail connected.' : 'Google OAuth code exchange failed.'
          : 'Open authUrl to connect Gmail.'
    }
  });
});

export const gmailDisconnect = asyncHandler(async (req: any, res) => {
  await OAuthAccount.findOneAndDelete({ userId: req.user.id, provider: 'gmail' });
  res.json({ success: true, data: { connected: false, deletedSyncedData: true } });
});

export const gmailSync = asyncHandler(async (req: any, res) => {
  const account = await OAuthAccount.findOne({ userId: req.user.id, provider: 'gmail' });
  const connected = Boolean(account?.connected && account.accessTokenEncrypted);
  const detected = [
    { type: 'interview_invite', count: 0 },
    { type: 'assessment', count: 0 },
    { type: 'rejection', count: 0 },
    { type: 'offer', count: 0 },
    { type: 'recruiter_reply', count: 0 },
    { type: 'follow_up_request', count: 0 }
  ];

  if (connected) {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=(interview OR assessment OR offer OR rejected OR recruiter)&maxResults=10', {
      headers: { Authorization: `Bearer ${account?.accessTokenEncrypted}` }
    });
    const data: any = await response.json().catch(() => ({}));
    detected[0].count = Array.isArray(data.messages) ? data.messages.length : 0;
  }

  await OAuthAccount.findOneAndUpdate(
    { userId: req.user.id, provider: 'gmail' },
    { lastSyncAt: new Date(), connected },
    { upsert: true }
  );
  res.json({
    success: true,
    data: {
      fallback: missingCredentials,
      detected
    }
  });
});
