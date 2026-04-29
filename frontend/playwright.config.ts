import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000'
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI
  }
});
