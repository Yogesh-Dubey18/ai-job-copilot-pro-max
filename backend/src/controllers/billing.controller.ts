import Subscription from '../models/Subscription';
import UsageCounter from '../models/UsageCounter';
import { asyncHandler } from '../utils/asyncHandler';

export const billingPlans = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'free', name: 'Free', aiCredits: 25, resumeVersions: 3, gmailSync: false },
      { id: 'pro', name: 'Pro', aiCredits: 250, resumeVersions: 25, gmailSync: true },
      { id: 'premium', name: 'Premium', aiCredits: 1000, resumeVersions: 100, gmailSync: true }
    ]
  });
});

export const billingStatus = asyncHandler(async (req: any, res) => {
  const subscription = await Subscription.findOneAndUpdate(
    { userId: req.user.id },
    { userId: req.user.id, plan: 'free', status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const usage = await UsageCounter.find({ userId: req.user.id }).lean();
  res.json({ success: true, data: { subscription, usage, fallback: true } });
});

export const incrementUsage = asyncHandler(async (req: any, res) => {
  const key = String(req.body.key || 'aiCredits');
  const usage = await UsageCounter.findOneAndUpdate(
    { userId: req.user.id, key, period: 'monthly' },
    { $inc: { count: 1 } },
    { upsert: true, new: true }
  );
  res.json({ success: true, data: usage });
});
