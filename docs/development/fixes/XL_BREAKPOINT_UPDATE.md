# Responsive Breakpoint Update - XL Breakpoint for Right Panel

## Change Summary
Updated the adaptive responsive breakpoint logic to use `xl:` (1280px) instead of `lg:` (1024px) when the right panel is open and expanded.

## Reasoning

### Space Requirements Calculation
When both sidebars are visible on desktop:

| Element | Width | Breakpoint Appears |
|---------|-------|-------------------|
| Left Sidebar | 320px | `lg:` (1024px+) |
| Right Panel (expanded) | 384px | Any |
| Content Area (minimum) | ~500px | - |
| Button spacing | ~76px | - |
| **Total Minimum** | **~1280px** | - |

### Why XL (1280px)?
- At 1024px-1279px with **both panels open**, there's insufficient horizontal space
- The left sidebar appears at 1024px (lg:), taking 320px
- The right panel takes 384px when expanded
- This leaves only ~320px for content + buttons = **crowded/collision**
- Using `xl:` (1280px) ensures adequate space for all elements

## Implementation

### Before
```typescript
const shouldUseLargerBreakpoint = isRightPanelOpen && !isRightPanelCollapsed;
const desktopShowClass = shouldUseLargerBreakpoint ? 'hidden lg:flex' : 'hidden md:flex';
const mobileShowClass = shouldUseLargerBreakpoint ? 'lg:hidden' : 'md:hidden';
```

### After
```typescript
const shouldUseLargerBreakpoint = isRightPanelOpen && !isRightPanelCollapsed;
const desktopShowClass = shouldUseLargerBreakpoint ? 'hidden xl:flex' : 'hidden md:flex';
const mobileShowClass = shouldUseLargerBreakpoint ? 'xl:hidden' : 'md:hidden';
```

## Behavior Matrix

| Screen Width | Left Sidebar | Right Panel | Button Display |
|-------------|--------------|-------------|----------------|
| < 768px | Hidden (mobile) | Any state | Dropdowns |
| 768px - 1023px | Hidden | Closed | Individual buttons |
| 768px - 1023px | Hidden | **Open** | **Dropdowns** (adaptive) |
| 1024px - 1279px | **Visible** | Closed | Individual buttons |
| 1024px - 1279px | **Visible** | **Open** | **Dropdowns** (adaptive) |
| ≥ 1280px | Visible | Any state | Individual buttons |

## Files Modified
1. **src/components/MainContent.tsx**
   - Updated breakpoint logic from `lg:` to `xl:`
   - Added detailed comment explaining space calculation

2. **src/components/EditorModeToggle.tsx**
   - Updated breakpoint logic from `lg:` to `xl:`
   - Added detailed comment explaining space calculation

3. **docs/development/fixes/ADAPTIVE_RESPONSIVE_BREAKPOINTS.md**
   - Updated documentation with new breakpoint values
   - Added space calculation explanation
   - Updated behavior table and test scenarios

## Testing Scenarios

### ✅ Test Case 1: Mobile (< 768px)
- **Expected**: Dropdowns visible, regardless of panel state
- **Result**: ✓ Pass

### ✅ Test Case 2: Tablet (768-1023px), Right Panel Closed
- **Expected**: Individual buttons visible
- **Result**: ✓ Pass

### ✅ Test Case 3: Tablet (768-1023px), Right Panel Open
- **Expected**: Dropdowns visible (adaptive)
- **Result**: ✓ Pass

### ✅ Test Case 4: Small Desktop (1024-1279px), Both Panels Open
- **Expected**: Dropdowns visible (prevents collision)
- **Result**: ✓ Pass

### ✅ Test Case 5: Desktop (≥ 1280px)
- **Expected**: Individual buttons visible, adequate space
- **Result**: ✓ Pass

## User Experience Impact

### Before (lg: 1024px)
- ❌ At 1024-1279px with both panels open: buttons collided
- ❌ Inconsistent spacing, poor UX
- ❌ Inadequate room for left sidebar + right panel + content

### After (xl: 1280px)
- ✅ At 1024-1279px with both panels open: dropdowns prevent collision
- ✅ Consistent spacing at all viewport sizes
- ✅ Adequate room for all elements with proper spacing
- ✅ Smooth, predictable responsive behavior

## Commit Message Template
```
fix: Update responsive breakpoint to xl (1280px) for right panel

When right panel is open and expanded, use xl: breakpoint instead of lg:
to account for combined width of left sidebar (320px at lg:) + right
panel (384px) + content area (~500px). Total minimum ~1204px, using xl:
(1280px) provides adequate spacing.

Fixes button collision at 1024-1279px screen widths when both sidebars
are visible.

Files modified:
- src/components/MainContent.tsx
- src/components/EditorModeToggle.tsx
- docs/development/fixes/ADAPTIVE_RESPONSIVE_BREAKPOINTS.md
```

## Related Documentation
- [Adaptive Responsive Breakpoints](./ADAPTIVE_RESPONSIVE_BREAKPOINTS.md)
- [Mobile Editor Mode Toggle](../MOBILE_EDITOR_MODE_TOGGLE.md)
- [Mobile Editor Options Dropdown](../MOBILE_EDITOR_OPTIONS_DROPDOWN.md)
