'use client';

import React, { useState } from 'react';
import { HelpCircle, Info, AlertCircle, Lightbulb, X } from 'lucide-react';

type HelpIconType = 'help' | 'info' | 'alert' | 'tip';

interface HelpTooltipProps {
  /** Help content */
  content: string | React.ReactNode;
  /** Icon type */
  icon?: HelpIconType;
  /** Tooltip title */
  title?: string;
  /** Placement of tooltip */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Size of the icon */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show as a popover (clickable) instead of hover tooltip */
  asPopover?: boolean;
}

/**
 * HelpTooltip Component
 *
 * Displays contextual help information with an icon trigger.
 * Can be used inline or as a popover.
 *
 * @example
 * ```tsx
 * <HelpTooltip content="This is the markdown editor" />
 *
 * <HelpTooltip
 *   icon="tip"
 *   title="Pro Tip"
 *   content="Use Cmd+S to save"
 *   asPopover
 * />
 * ```
 */
export default function HelpTooltip({
  content,
  icon = 'help',
  title,
  placement = 'top',
  size = 'sm',
  asPopover = false,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  const iconColor = getIconColor(icon);

  const renderIcon = () => {
    const IconComponent = getIcon(icon);
    return <IconComponent className={iconSize} />;
  };

  if (asPopover) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${iconColor} hover:opacity-70 transition-opacity`}
          aria-label="Show help"
        >
          {renderIcon()}
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            {/* Popover */}
            <div
              className={`absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm animate-scale-in ${getPopoverPosition(
                placement
              )}`}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </button>

              {title && (
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-6">
                  {title}
                </h4>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">{content}</div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Hover tooltip
  return (
    <div className="group relative inline-block">
      {renderIcon()}

      <div
        className={`absolute z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none ${getTooltipPosition(
          placement
        )}`}
        role="tooltip"
      >
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div>{content}</div>

        {/* Arrow */}
        <div
          className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${getArrowPosition(
            placement
          )}`}
        />
      </div>
    </div>
  );
}

/** Get icon component */
function getIcon(type: HelpIconType) {
  switch (type) {
    case 'help':
      return HelpCircle;
    case 'info':
      return Info;
    case 'alert':
      return AlertCircle;
    case 'tip':
      return Lightbulb;
    default:
      return HelpCircle;
  }
}

/** Get icon color */
function getIconColor(type: HelpIconType): string {
  switch (type) {
    case 'help':
      return 'text-blue-500 dark:text-blue-400';
    case 'info':
      return 'text-gray-500 dark:text-gray-400';
    case 'alert':
      return 'text-orange-500 dark:text-orange-400';
    case 'tip':
      return 'text-yellow-500 dark:text-yellow-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
}

/** Get tooltip position classes */
function getTooltipPosition(placement: string): string {
  switch (placement) {
    case 'top':
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2 mt-2';
    case 'left':
      return 'right-full top-1/2 -translate-y-1/2 mr-2';
    case 'right':
      return 'left-full top-1/2 -translate-y-1/2 ml-2';
    default:
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
  }
}

/** Get arrow position classes */
function getArrowPosition(placement: string): string {
  switch (placement) {
    case 'top':
      return 'top-full left-1/2 -translate-x-1/2 -mt-1';
    case 'bottom':
      return 'bottom-full left-1/2 -translate-x-1/2 -mb-1';
    case 'left':
      return 'left-full top-1/2 -translate-y-1/2 -ml-1';
    case 'right':
      return 'right-full top-1/2 -translate-y-1/2 -mr-1';
    default:
      return 'top-full left-1/2 -translate-x-1/2 -mt-1';
  }
}

/** Get popover position classes */
function getPopoverPosition(placement: string): string {
  switch (placement) {
    case 'top':
      return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2 mt-2';
    case 'left':
      return 'right-full top-1/2 -translate-y-1/2 mr-2';
    case 'right':
      return 'left-full top-1/2 -translate-y-1/2 ml-2';
    default:
      return 'top-full left-0 mt-2';
  }
}

/**
 * InfoBanner Component
 *
 * Displays an informational banner with help text.
 * Good for page-level contextual help.
 *
 * @example
 * ```tsx
 * <InfoBanner
 *   type="tip"
 *   title="Getting Started"
 *   dismissible
 * >
 *   Create your first note by clicking the + button
 * </InfoBanner>
 * ```
 */
interface InfoBannerProps {
  /** Banner content */
  children: React.ReactNode;
  /** Banner type */
  type?: 'info' | 'tip' | 'warning' | 'success';
  /** Banner title */
  title?: string;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

export function InfoBanner({
  children,
  type = 'info',
  title,
  dismissible = false,
  onDismiss,
}: InfoBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const styles = getBannerStyles(type);

  return (
    <div
      className={`${styles.bg} ${styles.border} border-l-4 p-4 rounded-r-lg animate-slide-in-down`}
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} mt-0.5`}>
          {type === 'info' && <Info className="w-5 h-5" />}
          {type === 'tip' && <Lightbulb className="w-5 h-5" />}
          {type === 'warning' && <AlertCircle className="w-5 h-5" />}
          {type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>

        <div className="flex-1">
          {title && <h3 className={`${styles.title} text-sm font-semibold mb-1`}>{title}</h3>}
          <div className={`${styles.text} text-sm`}>{children}</div>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`${styles.icon} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Get banner styling based on type */
function getBannerStyles(type: string) {
  switch (type) {
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500',
        icon: 'text-blue-500 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-300',
        text: 'text-blue-700 dark:text-blue-400',
      };
    case 'tip':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-500',
        icon: 'text-yellow-500 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-300',
        text: 'text-yellow-700 dark:text-yellow-400',
      };
    case 'warning':
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-500',
        icon: 'text-orange-500 dark:text-orange-400',
        title: 'text-orange-900 dark:text-orange-300',
        text: 'text-orange-700 dark:text-orange-400',
      };
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-500',
        icon: 'text-green-500 dark:text-green-400',
        title: 'text-green-900 dark:text-green-300',
        text: 'text-green-700 dark:text-green-400',
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-500',
        icon: 'text-gray-500 dark:text-gray-400',
        title: 'text-gray-900 dark:text-gray-300',
        text: 'text-gray-700 dark:text-gray-400',
      };
  }
}
