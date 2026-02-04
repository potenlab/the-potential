import { chromium, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Global Setup for E2E Tests
 *
 * This file runs once before all tests.
 * It can be used to:
 * - Set up test database state
 * - Create authenticated storage states
 * - Initialize test data
 *
 * To use authenticated tests:
 * 1. Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local
 * 2. Uncomment the auth setup code below
 * 3. Reference storage state in test files
 */

// Load environment variables
dotenv.config({ path: '.env.local' });

async function globalSetup(config: FullConfig) {
  console.log('Running global setup...');

  // Example: Create authenticated state for member user
  // Uncomment and modify when you have test users set up

  /*
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/ko/login`);

    // Fill login form
    await page.getByLabel(/이메일|Email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/비밀번호|Password/i).fill(process.env.TEST_USER_PASSWORD!);

    // Submit
    await page.getByRole('button', { name: /로그인|Sign In/i }).click();

    // Wait for redirect to home
    await page.waitForURL(/\/home/, { timeout: 10000 });

    // Save storage state for member
    await page.context().storageState({ path: 'e2e/.auth/member.json' });

    console.log('Member auth state saved');
  } catch (error) {
    console.error('Failed to set up member auth state:', error);
  }

  // Repeat for admin user if needed
  // ...

  await browser.close();
  */

  console.log('Global setup complete');
}

export default globalSetup;
