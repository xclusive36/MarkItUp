import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from './Button';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  illustration?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actions,
  illustration,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : Icon ? (
        <div
          className="mb-6 p-4 rounded-full"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-tertiary)',
          }}
        >
          <Icon className="w-12 h-12" strokeWidth={1.5} />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
