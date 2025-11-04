'use client';

import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Note } from '@/lib/types';

interface FolderNode {
  name: string;
  path: string;
  isExpanded: boolean;
  children: FolderNode[];
  notes: Note[];
}

interface FolderTreeProps {
  notes: Note[];
  activeNote: Note | null;
  currentFolder?: string;
  onNoteSelect: (noteId: string) => void;
  onFolderSelect?: (folderPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onRenameFolder?: (oldPath: string, newPath: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
  theme?: 'light' | 'dark';
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  notes,
  activeNote,
  currentFolder = '',
  onNoteSelect,
  onFolderSelect,
  onCreateFolder,
  theme = 'light',
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string } | null>(
    null
  );

  // Build folder tree from notes
  const folderTree = useMemo(() => {
    const root: FolderNode = {
      name: 'Root',
      path: '/',
      isExpanded: true,
      children: [],
      notes: notes.filter(n => !n.folder || n.folder === ''),
    };

    const folderMap = new Map<string, FolderNode>();
    folderMap.set('/', root);

    // Collect all unique folder paths
    const folderPaths = new Set<string>();
    notes.forEach(note => {
      if (note.folder) {
        const parts = note.folder.split('/').filter(Boolean);
        let currentPath = '';
        parts.forEach(part => {
          const parentPath = currentPath;
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          folderPaths.add(currentPath);

          if (!folderMap.has(currentPath)) {
            const newNode: FolderNode = {
              name: part,
              path: currentPath,
              isExpanded: expandedFolders.has(currentPath),
              children: [],
              notes: [],
            };
            folderMap.set(currentPath, newNode);

            // Add to parent
            const parent = folderMap.get(parentPath || '/');
            if (parent) {
              parent.children.push(newNode);
            }
          }
        });

        // Add note to its folder
        const folderNode = folderMap.get(note.folder);
        if (folderNode) {
          folderNode.notes.push(note);
        }
      }
    });

    return root;
  }, [notes, expandedFolders]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path });
  };

  const handleCreateFolder = () => {
    if (contextMenu && onCreateFolder) {
      onCreateFolder(contextMenu.path);
    }
    setContextMenu(null);
  };

  const renderFolder = (node: FolderNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isCurrentFolder = currentFolder === node.path || (node.path === '/' && !currentFolder);
    const paddingLeft = depth * 12 + 8;

    return (
      <div key={node.path}>
        {/* Folder header */}
        <div
          className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-opacity-80 transition-colors group rounded"
          style={{
            paddingLeft: `${paddingLeft}px`,
            backgroundColor: isCurrentFolder ? 'var(--accent-bg)' : 'transparent',
          }}
          onClick={() => {
            toggleFolder(node.path);
            if (onFolderSelect) {
              onFolderSelect(node.path === '/' ? '' : node.path);
            }
          }}
          onContextMenu={e => handleContextMenu(e, node.path)}
        >
          {/* Expand/collapse chevron */}
          {(node.children.length > 0 || node.notes.length > 0) && (
            <button
              onClick={e => {
                e.stopPropagation();
                toggleFolder(node.path);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
              ) : (
                <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          )}

          {/* Folder icon */}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          ) : (
            <Folder className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          )}

          {/* Folder name */}
          <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
            {node.name}
          </span>

          {/* Note count badge */}
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          >
            {node.notes.length}
          </span>

          {/* More options */}
          <button
            onClick={e => handleContextMenu(e, node.path)}
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
          >
            <MoreVertical className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div>
            {/* Child folders */}
            {node.children.map(child => renderFolder(child, depth + 1))}

            {/* Notes in this folder */}
            {node.notes.map(note => (
              <div
                key={note.id}
                className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
                style={{
                  paddingLeft: `${paddingLeft + 24}px`,
                  backgroundColor: activeNote?.id === note.id ? 'var(--accent-bg)' : 'transparent',
                }}
                onClick={() => onNoteSelect(note.id)}
              >
                <FileText className="w-3 h-3" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
                  {note.name.replace('.md', '')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Folder tree */}
      <div className="space-y-0.5">{renderFolder(folderTree)}</div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 border rounded shadow-lg py-1 text-sm min-w-40"
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={handleCreateFolder}
            >
              <Plus className="w-3 h-3" />
              New Subfolder
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setContextMenu(null)}
            >
              <Edit2 className="w-3 h-3" />
              Rename
            </button>
            <div className="border-t my-1" style={{ borderColor: 'var(--border-primary)' }} />
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              style={{ color: 'var(--error-color)' }}
              onClick={() => setContextMenu(null)}
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FolderTree;
