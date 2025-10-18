# Vector Search Quick Start Guide

**MarkItUp's AI-Powered Semantic Search**

This guide will help you get started with vector search in MarkItUp.

---

## What is Vector Search?

Vector search uses AI to understand the **meaning** of your notes, not just keywords. It finds notes based on concepts and context, making it easy to discover connections you might have missed.

**Example:**
- **Keyword search:** "machine learning" → finds notes with exact phrase
- **Semantic search:** "machine learning" → finds notes about AI, neural networks, data science, and more!

---

## Getting Started

### 1. Enable Vector Search

1. Click the **AI Chat** button (brain icon)
2. Scroll to **"Vector Search Settings"** (purple section)
3. Toggle **"Enable Vector Search"** to ON
4. Click **"Re-Index All Notes"** button
5. Wait for indexing to complete (progress bar shows status)

**First-time setup:** Indexing may take 2-5 seconds per note. You only need to do this once!

---

### 2. Use Semantic Search

1. Click the search box at the top
2. You'll see three mode buttons:
   - **Keyword** - Traditional exact-match search
   - **Semantic** - AI-powered meaning-based search
   - **Hybrid** - Combines both methods

3. Click **"Semantic"** to enable AI search
4. Type your query
5. See results based on meaning, not just exact words!

**Look for:**
- 🧠 **Semantic badges** on results
- **Purple highlights** showing semantic matches
- **Yellow highlights** showing keyword matches

---

### 3. Discover Related Notes

1. Open any note
2. Open the **right sidebar** (if closed)
3. Click the **"Related"** tab (sparkles ✨ icon)
4. See notes similar to your current note
5. Click any related note to navigate to it

**Features:**
- Similarity scores show how related each note is
- Color-coded labels: "Very Similar", "Similar", etc.
- Refresh button to recalculate

---

### 4. Enable Auto-Indexing (Optional)

Auto-indexing keeps your vector search database up-to-date automatically.

1. Go to **AI Chat → Vector Search Settings**
2. Toggle **"Auto-index new notes"** to ON
3. That's it! Notes will index automatically after saving

**How it works:**
- Save a note → waits 3 seconds → indexes in background
- No interruption to your workflow
- Silent operation

---

## Tips & Tricks

### Search Tips

✅ **Use concepts, not just keywords**
- Instead of: "javascript function"
- Try: "reusable code blocks"

✅ **Search by topic area**
- "productivity systems"
- "learning strategies"
- "creative writing techniques"

✅ **Find notes you forgot about**
- Type a question: "how to improve focus?"
- Semantic search finds relevant notes even if they don't contain those exact words

### Related Notes Tips

✅ **Discover unexpected connections**
- Related notes might surprise you with connections you didn't see

✅ **Build knowledge clusters**
- Use related notes to group similar topics together

✅ **Find missing links**
- If two notes should be related but aren't, consider adding connections

### Settings Tips

✅ **Re-index periodically**
- After importing many notes
- After major content changes
- If search results seem stale

✅ **Monitor storage**
- Check storage usage in Vector Search Settings
- Clear and re-index if needed

✅ **Adjust batch size**
- Slower devices: Lower batch size (5-10)
- Faster devices: Higher batch size (30-50)

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search | `Ctrl/Cmd + K` |
| Navigate results | `↑` `↓` |
| Select result | `Enter` |
| Close search | `Esc` |

---

## Troubleshooting

### "No results found"

**Try:**
- Switch between search modes (Keyword ↔ Semantic)
- Use different keywords or synonyms
- Check if notes are indexed (AI Chat → Vector Search Settings)
- Re-index all notes

### "Related notes not showing"

**Check:**
- Is vector search enabled?
- Are your notes indexed?
- Does the current note have enough content?
- Try lowering the similarity threshold in settings

### "Auto-indexing not working"

**Verify:**
- Is "Auto-index new notes" toggled ON?
- Did you wait 3+ seconds after saving?
- Check browser console for errors
- Try manual re-index

### "Slow performance"

**Solutions:**
- Lower the batch size in settings
- Close other browser tabs
- Wait for initial indexing to complete
- Clear browser cache

---

## Privacy & Data

✅ **All local processing**
- Vector search runs entirely in your browser
- No data sent to external servers
- Embeddings stored in browser's IndexedDB

✅ **Your data stays yours**
- Vectors never leave your device
- Settings stored in localStorage
- Delete anytime by clearing browser data

---

## Advanced Features

### Similarity Threshold

Adjust in Related Notes component:
- **Higher (0.7-0.9):** Only very similar notes
- **Lower (0.3-0.5):** More loosely related notes
- **Default (0.5):** Good balance

### Max Results

Control how many related notes to show:
- Default: 8 notes
- Range: 1-20 notes
- More results = more options, but slower

### Search Modes

**Keyword:**
- Fast, exact matches
- Good for finding specific terms
- Traditional search experience

**Semantic:**
- AI-powered, meaning-based
- Finds conceptually related notes
- Best for exploration

**Hybrid:**
- Combines both methods
- Balanced approach
- Recommended for most searches

---

## Best Practices

### 1. Write Descriptive Notes

Vector search works best with:
- Clear, descriptive titles
- Well-written content
- Complete sentences
- Meaningful tags

### 2. Use Consistently

The more you use vector search, the more valuable it becomes:
- Regular indexing keeps data fresh
- Related notes reveal patterns over time
- Semantic search improves with more content

### 3. Combine with Links

Vector search complements manual linking:
- Use semantic search to discover connections
- Add manual links to make them permanent
- Related notes suggest new links to create

### 4. Organize by Topics

Vector search works better with:
- Notes grouped by topic
- Consistent terminology
- Rich, detailed content

---

## Next Steps

1. ✅ Enable vector search
2. ✅ Index your notes
3. ✅ Try semantic search
4. ✅ Explore related notes
5. ✅ Enable auto-indexing

**Questions?** Check the full documentation in `/docs/AI_FEATURES.md`

**Happy searching!** 🚀
