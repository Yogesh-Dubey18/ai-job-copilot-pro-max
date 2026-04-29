import { expect, test } from '@playwright/test';

test('public landing page renders the product name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Job Copilot Pro MAX' })).toBeVisible();
});
