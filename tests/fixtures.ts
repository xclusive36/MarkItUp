/* eslint-disable react-hooks/rules-of-hooks */
/**
 * Playwright test fixtures and page objects
 * Note: Disabling react-hooks/rules-of-hooks because these are Playwright
 * fixtures, not React hooks. The `use` parameter is a Playwright pattern.
 */

import { test as base, expect, Page } from '@playwright/test';

/**
 * Custom fixtures for MarkItUp E2E tests
 * Provides reusable utilities and page objects
 */

// Page Object Models
export class EditorPage {
  constructor(private page: Page) {}

  // Locators
  get editor() {
    return this.page.locator('textarea[placeholder*="Start writing"]');
  }

  get fileNameInput() {
    return this.page.locator('input[placeholder="Enter note title..."]').first();
  }

  get folderInput() {
    return this.page.locator('input[placeholder="Enter folder path (optional)..."]').first();
  }

  get saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  get createNoteButton() {
    return this.page.getByRole('button', { name: /new note/i }).first();
  }

  // Actions
  async createNote(fileName: string, content: string, folder?: string) {
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');

    // Click new note button
    await this.createNoteButton.click();

    // Wait for input to appear and be ready
    await this.fileNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(300); // Brief pause for input to be interactive

    // Clear and fill filename
    await this.fileNameInput.clear();
    await this.fileNameInput.fill(fileName);

    if (folder) {
      await this.folderInput.waitFor({ state: 'visible', timeout: 5000 });
      await this.folderInput.clear();
      await this.folderInput.fill(folder);
    }

    // Wait for editor to be visible
    await this.editor.waitFor({ state: 'visible', timeout: 10000 });
    await this.editor.clear();
    await this.editor.fill(content);

    // Save the note
    await this.saveButton.click();

    // Wait for save to complete
    await this.page.waitForTimeout(1000);
  }

  async editNote(content: string) {
    await this.editor.fill(content);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

export class SidebarPage {
  constructor(private page: Page) {}

  get sidebar() {
    return this.page.locator('[data-testid="sidebar"]').or(this.page.locator('aside').first());
  }

  async clickNote(noteName: string) {
    await this.page.getByText(noteName, { exact: false }).click();
  }

  async deleteNote(noteName: string) {
    const noteElement = this.page.getByText(noteName, { exact: false });
    await noteElement.hover();
    await noteElement
      .locator('..')
      .getByRole('button', { name: /delete/i })
      .click();

    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm|delete/i }).last();
    await confirmButton.click();
  }

  async searchNotes(query: string) {
    const searchInput = this.page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(query);
  }
}

export class ModalPage {
  constructor(private page: Page) {}

  async openModal(modalName: string) {
    // Try various ways to open modals
    const button = this.page.getByRole('button', { name: new RegExp(modalName, 'i') });
    await button.click();
  }

  async closeModal() {
    // Try close button
    const closeButton = this.page
      .locator('button[aria-label*="close"]')
      .or(this.page.locator('button').filter({ hasText: /×|close/i }))
      .first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try escape key
      await this.page.keyboard.press('Escape');
    }
  }

  async waitForModal(modalTitle?: string) {
    if (modalTitle) {
      await this.page.waitForSelector(`text=/${modalTitle}/i`);
    } else {
      await this.page.waitForSelector('[role="dialog"]');
    }
  }
}

export class ViewPage {
  constructor(private page: Page) {}

  async switchView(view: 'editor' | 'graph' | 'search' | 'analytics' | 'plugins') {
    // Try multiple methods to switch views

    // Method 1: Look for button with view name
    const viewButton = this.page.getByRole('button', { name: new RegExp(view, 'i') }).first();
    const buttonVisible = await viewButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (buttonVisible) {
      await viewButton.click();
      await this.page.waitForTimeout(1000); // Wait for view transition
      return;
    }

    // Method 2: Look for nav link
    const navLink = this.page
      .locator(`a, button`)
      .filter({ hasText: new RegExp(view, 'i') })
      .first();
    const linkVisible = await navLink.isVisible({ timeout: 2000 }).catch(() => false);

    if (linkVisible) {
      await navLink.click();
      await this.page.waitForTimeout(1000);
      return;
    }

    console.log(`Could not find ${view} view button/link`);
  }

  async switchViewMode(mode: 'edit' | 'preview' | 'split') {
    const modeButton = this.page.getByRole('button', { name: new RegExp(mode, 'i') });
    await modeButton.click();
  }

  async toggleSidebar() {
    const toggleButton = this.page
      .locator('button[aria-label*="sidebar"]')
      .or(this.page.getByRole('button', { name: /toggle.*sidebar/i }))
      .first();
    await toggleButton.click();
  }
}

// Test fixtures
type MarkItUpFixtures = {
  editorPage: EditorPage;
  sidebarPage: SidebarPage;
  modalPage: ModalPage;
  viewPage: ViewPage;
};

export const test = base.extend<MarkItUpFixtures>({
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  sidebarPage: async ({ page }, use) => {
    await use(new SidebarPage(page));
  },
  modalPage: async ({ page }, use) => {
    await use(new ModalPage(page));
  },
  viewPage: async ({ page }, use) => {
    await use(new ViewPage(page));
  },
});

export { expect };
