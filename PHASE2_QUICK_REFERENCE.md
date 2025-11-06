# ⚡ Phase 2 Quick Reference: Navigation Components

Quick copy-paste examples for common use cases.

---

## 📍 Breadcrumbs

### Basic Usage
```tsx
import Breadcrumb from '@/components/ui/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Notes', onClick: () => navigate('/notes') },
    { label: 'Current Note' },
  ]}
/>
```

### With Icons
```tsx
import { Folder, FileText } from 'lucide-react';

<Breadcrumb
  items={[
    { 
      label: 'Projects', 
      icon: <Folder className="w-4 h-4" />,
      onClick: () => navigate('/projects') 
    },
    { 
      label: 'Current Project',
      icon: <FileText className="w-4 h-4" />
    },
  ]}
  showHome={true}
/>
```

---

## ⏳ Loading States

### Inline Spinner
```tsx
import LoadingSpinner from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="sm" label="Saving..." />
```

### Full Screen Loading
```tsx
<LoadingSpinner size="xl" label="Loading..." fullScreen />
```

### Skeleton List
```tsx
import { SkeletonList } from '@/components/ui/Skeleton';

{isLoading ? <SkeletonList items={10} /> : <NoteList notes={notes} />}
```

### Skeleton Card
```tsx
import { SkeletonCard } from '@/components/ui/Skeleton';

{isLoading ? (
  <div className="grid grid-cols-3 gap-4">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
  </div>
) : (
  <CardGrid cards={cards} />
)}
```

---

## 🏜️ Empty States

### Basic Empty State
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { FileText, Plus } from 'lucide-react';

<EmptyState
  icon={FileText}
  title="No notes yet"
  description="Create your first note to get started."
  actions={[
    {
      label: 'Create Note',
      onClick: () => createNote(),
      variant: 'primary',
      icon: Plus,
    },
  ]}
/>
```

### With Multiple Actions
```tsx
<EmptyState
  icon={Search}
  title="No results found"
  description="Try adjusting your search terms or filters."
  actions={[
    {
      label: 'Clear Filters',
      onClick: () => clearFilters(),
      variant: 'primary',
    },
    {
      label: 'View All',
      onClick: () => viewAll(),
      variant: 'secondary',
    },
  ]}
/>
```

---

## 🎯 Common Patterns

### Data Fetching Pattern
```tsx
function DataView() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <SkeletonList items={5} />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No data available"
        description="Get started by adding your first item."
        actions={[
          {
            label: 'Add Item',
            onClick: () => addItem(),
            variant: 'primary',
            icon: Plus,
          },
        ]}
      />
    );
  }

  return <DataList data={data} />;
}
```

### Page with Breadcrumbs
```tsx
function PageLayout({ children }) {
  return (
    <div>
      <div className="breadcrumb-container">
        <Breadcrumb items={breadcrumbItems} showHome />
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

### Button with Loading State
```tsx
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveData();
    setIsSaving(false);
  };

  return (
    <Button
      variant="primary"
      onClick={handleSave}
      isLoading={isSaving}
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </Button>
  );
}
```

---

## 🎨 CSS Classes

### Navigation
```tsx
// Active navigation item
<div className="nav-item nav-item-active">
  Active Item
</div>

// Selected item
<div className="nav-item nav-item-selected">
  Selected Item
</div>
```

### Skeleton Animations
```tsx
// Pulse animation
<div className="skeleton-pulse bg-gray-200 h-4 rounded" />

// Shimmer animation
<div className="skeleton-shimmer h-20 rounded-lg" />
```

### Loading Overlay
```tsx
{isLoading && (
  <div className="loading-overlay">
    <LoadingSpinner size="xl" />
  </div>
)}
```

---

## ⌨️ Keyboard Navigation

All components support keyboard navigation:

- **Tab** - Move focus between elements
- **Enter/Space** - Activate buttons/links
- **Escape** - Close modals/overlays
- **Arrow Keys** - Navigate lists (Command Palette)

---

## 🎯 Best Practices

### Loading States
✅ Use Skeleton for initial page loads  
✅ Use Spinner for button actions  
✅ Always show loading feedback for >300ms operations  
✅ Transition smoothly from loading to content

### Empty States
✅ Be helpful, not just informative  
✅ Provide 1-2 clear next steps  
✅ Use friendly language  
❌ Don't just say "Empty" or "No data"

### Breadcrumbs
✅ Use at top of content areas  
✅ Keep to 4-5 levels max  
✅ Make all items except last clickable  
✅ Show icons for visual context

---

**Need more details?** See `docs/UI_REFINEMENT_PHASE2.md`
