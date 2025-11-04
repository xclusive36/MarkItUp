'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SPACED REPETITION UI COMPONENTS
 *
 * React components for the flashcard review interface and statistics dashboard
 */

// ============================================================================
// TYPES (matching the main plugin file)
// ============================================================================

type CardState = 'new' | 'learning' | 'review' | 'relearning';
type CardRating = 1 | 2 | 3 | 4;

interface FlashcardRecord {
  id: string;
  noteId: string;
  noteName: string;
  blockId?: string;
  front: string;
  back: string;
  context?: string;
  tags: string[];
  state: CardState;
  due: number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review?: number;
  created: number;
  modified: number;
}

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

// ============================================================================
// FLASHCARD REVIEW COMPONENT
// ============================================================================

interface FlashcardReviewProps {
  onClose: () => void;
  manager: any; // FlashcardManager instance
}

export const FlashcardReview: React.FC<FlashcardReviewProps> = ({ onClose, manager }) => {
  const [currentCard, setCurrentCard] = useState<FlashcardRecord | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [queue, setQueue] = useState<FlashcardRecord[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [reviewStartTime, setReviewStartTime] = useState(0);

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const dueCards = await manager.getDueCards(20);
      const newCards = await manager.getNewCards(10);
      const combined = [...dueCards, ...newCards];

      setQueue(combined);
      if (combined.length > 0) {
        setCurrentCard(combined[0]);
        setReviewStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleRating = async (rating: CardRating) => {
    if (!currentCard || reviewing) return;

    setReviewing(true);
    const reviewTime = Date.now() - reviewStartTime;

    try {
      await manager.reviewCard(currentCard.id, rating, reviewTime);

      // Update session stats
      const ratingNames = ['again', 'hard', 'good', 'easy'] as const;
      const ratingName = ratingNames[rating - 1];
      if (ratingName) {
        setSessionStats(prev => ({
          ...prev,
          [ratingName]: prev[ratingName] + 1,
        }));
      }

      setReviewCount(prev => prev + 1);

      // Move to next card
      const newQueue = queue.slice(1);
      setQueue(newQueue);

      const nextCard = newQueue[0];
      if (nextCard) {
        setCurrentCard(nextCard);
        setShowAnswer(false);
        setReviewStartTime(Date.now());
      } else {
        setCurrentCard(null);
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
    } finally {
      setReviewing(false);
    }
  };

  const getRatingInfo = (): Record<
    CardRating,
    { label: string; interval: string; color: string }
  > => {
    if (!currentCard) {
      return {
        1: { label: 'Again', interval: '< 10m', color: 'red' },
        2: { label: 'Hard', interval: '< 1d', color: 'orange' },
        3: { label: 'Good', interval: '1-3d', color: 'green' },
        4: { label: 'Easy', interval: '4+d', color: 'blue' },
      };
    }

    const intervals = manager.getRatingIntervals(currentCard);

    return {
      1: { label: 'Again', interval: formatInterval(intervals[1]), color: 'red' },
      2: { label: 'Hard', interval: formatInterval(intervals[2]), color: 'orange' },
      3: { label: 'Good', interval: formatInterval(intervals[3]), color: 'green' },
      4: { label: 'Easy', interval: formatInterval(intervals[4]), color: 'blue' },
    };
  };

  const formatInterval = (days: number): string => {
    if (days < 1) return '< 10m';
    if (days === 1) return '1d';
    if (days < 30) return `${Math.round(days)}d`;
    if (days < 365) return `${Math.round(days / 30)}mo`;
    return `${Math.round(days / 365)}yr`;
  };

  const getStateColor = (state: CardState): string => {
    switch (state) {
      case 'new':
        return 'bg-blue-500';
      case 'learning':
        return 'bg-yellow-500';
      case 'review':
        return 'bg-green-500';
      case 'relearning':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const ratingInfo = getRatingInfo();

  if (!currentCard) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">All Done!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've reviewed all cards for today!
            </p>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2 dark:text-white">Session Summary</h3>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>
                  <div className="text-red-500 font-bold">{sessionStats.again}</div>
                  <div className="text-gray-500">Again</div>
                </div>
                <div>
                  <div className="text-orange-500 font-bold">{sessionStats.hard}</div>
                  <div className="text-gray-500">Hard</div>
                </div>
                <div>
                  <div className="text-green-500 font-bold">{sessionStats.good}</div>
                  <div className="text-gray-500">Good</div>
                </div>
                <div>
                  <div className="text-blue-500 font-bold">{sessionStats.easy}</div>
                  <div className="text-gray-500">Easy</div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white">Flashcard Review</h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStateColor(currentCard.state)}`}
            >
              {currentCard.state.toUpperCase()}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {reviewCount} reviewed • {queue.length} remaining
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Note info */}
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            From: <span className="font-medium">{currentCard.noteName}</span>
            {currentCard.blockId && <span className="ml-2 text-xs">^{currentCard.blockId}</span>}
          </div>

          {/* Front (Question) */}
          <motion.div
            key={currentCard.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              QUESTION
            </div>
            <div className="text-2xl font-medium dark:text-white mb-6">{currentCard.front}</div>
          </motion.div>

          {/* Back (Answer) */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
              >
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    ANSWER
                  </div>
                  <div className="text-xl dark:text-white mb-4">{currentCard.back}</div>

                  {currentCard.context && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        CONTEXT
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {currentCard.context}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with buttons */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Show Answer
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(rating => {
                const info = ratingInfo[rating as CardRating];
                return (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating as CardRating)}
                    disabled={reviewing}
                    className={`
                      py-3 rounded-lg font-medium transition-all
                      ${reviewing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                      ${info.color === 'red' ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300' : ''}
                      ${info.color === 'orange' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300' : ''}
                      ${info.color === 'green' ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300' : ''}
                      ${info.color === 'blue' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300' : ''}
                    `}
                  >
                    <div className="text-xs font-semibold mb-1">{info.label}</div>
                    <div className="text-xs opacity-75">{info.interval}</div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            Keyboard: Space = Show • 1-4 = Rate
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// STATISTICS DASHBOARD COMPONENT
// ============================================================================

interface StatsDashboardProps {
  onClose: () => void;
  manager: any;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ onClose, manager }) => {
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await manager.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">📊 Learning Statistics</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">
                Total Cards
              </div>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {stats.total}
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mb-1">
                Due Today
              </div>
              <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.due_today}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">
                Retention Rate
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                {stats.retention_rate.toFixed(0)}%
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">
                Streak
              </div>
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {stats.streak_days} 🔥
              </div>
            </div>
          </div>

          {/* Card States */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Card States</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">New</span>
                  <span className="text-2xl font-bold dark:text-white">{stats.new}</span>
                </div>
                <div className="mt-2 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.new / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Learning</span>
                  <span className="text-2xl font-bold dark:text-white">{stats.learning}</span>
                </div>
                <div className="mt-2 h-2 bg-yellow-200 dark:bg-yellow-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${(stats.learning / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Review</span>
                  <span className="text-2xl font-bold dark:text-white">{stats.review}</span>
                </div>
                <div className="mt-2 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${(stats.review / stats.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Relearning</span>
                  <span className="text-2xl font-bold dark:text-white">{stats.relearning}</span>
                </div>
                <div className="mt-2 h-2 bg-orange-200 dark:bg-orange-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${(stats.relearning / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500 dark:text-gray-400">Average Ease</div>
                <div className="text-xl font-semibold dark:text-white">
                  {stats.average_ease.toFixed(1)}/10
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Total Reviews</div>
                <div className="text-xl font-semibold dark:text-white">
                  {stats.total_reviews.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-400">Last Review</div>
                <div className="text-xl font-semibold dark:text-white">
                  {stats.last_review ? new Date(stats.last_review).toLocaleDateString() : 'Never'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// MAIN PLUGIN VIEW COMPONENT
// ============================================================================

interface SpacedRepetitionViewProps {
  manager: any;
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({ manager }) => {
  const [showReview, setShowReview] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd+Shift+R for review
      if (e.metaKey && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        setShowReview(true);
      }
      // Cmd+Shift+S for stats
      if (e.metaKey && e.shiftKey && e.key === 's') {
        e.preventDefault();
        setShowStats(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {showReview && <FlashcardReview onClose={() => setShowReview(false)} manager={manager} />}
      {showStats && <StatsDashboard onClose={() => setShowStats(false)} manager={manager} />}
    </>
  );
};
