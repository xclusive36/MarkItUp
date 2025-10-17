# TOC Plugin Update Fix

## Issue
When using the Table of Contents plugin commands (Insert TOC, Update TOC, Remove TOC), the commands would execute without errors but **no changes would appear** in the markdown file.

## Root Cause
The `PluginAPI.notes.update()` method was incomplete:
- ✅ Updated the note in PKM system (in-memory)
- ❌ Did NOT persist changes to the filesystem
- ❌ Did NOT update the UI to show changes

### Before (Broken):
```typescript
update: (id, updates) => this.pkmSystem.updateNote(id, updates),
```

This only updated the in-memory note, so changes were lost on page refresh and never visible to the user.

## Fix Applied
Updated the `update()` method in `src/lib/plugin-manager.ts` to:

1. **Update PKM system** (in-memory)
2. **Persist to filesystem** via PUT request to `/api/files/[filename]`
3. **Update UI** if the modified note is currently active:
   - Update markdown content
   - Update filename if changed
   - Update folder if changed
4. **Refresh notes list** to show changes in sidebar

### After (Fixed):
```typescript
update: async (id, updates) => {
  // Get the current note
  const note = this.pkmSystem.getNote(id);
  if (!note) return null;

  // Update in PKM system first
  const updatedNote = await this.pkmSystem.updateNote(id, updates);
  if (!updatedNote) return null;

  // If content was updated, persist to filesystem
  if (updates.content !== undefined) {
    const fullPath = updatedNote.folder
      ? `${updatedNote.folder}/${updatedNote.name}`
      : updatedNote.name;

    const response = await fetch(`/api/files/${encodeURIComponent(fullPath)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: updatedNote.content,
        overwrite: true,
      }),
    });

    // Update UI if this is the active note
    const activeNoteId = this.pkmSystem.viewState.activeNoteId;
    if (activeNoteId === id && this.uiCallbacks) {
      this.uiCallbacks.setMarkdown(updatedNote.content);
      // ... update filename and folder
    }

    // Refresh notes list
    if (this.uiCallbacks?.refreshNotes) {
      await this.uiCallbacks.refreshNotes();
    }
  }

  return updatedNote;
}
```

## What Now Works

✅ **Insert Table of Contents** (`Ctrl+Shift+O`)
- Generates TOC from document headings
- Inserts at appropriate location
- Saves to file immediately
- Visible in editor instantly

✅ **Update Table of Contents** (`Ctrl+Shift+U`)
- Updates existing TOC with current headings
- Persists changes to file
- UI reflects updates

✅ **Remove Table of Contents** (`Ctrl+Shift+R`)
- Removes TOC from document
- Saves cleaned content
- Changes visible immediately

## Testing Steps

1. **Open or create a note** with multiple headings:
   ```markdown
   # Main Title
   
   ## Section 1
   Content here...
   
   ## Section 2
   More content...
   
   ### Subsection 2.1
   Details...
   ```

2. **Press `Ctrl+Shift+O`** (or use Command Palette → "Insert Table of Contents")

3. **Expected Result:**
   ```markdown
   # Main Title
   
   <!-- TOC -->
   
   ## Table of Contents
   
   - 1. [Section 1](#section-1)
   - 2. [Section 2](#section-2)
     - 2.1. [Subsection 2.1](#subsection-21)
   
   <!-- TOC -->
   
   ## Section 1
   Content here...
   
   ## Section 2
   More content...
   
   ### Subsection 2.1
   Details...
   ```

4. **Verify changes are saved:**
   - Refresh the page
   - TOC should still be there
   - Check the actual `.md` file - changes are persisted

## Impact on Other Plugins

This fix benefits **ALL plugins** that use `api.notes.update()`:
- Daily Notes plugin
- Any custom plugins that modify note content
- Future plugins that need to update notes

The `update()` method now properly:
- Persists changes
- Updates UI
- Maintains data consistency

## Files Modified

- `/Users/xclusive36/MarkItUp/src/lib/plugin-manager.ts`

## Commit

- **Commit:** `7ffcd8f`
- **Message:** "Fix: PluginAPI update method now persists changes to filesystem"
- **Pushed to:** `main` branch

## Related Issues

This fixes the second issue discovered after the initial TOC plugin fix:
1. ✅ TOC plugin commands connected to methods (commit `1b2a64e`)
2. ✅ Plugin updates persist to filesystem (commit `7ffcd8f`)

Both issues are now resolved! 🎉
