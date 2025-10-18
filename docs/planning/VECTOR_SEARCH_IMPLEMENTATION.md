# Vector Search Implementation Plan for MarkItUp

## Executive Summary

This document outlines a comprehensive plan to implement **vector-based semantic search** in MarkItUp PKM, bringing it to feature parity with Reor while maintaining MarkItUp's flexibility and web-first architecture.

**Key Goals:**
- Add semantic search capabilities using embeddings and vector similarity
- Enable automatic link suggestions based on semantic relationships
- Maintain backward compatibility with existing search
- Provide flexible deployment options (local vs cloud)
- Ensure minimal performance impact

---

## 📊 Current State Analysis

### What We Have Now

**Search System (`src/lib/search.ts`):**
- ✅ Full-text keyword search with inverted index
- ✅ Special operators (`tag:`, `folder:`, exact phrases)
- ✅ Boolean search (AND/OR behavior)
- ✅ Score-based ranking
- ❌ No semantic understanding (exact word matching only)
- ❌ No concept similarity detection

**Semantic Search (`src/lib/ai/semantic-search.ts`):**
- ⚠️ Basic synonym expansion (hardcoded synonyms)
- ⚠️ Multi-layered search (exact + expanded + contextual)
- ⚠️ Simple caching mechanism
- ❌ No real embeddings or vector similarity
- ❌ No machine learning-based understanding

**AI Integration:**
- ✅ 4 AI providers (OpenAI, Anthropic, Gemini, Ollama)
- ✅ Chat with context awareness
- ✅ Content analysis capabilities
- ❌ No embedding generation pipeline
- ❌ No vector storage

### The Gap

**What Reor Has That We Don't:**
1. **Vector Database** - Store note embeddings for semantic similarity
2. **Embedding Pipeline** - Convert notes to vectors automatically
3. **Automatic Link Discovery** - Find related notes by semantic similarity
4. **True Semantic Search** - Understand meaning, not just keywords

---

## 🎯 Proposed Architecture

### Option 1: Hybrid Local + Cloud (Recommended)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                      MarkItUp Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Keyword    │  │   Semantic   │  │  AI-Powered  │      │
│  │    Search    │  │    Search    │  │    Search    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Search Orchestrator                       │
│         (Combines keyword + semantic results)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌─────────────────────┐
│  Keyword Index   │                  │   Vector Database   │
│  (Existing)      │                  │   (New)             │
│                  │                  │                     │
│  - Inverted      │                  │  - Note embeddings  │
│    index         │                  │  - Similarity       │
│  - Term          │                  │    search           │
│    matching      │                  │  - KNN queries      │
└──────────────────┘                  └─────────────────────┘
                                               ↑
                          ┌────────────────────┴────────────────────┐
                          ↓                                         ↓
                  ┌───────────────┐                         ┌──────────────┐
                  │  Local Embed  │                         │ Cloud Embed  │
                  │  (Browser)    │                         │ (API)        │
                  │               │                         │              │
                  │ - Transformers.js │                     │ - OpenAI     │
                  │ - WASM models │                         │ - Gemini     │
                  │ - Free        │                         │ - Anthropic  │
                  └───────────────┘                         └──────────────┘
```

**Benefits:**
- ✅ Users choose: free local or powerful cloud
- ✅ Privacy-first option available
- ✅ Graceful fallback to keyword search
- ✅ Incremental adoption path

---

## 🔧 Implementation Components

### 1. Vector Database Layer

**Files to Create:**
```
src/lib/vector/
├── vector-store.ts          # Abstract vector store interface
├── browser-vector-store.ts  # IndexedDB-based storage
├── memory-vector-store.ts   # In-memory for testing
└── types.ts                 # Vector-related types
```

**`vector-store.ts` Interface:**
```typescript
export interface VectorStore {
  // Store a note embedding
  addEmbedding(noteId: string, embedding: number[], metadata: NoteMetadata): Promise<void>;
  
  // Find similar notes
  findSimilar(
    embedding: number[], 
    options: { limit?: number; threshold?: number }
  ): Promise<SimilarNote[]>;
  
  // Update embedding when note changes
  updateEmbedding(noteId: string, embedding: number[]): Promise<void>;
  
  // Remove embedding when note deleted
  removeEmbedding(noteId: string): Promise<void>;
  
  // Batch operations
  batchAddEmbeddings(items: EmbeddingItem[]): Promise<void>;
  
  // Get stats
  getStats(): Promise<VectorStoreStats>;
  
  // Clear all embeddings
  clear(): Promise<void>;
}

export interface SimilarNote {
  noteId: string;
  similarity: number; // 0-1 cosine similarity score
  metadata: NoteMetadata;
}

export interface NoteMetadata {
  title: string;
  tags: string[];
  folder?: string;
  updatedAt: string;
}
```

**Browser Storage Implementation:**
```typescript
// Use IndexedDB for persistent storage
export class BrowserVectorStore implements VectorStore {
  private db: IDBDatabase;
  
  async addEmbedding(noteId: string, embedding: number[], metadata: NoteMetadata) {
    // Store in IndexedDB
    const tx = this.db.transaction(['embeddings'], 'readwrite');
    const store = tx.objectStore('embeddings');
    await store.put({ noteId, embedding, metadata, timestamp: Date.now() });
  }
  
  async findSimilar(queryEmbedding: number[], options = {}) {
    // Load all embeddings (optimized with indexing)
    const allEmbeddings = await this.getAllEmbeddings();
    
    // Calculate cosine similarity for each
    const similarities = allEmbeddings.map(item => ({
      noteId: item.noteId,
      similarity: this.cosineSimilarity(queryEmbedding, item.embedding),
      metadata: item.metadata
    }));
    
    // Sort by similarity and filter by threshold
    return similarities
      .filter(s => s.similarity >= (options.threshold || 0.5))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, options.limit || 10);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
}
```

---

### 2. Embedding Generation Service

**Files to Create:**
```
src/lib/vector/
├── embedding-service.ts      # Main service
├── local-embedder.ts         # Browser-based (Transformers.js)
├── cloud-embedder.ts         # API-based (OpenAI, etc.)
└── embedding-cache.ts        # Cache to avoid re-embedding
```

**`embedding-service.ts`:**
```typescript
export class EmbeddingService {
  private embedder: Embedder;
  private cache: EmbeddingCache;
  
  constructor(config: EmbeddingConfig) {
    this.embedder = config.useLocal 
      ? new LocalEmbedder()
      : new CloudEmbedder(config.provider, config.apiKey);
    this.cache = new EmbeddingCache();
  }
  
  async embedNote(note: Note): Promise<number[]> {
    // Check cache first
    const cached = await this.cache.get(note.id, note.updatedAt);
    if (cached) return cached;
    
    // Prepare text for embedding
    const text = this.prepareText(note);
    
    // Generate embedding
    const embedding = await this.embedder.embed(text);
    
    // Cache result
    await this.cache.set(note.id, note.updatedAt, embedding);
    
    return embedding;
  }
  
  async embedQuery(query: string): Promise<number[]> {
    return this.embedder.embed(query);
  }
  
  private prepareText(note: Note): string {
    // Combine title, content, and tags with appropriate weighting
    const parts = [
      note.name.repeat(3), // Triple-weight title
      note.content,
      ...note.tags.map(tag => `#${tag}`).map(t => t.repeat(2)) // Double-weight tags
    ];
    return parts.join('\n\n');
  }
}

export interface Embedder {
  embed(text: string): Promise<number[]>;
  getDimensions(): number;
  getModel(): string;
}
```

**Local Embedding (Browser):**
```typescript
import { pipeline } from '@xenova/transformers';

export class LocalEmbedder implements Embedder {
  private model: any;
  private modelName = 'Xenova/all-MiniLM-L6-v2'; // 384 dimensions, fast
  
  async initialize() {
    // Load model in browser via WASM
    this.model = await pipeline('feature-extraction', this.modelName);
  }
  
  async embed(text: string): Promise<number[]> {
    if (!this.model) await this.initialize();
    
    // Generate embedding
    const output = await this.model(text, { pooling: 'mean', normalize: true });
    
    // Convert to regular array
    return Array.from(output.data);
  }
  
  getDimensions(): number {
    return 384; // all-MiniLM-L6-v2 dimensions
  }
  
  getModel(): string {
    return this.modelName;
  }
}
```

**Cloud Embedding (API):**
```typescript
export class CloudEmbedder implements Embedder {
  constructor(
    private provider: 'openai' | 'gemini' | 'anthropic',
    private apiKey: string
  ) {}
  
  async embed(text: string): Promise<number[]> {
    switch (this.provider) {
      case 'openai':
        return this.embedOpenAI(text);
      case 'gemini':
        return this.embedGemini(text);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
  
  private async embedOpenAI(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small', // 1536 dimensions, $0.02/1M tokens
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
  }
  
  private async embedGemini(text: string): Promise<number[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/embedding-001',
          content: { parts: [{ text }] }
        })
      }
    );
    
    const data = await response.json();
    return data.embedding.values;
  }
  
  getDimensions(): number {
    switch (this.provider) {
      case 'openai': return 1536;
      case 'gemini': return 768;
      default: return 384;
    }
  }
}
```

---

### 3. Unified Search Orchestrator

**Files to Modify/Create:**
```
src/lib/search/
├── unified-search.ts        # NEW: Orchestrates all search types
├── search.ts                # EXISTING: Keyword search (keep as-is)
└── semantic-search.ts       # MODIFY: Use real vectors
```

**`unified-search.ts`:**
```typescript
import { SearchEngine } from './search';
import { VectorSearchEngine } from './semantic-search';
import { Note, SearchResult } from '../types';

export class UnifiedSearchEngine {
  private keywordSearch: SearchEngine;
  private vectorSearch: VectorSearchEngine;
  
  constructor(
    keywordSearch: SearchEngine,
    vectorSearch: VectorSearchEngine
  ) {
    this.keywordSearch = keywordSearch;
    this.vectorSearch = vectorSearch;
  }
  
  async search(
    query: string,
    options: UnifiedSearchOptions = {}
  ): Promise<UnifiedSearchResult> {
    const {
      mode = 'hybrid', // 'keyword' | 'semantic' | 'hybrid'
      limit = 20,
      includeContent = true
    } = options;
    
    let keywordResults: SearchResult[] = [];
    let semanticResults: SearchResult[] = [];
    
    // Run searches based on mode
    if (mode === 'keyword' || mode === 'hybrid') {
      keywordResults = this.keywordSearch.search(query, { limit, includeContent });
    }
    
    if (mode === 'semantic' || mode === 'hybrid') {
      semanticResults = await this.vectorSearch.search(query, { limit });
    }
    
    // Merge and rank results
    const mergedResults = this.mergeResults(
      keywordResults,
      semanticResults,
      mode
    );
    
    return {
      results: mergedResults.slice(0, limit),
      metadata: {
        keywordResultsCount: keywordResults.length,
        semanticResultsCount: semanticResults.length,
        mode,
        query
      }
    };
  }
  
  private mergeResults(
    keywordResults: SearchResult[],
    semanticResults: SearchResult[],
    mode: string
  ): SearchResult[] {
    if (mode === 'keyword') return keywordResults;
    if (mode === 'semantic') return semanticResults;
    
    // Hybrid: Combine with weighted scoring
    const resultMap = new Map<string, SearchResult>();
    
    // Add keyword results with weight
    keywordResults.forEach(result => {
      resultMap.set(result.noteId, {
        ...result,
        score: result.score * 0.6 // 60% weight for keyword
      });
    });
    
    // Add or boost with semantic results
    semanticResults.forEach(result => {
      if (resultMap.has(result.noteId)) {
        const existing = resultMap.get(result.noteId)!;
        existing.score += result.score * 0.4; // 40% weight for semantic
      } else {
        resultMap.set(result.noteId, {
          ...result,
          score: result.score * 0.4
        });
      }
    });
    
    // Sort by combined score
    return Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score);
  }
}

export interface UnifiedSearchOptions {
  mode?: 'keyword' | 'semantic' | 'hybrid';
  limit?: number;
  includeContent?: boolean;
  tags?: string[];
  folders?: string[];
}

export interface UnifiedSearchResult {
  results: SearchResult[];
  metadata: {
    keywordResultsCount: number;
    semanticResultsCount: number;
    mode: string;
    query: string;
  };
}
```

---

### 4. Automatic Link Suggester (Reor-Style)

**Files to Create:**
```
src/lib/vector/
└── link-suggester.ts         # NEW: Vector-based link suggestions
```

**`link-suggester.ts`:**
```typescript
import { VectorStore } from './vector-store';
import { EmbeddingService } from './embedding-service';
import { Note } from '../types';

export class VectorLinkSuggester {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {}
  
  async suggestLinks(
    currentNote: Note,
    options: {
      minSimilarity?: number;
      maxSuggestions?: number;
      excludeExistingLinks?: boolean;
    } = {}
  ): Promise<LinkSuggestion[]> {
    const {
      minSimilarity = 0.65, // Only suggest if 65%+ similar
      maxSuggestions = 10,
      excludeExistingLinks = true
    } = options;
    
    // Generate embedding for current note
    const embedding = await this.embeddingService.embedNote(currentNote);
    
    // Find similar notes
    const similar = await this.vectorStore.findSimilar(embedding, {
      limit: maxSuggestions * 2, // Get extra in case we filter some
      threshold: minSimilarity
    });
    
    // Extract existing links if needed
    let existingLinks: Set<string> = new Set();
    if (excludeExistingLinks) {
      const wikilinks = currentNote.content.match(/\[\[([^\]]+)\]\]/g) || [];
      existingLinks = new Set(wikilinks.map(link => 
        link.replace(/\[\[|\]\]/g, '').split('|')[0].trim()
      ));
    }
    
    // Build suggestions
    const suggestions: LinkSuggestion[] = [];
    
    for (const item of similar) {
      // Skip self
      if (item.noteId === currentNote.id) continue;
      
      // Skip existing links
      if (excludeExistingLinks && existingLinks.has(item.metadata.title)) {
        continue;
      }
      
      // Find best insertion points in content
      const insertionPoints = this.findInsertionPoints(
        currentNote.content,
        item.metadata
      );
      
      suggestions.push({
        targetNoteId: item.noteId,
        targetNoteTitle: item.metadata.title,
        similarity: item.similarity,
        reason: this.generateReason(item.similarity, item.metadata),
        insertionPoints,
        confidence: this.calculateConfidence(item.similarity, insertionPoints.length)
      });
      
      if (suggestions.length >= maxSuggestions) break;
    }
    
    return suggestions;
  }
  
  private findInsertionPoints(
    content: string,
    targetMetadata: NoteMetadata
  ): InsertionPoint[] {
    const points: InsertionPoint[] = [];
    const lines = content.split('\n');
    
    // Look for paragraphs that mention related concepts
    const relatedTerms = [
      targetMetadata.title.toLowerCase(),
      ...targetMetadata.tags.map(t => t.toLowerCase())
    ];
    
    lines.forEach((line, lineNumber) => {
      const lineLower = line.toLowerCase();
      
      for (const term of relatedTerms) {
        if (lineLower.includes(term)) {
          points.push({
            lineNumber: lineNumber + 1,
            context: line,
            relevanceScore: 0.8,
            suggestedText: `[[${targetMetadata.title}]]`
          });
          break; // One suggestion per line
        }
      }
    });
    
    return points;
  }
  
  private generateReason(similarity: number, metadata: NoteMetadata): string {
    if (similarity > 0.85) {
      return `Highly related content (${Math.round(similarity * 100)}% similar)`;
    } else if (similarity > 0.75) {
      return `Similar topic with shared concepts`;
    } else {
      return `Related through: ${metadata.tags.slice(0, 2).join(', ')}`;
    }
  }
  
  private calculateConfidence(similarity: number, insertionCount: number): number {
    // Higher confidence if both semantically similar AND has good insertion points
    return (similarity * 0.7) + (Math.min(insertionCount / 3, 1) * 0.3);
  }
}

export interface LinkSuggestion {
  targetNoteId: string;
  targetNoteTitle: string;
  similarity: number;
  reason: string;
  insertionPoints: InsertionPoint[];
  confidence: number;
}

export interface InsertionPoint {
  lineNumber: number;
  context: string;
  relevanceScore: number;
  suggestedText: string;
}
```

---

### 5. API Routes

**Files to Create/Modify:**
```
src/app/api/vector/
├── embed/route.ts           # Generate embeddings
├── search/route.ts          # Vector search endpoint
└── suggest-links/route.ts   # Link suggestions
```

**`src/app/api/vector/search/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { UnifiedSearchEngine } from '@/lib/search/unified-search';
import { SearchEngine } from '@/lib/search';
import { VectorSearchEngine } from '@/lib/search/semantic-search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode = 'hybrid', limit = 20 } = body;
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Initialize search engines
    const keywordEngine = new SearchEngine();
    const vectorEngine = new VectorSearchEngine();
    const unifiedEngine = new UnifiedSearchEngine(keywordEngine, vectorEngine);
    
    // Perform search
    const results = await unifiedEngine.search(query, { mode, limit });
    
    return NextResponse.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('Vector search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

---

### 6. Background Indexing Service

**Files to Create:**
```
src/lib/vector/
└── indexing-service.ts      # Background embedding generation
```

**`indexing-service.ts`:**
```typescript
export class VectorIndexingService {
  private queue: Note[] = [];
  private processing = false;
  
  constructor(
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStore
  ) {}
  
  async indexNote(note: Note): Promise<void> {
    this.queue.push(note);
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  async indexAllNotes(notes: Note[]): Promise<void> {
    console.log(`Indexing ${notes.length} notes...`);
    
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      
      try {
        const embedding = await this.embeddingService.embedNote(note);
        await this.vectorStore.addEmbedding(note.id, embedding, {
          title: note.name,
          tags: note.tags,
          folder: note.folder,
          updatedAt: note.updatedAt
        });
        
        if ((i + 1) % 10 === 0) {
          console.log(`Indexed ${i + 1}/${notes.length} notes`);
        }
      } catch (error) {
        console.error(`Failed to index note ${note.id}:`, error);
      }
    }
    
    console.log('Indexing complete!');
  }
  
  private async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const note = this.queue.shift()!;
      
      try {
        const embedding = await this.embeddingService.embedNote(note);
        await this.vectorStore.addEmbedding(note.id, embedding, {
          title: note.name,
          tags: note.tags,
          folder: note.folder,
          updatedAt: note.updatedAt
        });
      } catch (error) {
        console.error(`Failed to index note ${note.id}:`, error);
      }
    }
    
    this.processing = false;
  }
  
  getQueueLength(): number {
    return this.queue.length;
  }
  
  isProcessing(): boolean {
    return this.processing;
  }
}
```

---

## 🎨 UI Components

### 1. Search Mode Selector

**Add to `SearchBox.tsx`:**
```typescript
<div className="search-mode-selector">
  <button 
    className={mode === 'keyword' ? 'active' : ''}
    onClick={() => setMode('keyword')}
  >
    🔤 Keyword
  </button>
  <button 
    className={mode === 'hybrid' ? 'active' : ''}
    onClick={() => setMode('hybrid')}
  >
    🎯 Smart (Hybrid)
  </button>
  <button 
    className={mode === 'semantic' ? 'active' : ''}
    onClick={() => setMode('semantic')}
  >
    🧠 Semantic
  </button>
</div>
```

### 2. Vector Link Suggester UI

**New Component: `VectorLinkSuggester.tsx`:**
```typescript
export default function VectorLinkSuggester({ currentNote }: Props) {
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  
  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vector/suggest-links', {
        method: 'POST',
        body: JSON.stringify({ noteId: currentNote.id })
      });
      const data = await response.json();
      setSuggestions(data.suggestions);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="vector-link-suggester">
      <h3>🔗 Suggested Links</h3>
      <button onClick={loadSuggestions}>
        Find Related Notes
      </button>
      
      {suggestions.map(suggestion => (
        <div key={suggestion.targetNoteId} className="suggestion-card">
          <div className="suggestion-header">
            <strong>{suggestion.targetNoteTitle}</strong>
            <span className="similarity-badge">
              {Math.round(suggestion.similarity * 100)}%
            </span>
          </div>
          <div className="suggestion-reason">{suggestion.reason}</div>
          <button onClick={() => applyLink(suggestion)}>
            Insert Link
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Indexing Progress Indicator

**Add to main layout:**
```typescript
<div className="indexing-status">
  {indexingInProgress && (
    <>
      <Loader2 className="animate-spin" />
      <span>Indexing notes... {indexedCount}/{totalCount}</span>
    </>
  )}
</div>
```

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "@xenova/transformers": "^2.17.0",  // Local embeddings (browser)
    "idb": "^8.0.0"                      // IndexedDB wrapper
  }
}
```

**Note:** Transformers.js brings ~50MB of WASM models but runs entirely in browser!

---

## 🔄 Migration Strategy

### Phase 1: Foundation (Week 1)
- ✅ Add vector store interface and browser implementation
- ✅ Implement embedding service (local + cloud)
- ✅ Create background indexing service
- ✅ Add embedding cache layer

### Phase 2: Search Integration (Week 2)
- ✅ Update semantic-search.ts to use real vectors
- ✅ Create unified search orchestrator
- ✅ Add search mode selector UI
- ✅ Update search API routes

### Phase 3: Link Suggestions (Week 3)
- ✅ Implement vector link suggester
- ✅ Create link suggestion UI component
- ✅ Add link insertion automation
- ✅ Track suggestion acceptance for learning

### Phase 4: Polish & Performance (Week 4)
- ✅ Optimize vector operations
- ✅ Add progress indicators
- ✅ Implement incremental indexing
- ✅ Add settings UI for embedding config
- ✅ Documentation and user guides

---

## ⚙️ Settings & Configuration

**Add to AI Settings:**
```typescript
interface VectorSearchSettings {
  enabled: boolean;
  embeddingProvider: 'local' | 'openai' | 'gemini';
  autoIndex: boolean; // Auto-index new/updated notes
  linkSuggestionThreshold: number; // 0-1, default 0.65
  indexingMode: 'immediate' | 'idle' | 'manual';
}
```

**Settings UI:**
```typescript
<div className="vector-settings">
  <h3>🧠 Semantic Search Settings</h3>
  
  <label>
    <input type="checkbox" checked={settings.enabled} />
    Enable Vector Search
  </label>
  
  <select value={settings.embeddingProvider}>
    <option value="local">Local (Free, Private)</option>
    <option value="openai">OpenAI (Powerful, ~$0.02/1M tokens)</option>
    <option value="gemini">Gemini (Cost-effective, ~$0.00001/1M tokens)</option>
  </select>
  
  <label>
    Link Suggestion Threshold: {settings.linkSuggestionThreshold}
    <input 
      type="range" 
      min="0.5" 
      max="0.9" 
      step="0.05"
      value={settings.linkSuggestionThreshold}
    />
  </label>
</div>
```

---

## 🔌 Plugin System Impact

### Minimal Breaking Changes

**Current Plugin API:**
```typescript
interface PluginAPI {
  notes: {
    search: (query: string) => Promise<SearchResult[]>; // Still works!
  }
}
```

**Enhanced Plugin API (Backward Compatible):**
```typescript
interface PluginAPI {
  notes: {
    // Existing method (unchanged)
    search: (query: string) => Promise<SearchResult[]>;
    
    // NEW: Vector search methods (optional)
    vectorSearch?: (query: string, options?: VectorSearchOptions) => Promise<SearchResult[]>;
    suggestLinks?: (noteId: string) => Promise<LinkSuggestion[]>;
    getSimilarNotes?: (noteId: string, limit?: number) => Promise<SimilarNote[]>;
  }
}
```

**Plugins automatically get:**
- ✅ Better search results (hybrid mode uses vectors)
- ✅ Optional vector methods if available
- ✅ Graceful degradation if vectors not enabled
- ❌ **NO breaking changes** - all existing plugins work as-is

### New Plugin Opportunities

**Example: Smart Content Discovery Plugin**
```typescript
class SmartDiscoveryPlugin {
  async findRelatedContent(noteId: string) {
    // Use vector API if available
    if (this.api.notes.getSimilarNotes) {
      const similar = await this.api.notes.getSimilarNotes(noteId, 5);
      return similar.map(n => ({
        title: n.metadata.title,
        similarity: `${Math.round(n.similarity * 100)}% match`
      }));
    }
    
    // Fallback to keyword search
    const note = await this.api.notes.get(noteId);
    return this.api.notes.search(note.name);
  }
}
```

---

## 📊 Performance Considerations

### Browser Storage Limits

**IndexedDB Storage:**
- Chrome/Edge: ~60% of available disk space
- Firefox: ~50% of available disk space
- Safari: ~1GB per domain

**For 1000 notes:**
- Embeddings (384 dim): ~1.5 MB
- Embeddings (1536 dim): ~6 MB
- **Well within limits!**

### Indexing Speed

**Local Embedding (Browser):**
- ~50-200ms per note (depends on length)
- 1000 notes: ~1-3 minutes initial index

**Cloud Embedding (API):**
- ~100-300ms per note (network latency)
- 1000 notes: ~2-5 minutes initial index
- Rate limits: Batch in groups of 10-50

**Optimization: Incremental Indexing**
```typescript
// Only re-index changed notes
if (note.updatedAt > lastIndexedTime) {
  await indexNote(note);
}
```

---

## 💰 Cost Analysis

### Local Embedding (Browser)
- ✅ **Free** - No API costs
- ✅ **Private** - Data never leaves browser
- ⚠️ Slower (~100-200ms per note)
- ⚠️ Lower quality (384 dimensions)

### OpenAI Embeddings
- Model: `text-embedding-3-small`
- Cost: **$0.02 per 1M tokens**
- Quality: Excellent (1536 dimensions)
- For 1000 notes (avg 500 words): **~$0.02** to index

### Google Gemini Embeddings
- Model: `embedding-001`
- Cost: **$0.00001 per 1000 characters** (virtually free)
- Quality: Good (768 dimensions)
- For 1000 notes: **<$0.01** to index

### Recommendation
Start with **local embeddings** by default, offer cloud as upgrade for better quality.

---

## 🎯 Success Metrics

### Feature Parity with Reor
- ✅ Semantic search (meaning-based, not keyword)
- ✅ Automatic link suggestions
- ✅ Local-first option (privacy)
- ✅ Vector-based similarity
- ⚠️ Not quite "never manually link again" (we suggest, user approves)

### MarkItUp Advantages Over Reor
- ✅ Choice of embedding provider (local OR cloud)
- ✅ Hybrid search (combine keyword + semantic)
- ✅ Web-based (access anywhere)
- ✅ Collaborative (team features)
- ✅ Plugin ecosystem integration

---

## 🚀 Rollout Plan

### Beta Release (v3.5.0)
- Vector search as **opt-in feature**
- Default to keyword search (existing behavior)
- Settings toggle: "Enable Semantic Search"
- Local embeddings only (safe, private)

### Stable Release (v3.6.0)
- Hybrid search as default
- Cloud embedding options
- Link suggester UI refined
- Performance optimizations complete

### Future (v4.0.0)
- Advanced vector features:
  - Concept clustering
  - Knowledge map visualization
  - Multi-lingual embeddings
  - Custom embedding fine-tuning

---

## 📝 Documentation Needs

### User Guides
1. **"What is Semantic Search?"** - Explain vectors and embeddings
2. **"Local vs Cloud Embeddings"** - Help users choose
3. **"Using Link Suggestions"** - How to leverage automation
4. **"Improving Search Results"** - Tips for better queries

### Developer Guides
1. **"Vector Search Architecture"** - System overview
2. **"Adding Embedding Providers"** - Extend the system
3. **"Plugin Vector API"** - Use vectors in plugins
4. **"Performance Tuning"** - Optimize indexing

---

## ❓ Open Questions

1. **Should we auto-accept high-confidence link suggestions?**
   - Pro: More automation (Reor-like)
   - Con: Less user control
   - **Proposal:** Setting with threshold (e.g., auto-accept >90%)

2. **Should we index on server or client?**
   - Server: Faster, but requires compute
   - Client: Slower, but works in browser
   - **Proposal:** Hybrid - server for bulk, client for updates

3. **How to handle large knowledge bases (10k+ notes)?**
   - Batch indexing in background
   - Progressive loading of vectors
   - **Proposal:** Lazy load + pagination

4. **Should we support multiple vector stores?**
   - Browser (IndexedDB)
   - Server (PostgreSQL with pgvector)
   - Cloud (Pinecone, Weaviate)
   - **Proposal:** Start with browser, add server later

---

## 🎓 Learning Resources

For the team to understand vector search:
- [What are embeddings?](https://platform.openai.com/docs/guides/embeddings)
- [Transformers.js documentation](https://huggingface.co/docs/transformers.js)
- [Semantic search explained](https://www.pinecone.io/learn/semantic-search/)
- [Vector databases 101](https://www.datastax.com/guides/what-is-a-vector-database)

---

## ✅ Conclusion

**Should MarkItUp implement vector search?**

**YES! Here's why:**

1. **Competitive Parity** - Matches Reor's killer feature
2. **Better Search** - Semantic understanding > keyword matching
3. **Smart Automation** - Link suggestions save time
4. **Flexible Deployment** - Choice of local (free) or cloud (powerful)
5. **Plugin Enhancement** - Existing plugins get better search for free
6. **Future-Proof** - Foundation for advanced AI features

**Impact Assessment:**

| Aspect | Impact Level | Notes |
|--------|-------------|-------|
| **Existing Features** | 🟢 Minimal | Backward compatible |
| **Plugin System** | 🟢 Positive | Optional enhancements |
| **Performance** | 🟡 Moderate | Initial indexing takes time |
| **User Experience** | 🟢 Positive | Much better search |
| **Development Effort** | 🟡 Moderate | 3-4 weeks |
| **Maintenance** | 🟢 Low | Well-abstracted design |

**Recommendation: Proceed with implementation starting with Phase 1.**

---

*Document Version: 1.0*  
*Created: 2025-10-18*  
*Author: GitHub Copilot*  
*Status: Ready for Review*
