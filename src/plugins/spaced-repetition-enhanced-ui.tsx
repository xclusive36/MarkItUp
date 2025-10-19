'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ENHANCED SPACED REPETITION UI COMPONENTS v1.2
 *
 * Improved flashcard review interface and statistics dashboard with:
 * - Better keyboard navigation
 * - Visual progress tracking
 * - Retention charts
 * - Card difficulty indicators
 * - Session insights
 */

// ============================================================================
// TYPES
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
// ENHANCED FLASHCARD REVIEW COMPONENT
// ============================================================================

interface FlashcardReviewProps {
  onClose: () => void;
  manager: {
    getDueCards: (limit: number) => Promise<FlashcardRecord[]>;
    getNewCards: (limit: number) => Promise<FlashcardRecord[]>;
    reviewCard: (
      cardId: string,
      rating: CardRating,
      reviewTime: number
    ) => Promise<FlashcardRecord>;
    getRatingIntervals: (card: FlashcardRecord) => Record<CardRating, number>;
  };
}

export const EnhancedFlashcardReview: React.FC<FlashcardReviewProps> = ({ onClose, manager }) => {
  const [currentCard, setCurrentCard] = useState<FlashcardRecord | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [queue, setQueue] = useState<FlashcardRecord[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [reviewStartTime, setReviewStartTime] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  useEffect(() => {
    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
          setCardFlipped(true);
        }
      } else if (showAnswer && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        handleRating(parseInt(e.key) as CardRating);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnswer, currentCard]);

  const loadCards = async () => {
    try {
      const dueCards = await manager.getDueCards(20);
      const newCards = await manager.getNewCards(10);
      const combined = [...dueCards, ...newCards];

      setQueue(combined);
      setTotalCards(combined.length);
      if (combined.length > 0) {
        setCurrentCard(combined[0]);
        setReviewStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    }
  };

  const handleRating = useCallback(
    async (rating: CardRating) => {
      if (!currentCard || reviewing) return;

      setReviewing(true);
      const reviewTime = Date.now() - reviewStartTime;

      try {
        await manager.reviewCard(currentCard.id, rating, reviewTime);

        const ratingNames = ['again', 'hard', 'good', 'easy'] as const;
        setSessionStats(prev => ({
          ...prev,
          [ratingNames[rating - 1]]: prev[ratingNames[rating - 1]] + 1,
        }));

        setReviewCount(prev => prev + 1);

        const newQueue = queue.slice(1);
        setQueue(newQueue);

        if (newQueue.length > 0) {
          setCurrentCard(newQueue[0]);
          setShowAnswer(false);
          setCardFlipped(false);
          setReviewStartTime(Date.now());
        } else {
          setCurrentCard(null);
        }
      } catch (error) {
        console.error('Error reviewing card:', error);
      } finally {
        setReviewing(false);
      }
    },
    [currentCard, reviewing, reviewStartTime, queue, manager]
  );

  const getRatingInfo = (): Record<
    CardRating,
    { label: string; interval: string; color: string; emoji: string }
  > => {
    if (!currentCard) {
      return {
        1: { label: 'Again', interval: '< 10m', color: 'red', emoji: '😓' },
        2: { label: 'Hard', interval: '< 1d', color: 'orange', emoji: '😅' },
        3: { label: 'Good', interval: '1-3d', color: 'green', emoji: '😊' },
        4: { label: 'Easy', interval: '4+d', color: 'blue', emoji: '😎' },
      };
    }

    const intervals = manager.getRatingIntervals(currentCard);

    return {
      1: { label: 'Again', interval: formatInterval(intervals[1]), color: 'red', emoji: '😓' },
      2: { label: 'Hard', interval: formatInterval(intervals[2]), color: 'orange', emoji: '😅' },
      3: { label: 'Good', interval: formatInterval(intervals[3]), color: 'green', emoji: '😊' },
      4: { label: 'Easy', interval: formatInterval(intervals[4]), color: 'blue', emoji: '😎' },
    };
  };

  const formatInterval = (days: number): string => {
    if (days < 1) return '< 10m';
    if (days === 1) return '1 day';
    if (days < 30) return `${Math.round(days)} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
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

  const getDifficultyLabel = (difficulty: number): { label: string; color: string } => {
    if (difficulty < 3) return { label: 'Easy', color: 'text-green-600 dark:text-green-400' };
    if (difficulty < 6) return { label: 'Medium', color: 'text-yellow-600 dark:text-yellow-400' };
    if (difficulty < 8) return { label: 'Hard', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Very Hard', color: 'text-red-600 dark:text-red-400' };
  };

  const progressPercentage = totalCards > 0 ? (reviewCount / totalCards) * 100 : 0;
  const ratingInfo = getRatingInfo();

  // Session Complete View
  if (!currentCard) {
    const totalReviews =
      sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;
    const accuracy =
      totalReviews > 0 ? ((sessionStats.good + sessionStats.easy) / totalReviews) * 100 : 0;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold mb-2 dark:text-white">All Done!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You've completed today's review session
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4 dark:text-white text-lg">Session Summary</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cards Reviewed</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totalReviews}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {accuracy.toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-2xl mb-1">😓</div>
                  <div className="font-bold text-red-600 dark:text-red-400">
                    {sessionStats.again}
                  </div>
                  <div className="text-xs text-gray-500">Again</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-2xl mb-1">😅</div>
                  <div className="font-bold text-orange-600 dark:text-orange-400">
                    {sessionStats.hard}
                  </div>
                  <div className="text-xs text-gray-500">Hard</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-2xl mb-1">😊</div>
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {sessionStats.good}
                  </div>
                  <div className="text-xs text-gray-500">Good</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-2xl mb-1">😎</div>
                  <div className="font-bold text-blue-600 dark:text-blue-400">
                    {sessionStats.easy}
                  </div>
                  <div className="text-xs text-gray-500">Easy</div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const difficulty = getDifficultyLabel(currentCard.difficulty);

  // Main Review Interface
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">🎓 Flashcard Review</h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStateColor(currentCard.state)}`}
            >
              {currentCard.state.toUpperCase()}
            </div>
            <div className={`text-xs font-semibold ${difficulty.color}`}>⚡ {difficulty.label}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-white/90">
              {reviewCount} / {totalCards} reviewed
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Card Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Note Info */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{currentCard.noteName}</span>
              {currentCard.blockId && (
                <span className="ml-2 text-xs opacity-60">^{currentCard.blockId}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Reviews: {currentCard.reps}</span>
              {currentCard.lapses > 0 && <span>• Lapses: {currentCard.lapses}</span>}
            </div>
          </div>

          {/* Card with 3D flip effect */}
          <div className="perspective-1000">
            <motion.div
              className="min-h-[300px]"
              initial={false}
              animate={{ rotateY: cardFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front (Question) */}
              <div className={`${cardFlipped ? 'invisible' : 'visible'}`}>
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 border-2 border-blue-200 dark:border-gray-500">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">
                    Question
                  </div>
                  <div className="text-3xl font-medium dark:text-white leading-relaxed">
                    {currentCard.front}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Answer */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8 border-2 border-green-200 dark:border-gray-500">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-4 uppercase tracking-wide">
                    Answer
                  </div>
                  <div className="text-2xl dark:text-white leading-relaxed mb-4">
                    {currentCard.back}
                  </div>

                  {currentCard.context && (
                    <div className="mt-6 pt-6 border-t border-green-200 dark:border-gray-500">
                      <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                        Context
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
            <div>
              <button
                onClick={() => {
                  setShowAnswer(true);
                  setCardFlipped(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-lg shadow-lg"
              >
                Show Answer
              </button>
              <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to
                reveal
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {([1, 2, 3, 4] as CardRating[]).map(rating => {
                  const info = ratingInfo[rating];
                  const colors = {
                    red: 'bg-red-500 hover:bg-red-600 text-white',
                    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
                    green: 'bg-green-500 hover:bg-green-600 text-white',
                    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
                  };

                  return (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      disabled={reviewing}
                      className={`
                        py-4 rounded-xl font-medium transition-all shadow-md
                        ${reviewing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'}
                        ${colors[info.color as keyof typeof colors]}
                      `}
                    >
                      <div className="text-2xl mb-1">{info.emoji}</div>
                      <div className="text-sm font-bold mb-1">{info.label}</div>
                      <div className="text-xs opacity-90">{info.interval}</div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">1-4</kbd> to
                rate •<kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded ml-1">Esc</kbd>{' '}
                to exit
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// ENHANCED STATISTICS DASHBOARD
// ============================================================================

interface StatsDashboardProps {
  onClose: () => void;
  manager: {
    getStats: () => Promise<FlashcardStats>;
  };
}

export const EnhancedStatsDashboard: React.FC<StatsDashboardProps> = ({ onClose, manager }) => {
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">No Data Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start creating flashcards to see your statistics!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const cardStateData = [
    {
      state: 'New',
      count: stats.new,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      emoji: '🆕',
    },
    {
      state: 'Learning',
      count: stats.learning,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      emoji: '📚',
    },
    {
      state: 'Review',
      count: stats.review,
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
      emoji: '✅',
    },
    {
      state: 'Relearning',
      count: stats.relearning,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
      emoji: '🔄',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📊 Learning Statistics
              </h2>
              <p className="text-sm text-purple-100">Track your progress and retention</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                  Total Cards
                </div>
                <div className="text-2xl">🎴</div>
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                In your collection
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-5 border border-yellow-200 dark:border-yellow-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-yellow-700 dark:text-yellow-300 font-semibold">
                  Due Today
                </div>
                <div className="text-2xl">⏰</div>
              </div>
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.due_today}
              </div>
              <div className="text-xs text-yellow-600/70 dark:text-yellow-400/70 mt-1">
                Ready to review
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-green-700 dark:text-green-300 font-semibold">
                  Retention
                </div>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {stats.retention_rate.toFixed(0)}%
              </div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                Last 30 days
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
                  Streak
                </div>
                <div className="text-2xl">🔥</div>
              </div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {stats.streak_days}
              </div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                Days in a row
              </div>
            </motion.div>
          </div>

          {/* Card States Distribution */}
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
              <span>📈</span> Card Distribution
            </h3>

            {/* Visual Chart */}
            <div className="mb-6">
              <div className="flex h-8 rounded-lg overflow-hidden">
                {cardStateData.map((item, index) => {
                  const percentage = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  if (percentage === 0) return null;
                  return (
                    <motion.div
                      key={item.state}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className={`${item.color} relative group cursor-pointer`}
                      title={`${item.state}: ${item.count} (${percentage.toFixed(1)}%)`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {percentage.toFixed(0)}%
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* State Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {cardStateData.map((item, index) => (
                <motion.div
                  key={item.state}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4 border border-gray-200 dark:border-gray-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {item.state}
                    </div>
                    <div className="text-xl">{item.emoji}</div>
                  </div>
                  <div className={`text-3xl font-bold ${item.textColor}`}>{item.count}</div>
                  <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-500 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%`,
                      }}
                      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                      className={item.color}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">⚡</div>
                <div className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">
                  Average Ease
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.average_ease.toFixed(1)}
                <span className="text-lg">/10</span>
              </div>
              <div className="mt-2 w-full bg-indigo-200 dark:bg-indigo-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${(stats.average_ease / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-5 border border-pink-200 dark:border-pink-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">📝</div>
                <div className="text-sm text-pink-700 dark:text-pink-300 font-semibold">
                  Total Reviews
                </div>
              </div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {stats.total_reviews.toLocaleString()}
              </div>
              <div className="text-xs text-pink-600/70 dark:text-pink-400/70 mt-2">All time</div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-xl p-5 border border-teal-200 dark:border-teal-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">📅</div>
                <div className="text-sm text-teal-700 dark:text-teal-300 font-semibold">
                  Last Review
                </div>
              </div>
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {stats.last_review
                  ? new Date(stats.last_review).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Never'}
              </div>
              <div className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-2">
                {stats.last_review
                  ? `${Math.floor((Date.now() - stats.last_review) / (1000 * 60 * 60 * 24))} days ago`
                  : 'Start reviewing!'}
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          {stats.streak_days >= 7 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-300 dark:border-yellow-700"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎉</div>
                <div>
                  <div className="font-bold text-yellow-800 dark:text-yellow-200">
                    Amazing {stats.streak_days}-day streak!
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Keep up the great work! Consistency is key to learning.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedFlashcardReview;
