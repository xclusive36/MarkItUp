'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** CSS selector for the element to highlight */
  target: string;
  /** Title of the step */
  title: string;
  /** Content/description of the step */
  content: string;
  /** Placement of the tooltip relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Whether this step is skippable */
  skippable?: boolean;
}

interface GuidedTourProps {
  /** Array of tour steps */
  steps: TourStep[];
  /** Whether the tour is active */
  isActive: boolean;
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
  /** Show step indicators */
  showProgress?: boolean;
  /** Allow clicking outside to dismiss */
  dismissOnOutsideClick?: boolean;
}

/**
 * GuidedTour Component
 *
 * Creates an interactive onboarding experience with step-by-step tooltips.
 * Highlights UI elements and provides contextual guidance.
 *
 * @example
 * ```tsx
 * const steps = [
 *   {
 *     id: 'editor',
 *     target: '#markdown-editor',
 *     title: 'Welcome to the Editor',
 *     content: 'Start writing your notes here!',
 *     placement: 'bottom'
 *   },
 *   {
 *     id: 'preview',
 *     target: '#preview-pane',
 *     title: 'Live Preview',
 *     content: 'See your markdown rendered in real-time',
 *     placement: 'left'
 *   }
 * ];
 *
 * <GuidedTour
 *   steps={steps}
 *   isActive={showTour}
 *   onComplete={() => setShowTour(false)}
 * />
 * ```
 */
export default function GuidedTour({
  steps,
  isActive,
  onComplete,
  onSkip,
  showProgress = true,
  dismissOnOutsideClick = false,
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Update target element position
  useEffect(() => {
    if (!isActive || !step) return undefined;

    const updateTargetPosition = () => {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view if needed
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    };

    updateTargetPosition();

    // Update on scroll and resize
    window.addEventListener('scroll', updateTargetPosition, true);
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      window.removeEventListener('scroll', updateTargetPosition, true);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, step]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete?.();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (dismissOnOutsideClick && e.target === overlayRef.current) {
      handleSkip();
    }
  };

  if (!isActive || !step || !targetRect) return null;

  const tooltipPosition = calculateTooltipPosition(targetRect, step.placement || 'bottom');

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 tour-overlay"
        onClick={handleOverlayClick}
        role="presentation"
      >
        {/* Spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="tour-spotlight">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tour-spotlight)"
          />
        </svg>

        {/* Highlight ring */}
        <div
          className="absolute pointer-events-none border-4 border-blue-500 rounded-lg animate-pulse"
          style={{
            left: targetRect.left - 8,
            top: targetRect.top - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm animate-scale-in pointer-events-auto"
        style={{
          left: tooltipPosition.left,
          top: tooltipPosition.top,
          transform: tooltipPosition.transform,
        }}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        {/* Arrow */}
        <div
          className="absolute w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45"
          style={getArrowStyle(step.placement || 'bottom')}
        />

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative">
          <h3
            id="tour-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-6"
          >
            {step.title}
          </h3>
          <p id="tour-content" className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {step.content}
          </p>

          {/* Progress indicators */}
          {showProgress && (
            <div className="flex items-center gap-1 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : index < currentStep
                        ? 'bg-blue-300 dark:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentStep + 1} of {steps.length}
            </div>

            <div className="flex gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                {isLastStep ? (
                  'Finish'
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Calculate tooltip position based on target and placement */
function calculateTooltipPosition(
  targetRect: DOMRect,
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
): { left: number; top: number; transform: string } {
  const gap = 16; // Gap between target and tooltip

  switch (placement) {
    case 'top':
      return {
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.top - gap,
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return {
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.bottom + gap,
        transform: 'translate(-50%, 0)',
      };
    case 'left':
      return {
        left: targetRect.left - gap,
        top: targetRect.top + targetRect.height / 2,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        left: targetRect.right + gap,
        top: targetRect.top + targetRect.height / 2,
        transform: 'translate(0, -50%)',
      };
    case 'center':
      return {
        left: window.innerWidth / 2,
        top: window.innerHeight / 2,
        transform: 'translate(-50%, -50%)',
      };
    default:
      return {
        left: targetRect.left + targetRect.width / 2,
        top: targetRect.bottom + gap,
        transform: 'translate(-50%, 0)',
      };
  }
}

/** Get arrow positioning styles */
function getArrowStyle(
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
): React.CSSProperties {
  switch (placement) {
    case 'top':
      return {
        bottom: '-8px',
        left: '50%',
        marginLeft: '-8px',
      };
    case 'bottom':
      return {
        top: '-8px',
        left: '50%',
        marginLeft: '-8px',
      };
    case 'left':
      return {
        right: '-8px',
        top: '50%',
        marginTop: '-8px',
      };
    case 'right':
      return {
        left: '-8px',
        top: '50%',
        marginTop: '-8px',
      };
    default:
      return { display: 'none' };
  }
}

/**
 * Hook to manage guided tour state
 *
 * @example
 * ```tsx
 * const { startTour, TourComponent } = useGuidedTour(tourSteps);
 *
 * return (
 *   <>
 *     <button onClick={startTour}>Start Tour</button>
 *     {TourComponent}
 *   </>
 * );
 * ```
 */
export function useGuidedTour(steps: TourStep[]) {
  const [isActive, setIsActive] = useState(false);

  const startTour = () => setIsActive(true);
  const endTour = () => setIsActive(false);

  const TourComponent = (
    <GuidedTour steps={steps} isActive={isActive} onComplete={endTour} onSkip={endTour} />
  );

  return { startTour, endTour, isActive, TourComponent };
}

<style jsx global>{`
  .tour-overlay {
    animation: fadeIn 0.3s ease-out;
  }
`}</style>;
