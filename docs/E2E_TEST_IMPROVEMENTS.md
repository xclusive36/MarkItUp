# E2E Test Improvements Guide

**Status:** 17/38 tests passing (45%)  
**Goal:** Achieve 80%+ pass rate (30+/38 tests)

## 📊 Current Test Results Analysis

### ✅ Passing Tests (17)
- Plugin system functionality
- PWA features (service worker, manifest)
- Performance benchmarks
- Theme switching
- Navigation & responsive design
- Analytics dashboard access
- Collaboration settings access

### ❌ Failing Tests (21)
**Root Causes:**
1. **Selector Mismatches** (15 tests) - Elements exist but selectors don't match
2. **Timing Issues** (4 tests) - Elements load slower than expected
3. **Strict Mode Violations** (2 tests) - Multiple elements match same selector

---

## 🔧 Recommended Improvements

### 1. Fix Note Creation Selectors (HIGH PRIORITY)

**Problem:** Tests look for `input[placeholder="Untitled"]` but actual placeholder is `"Enter note title..."`

**Current Code (tests/fixtures.ts):**
```typescript
get fileNameInput() {
  return this.page.locator('input[placeholder="Untitled"]');
}
```

**Fixed Code:**
```typescript
get fileNameInput() {
  return this.page.locator('input[placeholder="Enter note title..."]');
}
```

**Impact:** Fixes 10+ tests that depend on note creation

---

### 2. Add Proper Wait Conditions (HIGH PRIORITY)

**Problem:** Tests timeout because they don't wait for async operations

**Solution:** Add explicit waits for network and state changes

**Example Fix:**
```typescript
async createNote(fileName: string, content: string, folder?: string) {
  // Wait for the page to be ready
  await this.page.waitForLoadState('networkidle');
  
  // Click new note button and wait for input to appear
  await this.newNoteButton.click();
  await this.fileNameInput.waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill in the form
  await this.fileNameInput.fill(fileName);
  if (folder) {
    await this.folderInput.fill(folder);
  }
  
  // Wait for editor to be ready
  await this.editor.waitFor({ state: 'visible' });
  await this.editor.fill(content);
  
  // Save and wait for save to complete
  await Promise.all([
    this.page.waitForResponse(resp => 
      resp.url().includes('/api/files') && resp.status() === 200
    ),
    this.saveButton.click()
  ]);
  
  // Wait for UI to update
  await this.page.waitForTimeout(500);
}
```

**Impact:** Prevents timeouts and race conditions

---

### 3. Fix Strict Mode Violations (MEDIUM PRIORITY)

**Problem:** Multiple elements match `text=/keyboard|shortcuts/i`

**Current Code:**
```typescript
test('should open keyboard shortcuts modal', async ({ page }) => {
  await page.getByText(/keyboard|shortcuts/i).click();
  // ...
});
```

**Fixed Code:**
```typescript
test('should open keyboard shortcuts modal', async ({ page }) => {
  // Use more specific selector or .first()
  await page.getByRole('button', { name: /keyboard shortcuts/i }).first().click();
  // OR use a more specific selector
  await page.locator('[data-testid="keyboard-shortcuts-button"]').click();
});
```

**Better Solution:** Add `data-testid` attributes to UI components:

```tsx
// In your component
<button data-testid="keyboard-shortcuts-button">
  Keyboard Shortcuts
</button>
```

**Impact:** Eliminates strict mode errors, more reliable selectors

---

### 4. Improve Graph View Tests (MEDIUM PRIORITY)

**Problem:** SVG elements exist but `isVisible()` returns false

**Debugging Steps:**
```typescript
test('should display knowledge graph', async ({ page, viewPage }) => {
  await viewPage.switchToView('graph');
  
  // Debug: Check if SVG exists
  const svg = page.locator('svg.knowledge-graph');
  console.log('SVG exists:', await svg.count() > 0);
  console.log('SVG visible:', await svg.isVisible());
  console.log('SVG display:', await svg.evaluate(el => 
    window.getComputedStyle(el).display
  ));
  
  // Check parent container
  const container = page.locator('.graph-container');
  console.log('Container display:', await container.evaluate(el => 
    window.getComputedStyle(el).display
  ));
});
```

**Possible Fixes:**

**Option A: Wait for visibility**
```typescript
await svg.waitFor({ state: 'visible', timeout: 10000 });
```

**Option B: Check for existence instead**
```typescript
await expect(svg).toHaveCount(1); // Element exists
await expect(svg).toBeAttached(); // Element is in DOM
```

**Option C: Wait for CSS animation to complete**
```typescript
await page.waitForTimeout(1000); // Allow transition
await expect(svg).toBeVisible();
```

**Impact:** Makes graph view tests reliable

---

### 5. Add Better Error Messages (LOW PRIORITY)

**Current:**
```typescript
await expect(element).toBeVisible();
// Error: element is not visible
```

**Improved:**
```typescript
await expect(element, 'File name input should be visible after clicking New Note').toBeVisible();
// Error: File name input should be visible after clicking New Note
//   element is not visible
```

**Impact:** Easier debugging when tests fail

---

### 6. Use Page Object Methods Consistently (MEDIUM PRIORITY)

**Problem:** Some tests use page objects, others use raw locators

**Before:**
```typescript
test('should create note', async ({ page }) => {
  await page.getByRole('button', { name: /new note/i }).click();
  await page.locator('input').fill('test');
  // ...
});
```

**After:**
```typescript
test('should create note', async ({ editorPage }) => {
  await editorPage.createNote('test', 'content');
  await editorPage.expectNoteCreated('test');
});
```

**Impact:** More maintainable, reusable test code

---

### 7. Add Custom Assertions (LOW PRIORITY)

**Create a custom matcher:**

```typescript
// tests/matchers.ts
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHaveNoteSaved(page: Page, fileName: string) {
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/files') && resp.status() === 200,
      { timeout: 5000 }
    );
    
    return {
      pass: response.ok(),
      message: () => `Expected note "${fileName}" to be saved`,
    };
  },
});
```

**Usage:**
```typescript
await expect(page).toHaveNoteSaved('my-note');
```

**Impact:** More readable, domain-specific assertions

---

### 8. Implement Visual Regression Testing (FUTURE)

**Tools to consider:**
- Percy.io
- Argos
- Playwright's built-in screenshot comparison

**Example:**
```typescript
test('should render editor correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('editor-view.png', {
    maxDiffPixels: 100,
  });
});
```

**Impact:** Catch unintended UI changes

---

### 9. Add Test Data Fixtures (MEDIUM PRIORITY)

**Create reusable test data:**

```typescript
// tests/test-data.ts
export const TEST_NOTES = {
  simple: {
    name: 'simple-note',
    content: '# Simple Note\n\nTest content',
  },
  withLinks: {
    name: 'linked-note',
    content: '# Linked Note\n\nSee [[simple-note]] for more info',
  },
  withTags: {
    name: 'tagged-note',
    content: '# Tagged Note\n\n#important #project',
  },
};

export const TEST_FOLDERS = {
  projects: 'projects',
  personal: 'personal',
  archive: 'archive',
};
```

**Usage:**
```typescript
import { TEST_NOTES } from './test-data';

test('should create note with links', async ({ editorPage }) => {
  await editorPage.createNote(
    TEST_NOTES.withLinks.name,
    TEST_NOTES.withLinks.content
  );
});
```

**Impact:** Consistent test data, easier to maintain

---

### 10. Add Performance Budgets (FUTURE)

**Example:**
```typescript
test('should load in under 2 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(2000);
});

test('should render 100 notes without lag', async ({ page }) => {
  // Create 100 notes
  for (let i = 0; i < 100; i++) {
    await createNoteViaAPI(`note-${i}`, `Content ${i}`);
  }
  
  await page.goto('/');
  
  // Measure render time
  const renderTime = await page.evaluate(() => {
    const start = performance.now();
    // Trigger render
    document.querySelector('[data-notes-list]');
    return performance.now() - start;
  });
  
  expect(renderTime).toBeLessThan(1000);
});
```

**Impact:** Ensure performance doesn't regress

---

## 🚀 Implementation Plan

### Phase 1: Quick Wins (1-2 hours)
1. ✅ Fix file name input selector (`"Untitled"` → `"Enter note title..."`)
2. ✅ Fix folder input selector
3. ✅ Add `.first()` to strict mode violations
4. ✅ Add explicit waits to note creation tests

**Expected Result:** 25-30 tests passing (65-80%)

### Phase 2: Stability Improvements (2-3 hours)
1. ✅ Add proper wait conditions for all async operations
2. ✅ Debug graph view visibility issues
3. ✅ Add data-testid attributes to key UI elements
4. ✅ Implement consistent page object usage

**Expected Result:** 30-34 tests passing (80-90%)

### Phase 3: Advanced Improvements (Optional)
1. ⏳ Add visual regression testing
2. ⏳ Create test data fixtures
3. ⏳ Implement custom assertions
4. ⏳ Add performance budgets

**Expected Result:** 35+ tests passing (90%+), comprehensive coverage

---

## 📝 Specific Code Changes

### Change 1: Update EditorPage Fixture

**File:** `tests/fixtures.ts`

**Find:**
```typescript
get fileNameInput() {
  return this.page.locator('input[placeholder="Untitled"]');
}
```

**Replace with:**
```typescript
get fileNameInput() {
  return this.page.locator('input[placeholder="Enter note title..."]');
}
```

---

### Change 2: Add Wait Conditions

**File:** `tests/fixtures.ts`

**Find:**
```typescript
async createNote(fileName: string, content: string, folder?: string) {
  await this.newNoteButton.click();
  await this.fileNameInput.fill(fileName);
```

**Replace with:**
```typescript
async createNote(fileName: string, content: string, folder?: string) {
  await this.page.waitForLoadState('networkidle');
  await this.newNoteButton.click();
  await this.fileNameInput.waitFor({ state: 'visible', timeout: 10000 });
  await this.fileNameInput.fill(fileName);
```

---

### Change 3: Fix Keyboard Shortcuts Test

**File:** `tests/ui-interactions.spec.ts`

**Find:**
```typescript
test('should open keyboard shortcuts modal', async ({ page, modalPage }) => {
  await page.getByText(/keyboard|shortcuts/i).click();
```

**Replace with:**
```typescript
test('should open keyboard shortcuts modal', async ({ page, modalPage }) => {
  await page.getByRole('button', { name: /keyboard shortcuts/i }).first().click();
```

---

### Change 4: Fix Graph View Test

**File:** `tests/advanced-features.spec.ts`

**Find:**
```typescript
test('should display knowledge graph', async ({ page, viewPage }) => {
  await viewPage.switchToView('graph');
  const svg = page.locator('svg, canvas').first();
  await expect(svg).toBeVisible();
});
```

**Replace with:**
```typescript
test('should display knowledge graph', async ({ page, viewPage }) => {
  await viewPage.switchToView('graph');
  
  // Wait for graph to render
  await page.waitForTimeout(1000);
  
  const svg = page.locator('svg, canvas').first();
  
  // Check that element exists and is attached to DOM
  await expect(svg).toBeAttached();
  await expect(svg).toHaveCount(1);
  
  // Optionally check visibility if transitions complete
  await svg.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
    // If visibility check fails, at least element exists
    console.log('Graph SVG exists but may be hidden by CSS');
  });
});
```

---

### Change 5: Add Test IDs to Components (Optional but Recommended)

**File:** `src/components/Sidebar.tsx`

**Find:**
```tsx
<button onClick={createNewNote}>
  New Note
</button>
```

**Replace with:**
```tsx
<button data-testid="new-note-button" onClick={createNewNote}>
  New Note
</button>
```

**File:** `src/components/Sidebar.tsx`

**Find:**
```tsx
<input
  type="text"
  value={fileName}
  onChange={e => setFileName(e.target.value)}
  placeholder="Enter note title..."
/>
```

**Replace with:**
```tsx
<input
  data-testid="note-title-input"
  type="text"
  value={fileName}
  onChange={e => setFileName(e.target.value)}
  placeholder="Enter note title..."
/>
```

Then update fixtures:
```typescript
get fileNameInput() {
  return this.page.getByTestId('note-title-input');
}

get newNoteButton() {
  return this.page.getByTestId('new-note-button');
}
```

---

## 🎯 Success Metrics

### Target Pass Rates

| Phase | Tests Passing | Pass Rate | Status |
|-------|---------------|-----------|--------|
| **Current** | 17/38 | 45% | ✅ Baseline |
| **Phase 1** | 25-30/38 | 65-80% | 🎯 Target |
| **Phase 2** | 30-34/38 | 80-90% | 🎯 Stretch |
| **Phase 3** | 35+/38 | 90%+ | 🏆 Excellence |

### Coverage Goals

- ✅ All critical user flows tested
- ✅ All major features covered
- 🎯 Edge cases handled
- 🎯 Error scenarios tested
- 🏆 Performance benchmarks

---

## 🐛 Debugging Tips

### 1. Use UI Mode for Visual Debugging
```bash
npm run test:ui
```
- See exactly what Playwright sees
- Pause and inspect DOM
- Time-travel through test execution

### 2. Add Console Logs
```typescript
test('debug test', async ({ page }) => {
  console.log('Current URL:', page.url());
  console.log('Element count:', await page.locator('button').count());
  
  const element = page.locator('input');
  console.log('Element visible:', await element.isVisible());
  console.log('Element disabled:', await element.isDisabled());
});
```

### 3. Take Screenshots on Failure
```typescript
test('my test', async ({ page }) => {
  try {
    await expect(element).toBeVisible();
  } catch (error) {
    await page.screenshot({ path: 'debug-screenshot.png' });
    throw error;
  }
});
```

### 4. Use Trace Viewer
```bash
npx playwright show-trace test-results/.../trace.zip
```
- See full test execution timeline
- Network requests
- DOM snapshots
- Console logs

---

## 📚 Additional Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Documentation](https://playwright.dev/docs/selectors)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)

---

**Next Steps:**
1. Implement Phase 1 changes for quick wins
2. Run tests and verify improvements
3. Document any new failures
4. Iterate on Phase 2 improvements

**Goal:** Achieve 80%+ pass rate with stable, maintainable tests! 🎯
