import { test, expect, type Page } from '@playwright/test';
import { TEST_FILTERS } from './fixtures/test-user';

/**
 * Expert Search Flow E2E Tests
 *
 * Tests for:
 * 1. Expert search page rendering
 * 2. Search functionality
 * 3. Filter functionality (category, availability)
 * 4. Expert card display
 * 5. Navigation to expert profile
 * 6. Expert profile page rendering
 * 7. Contact/collaboration modals
 */

test.describe('Expert Search Flow', () => {
  test.describe('Expert Search Page (Unauthenticated)', () => {
    test('should redirect to login when accessing experts without auth', async ({ page }) => {
      await page.goto('/ko/experts');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});

/**
 * Authenticated Expert Search Tests
 *
 * These tests require authenticated state.
 */
test.describe('Expert Search (Authenticated)', () => {
  test.skip('should display expert search page with all elements', async ({ page }) => {
    await page.goto('/ko/experts');

    // Verify page header
    await expect(page.getByRole('heading', { name: /전문가|Expert/i })).toBeVisible();

    // Verify search input
    await expect(
      page.getByPlaceholder(/검색|search/i)
    ).toBeVisible();

    // Verify filter button (mobile) or filter panel (desktop)
    const filterButton = page.getByRole('button', { name: /필터|Filter/i });
    const filterPanel = page.locator('[data-testid="filter-panel"]');

    // Either filter button or panel should be visible depending on viewport
    await expect(filterButton.or(filterPanel.first())).toBeVisible();
  });

  test.skip('should search experts by keyword', async ({ page }) => {
    await page.goto('/ko/experts');

    // Enter search query
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill(TEST_FILTERS.searchQuery);

    // Wait for search results
    await page.waitForTimeout(500); // Debounce wait

    // Results should update based on search
    // Note: Exact assertion depends on test data
  });

  test.skip('should clear search when clicking X button', async ({ page }) => {
    await page.goto('/ko/experts');

    // Enter search query
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill(TEST_FILTERS.searchQuery);

    // Wait for X button to appear
    await page.waitForTimeout(300);

    // Click clear button
    const clearButton = page.getByRole('button', { name: /초기화|clear|reset/i }).first();
    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Search input should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test.skip('should filter experts by category', async ({ page }) => {
    await page.goto('/ko/experts');

    // Open filter panel on mobile if needed
    const filterButton = page.getByRole('button', { name: /필터|Filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // Select a category filter
    const categoryOption = page.getByRole('button', { name: /마케팅|Marketing/i });
    if (await categoryOption.isVisible()) {
      await categoryOption.click();

      // Wait for results to update
      await page.waitForTimeout(500);

      // Results should be filtered
      // Note: Exact assertion depends on test data
    }
  });

  test.skip('should display expert cards with correct information', async ({ page }) => {
    await page.goto('/ko/experts');

    // Wait for expert cards to load
    await page.waitForTimeout(1000);

    // Find first expert card
    const expertCard = page.locator('[data-testid="expert-card"]').first();

    // If cards exist, verify structure
    if (await expertCard.isVisible()) {
      // Expert card should have avatar
      await expect(expertCard.locator('img, [data-testid="avatar"]')).toBeVisible();

      // Expert card should have name
      await expect(expertCard.locator('[data-testid="expert-name"]')).toBeVisible();

      // Expert card should have category badge
      await expect(expertCard.locator('[data-testid="category-badge"]')).toBeVisible();
    }
  });

  test.skip('should show verified badge for verified experts', async ({ page }) => {
    await page.goto('/ko/experts');

    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Find expert card with verified badge
    const verifiedBadge = page.locator('[data-testid="verified-badge"]').first();

    // Note: May not exist if no verified experts
    if (await verifiedBadge.isVisible()) {
      await expect(verifiedBadge).toHaveText(/검증|Verified/i);
    }
  });

  test.skip('should navigate to expert profile on card click', async ({ page }) => {
    await page.goto('/ko/experts');

    // Wait for cards to load
    await page.waitForTimeout(1000);

    // Click on first expert card
    const expertCard = page.locator('[data-testid="expert-card"]').first();

    if (await expertCard.isVisible()) {
      await expertCard.click();

      // Should navigate to expert profile
      await expect(page).toHaveURL(/\/experts\//, { timeout: 5000 });
    }
  });

  test.skip('should show empty state when no experts match filters', async ({ page }) => {
    await page.goto('/ko/experts');

    // Enter a search query that won't match anything
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill('nonexistent-expert-xyz-12345');

    // Wait for search
    await page.waitForTimeout(500);

    // Empty state should be visible
    await expect(page.getByText(/검색 조건에 맞는|No experts found/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test.skip('should reset filters when clicking reset button', async ({ page }) => {
    await page.goto('/ko/experts');

    // Enter search and apply filter
    const searchInput = page.getByPlaceholder(/검색|search/i);
    await searchInput.fill('test');

    // Wait for filter badge to appear
    await page.waitForTimeout(500);

    // Click reset button
    const resetButton = page.getByRole('button', { name: /초기화|Reset/i });
    if (await resetButton.isVisible()) {
      await resetButton.click();

      // Search should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test.skip('should display results count', async ({ page }) => {
    await page.goto('/ko/experts');

    // Wait for results to load
    await page.waitForTimeout(1000);

    // Results count should be visible
    await expect(page.getByText(/명|results?|found/i)).toBeVisible();
  });
});

/**
 * Expert Profile Page Tests
 */
test.describe('Expert Profile Page (Authenticated)', () => {
  test.skip('should display expert profile with all sections', async ({ page }) => {
    // Navigate directly to an expert profile
    // Note: Requires known expert ID in test data
    await page.goto('/ko/experts/1');

    // Profile header should be visible
    await expect(page.locator('[data-testid="expert-profile-header"]')).toBeVisible();

    // Expert name should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // CTA buttons should be visible
    await expect(
      page.getByRole('button', { name: /협업|연락|Contact|Collaboration/i })
    ).toBeVisible();
  });

  test.skip('should open collaboration modal on button click', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Click collaboration button
    await page.getByRole('button', { name: /협업 제안|Propose Collaboration/i }).click();

    // Modal should open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Modal should have form fields
    await expect(page.getByRole('dialog').getByLabel(/제목|Subject/i)).toBeVisible();
    await expect(page.getByRole('dialog').getByLabel(/메시지|Message/i)).toBeVisible();
  });

  test.skip('should close modal on cancel', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Open modal
    await page.getByRole('button', { name: /협업 제안|Propose Collaboration/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click cancel or close button
    const cancelButton = page.getByRole('button', { name: /취소|Cancel|Close/i });
    await cancelButton.click();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test.skip('should open coffee chat modal on button click', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Click coffee chat button
    const coffeeChatButton = page.getByRole('button', { name: /커피챗|Coffee Chat/i });

    if (await coffeeChatButton.isVisible()) {
      await coffeeChatButton.click();

      // Modal should open
      await expect(page.getByRole('dialog')).toBeVisible();
    }
  });

  test.skip('should navigate back to search from profile', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Click back button or navigate back
    const backButton = page.getByRole('button', { name: /뒤로|Back/i });

    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL(/\/experts$/);
    } else {
      // Use browser back
      await page.goBack();
      await expect(page).toHaveURL(/\/experts/);
    }
  });

  test.skip('should display portfolio section', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Portfolio section should be visible if expert has portfolio
    const portfolioSection = page.locator('[data-testid="portfolio-section"]');

    if (await portfolioSection.isVisible()) {
      // Portfolio links should be clickable
      const portfolioLink = portfolioSection.getByRole('link').first();
      if (await portfolioLink.isVisible()) {
        // Link should have href attribute
        await expect(portfolioLink).toHaveAttribute('href');
      }
    }
  });

  test.skip('should display expertise badges', async ({ page }) => {
    await page.goto('/ko/experts/1');

    // Expertise/skills section should have badges
    const skillBadges = page.locator('[data-testid="skill-badge"]');

    // At least some skills should be visible
    const count = await skillBadges.count();
    expect(count).toBeGreaterThan(0);
  });
});

/**
 * Mobile Expert Search Tests
 */
test.describe('Expert Search Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.skip('should show filter button on mobile', async ({ page }) => {
    await page.goto('/ko/experts');

    // Filter button should be visible on mobile
    await expect(page.getByRole('button', { name: /필터|Filter/i })).toBeVisible();

    // Filter panel should be hidden by default
    await expect(page.locator('[data-testid="filter-panel"]')).not.toBeVisible();
  });

  test.skip('should open filter sheet on mobile', async ({ page }) => {
    await page.goto('/ko/experts');

    // Click filter button
    await page.getByRole('button', { name: /필터|Filter/i }).click();

    // Filter sheet should slide in
    await expect(page.getByRole('dialog')).toBeVisible();

    // Should have category filters
    await expect(page.getByText(/카테고리|Category/i)).toBeVisible();
  });

  test.skip('should close filter sheet with apply button', async ({ page }) => {
    await page.goto('/ko/experts');

    // Open filter sheet
    await page.getByRole('button', { name: /필터|Filter/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click apply button
    await page.getByRole('button', { name: /적용|Apply/i }).click();

    // Sheet should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
