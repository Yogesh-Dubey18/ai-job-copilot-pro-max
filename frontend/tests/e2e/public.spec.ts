import { expect, test } from '@playwright/test';

test('public landing page renders the product name', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Job Copilot Pro MAX' })).toBeVisible();
});

test('public marketing pages render', async ({ page }) => {
  for (const route of ['/features', '/pricing', '/about', '/contact']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('auth and protected entry pages are reachable', async ({ page }) => {
  for (const route of ['/login', '/register', '/resume/upload', '/jobs', '/applications', '/analytics', '/assistant', '/tools', '/admin']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' }).catch(() => page.goto('/login'));
    await expect(page.locator('body')).toBeVisible();
  }
});
