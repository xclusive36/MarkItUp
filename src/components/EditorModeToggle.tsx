import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit3, Eye, Columns } from 'lucide-react';

interface EditorModeToggleProps {
  viewMode: 'edit' | 'preview' | 'split';
  setViewMode: (v: 'edit' | 'preview' | 'split') => void;
  theme: string;
  onModeChange?: (mode: 'edit' | 'preview' | 'split') => void;
}

const modes: Array<{
  key: 'edit' | 'preview' | 'split';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'edit', label: 'Edit', icon: Edit3 },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'split', label: 'Split', icon: Columns },
];

const EditorModeToggle: React.FC<EditorModeToggleProps> = ({
  viewMode,
  setViewMode,
  // theme, // No longer needed - using CSS variables
  onModeChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Show buttons on desktop (md and up)
  const desktopShowClass = 'hidden md:inline-flex';
  const mobileShowClass = 'md:hidden';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleModeChange = (mode: 'edit' | 'preview' | 'split') => {
    setViewMode(mode);
    onModeChange?.(mode);
    setIsDropdownOpen(false);
  };

  const currentMode = modes.find(m => m.key === viewMode);

  return (
    <>
      {/* Desktop: Button Group (visible on md/lg and up) */}
      <div
        className={`${desktopShowClass} gap-2 p-1 rounded-lg shadow-sm`}
        style={{
          background: 'transparent',
          boxShadow: 'var(--theme-shadow, 0 1px 4px rgba(0,0,0,0.1))',
        }}
      >
        {modes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleModeChange(key)}
            className="px-3 py-1 text-xs rounded-md transition-colors shadow-sm font-medium focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              minWidth: 70,
              backgroundColor: viewMode === key ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
              color: viewMode === key ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: viewMode === key ? 'var(--accent-primary)' : 'var(--border-secondary)',
            }}
            onMouseEnter={e => {
              if (viewMode !== key) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }
            }}
            onMouseLeave={e => {
              if (viewMode !== key) {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mobile: Dropdown Menu (visible below md/lg) */}
      <div className={`${mobileShowClass} relative`} ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors shadow-sm font-medium focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--border-secondary)',
          }}
          aria-label="Editor mode menu"
        >
          {currentMode && (
            <>
              <currentMode.icon className="w-4 h-4" />
              <span className="text-xs">{currentMode.label}</span>
            </>
          )}
          <MoreVertical className="w-3 h-3 ml-1" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div
            className="absolute right-0 top-full mt-1 min-w-[140px] rounded-lg shadow-lg border z-50 py-1"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
            }}
          >
            {modes.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleModeChange(key)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm transition-colors"
                style={{
                  color: viewMode === key ? 'var(--accent-primary)' : 'var(--text-primary)',
                  backgroundColor: viewMode === key ? 'var(--bg-tertiary)' : 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  if (viewMode !== key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {viewMode === key && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default EditorModeToggle;
