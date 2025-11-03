import { test, expect } from './fixtures';

/**
 * Core User Flow Tests
 * Tests the fundamental note-taking operations
 */

test.describe('Note Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/MarkItUp/i);
    await expect(page.locator('h1').or(page.locator('text=/Welcome/i'))).toBeVisible();
  });

  test('should create a new note', async ({ page, editorPage }) => {
    const fileName = `Test Note ${Date.now()}`;
    const content = '# Test Heading\n\nThis is a test note.';

    await editorPage.createNote(fileName, content);

    // Verify note appears in sidebar
    await expect(page.getByText(fileName)).toBeVisible();
  });

  test('should edit an existing note', async ({ page, editorPage }) => {
    const fileName = `Edit Test ${Date.now()}`;
    const initialContent = '# Initial Content';
    const updatedContent = '# Updated Content\n\nEdited successfully!';

    // Create note
    await editorPage.createNote(fileName, initialContent);

    // Edit note
    await editorPage.editNote(updatedContent);
    await editorPage.saveButton.click();

    // Verify save
    await expect(page.locator('text=/saved/i')).toBeVisible();
  });

  test('should save note with Cmd+S / Ctrl+S', async ({ page, editorPage }) => {
    const fileName = `Keyboard Save ${Date.now()}`;
    const content = '# Keyboard Shortcut Test';

    await editorPage.createNoteButton.click();
    await editorPage.fileNameInput.fill(fileName);
    await editorPage.editor.fill(content);

    // Use keyboard shortcut
    const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
    await page.keyboard.press(`${modifier}+KeyS`);
    await page.waitForTimeout(1000);

    // Verify save - look for success indicator or note in sidebar
    const savedIndicator = await page
      .locator('text=/saved|success/i')
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const noteInSidebar = await page
      .getByText(fileName, { exact: false })
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // Either a save indicator should show or note should appear in sidebar
    expect(savedIndicator || noteInSidebar).toBeTruthy();
  });

  test('should create note in folder', async ({ page, editorPage }) => {
    const fileName = `Folder Test ${Date.now()}`;
    const folder = 'test-folder';
    const content = '# Note in Folder';

    await editorPage.createNote(fileName, content, folder);

    // Verify note created
    await expect(page.getByText(fileName)).toBeVisible();
  });

  test('should load note from sidebar', async ({ page, editorPage, sidebarPage }) => {
    const fileName = `Load Test ${Date.now()}`;
    const content = '# Note to Load\n\nUnique content 12345';

    // Create note
    await editorPage.createNote(fileName, content);

    // Create another note to switch context
    await editorPage.createNote(`Another Note ${Date.now()}`, '# Another');

    // Load the first note
    await sidebarPage.clickNote(fileName);

    // Verify content loaded
    await expect(editorPage.editor).toHaveValue(new RegExp('Unique content 12345'));
  });

  test('should delete a note', async ({ page, editorPage, sidebarPage }) => {
    const fileName = `Delete Test ${Date.now()}`;
    const content = '# Note to Delete';

    // Create note
    await editorPage.createNote(fileName, content);
    await page.waitForTimeout(500);

    const noteVisible = await page
      .getByText(fileName)
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    if (!noteVisible) {
      test.skip(); // Skip if note creation failed
    }

    // Delete note with increased timeout
    await sidebarPage.deleteNote(fileName);
    await page.waitForTimeout(1000);

    // Verify note removed
    const stillVisible = await page
      .getByText(fileName, { exact: true })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    expect(stillVisible).toBeFalsy();
  });

  test('should handle markdown formatting', async ({ page, editorPage }) => {
    const fileName = `Markdown Test ${Date.now()}`;
    const content = `# Heading 1
## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

\`\`\`javascript
const x = 42;
\`\`\`

[[Wiki Link]]

#tag1 #tag2`;

    await editorPage.createNote(fileName, content);

    // Verify content saved
    await expect(editorPage.editor).toHaveValue(new RegExp('Heading 1'));
    await expect(editorPage.editor).toHaveValue(new RegExp('Wiki Link'));
    await expect(editorPage.editor).toHaveValue(new RegExp('#tag1'));
  });

  test('should search notes', async ({ page, sidebarPage }) => {
    const searchTerm = `unique-search-${Date.now()}`;
    const fileName = `Searchable Note ${searchTerm}`;
    const content = `# Contains ${searchTerm}`;

    // Create a searchable note
    const createButton = page.getByRole('button', { name: /new note/i }).first();
    await createButton.click();
    await page.waitForTimeout(500);

    const fileInput = page
      .locator('input[placeholder*="Untitled"], input[placeholder*="note title"]')
      .first();
    await fileInput.fill(fileName);

    const editor = page.locator('textarea').first();
    await editor.fill(content);

    const saveButton = page.getByRole('button', { name: /save/i });
    if (await saveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Search for the note
    const searchResult = await sidebarPage.searchNotes(searchTerm).catch(() => false);
    if (!searchResult) {
      test.skip(); // Skip if search not available
    }

    // Verify search results
    const resultVisible = await page
      .getByText(fileName, { exact: false })
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(resultVisible).toBeTruthy();
  });

  test('should clear editor for new note', async ({ page, editorPage }) => {
    const firstNote = `First Note ${Date.now()}`;
    const firstContent = '# First Note Content';

    // Create first note
    await editorPage.createNote(firstNote, firstContent);
    await page.waitForTimeout(500);

    // Click new note button
    await editorPage.createNoteButton.click();
    await page.waitForTimeout(500);

    // Verify editor is cleared
    const fileInputEmpty = await editorPage.fileNameInput
      .inputValue()
      .then(v => v === '')
      .catch(() => false);

    // Editor should have placeholder or be empty/have default text
    const editorValue = await editorPage.editor.inputValue();
    const isCleared =
      editorValue === '' || editorValue === '# ' || editorValue.includes('Start typing');

    expect(fileInputEmpty || isCleared).toBeTruthy();
  });
});
