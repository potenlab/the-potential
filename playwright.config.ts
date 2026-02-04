import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Playwright Configuration for The Potential E2E Tests
 *
 * Features:
 * - Runs against local dev server
 * - Chromium-only for faster CI
 * - Retry on CI for flake reduction
 * - Video recording on failure
 * - Test isolation with storage state
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Test timeout (30 seconds per test)
  timeout: 30000,

  // Expect timeout (5 seconds per assertion)
  expect: {
    timeout: 5000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for more stability
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list'], ['github']]
    : [['html', { open: 'never' }], ['list']],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video on failure
    video: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Set default locale to Korean (app default)
    locale: 'ko-KR',

    // Browser context options
    contextOptions: {
      // Ignore HTTPS errors for local development
      ignoreHTTPSErrors: true,
    },
  },

  // Configure projects for different browsers
  projects: [
    // Chromium Desktop
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Mobile Chrome (for responsive testing)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  // Run local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for dev server to start
  },

  // Output directory for test artifacts
  outputDir: 'e2e-results',
});
