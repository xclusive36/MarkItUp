'use client';

// No React hooks used
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  theme?: 'light' | 'dark';
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  theme = 'light',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="mb-6 opacity-20" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
        <Icon className="w-24 h-24" strokeWidth={1.5} />
      </div>
      <h3
        className="text-xl font-semibold mb-2"
        style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
      >
        {title}
      </h3>
      <p
        className="text-sm max-w-md mb-6"
        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
      >
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
            color: '#ffffff',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
