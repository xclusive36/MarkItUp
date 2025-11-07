'use client';

import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  /** Whether to show the success animation */
  show: boolean;
  /** Success message to display */
  message?: string;
  /** Duration in milliseconds before auto-hiding (0 = no auto-hide) */
  duration?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Animation variant */
  variant?: 'checkmark' | 'confetti' | 'glow' | 'tada';
}

/**
 * SuccessAnimation Component
 *
 * Displays celebratory success animations for completed actions.
 *
 * @example
 * ```tsx
 * <SuccessAnimation
 *   show={saved}
 *   message="Note saved!"
 *   variant="confetti"
 *   onComplete={() => setSaved(false)}
 * />
 * ```
 */
export default function SuccessAnimation({
  show,
  message = 'Success!',
  duration = 2000,
  onComplete,
  variant = 'checkmark',
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
    return undefined;
  }, [show, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {variant === 'checkmark' && <CheckmarkAnimation message={message} />}
      {variant === 'confetti' && <ConfettiAnimation message={message} />}
      {variant === 'glow' && <GlowAnimation message={message} />}
      {variant === 'tada' && <TadaAnimation message={message} />}
    </div>
  );
}

/** Animated checkmark */
function CheckmarkAnimation({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl animate-pop-in pointer-events-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center animate-success-glow">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="checkmark-svg checkmark-animate" d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{message}</p>
      </div>
    </div>
  );
}

/** Confetti celebration */
function ConfettiAnimation({ message }: { message: string }) {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
    ][Math.floor(Math.random() * 6)],
  }));

  return (
    <>
      {/* Confetti pieces */}
      {confettiPieces.map(piece => (
        <div
          key={piece.id}
          className={`absolute top-0 w-2 h-2 ${piece.color} rounded-sm`}
          style={{
            left: `${piece.left}%`,
            animation: `confetti-fall ${piece.duration}s ease-out ${piece.delay}s`,
            transform: 'translateY(-100%)',
          }}
        />
      ))}

      {/* Success message */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl animate-pop-in pointer-events-auto">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-tada">🎉</span>
          <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{message}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

/** Glow effect */
function GlowAnimation({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl animate-scale-in animate-success-glow pointer-events-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-3xl">✨</span>
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{message}</p>
      </div>
    </div>
  );
}

/** Tada celebration */
function TadaAnimation({ message }: { message: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl animate-tada pointer-events-auto">
      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl">🎊</span>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{message}</p>
      </div>
    </div>
  );
}

/**
 * Hook to trigger success animations
 *
 * @example
 * ```tsx
 * const { triggerSuccess, SuccessComponent } = useSuccessAnimation();
 *
 * const handleSave = async () => {
 *   await saveNote();
 *   triggerSuccess('Note saved!', 'confetti');
 * };
 *
 * return (
 *   <>
 *     <button onClick={handleSave}>Save</button>
 *     {SuccessComponent}
 *   </>
 * );
 * ```
 */
export function useSuccessAnimation() {
  const [config, setConfig] = useState<{
    show: boolean;
    message: string;
    variant: 'checkmark' | 'confetti' | 'glow' | 'tada';
  }>({
    show: false,
    message: 'Success!',
    variant: 'checkmark',
  });

  const triggerSuccess = (
    message: string = 'Success!',
    variant: 'checkmark' | 'confetti' | 'glow' | 'tada' = 'checkmark'
  ) => {
    setConfig({ show: true, message, variant });
  };

  const SuccessComponent = (
    <SuccessAnimation
      show={config.show}
      message={config.message}
      variant={config.variant}
      onComplete={() => setConfig(prev => ({ ...prev, show: false }))}
    />
  );

  return { triggerSuccess, SuccessComponent };
}
