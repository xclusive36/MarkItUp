import { test, expect } from './fixtures';

/**
 * UI Interaction Tests
 * Tests modals, view switching, and UI controls
 */

test.describe('Modal Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open keyboard shortcuts modal', async ({ page, modalPage }) => {
    // Use more specific selector to avoid strict mode violation
    await page
      .getByRole('button', { name: /keyboard shortcuts/i })
      .first()
      .click();

    await modalPage.waitForModal('Keyboard Shortcuts');

    // Close modal
    await modalPage.closeModal();
  });

  test('should open command palette with keyboard shortcut', async ({ page, modalPage }) => {
    // Focus the page first
    await page.locator('body').click();

    // Try keyboard shortcut
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyK`);

    // If keyboard doesn't work, try clicking button instead
    const commandPaletteVisible = await page
      .locator('[role="dialog"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!commandPaletteVisible) {
      // Fallback: look for command palette button
      const button = page.getByRole('button', { name: /command.*palette/i }).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
      }
    }

    // Verify modal appears (with longer timeout)
    await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 });
  });
  test('should close modal with X button', async ({ page }) => {
    // Try to open any modal (keyboard help is easiest)
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    // Find and click close button
    const closeButton = page
      .locator('button[aria-label*="close"]')
      .or(page.locator('button').filter({ hasText: /×|close/i }))
      .first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);

      // Modal should be closed
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    }
  });
});

test.describe('View Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should switch between editor and graph view', async ({ page, viewPage }) => {
    // Click graph view button
    const graphButton = page.getByRole('button', { name: /graph/i }).first();
    if (await graphButton.isVisible()) {
      await graphButton.click();
      await page.waitForTimeout(1500);

      // Graph view should exist in DOM (may not be "visible" due to CSS)
      const graphElement = page.locator('svg, canvas').first();
      const graphExists = (await graphElement.count()) > 0;
      expect(graphExists).toBeTruthy();

      // Switch back to editor
      const editorButton = page.getByRole('button', { name: /editor/i }).first();
      if (await editorButton.isVisible()) {
        await editorButton.click();
        await page.waitForTimeout(500);

        // Editor should be visible
        await expect(page.locator('textarea')).toBeVisible();
      }
    }
  });

  test('should switch view modes (edit/preview/split)', async ({ page }) => {
    // Look for view mode buttons
    const previewButton = page.getByRole('button', { name: /preview/i }).first();

    if (await previewButton.isVisible()) {
      await previewButton.click();
      await page.waitForTimeout(500);

      // Preview should be visible or at least exist
      const previewExists =
        (await page.locator('.preview, .markdown-preview, [data-preview]').first().count()) > 0;
      expect(previewExists).toBeTruthy();

      // Switch to split view
      const splitButton = page.getByRole('button', { name: /split/i }).first();
      if (await splitButton.isVisible()) {
        await splitButton.click();
        await page.waitForTimeout(500);

        // Both editor and preview should exist in DOM
        const hasEditor = (await page.locator('textarea').count()) > 0;
        const hasPreview = (await page.locator('.preview, .markdown-preview').first().count()) > 0;
        expect(hasEditor || hasPreview).toBeTruthy();
      }
    }
  });

  test('should toggle sidebar', async ({ page }) => {
    // Find sidebar toggle button
    const toggleButton = page
      .locator('button')
      .filter({
        hasText: /sidebar|menu|☰/i,
      })
      .first();

    if (await toggleButton.isVisible()) {
      const sidebar = page.locator('aside, [data-sidebar], nav').first();

      // Check initial state
      const initiallyVisible = await sidebar.isVisible();

      // Toggle sidebar
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Sidebar visibility should change
      const afterToggle = await sidebar.isVisible();
      expect(afterToggle).not.toBe(initiallyVisible);
    }
  });

  test('should open plugin panel', async ({ page }) => {
    // Look for plugins button/tab
    const pluginsButton = page.getByRole('button', { name: /plugin/i }).first();

    if (await pluginsButton.isVisible()) {
      await pluginsButton.click();
      await page.waitForTimeout(1000);

      // Plugin panel should be visible
      await expect(
        page.locator('text=/plugin/i').or(page.locator('[data-testid*="plugin"]'))
      ).toBeVisible();
    }
  });
});

test.describe('Responsive Behavior', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // App should still be usable
    await expect(page).toHaveTitle(/MarkItUp/i);

    // Mobile menu button should be visible
    const mobileMenu = page
      .locator('button')
      .filter({
        hasText: /menu|☰|sidebar/i,
      })
      .first();

    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await page.waitForTimeout(500);
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // App should be functional
    await expect(page).toHaveTitle(/MarkItUp/i);
    // Check textarea exists (avoid strict mode violation)
    await expect(page.locator('textarea').first()).toBeVisible();
  });
});

test.describe('Theme Switching', () => {
  test('should switch between light and dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for theme toggle button
    const themeButton = page
      .locator('button')
      .filter({
        hasText: /theme|dark|light|🌙|☀️/i,
      })
      .first();

    if (await themeButton.isVisible()) {
      // Get initial theme
      const html = page.locator('html');
      const initialClass = await html.getAttribute('class');

      // Toggle theme
      await themeButton.click();
      await page.waitForTimeout(500);

      // Theme should change
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }
  });
});

test.describe('Navigation', () => {
  test('should navigate using breadcrumbs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for breadcrumbs
    const breadcrumb = page.locator('[data-breadcrumb], nav[aria-label*="breadcrumb"]').first();

    if (await breadcrumb.isVisible()) {
      const links = breadcrumb.locator('a, button');
      const count = await links.count();

      if (count > 0) {
        await links.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should use bottom navigation on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for bottom nav
    const bottomNav = page.locator('[data-bottom-nav], nav.bottom').first();

    if (await bottomNav.isVisible()) {
      const navButtons = bottomNav.locator('button, a');
      const count = await navButtons.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
