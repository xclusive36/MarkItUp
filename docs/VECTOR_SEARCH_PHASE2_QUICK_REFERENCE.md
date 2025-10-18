# Vector Search - Phase 2 Quick Reference

## For Users

### Search Modes

**🔍 Keyword Search** (Default)
- Fast exact-match search
- Use for: Finding specific phrases, file names, tags
- Example: `tag:urgent` or `"project deadline"`

**🧠 Semantic Search**
- AI-powered conceptual search
- Use for: Discovering related ideas, exploring connections
- Example: "notes about team collaboration"
- Finds notes even without exact word matches

**✨ Hybrid Search** (Recommended)
- Combines keyword + semantic (60/40 split)
- Use for: General-purpose search, best of both worlds
- Example: Any natural language query

### How to Use

1. **Select Mode**: Click keyword/semantic/hybrid button above search box
2. **Type Query**: Enter your search terms
3. **View Results**: Results appear instantly, ranked by relevance
4. **Select Note**: Click or press Enter to open

### First-Time Setup

- Semantic/hybrid search triggers automatic indexing
- Takes 2-3 minutes for 1000 notes (one-time)
- You can continue working during indexing
- No configuration required

---

## For Developers

### API Endpoints

#### Vector Search
```typescript
// POST /api/vector/search
fetch('/api/vector/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'machine learning',
    mode: 'hybrid',      // 'keyword' | 'semantic' | 'hybrid'
    limit: 20,
    tags: ['ai'],
    folders: ['research'],
    threshold: 0.3
  })
})

// GET /api/vector/search
fetch('/api/vector/search?q=machine+learning&mode=hybrid&limit=20')
```

Response:
```json
{
  "success": true,
  "mode": "hybrid",
  "results": [
    {
      "noteId": "note-id",
      "noteName": "Note Name",
      "score": 0.87,
      "matches": [...]
    }
  ],
  "count": 15
}
```

#### Indexing
```typescript
// POST /api/vector/index - Prepare notes for indexing
fetch('/api/vector/index', { method: 'POST' })

// GET /api/vector/index - Get status
fetch('/api/vector/index')
```

### Using Unified Search

```typescript
import { UnifiedSearchEngine } from '@/lib/search';
import { SearchEngine } from '@/lib/search-engine';
import { SemanticSearchEngine } from '@/lib/ai/semantic-search';

// Initialize
const keywordEngine = new SearchEngine();
const semanticEngine = new SemanticSearchEngine();
const unifiedEngine = new UnifiedSearchEngine(keywordEngine, semanticEngine);

await semanticEngine.initializeVectorSearch();

// Search
const results = await unifiedEngine.search(
  'your query',
  notes,
  'hybrid',  // mode
  { limit: 20, tags: ['tag1'] }
);
```

### Component Usage

```tsx
import SearchBox, { SearchMode } from '@/components/SearchBox';

<SearchBox
  onSearch={handleSearch}
  onSelectNote={handleNoteSelect}
  defaultMode="hybrid"
  placeholder="Search notes..."
/>
```

### Architecture

```
┌─────────────────────────────────────────┐
│           User Interface                │
│  SearchBox with Mode Selector           │
└─────────────────┬───────────────────────┘
                  │
         ┌────────▼─────────┐
         │   API Router     │
         │  /api/vector/*   │
         └────────┬─────────┘
                  │
      ┌───────────┴────────────┐
      │                        │
┌─────▼──────┐        ┌───────▼────────┐
│  Keyword   │        │   Semantic     │
│  Search    │        │   Search       │
└─────┬──────┘        └───────┬────────┘
      │                       │
      └───────────┬───────────┘
                  │
         ┌────────▼─────────┐
         │  Unified Search  │
         │   (Hybrid Mode)  │
         └──────────────────┘
```

### Performance

| Operation | Time | Storage |
|-----------|------|---------|
| Keyword Search | 10-20ms | - |
| Semantic Search | 100-200ms | ~1.5KB/note |
| Hybrid Search | 150-250ms | ~1.5KB/note |
| Indexing | ~150ms/note | ~1.5MB/1000 notes |

---

## Files Created

**New Files**:
- `src/lib/search/unified-search.ts` - Search orchestrator
- `src/lib/search/index.ts` - Exports
- `src/app/api/vector/search/route.ts` - Search API
- `src/app/api/vector/index/route.ts` - Index API
- `docs/VECTOR_SEARCH_PHASE2_SUMMARY.md` - Full documentation

**Modified Files**:
- `src/lib/ai/semantic-search.ts` - Vector integration
- `src/components/SearchBox.tsx` - Mode selector UI
- `src/app/page.tsx` - API routing

---

## Testing

```bash
# Type check
npm run type-check

# Start dev server
npm run dev

# Test searches
# 1. Try keyword search with exact phrase
# 2. Try semantic search with conceptual query
# 3. Try hybrid search with mixed query
# 4. Check browser DevTools → Application → IndexedDB
```

---

## What's Next (Phase 3)

1. **Settings UI**: Control panel for vector search
2. **Progress Indicators**: Visual feedback during indexing
3. **Index Management**: Clear, re-index, view status
4. **Advanced Filters**: Date ranges, thresholds, etc.
5. **Performance Optimizations**: Caching, incremental indexing

---

## Support

**Issues**:
- Vector search not working → Check browser console, IndexedDB enabled
- Slow search → Try keyword mode, check note count
- No results → Lower similarity threshold, try different mode

**Limitations**:
- Requires modern browser with IndexedDB
- First-time model download ~50MB
- Initial indexing takes time (2-3 min per 1000 notes)

