# UI/UX Enhancements - October 2025

This document describes all the user interface and experience enhancements implemented in MarkItUp PKM.

## 📋 Table of Contents

- [Overview](#overview)
- [New Components](#new-components)
- [CSS Enhancements](#css-enhancements)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Usage Guide](#usage-guide)
- [Integration Instructions](#integration-instructions)

---

## Overview

These enhancements focus on improving the overall user experience through:

1. **Better visual hierarchy** with elevation system and interactive states
2. **Distraction-free writing** with Zen Mode
3. **Enhanced notifications** with action buttons and priority levels
4. **Advanced filtering** for sidebar notes organization
5. **Improved accessibility** with reduced motion and high contrast support

---

## New Components

### 1. ZenMode Component ⭐⭐⭐

**File:** `src/components/ZenMode.tsx`

A distraction-free writing mode that hides all UI elements except the editor.

**Features:**
- ✅ Full-screen editor with minimal distractions
- ✅ **Focus Mode** - Dims non-active text (Cmd/Ctrl+Shift+F)
- ✅ **Typewriter Mode** - Keeps cursor centered vertically (Cmd/Ctrl+Shift+T)
- ✅ Auto-hiding controls (appear on mouse movement)
- ✅ Live statistics bar at bottom
- ✅ Keyboard shortcut: `Cmd/Ctrl+Shift+F` to toggle

**Usage:**
```tsx
import ZenMode from '@/components/ZenMode';

<ZenMode
  markdown={markdown}
  onMarkdownChange={setMarkdown}
  onClose={() => setShowZenMode(false)}
  theme={theme}
/>
```

**Keyboard Shortcuts:**
- `Escape` - Exit Zen Mode
- `Cmd/Ctrl+Shift+F` - Toggle Focus Mode
- `Cmd/Ctrl+Shift+T` - Toggle Typewriter Mode

---

### 2. NotificationQueue Component ⭐⭐⭐

**File:** `src/components/NotificationQueue.tsx`

Advanced notification system with stacking, priorities, and action buttons.

**Features:**
- ✅ Queue system (stacks multiple notifications)
- ✅ Priority levels: `low`, `normal`, `high`
- ✅ Persistent notifications (won't auto-dismiss)
- ✅ Action buttons with callbacks
- ✅ Auto-dismiss after configurable duration
- ✅ Type-based styling: `success`, `error`, `warning`, `info`
- ✅ Global notification manager hook

**Usage:**
```tsx
import { useNotifications } from '@/components/NotificationQueue';

const { addNotification, removeNotification } = useNotifications();

// Add a simple notification
addNotification({
  type: 'success',
  message: 'Note saved successfully!',
});

// Add a notification with actions
addNotification({
  type: 'warning',
  title: 'File exists',
  message: 'A file with this name already exists. Overwrite?',
  persistent: true,
  priority: 'high',
  actions: [
    {
      label: 'Overwrite',
      onClick: () => saveFile(true),
      variant: 'primary',
    },
    {
      label: 'Cancel',
      onClick: () => {},
      variant: 'secondary',
    },
  ],
});
```

**Component Placement:**
```tsx
// Add once in your main app component
<NotificationQueue maxNotifications={5} />
```

---

### 3. SidebarFilters Component ⭐⭐

**File:** `src/components/SidebarFilters.tsx`

Quick filter chips for sidebar notes organization.

**Features:**
- ✅ Filter by: Today, This Week, Recent, Pinned, Untagged, Orphans
- ✅ Shows count badges for each filter
- ✅ Visual active state
- ✅ One-click filter clear

**Usage:**
```tsx
import SidebarFilters, { FilterType } from '@/components/SidebarFilters';

const [activeFilter, setActiveFilter] = useState<FilterType>('all');

<SidebarFilters
  activeFilter={activeFilter}
  onFilterChange={setActiveFilter}
  counts={{
    today: 5,
    week: 12,
    untagged: 3,
    orphans: 8,
    recent: 10,
    pinned: 2,
  }}
  theme={theme}
/>
```

---

### 4. NotesViewToggle Component ⭐⭐

**File:** `src/components/NotesViewToggle.tsx`

Toggle between different note display modes.

**Features:**
- ✅ Three view modes: List, Grid, Compact
- ✅ Visual active state
- ✅ Keyboard accessible

**Usage:**
```tsx
import NotesViewToggle, { NotesViewMode } from '@/components/NotesViewToggle';

const [viewMode, setViewMode] = useState<NotesViewMode>('list');

<NotesViewToggle
  view={viewMode}
  onViewChange={setViewMode}
  theme={theme}
/>
```

---

### 5. NotesSortDropdown Component ⭐⭐

**File:** `src/components/NotesSortDropdown.tsx`

Dropdown menu for sorting notes.

**Features:**
- ✅ Sort by: Name, Date Created, Date Modified, Link Count, Tag Count
- ✅ Ascending/Descending toggle
- ✅ Visual sort direction indicator
- ✅ Persists sort preference

**Usage:**
```tsx
import NotesSortDropdown, { SortOption, SortDirection } from '@/components/NotesSortDropdown';

const [sortBy, setSortBy] = useState<SortOption>('name');
const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

<NotesSortDropdown
  sortBy={sortBy}
  sortDirection={sortDirection}
  onSortChange={(sort, direction) => {
    setSortBy(sort);
    setSortDirection(direction);
  }}
  theme={theme}
/>
```

---

## CSS Enhancements

**File:** `src/app/globals.css`

### Elevation System

Provides depth hierarchy for UI elements:

```css
.elevation-0 { box-shadow: none; }
.elevation-1 { box-shadow: var(--shadow-sm); }
.elevation-2 { box-shadow: var(--shadow-md); }
.elevation-3 { box-shadow: var(--shadow-lg); }
.elevation-4 { box-shadow: var(--shadow-xl); }
.elevation-5 { box-shadow: var(--shadow-2xl); }
```

**Usage:**
```tsx
<div className="elevation-2 rounded-lg p-4">
  Card with medium elevation
</div>
```

---

### Interactive States

Lift effect for interactive elements:

```css
.interactive {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.interactive:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

**Usage:**
```tsx
<button className="interactive px-4 py-2 rounded-lg">
  Hover me!
</button>
```

---

### Visual Separators

Horizontal and vertical dividers:

```css
.divider { /* Horizontal */ }
.divider-vertical { /* Vertical */ }
```

**Usage:**
```tsx
<div className="divider my-4" />
```

---

### Badge System

Color-coded badges with variants:

```css
.badge { /* Base badge styles */ }
.badge-primary { /* Blue */ }
.badge-success { /* Green */ }
.badge-warning { /* Yellow */ }
.badge-error { /* Red */ }
.badge-clickable { /* Interactive badge */ }
```

**Usage:**
```tsx
<span className="badge badge-success">
  <CheckCircle className="w-3 h-3" />
  Active
</span>

<button className="badge badge-clickable">
  <Tag className="w-3 h-3" />
  #productivity
</button>
```

---

### Container System

Fluid responsive containers:

```css
.container-fluid {
  width: 100%;
  padding-left: clamp(1rem, 3vw, 2rem);
  padding-right: clamp(1rem, 3vw, 2rem);
}

.main-grid {
  display: grid;
  grid-template-columns: 
    minmax(0, 280px)   /* Sidebar */
    minmax(0, 1fr)      /* Main */
    minmax(0, 320px);   /* Right panel */
  gap: clamp(1rem, 2vw, 2rem);
}
```

---

### Progress Indicators

Determinate and indeterminate progress bars:

```css
.progress-bar { /* Container */ }
.progress-bar-fill { /* Determinate progress */ }
.progress-bar-indeterminate { /* Loading animation */ }
```

**Usage:**
```tsx
<div className="progress-bar">
  <div 
    className="progress-bar-fill" 
    style={{ width: '60%' }}
  />
</div>

<div className="progress-bar">
  <div className="progress-bar-indeterminate" />
</div>
```

---

### Accessibility Enhancements

#### Skip to Content Link

```css
.skip-to-content {
  position: absolute;
  top: -40px;
  /* Appears on focus */
}
```

**Usage:**
```tsx
<a href="#main-content" className="skip-to-content">
  Skip to content
</a>
```

#### Reduced Motion Support

Automatically respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### High Contrast Mode

Enhances borders and outlines for better visibility:

```css
@media (prefers-contrast: high) {
  .badge {
    border-width: 2px;
  }
  
  button:focus-visible {
    outline: 3px solid currentColor;
  }
}
```

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open Command Palette |
| `Cmd/Ctrl+S` | Save Current Note |
| `Cmd/Ctrl+I` | Toggle AI Chat |
| **`Cmd/Ctrl+Shift+F`** | **Toggle Zen Mode** |
| `?` | Show Keyboard Shortcuts Help |
| `Escape` | Close All Modals |

### Zen Mode Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Exit Zen Mode |
| `Cmd/Ctrl+Shift+F` | Toggle Focus Mode |
| `Cmd/Ctrl+Shift+T` | Toggle Typewriter Mode |

---

## Usage Guide

### Example: Complete Sidebar Enhancement

```tsx
'use client';

import { useState } from 'react';
import SidebarFilters, { FilterType } from '@/components/SidebarFilters';
import NotesViewToggle, { NotesViewMode } from '@/components/NotesViewToggle';
import NotesSortDropdown, { SortOption, SortDirection } from '@/components/NotesSortDropdown';

export default function EnhancedSidebar() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<NotesViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  return (
    <div className="sidebar p-4 space-y-4">
      {/* Filter chips */}
      <SidebarFilters
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={{
          today: 5,
          week: 12,
          orphans: 8,
        }}
      />
      
      {/* View mode and sort controls */}
      <div className="flex items-center justify-between">
        <NotesViewToggle
          view={viewMode}
          onViewChange={setViewMode}
        />
        
        <NotesSortDropdown
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={(sort, dir) => {
            setSortBy(sort);
            setSortDirection(dir);
          }}
        />
      </div>
      
      {/* Notes list */}
      <div className={`notes-${viewMode}`}>
        {/* Your notes rendering logic */}
      </div>
    </div>
  );
}
```

---

### Example: Using Notifications

```tsx
'use client';

import { useNotifications } from '@/components/NotificationQueue';

export default function MyComponent() {
  const { addNotification } = useNotifications();
  
  const handleSave = async () => {
    try {
      await saveNote();
      
      addNotification({
        type: 'success',
        message: 'Note saved successfully!',
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message,
        persistent: true,
        actions: [
          {
            label: 'Retry',
            onClick: handleSave,
            variant: 'primary',
          },
          {
            label: 'Dismiss',
            onClick: () => {},
          },
        ],
      });
    }
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

---

## Integration Instructions

### 1. Add NotificationQueue to Root Layout

In `src/app/page.tsx` or your root component:

```tsx
import NotificationQueue from '@/components/NotificationQueue';

export default function App() {
  return (
    <>
      {/* Your app content */}
      
      {/* Add at the end, before closing tags */}
      <NotificationQueue maxNotifications={5} />
    </>
  );
}
```

### 2. Enable Zen Mode

Already integrated in `src/app/page.tsx`:

- State: `showZenMode`
- Shortcut: `Cmd/Ctrl+Shift+F`
- Component renders when `showZenMode` is true

### 3. Integrate Sidebar Components

Add to your `Sidebar.tsx` component:

```tsx
import SidebarFilters from '@/components/SidebarFilters';
import NotesViewToggle from '@/components/NotesViewToggle';
import NotesSortDropdown from '@/components/NotesSortDropdown';

// In your sidebar component, add above the notes list:
<div className="space-y-4">
  <SidebarFilters {...props} />
  
  <div className="flex items-center justify-between">
    <NotesViewToggle {...props} />
    <NotesSortDropdown {...props} />
  </div>
</div>
```

---

## Design Tokens

### Spacing Scale
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Typography Scale
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Border Radius Scale
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Shadow Scale
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## Browser Support

All enhancements are tested and work on:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Considerations

1. **CSS Animations** - Use `transform` and `opacity` for GPU acceleration
2. **Notifications** - Limited to max 5 by default to prevent memory issues
3. **Auto-dismiss** - Notifications clean up timers on unmount
4. **Event Listeners** - All keyboard shortcuts properly cleaned up

---

## Accessibility Features

### WCAG 2.1 AA Compliance

- ✅ All interactive elements have `aria-label` or visible text
- ✅ Focus indicators on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader announcements for notifications
- ✅ Color contrast ratios meet AA standards
- ✅ Respects `prefers-reduced-motion`
- ✅ Supports `prefers-contrast: high`

### Keyboard Navigation

- All components fully navigable via keyboard
- Focus trap in modals (Zen Mode, Notifications)
- Skip to content link for main navigation bypass
- Logical tab order

---

## Future Enhancements

Planned improvements for the next iteration:

1. **Graph View Enhancements**
   - Floating control panel
   - Mini-map for large graphs
   - Node clustering visualization

2. **Mobile Gestures**
   - Swipe to toggle panels
   - Long-press context menus
   - Pull-to-refresh

3. **Command Palette**
   - Recent commands section
   - Command aliases
   - Fuzzy search improvements

4. **Right Panel UX**
   - Peek preview on hover
   - Per-view collapse state memory
   - Smooth width transitions

---

## Support

If you encounter any issues or have suggestions:

1. Check the [GitHub Issues](https://github.com/xclusive36/MarkItUp/issues)
2. Review the [User Guide](./USER_GUIDE.md)
3. Join the [Discussions](https://github.com/xclusive36/MarkItUp/discussions)

---

**Last Updated:** October 17, 2025  
**Version:** 3.3.0  
**Implemented By:** GitHub Copilot AI Assistant
