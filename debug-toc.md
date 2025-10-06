# Debug TOC Plugin Flow

## Current Understanding

### Data Flow:
1. User selects note → `handleNoteSelect()` in page.tsx
2. Sets UI state: `setActiveNote(note)`, `setMarkdown(note.content)`
3. **Should** set PKM state: `pkm.setActiveNote(note.id)`
4. User triggers "Insert TOC" command
5. Plugin calls `this.api.notes.getActiveNoteId()` → should return `this.pkmSystem.viewState.activeNoteId`
6. Plugin calls `this.api.notes.update(id, { content })` 
7. Update method checks: `if (activeNoteId === id && this.uiCallbacks)`
8. If true, calls: `this.uiCallbacks.setMarkdown(updatedNote.content)`

### Problem Symptoms:
- TOC is **not appearing** in markdown editor
- This means `setMarkdown()` is **not being called**

### Possible Issues:

#### Issue 1: pkm.setActiveNote() not called
- Check if user made manual edits to page.tsx that removed this

#### Issue 2: activeNoteId is undefined
- Check `this.pkmSystem.viewState.activeNoteId` value when update() runs

#### Issue 3: uiCallbacks not set
- Check if PluginManager has uiCallbacks configured

#### Issue 4: update() throwing error
- Check browser console for errors

#### Issue 5: API call failing
- Check if PUT /api/files/[filename] is working

## Debugging Steps:

### 1. Add console logs to plugin update
In `src/plugins/table-of-contents.ts` insertTOC method:
```typescript
async insertTOC(noteId?: string): Promise<void> {
  console.log('[TOC DEBUG] insertTOC called');
  const note = noteId ? this.api.notes.get(noteId) : this.getCurrentNote();
  console.log('[TOC DEBUG] Current note:', note?.id, note?.name);
  
  // ... rest of method
}
```

### 2. Add console logs to plugin-manager update
In `src/lib/plugin-manager.ts` update method:
```typescript
update: async (id, updates) => {
  console.log('[PLUGIN-MANAGER] update called:', id, updates);
  const note = this.pkmSystem.getNote(id);
  console.log('[PLUGIN-MANAGER] found note:', note?.id);
  
  const updatedNote = await this.pkmSystem.updateNote(id, updates);
  console.log('[PLUGIN-MANAGER] updated note:', updatedNote?.id);
  
  if (updates.content !== undefined) {
    const activeNoteId = this.pkmSystem.viewState.activeNoteId;
    console.log('[PLUGIN-MANAGER] activeNoteId:', activeNoteId, 'comparing to:', id);
    console.log('[PLUGIN-MANAGER] has uiCallbacks:', !!this.uiCallbacks);
    
    if (activeNoteId === id && this.uiCallbacks) {
      console.log('[PLUGIN-MANAGER] CALLING setMarkdown with:', updatedNote.content.substring(0, 100));
      this.uiCallbacks.setMarkdown(updatedNote.content);
    }
  }
}
```

### 3. Check page.tsx for pkm.setActiveNote
Verify handleNoteSelect has:
```typescript
pkm.setActiveNote(note.id);
```

### 4. Check browser console
- Open DevTools → Console
- Select a note
- Look for: "[PLUGIN-MANAGER] activeNoteId: ..."
- Trigger TOC command
- Look for all debug logs

## Expected Console Output:

When selecting a note:
```
[PLUGIN-MANAGER] activeNoteId set to: <note-id>
```

When triggering Insert TOC:
```
[TOC DEBUG] insertTOC called
[TOC DEBUG] Current note: <note-id> <note-name>
[PLUGIN-MANAGER] update called: <note-id> { content: "..." }
[PLUGIN-MANAGER] found note: <note-id>
[PLUGIN-MANAGER] updated note: <note-id>
[PLUGIN-MANAGER] activeNoteId: <note-id> comparing to: <note-id>
[PLUGIN-MANAGER] has uiCallbacks: true
[PLUGIN-MANAGER] CALLING setMarkdown with: <content>
```

If any of these are missing, we found the issue!
