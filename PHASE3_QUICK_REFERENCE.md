# 📱 Phase 3 Quick Reference: Mobile Components

Quick copy-paste examples for mobile optimizations.

---

## 📋 Bottom Sheet

### Basic Usage
```tsx
import BottomSheet from '@/components/ui/BottomSheet';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<BottomSheet
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Quick Actions"
>
  <div className="space-y-3">
    <Button fullWidth>Action 1</Button>
    <Button fullWidth>Action 2</Button>
  </div>
</BottomSheet>
```

### Height Variants
```tsx
// Auto height (fits content)
<BottomSheet height="auto">...</BottomSheet>

// Half screen
<BottomSheet height="half">...</BottomSheet>

// Almost full screen
<BottomSheet height="full">...</BottomSheet>
```

---

## ↻ Pull to Refresh

### Basic Usage
```tsx
import PullToRefresh from '@/components/ui/PullToRefresh';

<PullToRefresh
  onRefresh={async () => {
    await fetchNewData();
  }}
>
  <YourContent />
</PullToRefresh>
```

### With Loading State
```tsx
const [isRefreshing, setIsRefreshing] = useState(false);

<PullToRefresh
  onRefresh={async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }}
  disabled={isRefreshing}
>
  {isRefreshing ? <LoadingSpinner /> : <Content />}
</PullToRefresh>
```

---

## 👆 Touch Target

### Icon Button
```tsx
import TouchTarget from '@/components/ui/TouchTarget';
import { Heart, Share2, Bookmark } from 'lucide-react';

<div className="flex gap-2">
  <TouchTarget onClick={handleLike}>
    <Heart className="w-5 h-5" />
  </TouchTarget>
  <TouchTarget onClick={handleShare}>
    <Share2 className="w-5 h-5" />
  </TouchTarget>
  <TouchTarget onClick={handleBookmark}>
    <Bookmark className="w-5 h-5" />
  </TouchTarget>
</div>
```

### Custom Size
```tsx
<TouchTarget minSize={48} onClick={handleAction}>
  <SmallIcon />
</TouchTarget>
```

---

## 🤏 Gesture Hooks

### Swipe Gestures
```tsx
import { useSwipe } from '@/hooks/useGestures';

const swipeHandlers = useSwipe({
  onSwipeLeft: () => nextItem(),
  onSwipeRight: () => prevItem(),
  threshold: 100,
});

<div {...swipeHandlers} className="swipeable-container">
  <Content />
</div>
```

### Long Press
```tsx
import { useLongPress } from '@/hooks/useGestures';

const longPressHandlers = useLongPress({
  onLongPress: () => showContextMenu(),
  delay: 500,
});

<div {...longPressHandlers}>
  Long press for options
</div>
```

### Drag
```tsx
import { useDrag } from '@/hooks/useGestures';

const { dragState, startDrag, updateDrag, endDrag } = useDrag();

<div
  onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
  onMouseMove={(e) => updateDrag(e.clientX, e.clientY)}
  onMouseUp={endDrag}
  style={{
    transform: `translate(${dragState.offset.x}px, ${dragState.offset.y}px)`
  }}
>
  Draggable element
</div>
```

---

## 🎨 CSS Utilities

### Safe Areas
```tsx
// Respect device notches
<div className="safe-area-inset">
  Content
</div>

// Individual sides
<div className="safe-area-top safe-area-bottom">
  Content
</div>
```

### Mobile-Only Classes
```tsx
// Hide on mobile
<div className="mobile-hidden">Desktop only</div>

// Stack on mobile
<div className="mobile-stack">
  <Card>1</Card>
  <Card>2</Card>
</div>

// Full width on mobile
<div className="mobile-full-width">Content</div>

// Compact padding on mobile
<div className="mobile-compact">Content</div>
```

### Animations
```tsx
// Spring animation
<div className="spring-in">Animated content</div>

// Bounce
<div className="bounce-in">Animated content</div>

// Slide from sides
<div className="slide-in-left">From left</div>
<div className="slide-in-right">From right</div>
<div className="slide-in-bottom">From bottom</div>
```

### Gesture Feedback
```tsx
// Ripple effect
<button className="ripple">Click me</button>

// Press feedback
<button className="press-feedback">Press me</button>
```

---

## 📐 Common Patterns

### Mobile Action Sheet
```tsx
function NoteOptionsSheet({ note, isOpen, onClose }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Options">
      <div className="space-y-2">
        <Button variant="ghost" fullWidth icon={Share2}>
          Share
        </Button>
        <Button variant="ghost" fullWidth icon={Download}>
          Export
        </Button>
        <Button variant="danger" fullWidth icon={Trash}>
          Delete
        </Button>
      </div>
    </BottomSheet>
  );
}
```

### Pull-to-Refresh List
```tsx
function RefreshableList() {
  const [data, setData] = useState([]);

  return (
    <PullToRefresh
      onRefresh={async () => {
        const fresh = await fetchData();
        setData(fresh);
      }}
    >
      <div className="space-y-2">
        {data.map(item => (
          <Card key={item.id}>{item.title}</Card>
        ))}
      </div>
    </PullToRefresh>
  );
}
```

### Swipeable Card
```tsx
function SwipeCard({ item, onArchive, onDelete }) {
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => onDelete(item.id),
    onSwipeRight: () => onArchive(item.id),
    threshold: 100,
  });

  return (
    <div {...swipeHandlers} className="relative">
      <Card variant="interactive" padding="md">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </Card>
    </div>
  );
}
```

### Mobile FAB
```tsx
// Floating action button (auto-hides on desktop)
<button className="mobile-fab" onClick={handleCreate}>
  <Plus className="w-6 h-6" />
</button>
```

### Horizontal Scroll
```tsx
<div className="horizontal-scroll">
  {categories.map(cat => (
    <Badge key={cat} variant="primary">
      {cat}
    </Badge>
  ))}
</div>
```

### Sticky Bottom Bar
```tsx
<div className="mobile-sticky-bottom safe-area-bottom">
  <Button variant="primary" fullWidth>
    Save Changes
  </Button>
</div>
```

---

## 📱 Responsive Patterns

### Mobile vs Desktop Modal
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

{isMobile ? (
  <BottomSheet isOpen={isOpen} onClose={onClose}>
    <Content />
  </BottomSheet>
) : (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Content />
  </Modal>
)}
```

### Conditional Touch Targets
```tsx
// Only wrap in TouchTarget on mobile
{isMobile ? (
  <TouchTarget onClick={handleAction}>
    <Icon />
  </TouchTarget>
) : (
  <button onClick={handleAction}>
    <Icon />
  </button>
)}
```

---

## ⚡ Performance Tips

### Passive Event Listeners
```tsx
// Automatically handled in PullToRefresh
// For custom scroll handlers:
useEffect(() => {
  const handleScroll = () => { /* ... */ };
  
  element.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => element.removeEventListener('scroll', handleScroll);
}, []);
```

### Debounced Gestures
```tsx
import { debounce } from 'lodash';

const swipeHandlers = useSwipe({
  onSwipeLeft: debounce(() => handleSwipe(), 300),
  threshold: 50,
});
```

---

## ✅ Best Practices

### Touch Targets
- ✅ Minimum 44×44px (WCAG 2.1)
- ✅ Use TouchTarget for icons
- ✅ Add padding around small elements
- ❌ Don't rely on hover states

### Gestures
- ✅ Provide visual feedback
- ✅ Set appropriate thresholds
- ✅ Offer alternative access (buttons)
- ❌ Don't make gestures the only way

### Bottom Sheets
- ✅ Use for mobile-first UX
- ✅ Show drag handle
- ✅ Make dismissible
- ❌ Don't use on desktop (use modals)

### Pull-to-Refresh
- ✅ Use on scrollable content
- ✅ Show visual progress
- ✅ Handle async properly
- ❌ Don't use on static pages

---

**Need more details?** See `docs/UI_REFINEMENT_PHASE3.md`
