# Quick Integration Guide

## How to Add the New Components to MarkItUp

### Step 1: Update Root Layout

Add the global components that need to be available everywhere:

```tsx
// src/app/layout.tsx
'use client';

import { useState } from 'react';
import KeyboardShortcuts from '@/components/navigation/KeyboardShortcuts';
import CommandPalette from '@/components/navigation/CommandPalette';
import FloatingActionButton from '@/components/navigation/FloatingActionButton';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <html lang="en">
      <body>
        {/* Global keyboard shortcuts */}
        <KeyboardShortcuts onCommandPalette={() => setCommandPaletteOpen(true)} />
        
        {/* Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
        
        {/* Floating Action Button */}
        <FloatingActionButton />
        
        {/* Your existing layout */}
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Update Homepage

Add QuickEditor and wrap sidebars in CollapsibleSidebar:

```tsx
// src/app/page.tsx or your home page component
import QuickEditor from '@/components/editors/QuickEditor';
import CollapsibleSidebar from '@/components/navigation/CollapsibleSidebar';
import YourExistingSidebar from '@/components/Sidebar';

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar - Collapsible */}
      <CollapsibleSidebar
        side="left"
        defaultOpen={false}
        storageKey="markitup-left-sidebar"
      >
        <YourExistingSidebar />
      </CollapsibleSidebar>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Quick Editor - Featured prominently */}
        <div className="mb-8 max-w-4xl mx-auto">
          <QuickEditor />
        </div>

        {/* Your existing home page content */}
        {/* ... */}
      </main>

      {/* Right Sidebar - Optional, also collapsible */}
      <CollapsibleSidebar
        side="right"
        defaultOpen={true}
        storageKey="markitup-right-sidebar"
      >
        {/* Your right panel content */}
      </CollapsibleSidebar>
    </div>
  );
}
```

### Step 3: Create Editor Page

Create a new route that uses the Enhanced Markdown Editor:

```tsx
// src/app/editor/[...path]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EnhancedMarkdownEditor from '@/components/editors/EnhancedMarkdownEditor';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const filePath = Array.isArray(params.path) 
    ? params.path.join('/') 
    : params.path;

  useEffect(() => {
    // Load file content
    fetch(`/api/files?path=${encodeURIComponent(filePath)}`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [filePath]);

  const handleSave = async (newContent: string) => {
    await fetch('/api/files', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath, content: newContent }),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <EnhancedMarkdownEditor
        initialContent={content}
        filePath={filePath}
        onSave={handleSave}
        onCancel={() => router.back()}
        showPreview={true}
      />
    </div>
  );
}
```

### Step 4: Add Navigation Links

Update your navigation to include new pages:

```tsx
// In your nav component
<nav>
  <Link href="/">Home</Link>
  <Link href="/editor/new">New Note (Cmd+E)</Link>
  <Link href="/daily-notes">Daily Notes (Cmd+D)</Link>
  <Link href="/search">Search (Cmd+K)</Link>
  <Link href="/graph">Graph (Cmd+G)</Link>
  
  {/* Command Palette trigger */}
  <button onClick={() => setCommandPaletteOpen(true)}>
    Quick Find (Cmd+P)
  </button>
</nav>
```

### Step 5: Test Everything

1. **Keyboard Shortcuts**
   - Cmd/Ctrl+P → Command Palette opens
   - Cmd/Ctrl+E → New note page
   - Cmd/Ctrl+D → Daily notes page

2. **QuickEditor**
   - Type on homepage
   - Auto-saves to localStorage
   - Click "Create Note" to save

3. **Enhanced Editor**
   - Navigate to `/editor/your-file.md`
   - See split-pane view
   - Test auto-save (wait 2 seconds after typing)
   - Click distraction-free mode icon

4. **Daily Notes**
   - Navigate to `/daily-notes`
   - Click a date
   - Creates or opens daily note

5. **Collapsible Sidebars**
   - Click chevron buttons
   - Sidebars slide in/out
   - State persists on refresh

### Step 6: Optional - Enhanced File Watching

If you want to upgrade file watching with chokidar:

```typescript
// src/lib/file-watcher.ts
import chokidar from 'chokidar';

const MARKDOWN_DIR = path.join(process.cwd(), 'markdown');

export function startFileWatcher() {
  const watcher = chokidar.watch(MARKDOWN_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on('add', path => console.log(`File ${path} has been added`))
    .on('change', path => console.log(`File ${path} has been changed`))
    .on('unlink', path => console.log(`File ${path} has been removed`));

  return watcher;
}
```

## Troubleshooting

### Command Palette not showing files?

Make sure `/api/files/list` endpoint is accessible.

### Auto-save not working?

Check browser console for errors. Make sure your `/api/files` PUT endpoint accepts content updates.

### Daily notes not creating?

Check that the `/markdown/journal/` directory can be created. Verify permissions.

### Keyboard shortcuts not working?

Ensure KeyboardShortcuts component is added to your root layout.

## Next Steps

1. Customize the components to match your design system
2. Add more commands to the Command Palette
3. Create more daily note templates
4. Add Recent Files widget using `EditorStatePersistence.getRecentFiles()`
5. Integrate with your existing AI features

---

**You now have the best of both worlds - MarkItUp's powerful features + Sentiment's editing experience!**
