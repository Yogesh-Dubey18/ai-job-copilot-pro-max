import Subscription from '../models/Subscription';
import UsageCounter from '../models/UsageCounter';
import { createCheckout, enforceUsage, getEntitlement, planLimits } from '../services/billing.service';
import { asyncHandler } from '../utils/asyncHandler';

export const billingPlans = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'free', name: 'Free', ...planLimits.free },
      { id: 'pro', name: 'Pro', ...planLimits.pro },
      { id: 'premium', name: 'Premium', ...planLimits.premium }
    ]
  });
});

export const billingStatus = asyncHandler(async (req: any, res) => {
  const { subscription, limits } = await getEntitlement(req.user.id);
  const usage = await UsageCounter.find({ userId: req.user.id }).lean();
  res.json({ success: true, data: { subscription, limits, usage, fallback: true } });
});

export const incrementUsage = asyncHandler(async (req: any, res) => {
  const key = String(req.body.key || 'aiCredits');
  res.json({ success: true, data: await enforceUsage(req.user.id, key) });
});

export const createCheckoutSession = asyncHandler(async (req: any, res) => {
  res.json({ success: true, data: await createCheckout(req.user.id, String(req.body.plan || 'pro')) });
});

export const billingWebhook = asyncHandler(async (_req, res) => {
  res.json({ success: true, received: true, mode: process.env.STRIPE_WEBHOOK_SECRET ? 'stripe' : 'safe-mode' });
});
