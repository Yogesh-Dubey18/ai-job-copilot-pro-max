import Stripe from 'stripe';
import { env } from '../config/env';
import Subscription from '../models/Subscription';
import UsageCounter from '../models/UsageCounter';
import { AppError } from '../utils/AppError';

export const planLimits: Record<string, Record<string, number | boolean>> = {
  free: { aiCredits: 25, resumeVersions: 1, jobMatches: 10, gmailSync: false, portfolioPublish: false },
  pro: { aiCredits: 250, resumeVersions: 9999, jobMatches: 200, gmailSync: false, portfolioPublish: true },
  premium: { aiCredits: 1000, resumeVersions: 9999, jobMatches: 1000, gmailSync: true, portfolioPublish: true }
};

const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) : null;

export const getEntitlement = async (userId: string) => {
  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    { userId, plan: 'free', status: 'active' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return { subscription, limits: planLimits[subscription.plan] || planLimits.free };
};

export const enforceUsage = async (userId: string, key: string) => {
  const { subscription, limits } = await getEntitlement(userId);
  const limit = limits[key];
  if (limit === false) throw new AppError(`${key} is not included in the ${subscription.plan} plan.`, 402);
  if (limit === true) return { allowed: true, limit, count: 0 };

  const usage = await UsageCounter.findOneAndUpdate(
    { userId, key, period: 'monthly' },
    { $setOnInsert: { count: 0, period: 'monthly' } },
    { upsert: true, new: true }
  );
  if (usage.count >= Number(limit)) throw new AppError(`${key} monthly limit reached for ${subscription.plan} plan.`, 402);
  usage.count += 1;
  await usage.save();
  return { allowed: true, limit, count: usage.count };
};

export const createCheckout = async (userId: string, plan: string) => {
  if (!stripe) return { mode: 'safe-mode', message: 'STRIPE_SECRET_KEY is not configured.', plan };
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: `${env.FRONTEND_URL}/billing?success=true`,
    cancel_url: `${env.FRONTEND_URL}/billing?canceled=true`,
    line_items: [],
    metadata: { userId, plan }
  });
  return { mode: 'stripe', url: session.url };
};
