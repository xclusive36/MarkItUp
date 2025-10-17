# Table of Contents V2.0 - Quick Start Guide

Get started with the enhanced Table of Contents plugin in 2 minutes!

## ⚡ Quick Actions

### Open Document Outline

**Keyboard:** `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)

**What you get:**

- Live sidebar showing all headings
- Click any heading to jump there
- Collapsible sections
- Word counts per section
- Real-time stats

### Insert Table of Contents

**Keyboard:** `Ctrl+Shift+O` (Windows/Linux) or `Cmd+Shift+O` (Mac)

**What happens:**

- TOC generated at cursor position
- Clickable links to all sections
- Auto-numbered (or styled)
- Respects your settings

### Check Document Structure

**Command Palette:** "Show Document Structure Stats"

**What you see:**

- Total headings count
- Word count analysis
- Structure warnings
- Quality feedback

## 🎨 Choose Your TOC Style

Go to **Settings → Plugins → Table of Contents**

Set **TOC Style** to one of:

- `numbered` - Classic numbered TOC (1.1.2, etc.)
- `simple` - Clean bullet list
- `detailed` - With word counts and line numbers
- `emoji` - Fun with icons (📚 📖 📝)

## 📋 Using the Document Outline

### Open the Outline

1. Press `Ctrl+Shift+L`
2. Outline appears on the right side
3. Shows all headings in your document

### Navigate with Clicks

1. Click any heading in the outline
2. Editor jumps to that section
3. Outline highlights current section

### View Statistics

1. Click the **📊** icon in outline header
2. See heading counts, word stats
3. Check heading distribution

### Collapse Sections

1. Click the **▼** arrow next to headings
2. Children hide
3. Click **▶** to expand again

### Close the Outline

1. Press `Ctrl+Shift+L` again
2. Or click outside the outline

## 💡 Pro Tips

### Best Practices

- **Use one H1** as your document title
- **Don't skip levels** (H1 → H2 → H3, not H1 → H3)
- **Keep nesting shallow** (H1-H4 is ideal)
- **Use TOC for 3+ headings**

### Power User Shortcuts

- `Ctrl+Shift+O` - Insert TOC
- `Ctrl+Shift+U` - Update existing TOC
- `Ctrl+Shift+R` - Remove TOC
- `Ctrl+Shift+L` - Toggle outline

### Settings to Try

**For minimalists:**

- `tocStyle: "simple"`
- `showOutlineWordCounts: false`
- `includeNumbers: false`

**For power users:**

- `tocStyle: "detailed"`
- `showOutlineWordCounts: true`
- `showOutlineLineNumbers: true`

**For visual thinkers:**

- `tocStyle: "emoji"`
- `showOutlineWordCounts: true`

## 🔧 Common Tasks

### Adding TOC to Multiple Notes

1. Open first note
2. `Ctrl+Shift+O` to insert
3. Save note
4. Open next note
5. Repeat

### Updating Old TOCs

1. Open note with old TOC
2. `Ctrl+Shift+U` to update
3. TOC refreshed with current headings

### Fixing Structure Issues

1. Run "Show Document Structure Stats"
2. Read warnings
3. Fix heading levels
4. Re-check with outline view

### Working with Long Documents

1. Open outline with `Ctrl+Shift+L`
2. Keep it open while editing
3. Click headings to jump around
4. Collapse sections you're not working on

## 🎯 Example Workflow

**Writing a blog post:**

```markdown
# My Blog Post Title

[Write introduction here]

<!-- TOC -->
## 📑 Table of Contents
- 📚 Introduction
- 📚 Main Points
  - 📖 Point 1
  - 📖 Point 2
- 📚 Conclusion
<!-- TOC -->

## Introduction
...

## Main Points

### Point 1
...

### Point 2
...

## Conclusion
...
```

**Steps:**

1. Write your headings first
2. Press `Ctrl+Shift+L` to see outline
3. Navigate between sections
4. When ready, `Ctrl+Shift+O` to insert TOC
5. Choose emoji style for visual appeal
6. Save and publish!

## 📊 Understanding Structure Stats

When you run "Show Document Structure Stats", you'll see:

```
📊 Document Structure Analysis

📋 Total Headings: 12
📝 Total Words in Sections: 2,450
📏 Average Words per Section: 204
🎯 Deepest Level: H3

📈 Heading Distribution:
  H1: 1
  H2: 5
  H3: 6

✅ Document structure looks good!
```

**What to look for:**

- **One H1** ✅
- **Balanced distribution** (more H2s than H3s than H4s) ✅
- **No skipped levels** ✅
- **Max depth H1-H4** ✅

**Warning examples:**

- ⚠️ Multiple H1 headings → Pick one title
- ⚠️ Skipped levels (H1 → H3) → Add H2
- ⚠️ Deep nesting (H6) → Simplify structure

## 🎨 TOC Style Examples

### Numbered (Default)

```markdown
## 📑 Table of Contents

- 1. Getting Started
  - 1.1. Installation
  - 1.2. Configuration
- 2. Usage Guide
  - 2.1. Basic Features
  - 2.2. Advanced Features
```

### Simple

```markdown
## Table of Contents

- Getting Started
  - Installation
  - Configuration
- Usage Guide
  - Basic Features
  - Advanced Features
```

### Detailed

```markdown
## 📋 Table of Contents

- Getting Started *(245 words)* *[Line 5]*
  - Installation *(120 words)* *[Line 12]*
  - Configuration *(125 words)* *[Line 30]*
- Usage Guide *(380 words)* *[Line 48]*
  - Basic Features *(190 words)* *[Line 55]*
  - Advanced Features *(190 words)* *[Line 80]*
```

### Emoji

```markdown
## 📑 Table of Contents

- 📚 Getting Started
  - 📖 Installation
  - 📖 Configuration
- 📚 Usage Guide
  - 📖 Basic Features
  - 📖 Advanced Features
```

## ❓ Troubleshooting

### Outline not showing?

- Press `Ctrl+Shift+L` to toggle
- Check if document has headings
- Try refreshing with "Refresh Document Outline"

### TOC wrong style?

- Check Settings → Table of Contents → TOC Style
- Delete old TOC and re-insert
- Make sure you saved settings

### Navigation not working?

- Ensure headings use proper markdown (`#`, `##`, `###`)
- No headings inside code blocks
- Check for special characters in headings

### Word counts seem wrong?

- Click refresh icon in outline
- Make sure content is saved
- Word counts exclude code blocks

## 🚀 Next Steps

**Explore more:**

- Try all 4 TOC styles
- Analyze structure of existing notes
- Use outline for long documents
- Customize settings to your workflow

**Learn more:**

- Read full changelog: `TOC_V2_CHANGELOG.md`
- Check plugin settings for all options
- Experiment with keyboard shortcuts

**Share feedback:**

- What TOC style do you prefer?
- How do you use the outline view?
- What features would you like in V2.1?

---

**Need help?** Check the main documentation or run "Show Document Structure Stats" to validate your markdown!

**Version:** 2.0.0  
**Status:** Ready to use!  
**Have fun organizing your knowledge! 📚**
