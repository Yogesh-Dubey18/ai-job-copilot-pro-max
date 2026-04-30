import { describe, expect, it } from 'vitest';
import { createCheckout, planLimits } from './billing.service';

describe('billing fallback', () => {
  it('defines Free, Pro, and Premium limits', () => {
    expect(planLimits.free.resumeVersions).toBe(1);
    expect(planLimits.pro.portfolioPublish).toBe(true);
    expect(planLimits.premium.gmailSync).toBe(true);
  });

  it('returns safe checkout mode without Stripe keys', async () => {
    const result = await createCheckout('user-id', 'pro');
    expect(result).toHaveProperty('mode');
  });
});
