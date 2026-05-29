import { defineConfig } from '@playwright/test';
import { environments } from './config/environments';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    headless: false,
    baseURL: environments.dummyjson.baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'unit',
      testMatch: /utils\/.*\.spec\.ts/,
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
    },
  ],
});
