# 🎨 UI Components Visual Guide

A quick visual reference for all the new UI components in Phase 1.

---

## 🔘 Button Component

### Variants

```tsx
import Button from '@/components/ui/Button';
import { Save, Download, Trash2 } from 'lucide-react';
```

**Primary** - Main call-to-action
```tsx
<Button variant="primary">Save Note</Button>
<Button variant="primary" icon={Save}>Save Note</Button>
```
💡 Use for: Primary actions like Save, Submit, Create

**Secondary** - Secondary actions
```tsx
<Button variant="secondary">Cancel</Button>
<Button variant="secondary" icon={Download}>Export</Button>
```
💡 Use for: Secondary actions like Cancel, Close, Export

**Ghost** - Minimal styling
```tsx
<Button variant="ghost">View All</Button>
```
💡 Use for: Less prominent actions, icon buttons

**Success** - Positive actions
```tsx
<Button variant="success">Publish</Button>
```
💡 Use for: Publishing, completing, confirming

**Danger** - Destructive actions
```tsx
<Button variant="danger" icon={Trash2}>Delete</Button>
```
💡 Use for: Deleting, removing, destructive actions

### Sizes

```tsx
<Button size="sm">Small</Button>      // Compact UI, toolbars
<Button size="md">Medium</Button>     // Default, most common
<Button size="lg">Large</Button>      // Hero sections, CTAs
```

### States

```tsx
<Button disabled>Disabled</Button>
<Button isLoading>Saving...</Button>
<Button fullWidth>Full Width</Button>
```

---

## 🎴 Card Component

### Variants

**Default** - Standard card
```tsx
<Card variant="default" padding="md">
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</Card>
```
💡 Use for: General content containers

**Elevated** - More prominent
```tsx
<Card variant="elevated" padding="lg">
  <h3>Important Content</h3>
</Card>
```
💡 Use for: Highlighting important content

**Bordered** - Simple outline
```tsx
<Card variant="bordered" padding="md">
  <h3>Minimal Card</h3>
</Card>
```
💡 Use for: Minimal design, less visual weight

**Interactive** - Clickable
```tsx
<Card variant="interactive" padding="md" onClick={handleClick}>
  <h3>Click Me!</h3>
</Card>
```
💡 Use for: Clickable cards, note items, list items

### Padding Options

```tsx
<Card padding="none">   // No padding (custom content)
<Card padding="sm">     // Small padding (compact)
<Card padding="md">     // Medium padding (default)
<Card padding="lg">     // Large padding (spacious)
```

---

## 🏷️ Badge Component

### Variants

```tsx
import Badge from '@/components/ui/Badge';
```

**Default** - Neutral
```tsx
<Badge variant="default">Draft</Badge>
```

**Primary** - Accent color
```tsx
<Badge variant="primary">#markdown</Badge>
```
💡 Use for: Tags, categories

**Success** - Positive status
```tsx
<Badge variant="success">Published</Badge>
<Badge variant="success">✓ Saved</Badge>
```
💡 Use for: Success states, completion

**Warning** - Caution status
```tsx
<Badge variant="warning">⚠ Pending</Badge>
```
💡 Use for: Warnings, pending states

**Error** - Error status
```tsx
<Badge variant="error">✗ Failed</Badge>
```
💡 Use for: Errors, failed states

**Info** - Informational
```tsx
<Badge variant="info">ℹ Info</Badge>
```
💡 Use for: Information, tips

### Removable Badges

```tsx
<Badge variant="primary" removable onRemove={() => console.log('Removed')}>
  #tag
</Badge>
```
💡 Use for: Tags that can be removed, filters

### Sizes

```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

---

## 📝 Input Component

### Basic Usage

```tsx
import Input from '@/components/ui/Input';
import { FileText, Search, Mail } from 'lucide-react';
```

**With Label**
```tsx
<Input
  label="Note Title"
  placeholder="Enter title..."
  fullWidth
/>
```

**With Icon**
```tsx
<Input
  label="Search"
  icon={Search}
  iconPosition="left"
  placeholder="Search notes..."
/>
```

**With Helper Text**
```tsx
<Input
  label="Email"
  icon={Mail}
  helperText="We'll never share your email"
  placeholder="you@example.com"
/>
```

**With Error**
```tsx
<Input
  label="Title"
  error="Title is required"
  variant="error"
/>
```

### Sizes

```tsx
<Input inputSize="sm" placeholder="Small" />
<Input inputSize="md" placeholder="Medium" />
<Input inputSize="lg" placeholder="Large" />
```

---

## 🔔 Alert Component

### Variants

```tsx
import Alert from '@/components/ui/Alert';
```

**Info** - Informational messages
```tsx
<Alert variant="info" title="Tip">
  You can use Ctrl+K to open the command palette.
</Alert>
```

**Success** - Success messages
```tsx
<Alert variant="success" title="Success!">
  Your note has been saved successfully.
</Alert>
```

**Warning** - Warning messages
```tsx
<Alert variant="warning" title="Warning">
  This action cannot be undone.
</Alert>
```

**Error** - Error messages
```tsx
<Alert variant="error" title="Error">
  Failed to save note. Please try again.
</Alert>
```

### Dismissible

```tsx
<Alert 
  variant="info" 
  dismissible 
  onDismiss={() => console.log('Dismissed')}
>
  This alert can be dismissed.
</Alert>
```

---

## 💬 Tooltip Component

### Basic Usage

```tsx
import Tooltip from '@/components/ui/Tooltip';
```

**Top (default)**
```tsx
<Tooltip content="Save your work">
  <Button variant="ghost" icon={Save} />
</Tooltip>
```

**Different Positions**
```tsx
<Tooltip content="Save" position="top">
  <Button icon={Save} />
</Tooltip>

<Tooltip content="Delete" position="bottom">
  <Button icon={Trash} />
</Tooltip>

<Tooltip content="Export" position="left">
  <Button icon={Download} />
</Tooltip>

<Tooltip content="Settings" position="right">
  <Button icon={Settings} />
</Tooltip>
```

💡 **Note:** Pure CSS implementation - lightweight and performant!

---

## 🎨 Design Tokens

### Spacing

```tsx
style={{ padding: 'var(--space-4)' }}      // 16px
style={{ margin: 'var(--space-2)' }}       // 8px
style={{ gap: 'var(--space-3)' }}          // 12px
```

**Available:** `--space-0` through `--space-24`

### Colors

```tsx
// Primary accent
style={{ color: 'var(--accent-primary)' }}
style={{ backgroundColor: 'var(--accent-primary-light)' }}

// Semantic colors
style={{ color: 'var(--color-success)' }}
style={{ color: 'var(--color-warning)' }}
style={{ color: 'var(--color-error)' }}
style={{ color: 'var(--color-info)' }}
```

### Shadows

```tsx
style={{ boxShadow: 'var(--shadow-sm)' }}   // Subtle
style={{ boxShadow: 'var(--shadow-md)' }}   // Medium
style={{ boxShadow: 'var(--shadow-lg)' }}   // Large
style={{ boxShadow: 'var(--shadow-xl)' }}   // Extra large
```

### Border Radius

```tsx
style={{ borderRadius: 'var(--radius-sm)' }}   // 4px
style={{ borderRadius: 'var(--radius-md)' }}   // 8px
style={{ borderRadius: 'var(--radius-lg)' }}   // 12px
style={{ borderRadius: 'var(--radius-xl)' }}   // 16px
style={{ borderRadius: 'var(--radius-full)' }} // Pill shape
```

---

## 🎯 Common Patterns

### Action Bar

```tsx
<div className="flex items-center gap-2">
  <Button variant="primary" icon={Save}>Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="ghost" icon={MoreVertical} />
</div>
```

### Status Display

```tsx
<div className="flex items-center gap-2">
  <span>Status:</span>
  <Badge variant="success">Published</Badge>
  <Badge variant="primary">#markdown</Badge>
  <Badge variant="default">3 min read</Badge>
</div>
```

### Form Field

```tsx
<div className="space-y-4">
  <Input
    label="Title"
    placeholder="Enter note title..."
    fullWidth
  />
  <Input
    label="Tags"
    icon={Hash}
    placeholder="Add tags..."
    helperText="Separate tags with commas"
    fullWidth
  />
</div>
```

### Card with Actions

```tsx
<Card variant="interactive" padding="lg">
  <div className="flex justify-between items-start mb-4">
    <div>
      <h3 className="font-semibold text-lg">Note Title</h3>
      <p className="text-sm opacity-60">Last edited 2 hours ago</p>
    </div>
    <Badge variant="success">Published</Badge>
  </div>
  
  <p className="mb-4">Note content goes here...</p>
  
  <div className="flex gap-2">
    <Button size="sm" variant="primary">Edit</Button>
    <Button size="sm" variant="secondary">Share</Button>
    <Button size="sm" variant="ghost">More</Button>
  </div>
</Card>
```

### Notification

```tsx
<Alert variant="info" title="New Feature!" dismissible>
  Check out our new AI-powered writing assistant.
  <Button variant="ghost" size="sm" className="mt-2">
    Learn More
  </Button>
</Alert>
```

---

## 📱 Responsive Usage

All components are responsive by default:

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-2">
  <Button fullWidth>Action 1</Button>
  <Button fullWidth>Action 2</Button>
</div>

// Full width on mobile
<Card className="w-full md:w-auto">
  Content
</Card>

// Smaller on mobile
<Button size="sm" className="md:size-md">
  Responsive Button
</Button>
```

---

## 🎨 Styling Classes Available

### Enhanced Sidebar
- `.sidebar-section` - Section container
- `.sidebar-note-item` - Note item with hover effects
- `.sidebar-note-item.active` - Active note indicator
- `.sidebar-stat-grid` - Stats display grid

### Modal Improvements
- `.modal-overlay` - Backdrop with blur
- `.modal-container` - Modal positioning
- `.modal-content` - Modal box
- `.modal-header` - Header section
- `.modal-body` - Content area
- `.modal-footer` - Action buttons area

### Status Bar
- `.status-bar` - Status bar container
- `.status-bar-indicator` - Status dot
- `.status-bar-indicator.saving` - Pulsing save indicator

---

## 💡 Best Practices

### Button Usage
- ✅ Use `primary` for main actions (max 1 per view)
- ✅ Use `secondary` for alternative actions
- ✅ Use `ghost` for less important actions
- ✅ Always include icon for clarity when possible
- ✅ Use `isLoading` state during async operations

### Card Usage
- ✅ Use `interactive` variant for clickable cards
- ✅ Use `elevated` to draw attention
- ✅ Keep padding consistent within the same view
- ✅ Use `padding="none"` for custom layouts

### Badge Usage
- ✅ Use semantic variants (success, warning, error)
- ✅ Keep text short (1-2 words max)
- ✅ Use `removable` for filters/tags
- ✅ Group related badges together

### Input Usage
- ✅ Always include labels for accessibility
- ✅ Use icons for visual clarity
- ✅ Show error messages inline
- ✅ Use helper text for guidance

### Alert Usage
- ✅ Place at top of relevant section
- ✅ Use appropriate variant for message type
- ✅ Keep messages concise
- ✅ Make dismissible when appropriate

---

## 🚀 Quick Migration

### Before (old style)
```tsx
<button className="px-3 py-1.5 bg-blue-500 text-white rounded">
  Save
</button>
```

### After (new component)
```tsx
<Button variant="primary" icon={Save}>
  Save
</Button>
```

### Benefits
- ✅ Consistent styling
- ✅ Built-in states (loading, disabled, hover)
- ✅ Accessibility (focus, ARIA)
- ✅ Dark mode support
- ✅ Responsive sizing

---

**Happy coding!** 🎉

For more examples, check out `src/components/examples/UIShowcase.tsx`
