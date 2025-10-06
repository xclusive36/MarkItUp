# Plugin System Issues Analysis

## Critical Issues Found

### 1. Table of Contents Plugin - Non-Functional Commands

**Location:** `src/plugins/table-of-contents.ts`

**Problems:**

#### A. `getCurrentNote()` Always Returns Null (Line 412)
```typescript
private getCurrentNote(): Note | null {
  // This would get the currently active/selected note
  // Implementation depends on the app's state management
  return null;  // ❌ CRITICAL: Always returns null!
}
```

**Impact:** All TOC commands fail because they can't access the current note.

**Used By:**
- `insertTOC()` - Line 326
- `updateTOC()` - Line 356  
- `removeTOC()` - Line 383

#### B. Command Callbacks Don't Call Plugin Methods (Lines 82-104)
```typescript
commands: [
  {
    id: 'insert-toc',
    name: 'Insert Table of Contents',
    description: 'Generate and insert TOC at cursor position',
    keybinding: 'Ctrl+Shift+O',
    callback: async function() {
      console.log('Inserting table of contents...');  // ❌ Only logs, doesn't do anything
    }
  },
  // ... other commands have same issue
]
```

**Impact:** Keyboard shortcuts and command palette entries do nothing.

#### C. Plugin Class Never Instantiated
The `TableOfContentsPlugin` class (lines 277-428) exists but:
- Is never instantiated
- Is never connected to the command callbacks
- The `initialize()` method is never called

### 2. Root Cause: Missing Integration Layer

**Problem:** The plugin manifest and plugin implementation class are disconnected.

**Current Architecture:**
```
PluginManifest (tableOfContentsPlugin)
  ├── commands[] - have empty callbacks
  └── onLoad() - just logs

TableOfContentsPlugin class
  ├── insertTOC() - actual implementation
  ├── updateTOC() - actual implementation
  └── removeTOC() - actual implementation
  
❌ These are never connected!
```

**What Should Happen:**
```typescript
// Plugin manager should:
1. Create instance: new TableOfContentsPlugin(api)
2. Call initialize()
3. Connect command callbacks to plugin methods
4. Provide way to get current note from app state
```

### 3. Similar Issues in Other Plugins

Checked other plugin files - many have the same pattern:

**Daily Notes Plugin** (`src/plugins/daily-notes.ts`):
- ✅ Better: Has `DailyNotesPlugin` class
- ❌ Same issue: Commands don't call plugin methods
- ❌ Same issue: Would need proper instantiation

**Link Checker Plugin** (`src/plugins/link-checker.ts`):
- ❌ Placeholder implementation
- ❌ Not functional

## Solutions Required

### For Table of Contents Plugin

#### Fix 1: Implement `getCurrentNote()` 
```typescript
private getCurrentNote(): Note | null {
  // Get from PKM system's view state
  const activeNoteId = this.api.notes.getActiveNoteId?.();
  return activeNoteId ? this.api.notes.get(activeNoteId) : null;
}
```

**Requires:** Adding `getActiveNoteId()` to PluginAPI

#### Fix 2: Connect Commands to Plugin Methods
```typescript
// In onLoad, create plugin instance and bind commands
onLoad: async function(api: PluginAPI) {
  const plugin = new TableOfContentsPlugin(api);
  await plugin.initialize();
  
  // Store instance for command callbacks
  this._pluginInstance = plugin;
},

commands: [
  {
    id: 'insert-toc',
    name: 'Insert Table of Contents',
    keybinding: 'Ctrl+Shift+O',
    callback: async function() {
      await this._pluginInstance?.insertTOC();
    }
  },
  // ... update other commands similarly
]
```

#### Fix 3: Extend PluginAPI
Add to `src/lib/types.ts` PluginAPI interface:
```typescript
notes: {
  // ... existing methods
  getActiveNoteId: () => string | undefined;  // NEW
  setActiveNote: (noteId: string) => void;    // NEW
}
```

### For Plugin System Generally

#### Architectural Improvements Needed:

1. **Plugin Lifecycle Management**
   - Plugin manager should instantiate plugin classes
   - Connect manifest commands to class methods
   - Manage plugin state

2. **State Access**
   - Plugins need access to active note
   - Need access to UI state
   - Need proper callbacks

3. **API Completeness**
   - `PluginAPI` needs `getActiveNoteId()`
   - Need cursor position access for insertions
   - Need editor integration for content modifications

## Testing Recommendations

### To Verify TOC Plugin is Broken:

1. Open the app at `localhost:3000`
2. Open any note with headings
3. Try keyboard shortcut `Ctrl+Shift+O`
4. Result: Nothing happens (just console log)
5. Check command palette
6. Try "Insert Table of Contents" command
7. Result: Nothing happens (just console log)

### After Fixes:

1. Same steps should insert TOC into the note
2. TOC should have clickable links to headings
3. Update command should refresh TOC
4. Remove command should delete TOC

## Priority

**High Priority:**
- Table of Contents plugin (user-facing, expected to work)
- Daily Notes plugin (if used)

**Medium Priority:**
- Link Checker plugin
- Other utility plugins

**Long-term:**
- Redesign plugin architecture for better integration
- Add plugin debugging tools
- Better plugin API documentation

## Files Needing Changes

1. `src/plugins/table-of-contents.ts` - Fix commands and getCurrentNote
2. `src/lib/types.ts` - Extend PluginAPI
3. `src/lib/plugin-manager.ts` - Enhance to provide active note
4. `src/lib/pkm.ts` - Expose active note through API
5. Documentation in `docs/PLUGIN_DEVELOPMENT.md` - Update with actual working patterns
