# Global Search - Quick Reference Guide (V3)

**Fast access to comprehensive search with advanced features: Replace, Bulk Operations, Regex, Refinement & Smart Filters**

## Quick Start

### Open Global Search
**Keyboard:** `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)  
**Menu:** Click "Global Search" in the header  
**Command Palette:** `Ctrl+K` → "Search all notes"

## 🆕 What's New in V3

### Search & Replace 🔄
- Find and replace across all search results
- Preview changes before applying
- Works with regex patterns
- Batch update multiple notes

### Bulk Operations 📦
- Select multiple results with checkboxes
- Add tags to multiple notes at once
- Move notes to different folders
- Delete multiple notes (with confirmation)

### Regex Mode 🔍
- Advanced pattern matching
- Real-time validation
- Full JavaScript regex support
- Perfect for complex searches

### Search Refinement 🎯
- Filter current results without re-searching
- Preserves original results
- Quick secondary filtering
- Instant refinement

### Smart Filters 🧠
- Filter by word count range
- Show only untagged notes
- Show only orphan notes (no links)
- Content-based filtering

### Persistent Preferences 💾
- Sort order saved automatically
- Preview state remembered
- Search mode preference
- Filters state persisted

## Search Modes

### 🔍 Keyword Mode (Fast & Precise)
- **Best for:** Known terms, exact phrases
- **Speed:** Instant
- **Example:** "machine learning algorithm"

### 🧠 Semantic Mode (AI-Powered)
- **Best for:** Concepts, related topics
- **Speed:** ~1-2 seconds (first search downloads model)
- **Example:** "how computers learn" → finds "machine learning" notes

### ✨ Hybrid Mode (Recommended)
- **Best for:** Most searches
- **Combines:** Keyword precision + semantic understanding
- **Example:** Best overall results

### 🔧 Regex Mode (Power Users)
- **Best for:** Complex patterns, advanced searches
- **Features:** Full regex support, validation
- **Example:** `\b[A-Z]{2,}\b` → Find acronyms
- **Validation:** Shows errors in real-time

## New V3 Features

### Search & Replace

**Quick Access:** Click "Replace" button when results are shown

**Steps:**
1. Perform search for text to replace
2. Click "Replace" button
3. Enter replacement text
4. Click "Preview Changes" to see affected notes
5. Review match counts per note
6. Click "Replace in X notes" to apply

**Safety:**
- Always shows preview before replacing
- Displays exact match count
- Works with all search modes (including regex)

### Bulk Operations

**Quick Access:** Click "Bulk" button when results are shown

**Steps:**
1. Perform search
2. Click "Bulk" to enable bulk mode
3. Select notes (checkboxes appear)
4. Use "Select All" or pick individually
5. Choose action:
   - **Tag:** Type tags, press Enter
   - **Move:** Select folder from dropdown
   - **Delete:** Click Delete button (confirms first)

**Tips:**
- Bulk mode shows selection count
- Can combine with filters for precision
- Confirmation required for delete

### Search Refinement

**Quick Access:** Click "Refine" button when results are shown

**Steps:**
1. Perform initial broad search
2. Click "Refine" button
3. Enter refinement query
4. Press Enter or click "Apply"
5. See filtered subset of results
6. Click "Clear" to restore original results

**Use Case:**
```
Search: "JavaScript" → 150 results
Refine: "async" → 23 results (subset)
Clear → 150 results (restored)
```

### Smart Filters

**Quick Access:** Click "Smart" button (always available)

**Available Filters:**
- **Word Count Range:** Min and max word count
- **Untagged Only:** Show notes without tags
- **Orphan Notes:** Show notes without wikilinks

**Steps:**
1. Click "Smart" button
2. Set filters:
   - Adjust word count sliders (0-10000)
   - Check "Only untagged notes"
   - Check "Only orphan notes"
3. Click "Apply Smart Filters"

**Use Cases:**
- Find long notes: Set min to 1000 words
- Find unorganized notes: Check "Untagged"
- Find isolated notes: Check "Orphan"

## Features

### Filters
**Tags** - Select one or more tags to narrow results  
**Folders** - Filter by folder location  
**Date Range** - All Time, Today, This Week, This Month

### Search History
- Automatically saves last 10 searches
- Click to re-run previous searches
- Shows result counts

### Saved Searches
- Save frequently-used searches
- Preserves filters and mode
- Quick load from dropdown

## Tips & Tricks

### Effective Searching

**For specific terms:**
```
Mode: Keyword
Query: "React hooks useState"
```

**For concepts:**
```
Mode: Semantic
Query: "state management in frontend apps"
```

**For best results:**
```
Mode: Hybrid
Query: Your natural question or keywords
```

### Using Filters

**Find tagged notes:**
```
1. Open Filters
2. Select tags (e.g., #project, #important)
3. Search or leave empty to see all tagged notes
```

**Scope to folder:**
```
1. Open Filters  
2. Select folder (e.g., "work" or "personal")
3. Search within that scope
```

### Saving Common Searches

**Weekly Review:**
```
Query: "weekly review"
Mode: Keyword
Filters: Date = This Week
→ Click "Save Search"
```

**Project Notes:**
```
Query: (empty or specific term)
Filters: Tags = #project
→ Click "Save Search"
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Open Global Search |
| `↑` | Previous result |
| `↓` | Next result |
| `Enter` | Open selected result |
| `Cmd+Enter` | Execute search |
| `Escape` | Close panel (or close preview if open) |
| Type to search | Auto-searches after 300ms |

## Search Results

**Result Cards Show:**
- Note name (clickable to open)
- Match score (% relevance)
- Matching lines with context
- Number of matches found

**Click any result** to open the note and close the search panel.

## Common Use Cases

### 1. Find Related Notes (with Preview)
```
Mode: Semantic
Query: "topic I'm writing about"
→ Enable preview pane
→ Use ↑↓ to browse without opening
→ Press Enter on the right one
```

### 2. Locate Specific Information (Sorted)
```
Mode: Keyword
Query: "exact phrase or term"
Sort: Date (to find recent mentions)
→ Quick navigation with arrows
```

### 3. Review Recent Work
```
Mode: Hybrid
Filters: Date = This Week
Sort: Date
→ See this week's notes chronologically
```

### 4. Explore Tag Collections
```
Mode: Any
Filters: Tags = #idea + #review
→ Enable preview to scan quickly
→ Sort by Folder for organization
```

### 5. Export Research
```
Mode: Hybrid
Query: "machine learning"
Filters: Folders = "research", "projects"
→ Review with preview
→ Click Export to save results
```

## Troubleshooting

**No results found?**
- Try Hybrid mode for broader coverage
- Remove filters (might be too restrictive)
- Check spelling/try related terms
- Use Semantic mode for concept matching

**Semantic search not working?**
- First search downloads ~25MB model (one-time)
- Check browser console for errors
- Ensure IndexedDB is enabled
- Use Keyword mode as fallback

**Saved searches disappeared?**
- Check browser localStorage quota
- Try clearing browser cache and re-saving
- Export important searches (copy queries manually)

**Search too slow?**
- Keyword mode is fastest
- Limit results (default: 50)
- Check number of indexed notes
- Try more specific queries

## Pro Tips

1. **Arrow Keys are Faster:** Use ↑↓ instead of clicking through results
2. **Preview Before Opening:** Enable preview to verify content without disrupting workflow
3. **Export for Documentation:** Save search results for research papers or documentation
4. **Sort Strategically:** Use Date for recent work, Folder for projects, Name for known notes
5. **Combine Modes:** Try all three modes + different sorts for comprehensive discovery
6. **Keyboard Only:** Open (Ctrl+Shift+F) → Type → ↓↓ → Enter (never touch mouse)

## Best Practices

### For Daily Use
- Use `Ctrl+Shift+F` frequently - it's faster than manual browsing
- Save your most common searches
- Check History for previously successful queries

### For Research
- Use Semantic mode to discover related concepts
- Save search patterns for different research areas
- Use date filters to track progress over time

### For Organization
- Regularly review untagged notes (filter by absence of tags if possible)
- Use folder filters to audit specific areas
- Combine tag filters to find intersections

## Related Features

- **Command Palette** (`Ctrl+K`) - Quick navigation and commands
- **SearchBox** (in sidebar) - Quick note search
- **Graph View** - Visual exploration of connections
- **Research Assistant** - AI-powered research queries

---

**Need Help?** Press `?` anywhere in the app for keyboard shortcuts, or check the full documentation in `docs/changelogs/general/GLOBAL_SEARCH_ENHANCEMENT.md`.
