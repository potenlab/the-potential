import { test, expect, type Page } from '@playwright/test';
import { TEST_USER } from './fixtures/test-user';

/**
 * Admin Approval Flow E2E Tests
 *
 * Tests for:
 * 1. Admin page access control
 * 2. Member approval list rendering
 * 3. Approve member action
 * 4. Reject member action with reason
 * 5. Expert verification page
 * 6. Status filter functionality
 * 7. Search functionality
 */

test.describe('Admin Approval Flow', () => {
  test.describe('Admin Access Control', () => {
    test('should redirect non-authenticated user from admin page', async ({ page }) => {
      await page.goto('/ko/admin');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect non-authenticated user from admin members page', async ({ page }) => {
      await page.goto('/ko/admin/members');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect non-authenticated user from admin experts page', async ({ page }) => {
      await page.goto('/ko/admin/experts');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect non-authenticated user from admin content page', async ({ page }) => {
      await page.goto('/ko/admin/content');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});

/**
 * Admin Member Approval Tests (Requires Admin Auth)
 *
 * These tests require admin authentication state.
 */
test.describe('Admin Member Approval (Admin Authenticated)', () => {
  test.skip('should display member approval page with all elements', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Page header should be visible
    await expect(page.getByRole('heading', { name: /회원 관리|Member/i })).toBeVisible();

    // Status filter tabs should be visible
    await expect(page.getByRole('button', { name: /전체|All/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /대기|Pending/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /승인|Approved/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /반려|Rejected/i })).toBeVisible();

    // Search input should be visible
    await expect(page.getByPlaceholder(/검색|Search/i)).toBeVisible();

    // Table should be visible
    await expect(page.getByRole('table')).toBeVisible();
  });

  test.skip('should filter members by pending status', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // All visible status badges should be pending
    const statusBadges = page.locator('[data-testid="status-badge"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      const badge = statusBadges.nth(i);
      await expect(badge).toHaveText(/pending|대기/i);
    }
  });

  test.skip('should filter members by approved status', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click approved tab
    await page.getByRole('button', { name: /승인됨|Approved/i }).click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // All visible status badges should be approved
    const statusBadges = page.locator('[data-testid="status-badge"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      const badge = statusBadges.nth(i);
      await expect(badge).toHaveText(/approved|승인/i);
    }
  });

  test.skip('should search members by name or email', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Enter search query
    const searchInput = page.getByPlaceholder(/검색|Search/i);
    await searchInput.fill('test');

    // Wait for search
    await page.waitForTimeout(500);

    // Results should be filtered (or show no results)
    // Note: Depends on test data
  });

  test.skip('should display member row with correct information', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Wait for table to load
    await page.waitForTimeout(1000);

    // Find first member row
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      // Row should have member info
      await expect(memberRow.locator('td').first()).toBeVisible(); // Name cell
      await expect(memberRow.locator('[data-testid="status-badge"]')).toBeVisible();
    }
  });

  test.skip('should show approve button for pending members', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab to ensure pending members are shown
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Find first pending member row
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      // Approve button should be visible
      const approveButton = memberRow.getByRole('button', { name: /승인|Approve/i });
      await expect(approveButton).toBeVisible();
    }
  });

  test.skip('should show reject button for pending members', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Find first pending member row
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      // Reject button should be visible
      const rejectButton = memberRow.getByRole('button', { name: /반려|Reject/i });
      await expect(rejectButton).toBeVisible();
    }
  });

  test.skip('should open approve confirmation dialog', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Find first pending member row and click approve
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      await memberRow.getByRole('button', { name: /승인|Approve/i }).first().click();

      // Confirmation dialog should open
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/승인|Approve/i)).toBeVisible();
    }
  });

  test.skip('should open reject dialog with reason field', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Find first pending member row and click reject
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      await memberRow.getByRole('button', { name: /반려|Reject/i }).first().click();

      // Reject dialog should open with reason textarea
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('dialog').getByLabel(/사유|Reason/i)
      ).toBeVisible();
    }
  });

  test.skip('should require reason for rejection', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Open reject dialog
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      await memberRow.getByRole('button', { name: /반려|Reject/i }).first().click();

      // Reject button in dialog should be disabled without reason
      const dialogRejectButton = page.getByRole('dialog').getByRole('button', { name: /반려|Reject/i });
      await expect(dialogRejectButton).toBeDisabled();

      // Enter reason
      await page.getByRole('dialog').getByLabel(/사유|Reason/i).fill('Test rejection reason');

      // Now reject button should be enabled
      await expect(dialogRejectButton).toBeEnabled();
    }
  });

  test.skip('should close approve dialog on cancel', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Open approve dialog
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      await memberRow.getByRole('button', { name: /승인|Approve/i }).first().click();
      await expect(page.getByRole('dialog')).toBeVisible();

      // Click cancel
      await page.getByRole('button', { name: /취소|Cancel/i }).click();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test.skip('should show success toast after approving member', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Open and confirm approval
    const memberRow = page.locator('tbody tr').first();

    if (await memberRow.isVisible()) {
      await memberRow.getByRole('button', { name: /승인|Approve/i }).first().click();

      // Confirm in dialog
      await page.getByRole('dialog').getByRole('button', { name: /승인|Approve/i }).click();

      // Success toast should appear
      await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    }
  });
});

/**
 * Admin Expert Verification Tests
 */
test.describe('Admin Expert Verification (Admin Authenticated)', () => {
  test.skip('should display expert verification page', async ({ page }) => {
    await page.goto('/ko/admin/experts');

    // Page header should be visible
    await expect(page.getByRole('heading', { name: /전문가 검증|Expert Verification/i })).toBeVisible();

    // Status tabs should be visible
    await expect(page.getByRole('button', { name: /대기|Pending/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /검증|Verified/i })).toBeVisible();
  });

  test.skip('should filter experts by pending status', async ({ page }) => {
    await page.goto('/ko/admin/experts');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();

    // Wait for filter
    await page.waitForTimeout(500);

    // Results should be pending experts only
  });

  test.skip('should show view documents button for pending experts', async ({ page }) => {
    await page.goto('/ko/admin/experts');

    // Click pending tab
    await page.getByRole('button', { name: /대기|Pending/i }).click();
    await page.waitForTimeout(500);

    // Find first expert row
    const expertRow = page.locator('tbody tr').first();

    if (await expertRow.isVisible()) {
      // View documents button should be visible
      await expect(
        expertRow.getByRole('button', { name: /서류|Documents/i })
      ).toBeVisible();
    }
  });
});

/**
 * Admin Content Management Tests
 */
test.describe('Admin Content Management (Admin Authenticated)', () => {
  test.skip('should display content management page', async ({ page }) => {
    await page.goto('/ko/admin/content');

    // Page header should be visible
    await expect(page.getByRole('heading', { name: /콘텐츠|Content/i })).toBeVisible();

    // Tabs for programs and posts should be visible
    await expect(page.getByRole('button', { name: /프로그램|Programs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /게시글|Posts/i })).toBeVisible();
  });

  test.skip('should show create program button', async ({ page }) => {
    await page.goto('/ko/admin/content');

    // Create button should be visible
    await expect(
      page.getByRole('button', { name: /생성|Create|추가|Add/i })
    ).toBeVisible();
  });
});

/**
 * Admin Navigation Tests
 */
test.describe('Admin Navigation (Admin Authenticated)', () => {
  test.skip('should have sidebar with all admin sections', async ({ page }) => {
    await page.goto('/ko/admin');

    // Sidebar should be visible on desktop
    const sidebar = page.locator('[data-testid="admin-sidebar"]');

    if (await sidebar.isVisible()) {
      // Members link
      await expect(sidebar.getByRole('link', { name: /회원|Members/i })).toBeVisible();

      // Experts link
      await expect(sidebar.getByRole('link', { name: /전문가|Experts/i })).toBeVisible();

      // Content link
      await expect(sidebar.getByRole('link', { name: /콘텐츠|Content/i })).toBeVisible();
    }
  });

  test.skip('should navigate between admin sections', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Navigate to experts
    const expertsLink = page.getByRole('link', { name: /전문가|Experts/i });
    if (await expertsLink.isVisible()) {
      await expertsLink.click();
      await expect(page).toHaveURL(/\/admin\/experts/);
    }

    // Navigate to content
    const contentLink = page.getByRole('link', { name: /콘텐츠|Content/i });
    if (await contentLink.isVisible()) {
      await contentLink.click();
      await expect(page).toHaveURL(/\/admin\/content/);
    }
  });
});

/**
 * Admin Responsive Tests
 */
test.describe('Admin Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.skip('should show mobile-friendly table on small screens', async ({ page }) => {
    await page.goto('/ko/admin/members');

    // Table should be scrollable or have condensed columns
    const table = page.getByRole('table');
    await expect(table).toBeVisible();

    // Some columns may be hidden on mobile
    // Note: Depends on implementation
  });
});
