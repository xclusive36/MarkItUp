'use client';

import React from 'react';

interface KeyboardHintProps {
  keys: string[];
  className?: string;
}

/**
 * Displays keyboard shortcut hints in a styled format
 * Example: <KeyboardHint keys={['Cmd', 'S']} />
 */
export const KeyboardHint: React.FC<KeyboardHintProps> = ({ keys, className = '' }) => {
  const isMac =
    typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Replace platform-specific keys
  const displayKeys = keys.map(key => {
    if (key === 'Cmd' || key === 'Ctrl') {
      return isMac ? '⌘' : 'Ctrl';
    }
    if (key === 'Alt' || key === 'Option') {
      return isMac ? '⌥' : 'Alt';
    }
    if (key === 'Shift') {
      return isMac ? '⇧' : 'Shift';
    }
    return key;
  });

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {displayKeys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd
            className="px-1.5 py-0.5 text-xs font-semibold rounded border shadow-sm"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-secondary)',
              color: 'var(--text-secondary)',
            }}
          >
            {key}
          </kbd>
          {index < displayKeys.length - 1 && <span className="text-xs mx-0.5">+</span>}
        </React.Fragment>
      ))}
    </span>
  );
};

interface TooltipWithShortcutProps {
  text: string;
  shortcut?: string[];
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Tooltip component that can include keyboard shortcuts
 */
export const TooltipWithShortcut: React.FC<TooltipWithShortcutProps> = ({
  text,
  shortcut,
  children,
  position = 'top',
}) => {
  const [show, setShow] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute z-50 ${positionClasses[position]} whitespace-nowrap px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none`}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)',
            border: '1px solid',
          }}
        >
          <div className="flex items-center gap-2">
            <span>{text}</span>
            {shortcut && shortcut.length > 0 && <KeyboardHint keys={shortcut} />}
          </div>
        </div>
      )}
    </div>
  );
};
