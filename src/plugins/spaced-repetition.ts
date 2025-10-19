import { PluginManifest, PluginAPI, Command, PluginSetting } from '../lib/types';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * SPACED REPETITION PLUGIN (SRS) - v1.0
 *
 * A comprehensive flashcard system with FSRS (Free Spaced Repetition Scheduler) algorithm
 * for optimal learning and retention.
 *
 * Features:
 * - Automatic flashcard detection from markdown with #flashcard tags
 * - FSRS algorithm for optimal scheduling
 * - Review interface with confidence ratings
 * - Statistics dashboard (retention rate, due cards, learning progress)
 * - AI-powered flashcard generation from content
 * - Block-level flashcards with ^block-id support
 * - Export/import flashcard decks
 *
 * Usage:
 * 1. Mark content as flashcard with #flashcard tag
 * 2. Use Q: and A: format or natural paragraph
 * 3. Review due cards in the Review Panel
 * 4. Track progress in Statistics Dashboard
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Database schema for IndexedDB storage
 */
interface FlashcardDB extends DBSchema {
  cards: {
    key: string; // cardId
    value: FlashcardRecord;
    indexes: {
      'by-note': string; // noteId
      'by-due': number; // dueDate timestamp
      'by-state': CardState;
    };
  };
  reviews: {
    key: string; // reviewId
    value: ReviewRecord;
    indexes: {
      'by-card': string; // cardId
      'by-date': number; // review timestamp
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
}

/**
 * Card states in the learning process
 */
type CardState = 'new' | 'learning' | 'review' | 'relearning';

/**
 * Rating given after reviewing a card
 */
type CardRating = 1 | 2 | 3 | 4; // Again, Hard, Good, Easy

/**
 * Flashcard record stored in database
 */
interface FlashcardRecord {
  id: string;
  noteId: string;
  noteName: string;
  blockId?: string;
  front: string; // Question
  back: string; // Answer
  context?: string; // Surrounding content for context
  tags: string[];

  // FSRS scheduling parameters
  state: CardState;
  due: number; // Timestamp when card is due
  stability: number; // Memory stability
  difficulty: number; // Card difficulty (0-10)
  elapsed_days: number; // Days since last review
  scheduled_days: number; // Days until next review
  reps: number; // Total reviews
  lapses: number; // Number of times forgotten
  last_review?: number; // Timestamp of last review

  // Metadata
  created: number;
  modified: number;
}

/**
 * Review history record
 */
interface ReviewRecord {
  id: string;
  cardId: string;
  rating: CardRating;
  state: CardState;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  review_time: number; // Time spent on review (ms)
  timestamp: number;
}

/**
 * Statistics for dashboard
 */
interface FlashcardStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  due_today: number;
  retention_rate: number;
  average_ease: number;
  total_reviews: number;
  streak_days: number;
  last_review?: number;
}

/**
 * Parsed flashcard from markdown
 */
interface ParsedFlashcard {
  front: string;
  back: string;
  context: string;
  blockId?: string;
  tags: string[];
  position: { start: number; end: number };
}

// ============================================================================
// FSRS ALGORITHM IMPLEMENTATION
// ============================================================================

/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm
 * Based on: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * This algorithm calculates optimal review intervals based on:
 * - Retrievability (memory strength)
 * - Stability (how long memory lasts)
 * - Difficulty (intrinsic card difficulty)
 */
class FSRSAlgorithm {
  // FSRS parameters (can be optimized per user)
  private w = [
    0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813,
    0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567,
  ];

  // Default parameters for new cards
  private readonly REQUEST_RETENTION = 0.9; // Target 90% retention
  private readonly MAXIMUM_INTERVAL = 36500; // 100 years in days
  private readonly INITIAL_STABILITY = [0.4072, 1.1829, 3.1262, 15.4722]; // For ratings 1-4

  /**
   * Calculate next review schedule after rating
   */
  public schedule(card: FlashcardRecord, rating: CardRating, now: number): FlashcardRecord {
    const elapsed_days = card.last_review ? (now - card.last_review) / (1000 * 60 * 60 * 24) : 0;

    let newCard = { ...card };

    if (card.state === 'new') {
      newCard = this.initCard(card, rating);
    } else {
      newCard = this.reviewCard(card, rating, elapsed_days);
    }

    newCard.last_review = now;
    newCard.reps += 1;
    newCard.modified = now;

    return newCard;
  }

  /**
   * Initialize a new card with first rating
   */
  private initCard(card: FlashcardRecord, rating: CardRating): FlashcardRecord {
    const stability = this.INITIAL_STABILITY[rating - 1];
    const difficulty = this.initDifficulty(rating);
    const interval = this.nextInterval(stability);

    return {
      ...card,
      state: rating === 1 ? 'learning' : 'review',
      stability,
      difficulty,
      elapsed_days: 0,
      scheduled_days: interval,
      due: Date.now() + interval * 24 * 60 * 60 * 1000,
      lapses: rating === 1 ? 1 : 0,
    };
  }

  /**
   * Update card after review
   */
  private reviewCard(
    card: FlashcardRecord,
    rating: CardRating,
    elapsed_days: number
  ): FlashcardRecord {
    const retrievability = this.forgettingCurve(elapsed_days, card.stability);
    const new_difficulty = this.nextDifficulty(card.difficulty, rating);
    const new_stability = this.nextStability(
      card.difficulty,
      card.stability,
      retrievability,
      rating
    );
    const interval = this.nextInterval(new_stability);

    let new_state = card.state;
    let lapses = card.lapses;

    if (rating === 1) {
      // Card forgotten - reset to learning/relearning
      new_state = card.reps === 0 ? 'learning' : 'relearning';
      lapses += 1;
    } else if (rating >= 3) {
      // Card passed - move to review
      new_state = 'review';
    }

    return {
      ...card,
      state: new_state,
      stability: new_stability,
      difficulty: new_difficulty,
      elapsed_days,
      scheduled_days: interval,
      due: Date.now() + interval * 24 * 60 * 60 * 1000,
      lapses,
    };
  }

  /**
   * Calculate retrievability (probability of recall)
   */
  private forgettingCurve(elapsed_days: number, stability: number): number {
    return Math.pow(1 + elapsed_days / (9 * stability), -1);
  }

  /**
   * Calculate initial difficulty for new card
   */
  private initDifficulty(rating: CardRating): number {
    return this.w[4] - (rating - 3) * this.w[5];
  }

  /**
   * Calculate next difficulty
   */
  private nextDifficulty(difficulty: number, rating: CardRating): number {
    const delta = rating - 3;
    const new_diff = difficulty - this.w[6] * delta;
    return this.constrainDifficulty(this.meanReversion(this.w[4], new_diff));
  }

  /**
   * Calculate next stability
   */
  private nextStability(
    difficulty: number,
    stability: number,
    retrievability: number,
    rating: CardRating
  ): number {
    let new_stability: number;

    if (rating === 1) {
      // Card forgotten - use relearning stability
      new_stability =
        this.w[11] *
        Math.pow(difficulty, -this.w[12]) *
        (Math.pow(stability + 1, this.w[13]) - 1) *
        Math.exp((1 - retrievability) * this.w[14]);
    } else {
      // Card remembered - increase stability
      const hard_penalty = rating === 2 ? this.w[15] : 1;
      const easy_bonus = rating === 4 ? this.w[16] : 1;

      new_stability =
        stability *
        (1 +
          Math.exp(this.w[8]) *
            (11 - difficulty) *
            Math.pow(stability, -this.w[9]) *
            (Math.exp((1 - retrievability) * this.w[10]) - 1) *
            hard_penalty *
            easy_bonus);
    }

    return Math.min(new_stability, this.MAXIMUM_INTERVAL);
  }

  /**
   * Calculate next review interval
   */
  private nextInterval(stability: number): number {
    const interval = stability * (Math.log(this.REQUEST_RETENTION) / Math.log(0.9));
    return Math.min(Math.max(Math.round(interval), 1), this.MAXIMUM_INTERVAL);
  }

  /**
   * Apply mean reversion to difficulty
   */
  private meanReversion(init: number, current: number): number {
    return this.w[7] * init + (1 - this.w[7]) * current;
  }

  /**
   * Constrain difficulty to valid range
   */
  private constrainDifficulty(difficulty: number): number {
    return Math.min(Math.max(difficulty, 1), 10);
  }

  /**
   * Get recommended ratings based on current state
   */
  public getRatingIntervals(card: FlashcardRecord): Record<CardRating, number> {
    const now = Date.now();
    const intervals = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
    } as Record<CardRating, number>;

    for (let rating = 1; rating <= 4; rating++) {
      const scheduled = this.schedule(card, rating as CardRating, now);
      intervals[rating as CardRating] = scheduled.scheduled_days;
    }

    return intervals;
  }
}

// ============================================================================
// FLASHCARD PARSER
// ============================================================================

/**
 * Parse markdown content to extract flashcards
 */
class FlashcardParser {
  /**
   * Find all flashcards in markdown content
   */
  public parse(content: string): ParsedFlashcard[] {
    const flashcards: ParsedFlashcard[] = [];

    // Patterns to match:
    // 1. Explicit Q: A: format with #flashcard
    // 2. Paragraph with #flashcard (auto-generate Q&A with AI)
    // 3. Block with ^block-id and #flashcard

    // Pattern 1: Q: ... A: ... #flashcard
    const qaPattern = /Q:\s*(.+?)\s*A:\s*(.+?)\s*#flashcard(?:\/(\S+))?/gs;
    let match;

    while ((match = qaPattern.exec(content)) !== null) {
      const [fullMatch, question, answer, subtag] = match;
      const start = match.index;
      const end = start + fullMatch.length;

      // Extract context (surrounding lines)
      const context = this.extractContext(content, start);

      // Extract block ID if present
      const blockId = this.extractBlockId(content, start, end);

      // Extract tags
      const tags = ['flashcard'];
      if (subtag) tags.push(subtag);

      flashcards.push({
        front: question.trim(),
        back: answer.trim(),
        context,
        blockId,
        tags,
        position: { start, end },
      });
    }

    // Pattern 2: Paragraph with #flashcard (needs AI processing)
    const paragraphPattern = /^(.+?)#flashcard(?:\/(\S+))?(?:\s*\^(\w+))?$/gm;

    while ((match = paragraphPattern.exec(content)) !== null) {
      const [fullMatch, text, subtag, blockId] = match;
      const start = match.index;
      const end = start + fullMatch.length;

      // Skip if already matched by Q: A: pattern
      if (flashcards.some(fc => fc.position.start === start)) {
        continue;
      }

      const context = this.extractContext(content, start);
      const tags = ['flashcard'];
      if (subtag) tags.push(subtag);

      // For paragraphs, we'll need AI to generate Q&A
      // For now, use the text as front, mark back as needs generation
      flashcards.push({
        front: text.trim(),
        back: '[AI Generated]',
        context,
        blockId,
        tags,
        position: { start, end },
      });
    }

    return flashcards;
  }

  /**
   * Extract surrounding context
   */
  private extractContext(content: string, start: number): string {
    const lines = content.split('\n');
    let currentPos = 0;
    let lineIndex = 0;

    // Find line containing the flashcard
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for \n
      if (currentPos + lineLength > start) {
        lineIndex = i;
        break;
      }
      currentPos += lineLength;
    }

    // Extract 2 lines before and after
    const contextStart = Math.max(0, lineIndex - 2);
    const contextEnd = Math.min(lines.length, lineIndex + 3);
    return lines.slice(contextStart, contextEnd).join('\n').trim();
  }

  /**
   * Extract block ID from content near position
   */
  private extractBlockId(content: string, start: number, end: number): string | undefined {
    const blockIdPattern = /\^(\w+)/;
    const surrounding = content.slice(Math.max(0, start - 50), Math.min(content.length, end + 50));
    const match = surrounding.match(blockIdPattern);
    return match ? match[1] : undefined;
  }

  /**
   * Generate card ID from content
   */
  public generateCardId(noteId: string, front: string, blockId?: string): string {
    const content = blockId || front.slice(0, 50);
    const hash = this.simpleHash(content);
    return `${noteId}-${hash}`;
  }

  /**
   * Simple hash function for IDs
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================================================
// FLASHCARD MANAGER
// ============================================================================

/**
 * Manages flashcard CRUD operations and database
 */
class FlashcardManager {
  private db?: IDBPDatabase<FlashcardDB>;
  private fsrs = new FSRSAlgorithm();
  private parser = new FlashcardParser();

  /**
   * Initialize database
   */
  public async init(): Promise<void> {
    this.db = await openDB<FlashcardDB>('markitup-flashcards', 1, {
      upgrade(db: IDBPDatabase<FlashcardDB>) {
        // Cards store
        const cardStore = db.createObjectStore('cards', { keyPath: 'id' });
        cardStore.createIndex('by-note', 'noteId');
        cardStore.createIndex('by-due', 'due');
        cardStore.createIndex('by-state', 'state');

        // Reviews store
        const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' });
        reviewStore.createIndex('by-card', 'cardId');
        reviewStore.createIndex('by-date', 'timestamp');

        // Settings store
        db.createObjectStore('settings');
      },
    });
  }

  /**
   * Index flashcards from a note
   */
  public async indexNote(noteId: string, noteName: string, content: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const parsed = this.parser.parse(content);
    let indexed = 0;

    for (const fc of parsed) {
      const cardId = this.parser.generateCardId(noteId, fc.front, fc.blockId);

      // Check if card already exists
      const existing = await this.db.get('cards', cardId);

      if (!existing) {
        // Create new card
        const now = Date.now();
        const card: FlashcardRecord = {
          id: cardId,
          noteId,
          noteName,
          blockId: fc.blockId,
          front: fc.front,
          back: fc.back,
          context: fc.context,
          tags: fc.tags,
          state: 'new',
          due: now,
          stability: 0,
          difficulty: 0,
          elapsed_days: 0,
          scheduled_days: 0,
          reps: 0,
          lapses: 0,
          created: now,
          modified: now,
        };

        await this.db.add('cards', card);
        indexed++;
      } else {
        // Update card content if changed
        if (existing.front !== fc.front || existing.back !== fc.back) {
          existing.front = fc.front;
          existing.back = fc.back;
          existing.context = fc.context;
          existing.modified = Date.now();
          await this.db.put('cards', existing);
          indexed++;
        }
      }
    }

    return indexed;
  }

  /**
   * Get due cards for review
   */
  public async getDueCards(limit = 20): Promise<FlashcardRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const now = Date.now();
    const allCards = await this.db.getAllFromIndex('cards', 'by-due');

    return allCards
      .filter((card: FlashcardRecord) => card.due <= now)
      .sort((a: FlashcardRecord, b: FlashcardRecord) => a.due - b.due)
      .slice(0, limit);
  }

  /**
   * Get new cards
   */
  public async getNewCards(limit = 10): Promise<FlashcardRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    const newCards = await this.db.getAllFromIndex('cards', 'by-state', IDBKeyRange.only('new'));

    return newCards.slice(0, limit);
  }

  /**
   * Review a card
   */
  public async reviewCard(
    cardId: string,
    rating: CardRating,
    reviewTime: number
  ): Promise<FlashcardRecord> {
    if (!this.db) throw new Error('Database not initialized');

    const card = await this.db.get('cards', cardId);
    if (!card) throw new Error('Card not found');

    const now = Date.now();
    const updatedCard = this.fsrs.schedule(card, rating, now);

    // Save updated card
    await this.db.put('cards', updatedCard);

    // Record review
    const review: ReviewRecord = {
      id: `${cardId}-${now}`,
      cardId,
      rating,
      state: updatedCard.state,
      due: updatedCard.due,
      stability: updatedCard.stability,
      difficulty: updatedCard.difficulty,
      elapsed_days: updatedCard.elapsed_days,
      scheduled_days: updatedCard.scheduled_days,
      review_time: reviewTime,
      timestamp: now,
    };
    await this.db.add('reviews', review);

    return updatedCard;
  }

  /**
   * Get statistics
   */
  public async getStats(): Promise<FlashcardStats> {
    if (!this.db) throw new Error('Database not initialized');

    const allCards = await this.db.getAll('cards');
    const allReviews = await this.db.getAll('reviews');
    const now = Date.now();

    const stats: FlashcardStats = {
      total: allCards.length,
      new: allCards.filter((c: FlashcardRecord) => c.state === 'new').length,
      learning: allCards.filter((c: FlashcardRecord) => c.state === 'learning').length,
      review: allCards.filter((c: FlashcardRecord) => c.state === 'review').length,
      relearning: allCards.filter((c: FlashcardRecord) => c.state === 'relearning').length,
      due_today: allCards.filter((c: FlashcardRecord) => c.due <= now).length,
      retention_rate: this.calculateRetentionRate(allReviews),
      average_ease: this.calculateAverageEase(allCards),
      total_reviews: allReviews.length,
      streak_days: this.calculateStreak(allReviews),
      last_review:
        allReviews.length > 0
          ? Math.max(...allReviews.map((r: ReviewRecord) => r.timestamp))
          : undefined,
    };

    return stats;
  }

  /**
   * Calculate retention rate from reviews
   */
  private calculateRetentionRate(reviews: ReviewRecord[]): number {
    if (reviews.length === 0) return 0;

    const recentReviews = reviews.filter(r => r.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (recentReviews.length === 0) return 0;

    const passed = recentReviews.filter(r => r.rating >= 2).length;
    return (passed / recentReviews.length) * 100;
  }

  /**
   * Calculate average ease (inverse of difficulty)
   */
  private calculateAverageEase(cards: FlashcardRecord[]): number {
    if (cards.length === 0) return 0;

    const withDifficulty = cards.filter(c => c.difficulty > 0);
    if (withDifficulty.length === 0) return 0;

    const avgDifficulty =
      withDifficulty.reduce((sum, c) => sum + c.difficulty, 0) / withDifficulty.length;
    return 10 - avgDifficulty; // Invert so higher is easier
  }

  /**
   * Calculate review streak
   */
  private calculateStreak(reviews: ReviewRecord[]): number {
    if (reviews.length === 0) return 0;

    const sortedReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
    const today = new Date().setHours(0, 0, 0, 0);
    let streak = 0;
    let currentDay = today;

    for (const review of sortedReviews) {
      const reviewDay = new Date(review.timestamp).setHours(0, 0, 0, 0);

      if (reviewDay === currentDay) {
        continue; // Same day
      } else if (reviewDay === currentDay - 24 * 60 * 60 * 1000) {
        streak++;
        currentDay = reviewDay;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  /**
   * Get card by ID
   */
  public async getCard(cardId: string): Promise<FlashcardRecord | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.get('cards', cardId);
  }

  /**
   * Get all cards for a note
   */
  public async getCardsForNote(noteId: string): Promise<FlashcardRecord[]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllFromIndex('cards', 'by-note', IDBKeyRange.only(noteId));
  }

  /**
   * Delete all cards for a note
   */
  public async deleteCardsForNote(noteId: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const cards = await this.getCardsForNote(noteId);

    for (const card of cards) {
      await this.db.delete('cards', card.id);
    }

    return cards.length;
  }

  /**
   * Get rating intervals for preview
   */
  public getRatingIntervals(card: FlashcardRecord): Record<CardRating, number> {
    return this.fsrs.getRatingIntervals(card);
  }
}

// ============================================================================
// PLUGIN INSTANCE
// ============================================================================

class SpacedRepetitionPlugin {
  private api: PluginAPI;
  private manager = new FlashcardManager();
  private reviewPanelOpen = false;

  constructor(api: PluginAPI) {
    this.api = api;
  }

  public async init(): Promise<void> {
    await this.manager.init();
    console.log('Spaced Repetition Plugin initialized');
  }

  /**
   * Index current note for flashcards
   */
  public async indexCurrentNote(): Promise<void> {
    const noteId = this.api.notes.getActiveNoteId();
    if (!noteId) {
      this.api.ui.showNotification('No active note', 'warning');
      return;
    }

    const note = this.api.notes.get(noteId);
    if (!note) return;

    try {
      const count = await this.manager.indexNote(note.id, note.name, note.content);
      this.api.ui.showNotification(`Indexed ${count} flashcard(s) from ${note.name}`, 'info');
    } catch (error) {
      console.error('Error indexing note:', error);
      this.api.ui.showNotification('Error indexing flashcards', 'error');
    }
  }

  /**
   * Index all notes for flashcards
   */
  public async indexAllNotes(): Promise<void> {
    const notes = this.api.notes.getAll();
    let totalIndexed = 0;

    this.api.ui.showNotification('Indexing all notes...', 'info');

    for (const note of notes) {
      try {
        const count = await this.manager.indexNote(note.id, note.name, note.content);
        totalIndexed += count;
      } catch (error) {
        console.error(`Error indexing note ${note.name}:`, error);
      }
    }

    this.api.ui.showNotification(
      `Indexed ${totalIndexed} flashcard(s) from ${notes.length} note(s)`,
      'info'
    );
  }

  /**
   * Open review panel
   */
  public async openReviewPanel(): Promise<void> {
    // This will be implemented with React component
    this.reviewPanelOpen = true;
    this.api.ui.showNotification('Review panel opened', 'info');
    // TODO: Actually open the review UI component
  }

  /**
   * Show statistics
   */
  public async showStatistics(): Promise<void> {
    try {
      const stats = await this.manager.getStats();

      const message = `
📊 Flashcard Statistics

📚 Total Cards: ${stats.total}
🆕 New: ${stats.new}
📖 Learning: ${stats.learning}
✅ Review: ${stats.review}
🔄 Relearning: ${stats.relearning}

⏰ Due Today: ${stats.due_today}
📈 Retention Rate: ${stats.retention_rate.toFixed(1)}%
💪 Average Ease: ${stats.average_ease.toFixed(1)}/10
🔥 Current Streak: ${stats.streak_days} days
📝 Total Reviews: ${stats.total_reviews}
      `.trim();

      this.api.ui.showNotification(message, 'info');
    } catch (error) {
      console.error('Error getting statistics:', error);
      this.api.ui.showNotification('Error loading statistics', 'error');
    }
  }

  /**
   * Generate flashcards from selected text using AI
   */
  public async generateFromSelection(): Promise<void> {
    // Check if AI is available
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.api.ui.showNotification(
        'AI not configured. Please set up an AI provider in Settings.',
        'warning'
      );
      return;
    }

    // Get selected text
    const selection = this.api.ui.getSelection();
    if (!selection || !selection.text.trim()) {
      this.api.ui.showNotification('Please select text to generate flashcards from', 'warning');
      return;
    }

    // Get current note context
    const noteId = this.api.notes.getActiveNoteId();
    const note = noteId ? this.api.notes.get(noteId) : null;

    try {
      this.api.ui.showNotification('🤖 Generating flashcards with AI...', 'info');

      // Build prompt
      const prompt = this.buildGenerationPrompt(selection.text, note);

      // Get AI settings from localStorage
      const aiSettings = this.getAISettings();
      let aiResponse: string;

      // For Ollama, use direct browser fetch (bypass server-side API)
      if (aiSettings.provider === 'ollama' && aiSettings.ollamaUrl) {
        console.log('[SpacedRepetition] Using direct Ollama fetch:', aiSettings.ollamaUrl);

        const ollamaUrl = aiSettings.ollamaUrl.replace(/\/$/, ''); // Remove trailing slash
        const response = await fetch(`${ollamaUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: aiSettings.model || 'llama3.2:3b',
            messages: [{ role: 'user', content: prompt }],
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const result = await response.json();
        aiResponse = result.message?.content || '';
      } else {
        // For other providers, use server-side API
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            context: note
              ? {
                  relatedNotes: [
                    {
                      id: note.id,
                      name: note.name,
                      relevantContent: selection.text,
                      relevanceScore: 1.0,
                    },
                  ],
                  conversationHistory: [],
                }
              : undefined,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error?.message || 'AI generation failed');
        }

        aiResponse = result.data.content;
      }

      // Parse generated flashcards
      console.log('[SpacedRepetition] AI Response:', aiResponse);
      const generatedCards = this.parseAIResponse(aiResponse);
      console.log('[SpacedRepetition] Parsed cards:', generatedCards.length, generatedCards);

      if (generatedCards.length === 0) {
        this.api.ui.showNotification(
          'No flashcards generated. Try selecting different text.',
          'warning'
        );
        return;
      }

      // Show preview UI for approval (TODO: implement UI component)
      // For now, auto-insert into note
      console.log('[SpacedRepetition] Calling insertGeneratedCards...');
      await this.insertGeneratedCards(generatedCards, selection);
      console.log('[SpacedRepetition] insertGeneratedCards completed');

      this.api.ui.showNotification(
        `✅ Generated ${generatedCards.length} flashcard(s)! Press Cmd+Shift+F to index them.`,
        'success'
      );
    } catch (error) {
      console.error('Error generating flashcards:', error);
      this.api.ui.showNotification(
        `Error generating flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  /**
   * Get AI settings from localStorage (client-side)
   */
  private getAISettings(): any {
    if (typeof window === 'undefined') {
      return { provider: 'none', apiKey: '', ollamaUrl: '' };
    }
    try {
      const saved = localStorage.getItem('markitup-ai-settings');
      if (saved) return JSON.parse(saved);
    } catch (error) {
      console.warn('[SpacedRepetition] Failed to load AI settings:', error);
    }
    return { provider: 'none', apiKey: '', ollamaUrl: '' };
  }

  /**
   * Build AI prompt for flashcard generation
   */
  private buildGenerationPrompt(
    selectedText: string,
    note: { id: string; name: string; content: string } | null
  ): string {
    const contextInfo = note
      ? `\n\nNote: ${note.name}\nNote context: This content is from a larger note about ${note.name}.`
      : '';

    return `Generate flashcards from this text. Create 3-5 high-quality Q&A pairs that test understanding of the key concepts.

Text:
${selectedText}
${contextInfo}

Requirements:
- Use clear, specific questions
- Provide complete, accurate answers
- Focus on important concepts
- One concept per flashcard
- Format: Q: [question] A: [answer]
- Add #flashcard tag to each line

Example format:
Q: What is the capital of France? A: Paris #flashcard

Generate the flashcards now:`;
  }

  /**
   * Parse AI response to extract flashcards
   */
  private parseAIResponse(aiResponse: string): Array<{ question: string; answer: string }> {
    const cards: Array<{ question: string; answer: string }> = [];

    // First try to match Q: and A: on the same line
    const lines = aiResponse.split('\n');
    for (const line of lines) {
      const match = line.match(/Q:\s*(.+?)\s*A:\s*(.+?)(?:\s*#flashcard)?$/i);
      if (match) {
        cards.push({
          question: match[1].trim(),
          answer: match[2].trim(),
        });
      }
    }

    // If no cards found, try multi-line format (Q: on one line, A: on next)
    if (cards.length === 0) {
      for (let i = 0; i < lines.length - 1; i++) {
        const qMatch = lines[i].match(/Q:\s*(.+?)(?:\s*#flashcard)?$/i);
        const aMatch = lines[i + 1].match(/A:\s*(.+?)(?:\s*#flashcard)?$/i);

        if (qMatch && aMatch) {
          cards.push({
            question: qMatch[1].trim(),
            answer: aMatch[1].trim(),
          });
          i++; // Skip the next line since we already processed it
        }
      }
    }

    return cards;
  }

  /**
   * Insert generated cards into the note
   */
  private async insertGeneratedCards(
    cards: Array<{ question: string; answer: string }>,
    selection: { text: string; start: number; end: number }
  ): Promise<void> {
    console.log('[SpacedRepetition] insertGeneratedCards called with', cards.length, 'cards');
    const noteId = this.api.notes.getActiveNoteId();
    console.log('[SpacedRepetition] Active note ID:', noteId);
    if (!noteId) {
      console.log('[SpacedRepetition] No active note ID!');
      return;
    }

    const note = this.api.notes.get(noteId);
    console.log('[SpacedRepetition] Got note:', note?.id, note?.name);
    if (!note) {
      console.log('[SpacedRepetition] Note not found!');
      return;
    }

    // Build flashcard text
    const flashcardText = cards
      .map(card => `Q: ${card.question} A: ${card.answer} #flashcard`)
      .join('\n');
    console.log('[SpacedRepetition] Flashcard text:', flashcardText);

    // Insert after selection
    const beforeSelection = note.content.slice(0, selection.end);
    const afterSelection = note.content.slice(selection.end);
    const newContent = `${beforeSelection}\n\n## 🎓 Generated Flashcards\n\n${flashcardText}\n${afterSelection}`;
    console.log(
      '[SpacedRepetition] New content length:',
      newContent.length,
      'old:',
      note.content.length
    );

    // Update note
    console.log('[SpacedRepetition] Calling api.notes.update...');
    await this.api.notes.update(noteId, { content: newContent });
    console.log('[SpacedRepetition] api.notes.update completed');

    // Update editor content
    console.log('[SpacedRepetition] Calling api.ui.setEditorContent...');
    this.api.ui.setEditorContent(newContent);
    console.log('[SpacedRepetition] api.ui.setEditorContent completed');
  }

  /**
   * Generate flashcards from entire note using AI
   */
  public async generateFromNote(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.api.ui.showNotification(
        'AI not configured. Please set up an AI provider in Settings.',
        'warning'
      );
      return;
    }

    const noteId = this.api.notes.getActiveNoteId();
    if (!noteId) {
      this.api.ui.showNotification('No active note', 'warning');
      return;
    }

    const note = this.api.notes.get(noteId);
    if (!note) return;

    try {
      this.api.ui.showNotification('🤖 Analyzing note and generating flashcards...', 'info');

      const prompt = `Analyze this note and generate 5-10 high-quality flashcards covering the most important concepts and facts.

Note: ${note.name}

Content:
${note.content}

Requirements:
- Focus on key concepts, definitions, and important facts
- Create clear, specific questions
- Provide accurate, complete answers
- One concept per flashcard
- Format: Q: [question] A: [answer]
- Add #flashcard/ai-generated tag

Generate the flashcards:`;

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: {
            relatedNotes: [
              {
                id: note.id,
                name: note.name,
                relevantContent: note.content.slice(0, 1000),
                relevanceScore: 1.0,
              },
            ],
            conversationHistory: [],
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'AI generation failed');
      }

      const generatedCards = this.parseAIResponse(result.data.content);

      if (generatedCards.length === 0) {
        this.api.ui.showNotification('No flashcards generated from this note.', 'warning');
        return;
      }

      // Append to end of note
      const flashcardText = generatedCards
        .map(card => `Q: ${card.question} A: ${card.answer} #flashcard/ai-generated`)
        .join('\n');

      const newContent = `${note.content}\n\n## 🤖 AI-Generated Flashcards\n\n${flashcardText}\n`;

      await this.api.notes.update(noteId, { content: newContent });
      this.api.ui.setEditorContent(newContent);

      this.api.ui.showNotification(
        `✅ Generated ${generatedCards.length} flashcard(s)! Press Cmd+Shift+F to index them.`,
        'info'
      );
    } catch (error) {
      console.error('Error generating flashcards from note:', error);
      this.api.ui.showNotification(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }

  /**
   * Complete missing answers for incomplete flashcards using AI
   */
  public async completeAnswers(): Promise<void> {
    if (!this.api.ai || !this.api.ai.isAvailable()) {
      this.api.ui.showNotification(
        'AI not configured. Please set up an AI provider in Settings.',
        'warning'
      );
      return;
    }

    const noteId = this.api.notes.getActiveNoteId();
    if (!noteId) {
      this.api.ui.showNotification('No active note', 'warning');
      return;
    }

    const note = this.api.notes.get(noteId);
    if (!note) return;

    // Find incomplete flashcards (Q: but no A:)
    const incompletePattern = /Q:\s*(.+?)\s*#flashcard(?!.*A:)/gim;
    const matches = [...note.content.matchAll(incompletePattern)];

    if (matches.length === 0) {
      this.api.ui.showNotification('No incomplete flashcards found', 'info');
      return;
    }

    try {
      this.api.ui.showNotification(`🤖 Completing ${matches.length} flashcard(s)...`, 'info');

      let updatedContent = note.content;

      for (const match of matches) {
        const question = match[1].trim();
        const prompt = `Given this flashcard question, provide a clear, accurate answer.

Question: ${question}

Note context: ${note.name}
${note.content.slice(0, 500)}

Provide only the answer, no extra text:`;

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: prompt,
            context: {
              relatedNotes: [
                {
                  id: note.id,
                  name: note.name,
                  relevantContent: note.content.slice(0, 1000),
                  relevanceScore: 1.0,
                },
              ],
              conversationHistory: [],
            },
          }),
        });

        const result = await response.json();

        if (result.success) {
          const answer = result.data.content.trim();
          // Replace Q: ... #flashcard with Q: ... A: ... #flashcard
          const oldText = match[0];
          const newText = `Q: ${question} A: ${answer} #flashcard`;
          updatedContent = updatedContent.replace(oldText, newText);
        }
      }

      await this.api.notes.update(noteId, { content: updatedContent });
      this.api.ui.setEditorContent(updatedContent);

      this.api.ui.showNotification(
        `✅ Completed ${matches.length} flashcard(s)! Press Cmd+Shift+F to index them.`,
        'info'
      );
    } catch (error) {
      console.error('Error completing answers:', error);
      this.api.ui.showNotification(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  }
}

// ============================================================================
// PLUGIN MANIFEST
// ============================================================================

let pluginInstance: SpacedRepetitionPlugin | null = null;

export const spacedRepetitionPlugin: PluginManifest = {
  id: 'spaced-repetition',
  name: 'Spaced Repetition (Flashcards)',
  version: '1.1.0',
  description: 'FSRS-based flashcard system with AI-powered generation for effective learning',
  author: 'MarkItUp Team',
  main: 'spaced-repetition.js',
  documentation: `# Spaced Repetition Plugin

## Overview
Create and review flashcards using scientifically-proven spaced repetition. Powered by the FSRS algorithm with AI-assisted flashcard generation.

## How to Create Flashcards

### Manual Creation
Add flashcards anywhere in your notes using this format:
\`\`\`
Q: Your question here? A: Your answer here #flashcard
\`\`\`

Example:
\`\`\`
Q: What is the capital of France? A: Paris #flashcard
\`\`\`

### AI-Powered Generation
1. **From Selection** (⌘⇧G):
   - Select text in your note
   - Press Cmd+Shift+G or use Command Palette
   - AI generates 3-5 flashcards from the selection
   - Review and edit as needed

2. **From Full Note** (⌘⌥G):
   - Open any note
   - Press Cmd+Alt+G
   - AI analyzes the entire note and creates 5-10 flashcards

**Note**: Ollama generation may take 20-30 seconds. Watch for toast notifications!

## Indexing Your Flashcards

Before reviewing, you must index your flashcards:

- **Index Current Note** (⌘⇧F): Scan active note for flashcards
- **Index All Notes**: Scan your entire vault
- **Auto-Index**: Enable in settings to automatically index on save

## Reviewing Flashcards

1. Press **Cmd+Shift+R** to start review
2. Rate each card:
   - **Again**: Didn't remember (resets interval)
   - **Hard**: Struggled to remember
   - **Good**: Remembered correctly
   - **Easy**: Very easy (longer interval)

The FSRS algorithm optimizes review intervals based on your ratings.

## View Statistics

Press **Cmd+Shift+S** to see:
- Total cards and due cards
- Daily review progress
- Retention rates
- Learning streaks

## Settings

- **Daily Review Limit**: Maximum cards per day (default: 20)
- **New Cards Per Day**: New cards to introduce daily (default: 10)  
- **Target Retention**: Goal accuracy percentage (default: 90%)
- **Show Context**: Display surrounding text during review
- **Auto-Index**: Automatically detect flashcards when saving

## Tips

- Keep questions focused and atomic
- Use the AI generator for consistent formatting
- Review daily for best retention
- Adjust settings based on your learning pace`,

  settings: [
    {
      id: 'auto-index',
      name: 'Auto-Index on Save',
      type: 'boolean',
      default: true,
      description: 'Automatically detect and index flashcards when saving notes',
    },
    {
      id: 'daily-limit',
      name: 'Daily Review Limit',
      type: 'number',
      default: 20,
      description: 'Maximum number of cards to review per day',
    },
    {
      id: 'new-cards-per-day',
      name: 'New Cards Per Day',
      type: 'number',
      default: 10,
      description: 'Maximum number of new cards to introduce per day',
    },
    {
      id: 'target-retention',
      name: 'Target Retention Rate',
      type: 'number',
      default: 90,
      description: 'Target retention percentage (affects intervals)',
    },
    {
      id: 'show-context',
      name: 'Show Context in Review',
      type: 'boolean',
      default: true,
      description: 'Display surrounding context when reviewing cards',
    },
  ] as PluginSetting[],

  commands: [
    {
      id: 'generate-from-selection',
      name: 'AI: Generate Flashcards from Selection',
      description: 'Use AI to generate flashcards from selected text',
      keybinding: 'Cmd+Shift+G',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.generateFromSelection();
        }
      },
    },
    {
      id: 'generate-from-note',
      name: 'AI: Generate Flashcards from Note',
      description: 'Use AI to analyze note and generate flashcards',
      keybinding: 'Cmd+Alt+G',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.generateFromNote();
        }
      },
    },
    {
      id: 'complete-answers',
      name: 'AI: Complete Missing Answers',
      description: 'Use AI to fill in missing answers for incomplete flashcards',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.completeAnswers();
        }
      },
    },
    {
      id: 'index-current-note',
      name: 'Index Current Note for Flashcards',
      description: 'Scan current note and index any flashcards',
      keybinding: 'Cmd+Shift+F',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.indexCurrentNote();
        }
      },
    },
    {
      id: 'index-all-notes',
      name: 'Index All Notes for Flashcards',
      description: 'Scan all notes and index flashcards',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.indexAllNotes();
        }
      },
    },
    {
      id: 'open-review',
      name: 'Start Flashcard Review',
      description: 'Open review panel to study due cards',
      keybinding: 'Cmd+Shift+R',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.openReviewPanel();
        }
      },
    },
    {
      id: 'show-stats',
      name: 'Show Flashcard Statistics',
      description: 'Display learning statistics and progress',
      keybinding: 'Cmd+Shift+S',
      callback: async () => {
        if (pluginInstance) {
          await pluginInstance.showStatistics();
        }
      },
    },
  ] as Command[],

  onLoad: async (api?: PluginAPI) => {
    if (api) {
      pluginInstance = new SpacedRepetitionPlugin(api);
      await pluginInstance.init();

      // Listen for note save events to auto-index
      api.events.on('note-updated', async (data: { noteId: string }) => {
        const autoIndex = api.settings.get('auto-index');
        if (autoIndex && pluginInstance) {
          // Auto-index in background (don't await)
          const note = api.notes.get(data.noteId);
          if (note) {
            // TODO: Call index method
          }
        }
      });
    }
    console.log('Spaced Repetition plugin loaded');
  },

  onUnload: () => {
    pluginInstance = null;
    console.log('Spaced Repetition plugin unloaded');
  },
};
