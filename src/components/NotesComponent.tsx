import React, { useEffect, useState, useRef } from 'react';
// Simple Toast component
function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg flex items-center gap-4 z-50 transition-all
        ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}
      role="alert"
      aria-live="assertive"
    >
      {message}
      <button
        className="ml-2 text-xs underline focus:outline-none"
        onClick={onClose}
        aria-label="Close notification"
      >
        Close
      </button>
    </div>
  );
}
import {
  Folder as FolderIcon,
  Clock,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface NoteMeta {
  path: string;
  name: string;
  folder: string;
  tags: string[];
  wordCount: number;
  readingTime: string;
  updatedAt: string;
  preview?: string;
  content?: string;
}
interface FolderNode {
  type: 'folder';
  name: string;
  path: string;
  children: TreeNode[];
}
interface FileNode {
  type: 'file';
  name: string;
  path: string;
}
type TreeNode = FolderNode | FileNode;

interface FolderTreeProps {
  nodes: TreeNode[];
  noteDetails: Record<string, NoteMeta>;
  openFolders: Record<string, boolean>;
  onToggleFolder: (path: string) => void;
  onNoteClick: (notePath: string) => void;
  selectedNotes: Set<string>;
  onToggleNoteSelect: (notePath: string) => void;
  activeNotePath: string | null;
  searchTerm: string;
  tagFilter: string | null;
  onDeleteNote: (path: string) => void;
}

function FolderTree({
  nodes,
  noteDetails,
  openFolders,
  onToggleFolder,
  onNoteClick,
  selectedNotes,
  onToggleNoteSelect,
  activeNotePath,
  searchTerm,
  tagFilter,
  onDeleteNote,
}: FolderTreeProps) {
  const filterNote = (node: FileNode) => {
    if (searchTerm) {
      const meta = noteDetails[node.path] || {};
      const haystack = [meta.name, meta.folder, ...(meta.tags || []), node.name]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(searchTerm.toLowerCase())) return false;
    }
    if (tagFilter && !(noteDetails[node.path]?.tags || []).includes(tagFilter)) return false;
    return true;
  };
  const highlight = (text: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  return (
    <ul className="pl-4">
      <AnimatePresence initial={false}>
        {nodes.map((node: TreeNode) => {
          if (node.type === 'folder') {
            const hasVisibleChild = (children: TreeNode[]): boolean =>
              children.some(child =>
                child.type === 'folder'
                  ? hasVisibleChild(child.children || [])
                  : filterNote(child as FileNode)
              );
            if (!hasVisibleChild(node.children || [])) return null;
            return (
              <motion.li
                key={node.path}
                className="mb-2"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                layout
              >
                <button
                  type="button"
                  className="flex items-center gap-1 font-semibold focus:outline-none"
                  onClick={() => onToggleFolder(node.path)}
                  aria-expanded={!!openFolders[node.path]}
                >
                  {openFolders[node.path] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span>{node.name}</span>
                </button>
                {openFolders[node.path] && node.children && (
                  <FolderTree
                    nodes={node.children}
                    noteDetails={noteDetails}
                    openFolders={openFolders}
                    onToggleFolder={onToggleFolder}
                    onNoteClick={onNoteClick}
                    selectedNotes={selectedNotes}
                    onToggleNoteSelect={onToggleNoteSelect}
                    activeNotePath={activeNotePath}
                    searchTerm={searchTerm}
                    tagFilter={tagFilter}
                    onDeleteNote={onDeleteNote}
                  />
                )}
              </motion.li>
            );
          } else if (node.type === 'file' && filterNote(node as FileNode)) {
            const meta = noteDetails[node.path] || {};
            return (
              <motion.li
                key={node.path}
                className="mb-2 group"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                layout
              >
                <div
                  className={`relative p-2 lg:p-3 rounded-lg cursor-pointer transition-colors border bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 flex items-start ${activeNotePath === node.path ? 'ring-2 ring-blue-400' : ''}`}
                  onClick={() => onNoteClick(node.path)}
                  tabIndex={0}
                  aria-label={`Open note ${meta.name || node.name.replace('.md', '')}`}
                >
                  <button
                    type="button"
                    className="mr-2 mt-1"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleNoteSelect(node.path);
                    }}
                    aria-label={selectedNotes.has(node.path) ? 'Deselect note' : 'Select note'}
                  >
                    {selectedNotes.has(node.path) ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs lg:text-sm font-medium truncate text-gray-900 dark:text-white">
                      {highlight(meta.name || node.name.replace('.md', ''))}
                    </h4>
                    {meta.folder && (
                      <p className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <FolderIcon className="w-3 h-3" />
                        {meta.folder}
                      </p>
                    )}
                    {meta.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {meta.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Note preview/snippet */}
                    {meta.preview && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {highlight(meta.preview)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 lg:gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meta.readingTime ? `${meta.readingTime}m` : '--'}
                      </span>
                      <span className="hidden lg:inline">
                        {meta.wordCount ? `${meta.wordCount} words` : '-- words'}
                      </span>
                    </div>
                  </div>
                  {/* Quick actions (edit, delete, favorite) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                      title="Edit"
                      tabIndex={-1}
                      onClick={e => {
                        e.stopPropagation();
                        onNoteClick(node.path);
                      }}
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900"
                      title="Delete"
                      tabIndex={-1}
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteNote(node.path);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          } else {
            return null;
          }
        })}
      </AnimatePresence>
    </ul>
  );
}

interface NotesComponentProps {
  refreshNotes?: () => void;
}

const NotesComponent: React.FC<NotesComponentProps> = ({ refreshNotes }) => {
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const [noteDetails, setNoteDetails] = useState<Record<string, NoteMeta>>({});
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [activeNotePath, setActiveNotePath] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  // Collect all tags for dropdown
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    Object.values(noteDetails).forEach(n => (n.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [noteDetails]);

  // Toast/snackbar state for undo delete and general feedback
  const [showUndo, setShowUndo] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<string | null>(null);
  const undoTimeout = useRef<NodeJS.Timeout | null>(null);
  // General toast state
  const [toast, setToast] = useState<{
    message: string;
    type?: 'info' | 'success' | 'error';
  } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Show toast helper
  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(null), 3500);
  };

  // Select all state
  const allNotePaths = React.useMemo(() => Object.keys(noteDetails), [noteDetails]);
  const allSelected = selectedNotes.size > 0 && allNotePaths.every(p => selectedNotes.has(p));
  const handleSelectAll = () => {
    if (allSelected) setSelectedNotes(new Set());
    else setSelectedNotes(new Set(allNotePaths));
  };

  // Fetch notes tree and details
  const fetchNotesTreeAndDetails = async () => {
    const res = await fetch('/api/notes');
    const data = await res.json();
    const treeData: TreeNode[] = Array.isArray(data) ? data : [];
    setTree(treeData);
    // Fetch all note details in parallel
    const notePaths: string[] = [];
    const collectPaths = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') notePaths.push(node.path);
        if (node.type === 'folder' && node.children) collectPaths(node.children);
      });
    };
    collectPaths(treeData);
    const detailsArr = await Promise.all(
      notePaths.map(async path => {
        const res = await fetch(`/api/files/${encodeURIComponent(path)}`);
        if (!res.ok) return null;
        const meta = await res.json();
        const last = path.split('/').pop() || '';
        return {
          path,
          name: meta.name || last.replace('.md', ''),
          folder: meta.folder || '',
          tags: meta.tags || [],
          wordCount: meta.wordCount || 0,
          readingTime: meta.readingTime || '',
          updatedAt: meta.updatedAt || '',
          preview: meta.content ? meta.content.slice(0, 100) : '',
        };
      })
    );
    const detailsMap: Record<string, NoteMeta> = {};
    detailsArr.forEach(d => {
      if (d) detailsMap[d.path] = d;
    });
    setNoteDetails(detailsMap);
  };

  useEffect(() => {
    fetchNotesTreeAndDetails();
  }, []);

  // Expose refreshNotes if provided
  useEffect(() => {
    if (!refreshNotes) return;
    // Optionally, you could expose a way for parent to trigger refresh
    // For now, just call refreshNotes when notes are updated, or provide a way to call fetchNotesTreeAndDetails
    // If you want to allow parent to trigger refresh, you could use a ref or event, but for now, do nothing
  }, [refreshNotes]);

  // Folder open/close
  const handleToggleFolder = (path: string) => {
    setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };
  // Note select for bulk actions
  const handleToggleNoteSelect = (path: string) => {
    setSelectedNotes(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };
  // Note click
  const handleNoteClick = (notePath: string) => {
    setActiveNotePath(notePath);
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('setCurrentView', { detail: { view: 'editor', notePath } });
      window.dispatchEvent(event);
    }
  };

  // Keyboard navigation for search results
  const flatNotePaths = React.useMemo(() => {
    // Flatten tree to visible note paths (filtered)
    const result: string[] = [];
    const walk = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'folder' && node.children) walk(node.children);
        else if (node.type === 'file') {
          // Apply filterNote logic
          const meta = noteDetails[node.path] || {};
          const haystack = [meta.name, meta.folder, ...(meta.tags || []), node.name]
            .join(' ')
            .toLowerCase();
          if (
            (!searchTerm || haystack.includes(searchTerm.toLowerCase())) &&
            (!tagFilter || (meta.tags || []).includes(tagFilter))
          ) {
            result.push(node.path);
          }
        }
      });
    };
    if (tree) walk(tree);
    return result;
  }, [tree, noteDetails, searchTerm, tagFilter]);

  const [searchFocusIdx, setSearchFocusIdx] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard handlers
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement !== searchInputRef.current) return;
      if (!flatNotePaths.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSearchFocusIdx(idx => (idx + 1) % flatNotePaths.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSearchFocusIdx(idx => (idx - 1 + flatNotePaths.length) % flatNotePaths.length);
      } else if (e.key === 'Enter' && searchFocusIdx >= 0) {
        e.preventDefault();
        handleNoteClick(flatNotePaths[searchFocusIdx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flatNotePaths, searchFocusIdx]);

  // Reset focus index on search/filter change
  useEffect(() => {
    setSearchFocusIdx(-1);
  }, [searchTerm, tagFilter, tree]);
  // Single note delete handler with undo
  const handleDeleteNote = async (path: string) => {
    if (!window.confirm('Delete this note?')) return;
    setLastDeleted(path);
    setShowUndo(true);
    showToast('Note deleted. You can undo.', 'info');
    // Optimistically remove from UI
    setNoteDetails(prev => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
    setSelectedNotes(prev => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
    // Actually delete after timeout unless undone
    if (undoTimeout.current) clearTimeout(undoTimeout.current);
    undoTimeout.current = setTimeout(async () => {
      if (lastDeleted) {
        try {
          const res = await fetch(`/api/files/${encodeURIComponent(lastDeleted)}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error('Delete failed');
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('singleNoteDeleted', { detail: { path: lastDeleted } });
            window.dispatchEvent(event);
            window.dispatchEvent(new Event('knowledgeGraphUpdate'));
          }
          showToast('Note permanently deleted.', 'success');
        } catch {
          showToast('Error deleting note.', 'error');
        }
      }
      setShowUndo(false);
      setLastDeleted(null);
    }, 4000);
  };

  // Undo delete
  const handleUndoDelete = () => {
    setShowUndo(false);
    setLastDeleted(null);
    showToast('Delete undone.', 'success');
    // Refetch notes to restore
    fetchNotesTreeAndDetails();
  };
  // Listen for single note delete event to update state like bulk delete
  useEffect(() => {
    function handleSingleNoteDeleted(e: Event) {
      const customEvent = e as CustomEvent<{ path: string }>;
      const path = customEvent?.detail?.path;
      if (!path) return;
      setNoteDetails(prev => {
        const next = { ...prev };
        delete next[path];
        return next;
      });
      // Remove from tree (refetch for simplicity)
      fetch('/api/notes')
        .then(res => res.json())
        .then(data => setTree(Array.isArray(data) ? data : []));
      setSelectedNotes(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    }
    window.addEventListener('singleNoteDeleted', handleSingleNoteDeleted);
    return () => window.removeEventListener('singleNoteDeleted', handleSingleNoteDeleted);
  }, []);

  // --- UI ---
  return (
    <div className="notes-component">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between mb-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium focus:outline-none focus:ring"
            aria-label="Create new note"
            onClick={() => {
              // Dispatch event to parent to create a new note
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('setCurrentView', { detail: { view: 'editor', notePath: null } })
                );
              }
            }}
          >
            + New Note
          </button>
          <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              aria-label={allSelected ? 'Deselect all notes' : 'Select all notes'}
            />
            Select All
          </label>
        </div>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search notes"
          ref={searchInputRef}
        />
        <select
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          value={tagFilter || ''}
          onChange={e => setTagFilter(e.target.value || null)}
          aria-label="Filter by tag"
        >
          <option value="">All tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>
              #{tag}
            </option>
          ))}
        </select>
      </div>
      {tree && allNotePaths.length > 0 ? (
        <FolderTree
          nodes={tree}
          noteDetails={noteDetails}
          openFolders={openFolders}
          onToggleFolder={handleToggleFolder}
          onNoteClick={handleNoteClick}
          selectedNotes={selectedNotes}
          onToggleNoteSelect={handleToggleNoteSelect}
          activeNotePath={searchFocusIdx >= 0 ? flatNotePaths[searchFocusIdx] : activeNotePath}
          searchTerm={searchTerm}
          tagFilter={tagFilter}
          onDeleteNote={handleDeleteNote}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center text-center text-gray-400 py-12"
          role="status"
        >
          <svg
            width="80"
            height="80"
            fill="none"
            viewBox="0 0 80 80"
            aria-hidden="true"
            className="mb-4"
          >
            <rect x="10" y="20" width="60" height="40" rx="8" fill="#e0e7ef" />
            <rect x="20" y="32" width="40" height="8" rx="2" fill="#cbd5e1" />
            <rect x="20" y="44" width="24" height="6" rx="2" fill="#cbd5e1" />
            <circle cx="60" cy="50" r="6" fill="#fbbf24" />
          </svg>
          <div className="text-lg font-semibold mb-2">No notes found</div>
          <div className="mb-4">
            {searchTerm || tagFilter
              ? 'Try adjusting your search or filter.'
              : 'Start by creating your first note!'}
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none focus:ring"
            aria-label="Create new note"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('setCurrentView', { detail: { view: 'editor', notePath: null } })
                );
              }
            }}
          >
            + New Note
          </button>
        </div>
      )}
      {/* Toast/snackbar for undo */}
      {showUndo && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded shadow-lg flex items-center gap-4 z-50"
          role="alert"
          aria-live="assertive"
        >
          Note deleted
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium"
            onClick={handleUndoDelete}
            aria-label="Undo delete"
          >
            Undo
          </button>
        </div>
      )}
      {/* General toast/snackbar for feedback */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default NotesComponent;
