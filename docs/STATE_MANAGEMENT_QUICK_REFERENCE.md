# State Management Quick Reference

## 🎯 Quick Start

```tsx
import { useAppStore } from '@/store/app-store';

// Subscribe to specific state
const markdown = useAppStore((state) => state.markdown);
const setMarkdown = useAppStore((state) => state.setMarkdown);

// Or use compatibility hooks
import { useModalState, useNoteState } from '@/store/app-store';
const modals = useModalState();
const { markdown, updateMarkdown } = useNoteState();
```

## 📦 State Categories

| Category | States | Key Actions |
|----------|--------|-------------|
| **Modals** | 17 modal visibility states | `openModal`, `closeModal`, `toggleModal` |
| **Notes** | notes, activeNote, markdown, fileName, folder | `setNotes`, `loadNote`, `clearNote`, `updateMarkdown` |
| **Views** | viewMode, currentView, sidebar states | `setViewMode`, `toggleLeftSidebar`, `toggleRightPanel` |
| **Graph** | graph, graphStats, tags, folders | `setGraph`, `setGraphStats`, `setTags`, `setFolders` |
| **Save** | saveStatus, lastSaved, isSaving, saveError | `setSaveSuccess`, `setSaveErrorWithTimeout` |

## 🔑 Common Patterns

### Open/Close Modal

```tsx
const modals = useModalState();

// Open
modals.aiChat.open();

// Close
modals.aiChat.close();

// Toggle
modals.aiChat.toggle();

// Check if open
if (modals.aiChat.isOpen) { ... }
```

### Load Note

```tsx
const { loadNote, clearNote } = useNoteState();

// Load existing note
loadNote(note);

// Start new note
clearNote();
```

### Update Markdown

```tsx
const { markdown, updateMarkdown } = useNoteState();

updateMarkdown('New content');
```

### Switch View

```tsx
const { setViewMode, setCurrentView } = useViewState();

setViewMode('split'); // 'edit' | 'preview' | 'split'
setCurrentView('graph'); // 'editor' | 'graph' | 'search' | 'analytics' | ...
```

### Save Operations

```tsx
const { setSaveSuccess, setSaveErrorWithTimeout, setIsSaving } = useSaveState();

setIsSaving(true);
try {
  await saveNote();
  setSaveSuccess('Note saved! 🎉');
} catch (error) {
  setSaveErrorWithTimeout('Failed to save', 3000);
}
```

## 🛠️ Redux DevTools

1. Install [Redux DevTools Extension](https://chrome.google.com/webstore/detail/redux-devtools/)
2. Open DevTools (F12)
3. Click "Redux" tab
4. See all state changes with action names
5. Time-travel through state history

## 📝 Adding New State

```tsx
// 1. Add to AppState interface
export interface AppState {
  myNewState: string;
  setMyNewState: (value: string) => void;
}

// 2. Add initial value and action
export const useAppStore = create<AppState>()(
  devtools((set) => ({
    myNewState: 'initial',
    setMyNewState: (myNewState) => set({ myNewState }, false, 'setMyNewState'),
  }))
);

// 3. Use in components
const myNewState = useAppStore((state) => state.myNewState);
const setMyNewState = useAppStore((state) => state.setMyNewState);
```

## 🎨 Best Practices

### ✅ DO

```tsx
// Subscribe to specific state
const markdown = useAppStore((state) => state.markdown);

// Use shallow equality for multiple values
const { markdown, fileName } = useAppStore(
  (state) => ({ markdown: state.markdown, fileName: state.fileName }),
  shallow
);
```

### ❌ DON'T

```tsx
// Subscribe to entire state (causes re-renders on ANY change)
const state = useAppStore();
```

## 📚 Full Documentation

See [STATE_MANAGEMENT_IMPLEMENTATION.md](./STATE_MANAGEMENT_IMPLEMENTATION.md) for complete guide.
