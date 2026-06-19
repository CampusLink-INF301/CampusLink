import { defineConfig, devices } from '@playwright/test';

const apiUrl = process.env.API_URL ?? 'http://localhost:3000/api';

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  timeout: 30000,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL ?? 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000,
    env: { VITE_API_URL: apiUrl },
  },
});
