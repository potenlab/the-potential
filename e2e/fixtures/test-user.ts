/**
 * Test User Fixtures
 *
 * Test user credentials and data for E2E tests.
 * Uses environment variables for security.
 */

export const TEST_USER = {
  // Regular member (approved)
  member: {
    email: process.env.TEST_USER_EMAIL || 'test-member@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Test123!@#',
    name: 'Test Member',
    company: 'Test Company',
  },

  // Expert (approved)
  expert: {
    email: process.env.TEST_EXPERT_EMAIL || 'test-expert@example.com',
    password: process.env.TEST_EXPERT_PASSWORD || 'Test123!@#',
    name: 'Test Expert',
    company: 'Expert Agency',
  },

  // Admin
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'test-admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Test123!@#',
    name: 'Test Admin',
  },

  // New user for signup tests (should not exist in DB)
  newUser: {
    email: `test-signup-${Date.now()}@example.com`,
    password: 'NewUser123!@#',
    name: 'New Test User',
    company: 'New Company',
  },
};

/**
 * Generate a unique email for signup tests
 */
export function generateUniqueEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/**
 * Test post content
 */
export const TEST_POST = {
  content: `Test post content created at ${new Date().toISOString()}`,
  shortContent: 'Test post',
};

/**
 * Test comment content
 */
export const TEST_COMMENT = {
  content: `Test comment at ${new Date().toISOString()}`,
};

/**
 * Test expert filter values
 */
export const TEST_FILTERS = {
  categories: ['marketing', 'development', 'design'],
  searchQuery: 'test',
};
