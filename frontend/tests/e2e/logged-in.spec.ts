import { expect, test } from '@playwright/test';

const uniqueEmail = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test('logged-in career workflow pages are reachable and admin is blocked', async ({ page }) => {
  const email = uniqueEmail();
  const backend = process.env.NEXT_PUBLIC_API_URL || 'https://backend-steel-three-33.vercel.app';
  const response = await page.request.post(`${backend}/api/auth/register`, {
    data: { name: 'E2E User', email, password: 'E2EPass123!' }
  });
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  await page.context().addCookies([
    {
      name: 'session',
      value: payload.token,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);

  for (const route of ['/onboarding', '/resume/upload', '/jobs', '/applications', '/responses', '/dashboard']) {
    await page.goto(route);
    await expect(page.locator('body')).toBeVisible();
  }

  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Access Required' })).toBeVisible();
});
