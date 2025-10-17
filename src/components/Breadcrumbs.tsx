'use client';

import React from 'react';
import { ChevronRight, Home, Folder, FileText } from 'lucide-react';

interface BreadcrumbsProps {
  folder?: string;
  fileName?: string;
  onNavigateHome: () => void;
  onNavigateToFolder: (folderPath: string) => void;
  theme: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  folder,
  fileName,
  onNavigateHome,
  onNavigateToFolder,
  theme,
}) => {
  // Split folder path into segments
  const folderSegments = folder ? folder.split('/').filter(segment => segment.trim() !== '') : [];

  return (
    <nav
      className="flex items-center gap-2 text-sm py-2 px-4 rounded-lg mb-4"
      style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      }}
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Go to home"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {/* Folder segments */}
      {folderSegments.map((segment, index) => {
        const folderPath = folderSegments.slice(0, index + 1).join('/');
        const isLast = index === folderSegments.length - 1 && !fileName;

        return (
          <React.Fragment key={folderPath}>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <button
              onClick={() => onNavigateToFolder(folderPath)}
              className={`flex items-center gap-1 transition-colors truncate max-w-[150px] sm:max-w-none ${
                isLast
                  ? 'font-semibold text-gray-900 dark:text-gray-100'
                  : 'hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title={segment}
            >
              <Folder className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{segment}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* Current file */}
      {fileName && (
        <>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <div
            className="flex items-center gap-1 font-semibold truncate max-w-[200px] sm:max-w-none"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
            title={fileName}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{fileName.replace('.md', '')}</span>
          </div>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;
