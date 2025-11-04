'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface SimpleDropdownProps {
  trigger: {
    icon: React.ReactNode;
    label?: string;
    title: string;
  };
  items: DropdownItem[];
  theme?: 'light' | 'dark'; // Optional for backward compatibility
  className?: string;
}

export function SimpleDropdown({ trigger, items, className = '' }: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-1 p-2 rounded-md transition-colors hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
        }}
        title={trigger.title}
      >
        {trigger.icon}
        {trigger.label && <span className="text-sm">{trigger.label}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50 border"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-primary)',
          }}
        >
          <div className="py-1">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="flex items-center w-full px-4 py-2 text-sm transition-colors hover:bg-opacity-10 hover:bg-blue-500 focus:outline-none focus:bg-opacity-10 focus:bg-blue-500"
                style={{
                  color: item.active ? 'var(--accent-primary)' : 'var(--text-primary)',
                }}
              >
                {item.icon && <span className="w-4 h-4 mr-3">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
