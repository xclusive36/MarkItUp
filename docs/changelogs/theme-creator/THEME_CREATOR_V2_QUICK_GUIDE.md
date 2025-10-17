# Theme Creator v2.0 - Quick Reference Guide

## 🚀 What's New

### 1. Live Preview Tab
- **New Tab:** Click "Preview" (2nd tab)
- **See It Live:** Changes update instantly—no need to click "Apply"
- **Accessibility:** Built-in contrast checker shows WCAG compliance

### 2. Undo/Redo
- **Keyboard:** `Ctrl+Z` to undo, `Ctrl+Y` to redo
- **Buttons:** ↶ Undo and ↷ Redo buttons below theme name
- **History:** Last 20 changes tracked

### 3. Better Notifications
- **No More Alerts:** Smooth toast notifications (bottom-right)
- **Auto-dismiss:** Disappears after 3 seconds
- **Color-coded:** Green (success), Blue (info), Red (error)

---

## 📖 How to Use

### Quick Start
1. Press `Ctrl+Shift+T` or click 🎨 Themes button
2. Choose a preset from "Presets" tab OR start customizing
3. Click "Preview" tab to see your theme in action
4. Modify colors in "Colors" tab
5. Watch Preview update in real-time
6. Made a mistake? Press `Ctrl+Z` to undo
7. Happy with it? Click "Save Theme"

### Preview Tab Features

**Left Column - Live Preview:**
- Sidebar with files
- Main content with headings & text
- Buttons (primary & secondary)
- Code block with syntax colors
- Status messages (success, error, warning, info)

**Right Column - Accessibility:**
- Contrast checks for:
  - Body text
  - Sidebar text
  - Button text
  - Link text
- WCAG AA/AAA pass/fail
- Color swatches
- Theme statistics

### Undo/Redo

**When to Use:**
- Experimented with colors and want to go back
- Accidentally changed the wrong setting
- Want to compare different versions

**How to Use:**
- `Ctrl+Z` - Undo last change
- `Ctrl+Y` - Redo undone change
- `Ctrl+Shift+Z` - Alternative redo
- Or click the ↶ Undo / ↷ Redo buttons

**Tips:**
- History saves up to 20 changes
- Counter shows your position (e.g., "5 / 12")
- Loading a preset clears history (starts fresh)

---

## 🎨 Workflow Tips

### Best Practices

**1. Start with Preview**
```
Presets → Preview → Colors → Preview → Adjust → Preview
```
Constantly switch between Preview and Colors tabs

**2. Check Accessibility**
- Aim for contrast ratio ≥ 4.5:1 (WCAG AA)
- Green borders = good contrast
- Red borders = poor contrast (fix it!)

**3. Use Undo Freely**
- Don't be afraid to experiment
- Easy to undo if you don't like it
- Try bold colors, then dial back

**4. Save Variations**
- Save "Theme Dark v1"
- Make changes
- Save "Theme Dark v2"
- Compare them later

---

## ⌨️ Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Open Theme Creator | `Ctrl+Shift+T` | `Cmd+Shift+T` |
| Undo | `Ctrl+Z` | `Cmd+Z` |
| Redo | `Ctrl+Y` or `Ctrl+Shift+Z` | `Cmd+Y` or `Cmd+Shift+Z` |

---

## 🔍 Preview Components Explained

### Sidebar Preview
Shows how folder/file lists will look with your colors

### Main Content Preview
- **Heading 1:** Uses heading font family
- **Heading 2:** Secondary heading color
- **Paragraph:** Body text with line height
- **Link:** Link color with hover state
- **Muted Text:** Less important text

### Button Preview
- **Primary Button:** Main action color
- **Secondary Button:** Alternative action

### Code Preview
Shows syntax highlighting colors:
- Keywords (function, const, return)
- Strings ("Hello World")
- Comments (// This is...)
- Numbers (42)
- Functions (example)
- Variables (message)

### Status Messages
Success/Error/Warning/Info notifications

---

## 🎯 Common Tasks

### Task: Create a High-Contrast Theme
1. Open Preview tab
2. Set background to very dark (#000000)
3. Set text to white (#FFFFFF)
4. Check contrast in Accessibility panel
5. Should see "WCAG AAA: ✓ Pass"

### Task: Fix Contrast Issues
1. Go to Preview tab
2. Scroll to Accessibility Analysis
3. Find red-bordered items (poor contrast)
4. Click Colors tab
5. Adjust the colors shown in the contrast check
6. Return to Preview—should be green now

### Task: Match Brand Colors
1. Have brand color codes ready
2. Go to Colors tab
3. Set "Primary Accent" to brand primary
4. Set "Secondary Accent" to brand secondary
5. Check Preview tab
6. Adjust until it looks right

### Task: Compare Two Themes
1. Load Theme A
2. Note what you like/dislike
3. Make changes
4. Don't like it? Undo with `Ctrl+Z`
5. Or load Theme B and compare

---

## 💡 Pro Tips

1. **Use Recent Colors** - Click recent colors in color picker to reuse
2. **Check All Contrast Pairs** - Don't just check body text
3. **Test with Real Content** - Preview shows realistic examples
4. **Save Before Major Changes** - Save current version first
5. **Name Themes Descriptively** - "Blue Ocean Dark" better than "Theme 1"

---

## ⚠️ Things to Know

- **History Clears:** When you load a preset/theme, history resets
- **Max 20 Undo:** Can only go back 20 changes
- **Toast Auto-dismiss:** Notifications disappear after 3 seconds
- **Preview is Representative:** Actual app may vary slightly

---

## 🆘 Troubleshooting

**Q: Undo button is disabled**
- You're at the first state—nothing to undo

**Q: Changes aren't showing in preview**
- Make sure you're on the Preview tab
- Try refreshing the page

**Q: Toast notifications too fast**
- They auto-dismiss after 3 seconds
- Read message quickly or it'll disappear

**Q: Keyboard shortcuts not working**
- Make sure Theme Creator is open
- Shortcuts only work when modal is visible

---

## 📊 Before & After

### Old Workflow
1. Change color → Click Apply → See result
2. Don't like it? → Change again → Click Apply
3. Oops, went too far → Manually reset
4. Save → Alert popup blocks UI

**Result:** Slow, frustrating, many clicks

### New Workflow
1. Change color → See instantly in Preview
2. Don't like it? → Press Ctrl+Z
3. Like it? → Save → Smooth notification

**Result:** Fast, smooth, fewer clicks

---

**Version:** 2.0.0  
**Updated:** October 17, 2025  
**Status:** ✅ Production Ready
