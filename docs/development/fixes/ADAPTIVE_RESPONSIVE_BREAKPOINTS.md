# Adaptive Responsive Breakpoints Fix

## Problem
When the right side panel was open and expanded (~384px width), the editor control buttons (Edit/Preview/Split and Markdown/WYSIWYG/Themes) were colliding and touching each other on tablet-sized screens. The static `md:` breakpoint (768px) didn't account for the reduced horizontal space when the right panel was visible.

## Solution
Implemented adaptive responsive breakpoints that adjust based on the right panel state:

- **When right panel is closed or collapsed**: Use standard `md:` breakpoint (768px)
- **When right panel is open and expanded**: Use larger `xl:` breakpoint (1280px)

This accounts for the combined space requirements:
- Left sidebar: 320px (visible at `lg:` 1024px+)
- Right panel: 384px (when expanded)
- Content area: ~500px minimum
- **Total minimum: ~1204px** → using `xl:` (1280px) provides adequate buffer

## Implementation

### 1. Props Chain
Added right panel state props through the component hierarchy:

```
page.tsx 
  → MainPanel (isRightPanelOpen, isRightPanelCollapsed)
    → MainContent (isRightPanelOpen, isRightPanelCollapsed)
      → EditorModeToggle (isRightPanelOpen, isRightPanelCollapsed)
```

### 2. Dynamic Breakpoint Classes

#### MainContent.tsx
```typescript
// Determine which breakpoint to use based on right panel state
const shouldUseLargerBreakpoint = isRightPanelOpen && !isRightPanelCollapsed;
const desktopShowClass = shouldUseLargerBreakpoint ? 'hidden xl:flex' : 'hidden md:flex';
const mobileShowClass = shouldUseLargerBreakpoint ? 'xl:hidden' : 'md:hidden';
```

Applied to:
- Markdown/WYSIWYG toggle button (desktop)
- Theme Creator button (desktop)
- Editor options dropdown (mobile)

#### EditorModeToggle.tsx
```typescript
// Determine which breakpoint to use based on right panel state
const shouldUseLargerBreakpoint = isRightPanelOpen && !isRightPanelCollapsed;
const desktopShowClass = shouldUseLargerBreakpoint ? 'hidden xl:inline-flex' : 'hidden md:inline-flex';
const mobileShowClass = shouldUseLargerBreakpoint ? 'xl:hidden' : 'md:hidden';
```

Applied to:
- Desktop button group (Edit/Preview/Split)
- Mobile dropdown menu

### 3. Files Modified

1. **src/components/MainPanel.tsx**
   - Added `isRightPanelOpen` and `isRightPanelCollapsed` to `MainPanelProps` interface
   - Destructured props with default values
   - Passed props to `MainContent` component

2. **src/components/MainContent.tsx**
   - Added `isRightPanelOpen` and `isRightPanelCollapsed` to `MainContentProps` interface
   - Implemented dynamic breakpoint logic
   - Applied adaptive classes to desktop and mobile UI elements
   - Passed props to `EditorModeToggle` component

3. **src/components/EditorModeToggle.tsx**
   - Added `isRightPanelOpen` and `isRightPanelCollapsed` to `EditorModeToggleProps` interface
   - Implemented dynamic breakpoint logic
   - Applied adaptive classes to button group and dropdown

4. **src/app/page.tsx** (already had the state)
   - State tracked: `isRightPanelOpen` and `isRightPanelCollapsed`
   - Props passed to `MainPanel` component

## Behavior

### Responsive Breakpoints

| Screen Size | Right Panel State | Breakpoint | Behavior |
|------------|-------------------|------------|----------|
| < 768px | Any | Mobile | Always show dropdowns |
| 768px - 1279px | Closed/Collapsed | Desktop | Show individual buttons |
| 768px - 1279px | Open/Expanded | Mobile | Show dropdowns (adaptive) |
| ≥ 1280px | Any | Desktop | Always show individual buttons |

### Visual Effect
- **Desktop mode**: Individual buttons displayed in toolbar
- **Mobile mode**: Compact dropdowns with three-dot menus

## Testing
Test on various screen widths with right panel in different states:

1. **Mobile (< 768px)**: Always dropdowns ✓
2. **Tablet (768-1279px) + right panel closed**: Individual buttons ✓
3. **Tablet/Small Desktop (768-1279px) + right panel open**: Dropdowns to prevent collision ✓
4. **Desktop (≥ 1280px)**: Always individual buttons ✓

The `xl:` breakpoint (1280px) accounts for:
- Left sidebar (320px) appears at `lg:` (1024px)
- Right panel (384px when expanded)
- Minimum content area (~500px)
- Adequate spacing for buttons (~76px)

## Benefits
1. **No button collision**: Adequate space maintained in all panel configurations
2. **Context-aware UI**: Responsive design adapts to available horizontal space
3. **Better UX**: Smooth transitions between mobile and desktop layouts
4. **Maintainable**: Centralized breakpoint logic based on panel state

## Related Files
- Mobile Editor Mode Toggle: `docs/development/MOBILE_EDITOR_MODE_TOGGLE.md`
- Mobile Editor Options Dropdown: `docs/development/MOBILE_EDITOR_OPTIONS_DROPDOWN.md`
- Layout Enhancements: `docs/LAYOUT_ENHANCEMENTS.md`

## Future Considerations
Could extend this pattern to other responsive UI elements that need to adapt based on sidebar visibility (left or right).
