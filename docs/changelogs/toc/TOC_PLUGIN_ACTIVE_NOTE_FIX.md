# Final TOC Plugin Fix - Active Note Sync

## The Real Problem

The Table of Contents plugin was executing correctly but **the markdown textarea wasn't updating** because the PKM system didn't know which note was active.

### Why This Happened

1. **UI State** - The React app tracks the active note in `activeNote` state
2. **PKM State** - The PKM system tracks it in `viewState.activeNoteId`
3. **❌ These were NOT synced!**

When you selected a note:
- ✅ UI knew which note was active (`setActiveNote(note)`)
- ❌ PKM didn't know (`viewState.activeNoteId` was undefined)

When the plugin updated the note:
```typescript
// In plugin-manager.ts update() method
const activeNoteId = this.pkmSystem.viewState.activeNoteId;
if (activeNoteId === id && this.uiCallbacks) {
  this.uiCallbacks.setMarkdown(updatedNote.content); // This never ran!
}
```

The condition `activeNoteId === id` was always false because `activeNoteId` was `undefined`.

## The Fix

Updated `src/app/page.tsx` to sync the active note ID with PKM system:

### 1. When Note is Selected
```typescript
const handleNoteSelect = useCallback(
  (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setActiveNote(note);
      setMarkdown(note.content);
      setFileName(note.name.replace('.md', ''));
      setFolder(note.folder || '');
      
      // ✅ NEW: Update PKM system's active note
      pkm.setActiveNote(note.id);
    }
  },
  [notes, pkm]
);
```

### 2. When Creating New Note
```typescript
const createNewNote = () => {
  setActiveNote(null);
  pkm.setActiveNote(undefined); // ✅ NEW: Clear active note in PKM
  setMarkdown('# New Note\n\nStart writing your thoughts here...');
  // ...
};
```

### 3. When Deleting Active Note
```typescript
if (activeNote?.id === noteId) {
  setActiveNote(null);
  pkm.setActiveNote(undefined); // ✅ NEW: Clear active note in PKM
  setMarkdown('');
  // ...
}
```

## How It Works Now

### Complete Flow:

1. **Open a note** → `handleNoteSelect()` called
   - Sets UI state: `setActiveNote(note)`
   - ✅ **Sets PKM state:** `pkm.setActiveNote(note.id)`

2. **Use TOC command** (Ctrl+Shift+O)
   - Plugin gets active note: `this.api.notes.getActiveNoteId()` ✅ Returns correct ID
   - Plugin gets note: `this.api.notes.get(activeNoteId)` ✅ Gets the note
   - Plugin generates TOC and updates: `this.api.notes.update(id, { content })`

3. **PluginAPI update() method**:
   ```typescript
   const activeNoteId = this.pkmSystem.viewState.activeNoteId; // ✅ Has value!
   if (activeNoteId === id && this.uiCallbacks) {
     this.uiCallbacks.setMarkdown(updatedNote.content); // ✅ RUNS!
   }
   ```

4. **Result**: Markdown textarea updates immediately! 🎉

## Testing Steps

1. **Open/reload the app** at http://localhost:3000
2. **Click on any note** in the sidebar
3. **Verify the note opens** in the editor
4. **Press Ctrl+Shift+O** (or use Command Palette → "Insert Table of Contents")
5. **You should see**:
   - ✅ TOC inserted into the markdown textarea
   - ✅ Changes are immediate (no refresh needed)
   - ✅ Changes persist (saved to file)

## Alternative Methods to Test

### Via Command Palette:
1. Press `Ctrl+K` or `Cmd+K`
2. Type "Insert Table of Contents"
3. Press Enter

### Via Update TOC:
1. Insert TOC first
2. Add/modify headings
3. Press `Ctrl+Shift+U` (or Command Palette → "Update Table of Contents")
4. TOC should update to reflect new headings

### Via Remove TOC:
1. With a note containing TOC
2. Press `Ctrl+Shift+R` (or Command Palette → "Remove Table of Contents")
3. TOC should be removed from editor

## Files Modified

- **src/app/page.tsx**
  - `handleNoteSelect()` - Added `pkm.setActiveNote(note.id)`
  - `createNewNote()` - Added `pkm.setActiveNote(undefined)`
  - `deleteNote()` - Added `pkm.setActiveNote(undefined)` when deleting active note

## Commits

1. **76001fe** - Fix: Prevent hash anchor links from being parsed as tags
2. **1b2a64e** - Fix: Table of Contents plugin now fully functional
3. **7ffcd8f** - Fix: PluginAPI update method now persists changes to filesystem
4. **71384ad** - Fix: Sync active note between UI and PKM system ← **THIS FIX**

## Summary

The plugin was working correctly all along! The issue was that the UI and PKM system weren't communicating about which note was active. By syncing `viewState.activeNoteId` when notes are selected/created/deleted, the plugin can now correctly update the markdown textarea.

**Status**: ✅ **FULLY WORKING** - TOC plugin now inserts/updates/removes TOC in the markdown editor!
