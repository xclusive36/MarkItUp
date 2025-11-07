import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  showHome = true,
  className = '',
}) => {
  const defaultSeparator = <ChevronRight className="w-4 h-4" />;
  const sep = separator !== undefined ? separator : defaultSeparator;

  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', icon: <Home className="w-4 h-4" />, onClick: () => {} }, ...items]
    : items;

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
      style={{
        color: 'var(--text-secondary)',
      }}
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center space-x-2">
              {item.onClick || item.href ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center space-x-1.5 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-1"
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isLast ? 600 : 400,
                    opacity: isLast ? 1 : 0.7,
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ) : (
                <span
                  className="flex items-center space-x-1.5"
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isLast ? 600 : 400,
                    opacity: isLast ? 1 : 0.7,
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && (
                <span
                  className="opacity-40"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-hidden="true"
                >
                  {sep}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
