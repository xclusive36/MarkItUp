# Theme Creator Plugin - User Guide 🎨

## Overview
The Theme Creator plugin allows you to create, customize, and manage custom themes for MarkItUp with a visual editor, preset themes, and accessibility checking.

## How to Access

### Method 1: Theme Button (Recommended)
- Look for the **🎨 Themes** button in the top toolbar (next to the Markdown/WYSIWYG toggle)
- Click it to open the Theme Creator modal

### Method 2: Keyboard Shortcut
- Press `Ctrl+Shift+T` (Command+Shift+T on Mac)

### Method 3: Command Palette (if available)
- Open the command palette
- Search for "Open Theme Creator"

## Features

### 1. Preset Themes Tab
Choose from 8 professionally designed themes:
- **Dracula** - Dark theme with vibrant colors
- **Nord** - Arctic, north-bluish color palette
- **Tokyo Night** - Clean dark theme inspired by Tokyo's night
- **GitHub Light** - Clean and professional light theme
- **Solarized Dark** - Precision colors for machines and people
- **Monokai** - Smooth colors for a retro feeling
- **Gruvbox Dark** - Retro groove color scheme
- **One Dark** - Iconic Atom editor dark theme

Click any preset to instantly apply and start customizing it.

### 2. Colors Tab
Customize 30+ color properties:
- **Background Colors**: Primary, Secondary, Tertiary
- **Text Colors**: Primary, Secondary, Muted
- **Accent Colors**: Primary, Secondary, Hover states
- **Status Colors**: Success, Warning, Error, Info
- **Syntax Highlighting**: Keywords, Strings, Comments, Numbers, Functions, Variables

Each color has:
- Visual color picker
- HEX input field
- Recent colors (last 12 used)
- Suggested color palette (32 common colors)

**Contrast Checker** (expandable):
- Shows WCAG contrast ratio
- AA/AAA compliance status
- Accessibility rating

### 3. Typography Tab
Customize text appearance:
- **Font Families**: Base, Heading, Monospace
- **Font Size**: 12-18px (slider)
- **Line Height**: 1.2-2.0 (slider)
- **Letter Spacing**: -2 to 2px (slider)

### 4. Layout Tab
Adjust UI spacing and effects:
- **Border Radius**: 0-16px (slider)
- **Shadow Intensity**: None, Subtle, Medium, Strong (dropdown)
- **Padding Scale**: 0.8-1.4 (slider)

### 5. Manage Tab
View and manage your saved themes:
- See all custom themes you've created
- **Load** button - Apply a saved theme
- **Delete** button - Remove a theme

## Actions

### Apply Theme
- Click **Apply Theme** button (green, bottom right)
- Theme changes are applied immediately
- Does NOT save the theme (use Save for that)

### Save Theme
- Enter a name in the theme name field at the top
- Click **Save Theme** button (blue, bottom right)
- Theme is saved to localStorage
- Can be loaded later from the Manage tab

### Export Theme
- Click **Export** button (gray, bottom left)
- Downloads a JSON file with your theme
- Share with others or backup your themes

### Import Theme
- Click **Import** button (gray, bottom left)
- Select a .json theme file
- Theme is loaded and applied instantly

## Tips

1. **Start with a Preset**: Choose a preset theme close to your desired look, then customize
2. **Check Contrast**: Use the contrast checker to ensure text is readable
3. **Save Often**: Save variations as you experiment
4. **Export Favorites**: Export your best themes as backup
5. **Recent Colors**: Click recent colors for quick access to colors you've used

## Keyboard Shortcuts

- `Ctrl+Shift+T` - Open Theme Creator
- `Esc` - Close Theme Creator (when X is clicked)

## Technical Details

- **Storage**: Themes saved to browser's localStorage
- **Format**: JSON (version 1.0)
- **Compatibility**: Works with existing dark/light theme system
- **Accessibility**: Built-in WCAG contrast checking

## Troubleshooting

**Q: Theme Creator won't open**
- Ensure the Theme Creator plugin is loaded in Plugin Manager
- Try refreshing the page
- Check browser console for errors

**Q: Saved themes disappeared**
- Themes are stored in localStorage - clearing browser data removes them
- Export important themes as backup

**Q: Colors not applying**
- Click "Apply Theme" button after making changes
- Some colors may require page refresh

**Q: Import fails**
- Ensure the file is a valid theme JSON export
- Check that it's a .json file
- Verify the file wasn't corrupted

## Future Enhancements (Planned)

- Cloud sync for themes
- Community theme sharing
- More preset themes
- Advanced color tools (gradients, patterns)
- Theme preview before applying
- Undo/redo for theme changes

---

**Plugin Version**: 1.0.0  
**Last Updated**: October 14, 2025
