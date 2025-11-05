// No React imports needed

export interface LoadingSpinnerProps {
  /** Size of the spinner (default: 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant (default: 'primary') */
  variant?: 'primary' | 'secondary' | 'white';
  /** Optional label text */
  label?: string;
  /** Whether to show inline or centered (default: 'inline') */
  layout?: 'inline' | 'centered';
  /** Additional CSS classes */
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

const variantClasses = {
  primary: 'border-blue-600 border-t-transparent',
  secondary: 'border-gray-600 border-t-transparent dark:border-gray-400',
  white: 'border-white border-t-transparent',
};

/**
 * Loading spinner component with various sizes and variants
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" label="Loading..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  label,
  layout = 'inline',
  className = '',
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label={label || 'Loading'}
    >
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );

  if (layout === 'centered') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-4">
        {spinner}
        {label && <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {spinner}
      {label && <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>}
    </div>
  );
}

/**
 * Loading overlay component for full-screen loading states
 */
export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" label={label} layout="centered" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for content placeholders
 */
export function Skeleton({ className = '', count = 1 }: { className?: string; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
        />
      ))}
    </>
  );
}
