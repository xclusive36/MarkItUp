import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Note } from '@/lib/types';
// import { FolderDragItem, NoteDragItem } from './NotesDndTypes';
import { Folder, Clock, X } from 'lucide-react';

const getFileIcon = (name: string) => {
  if (name.endsWith('.md')) return <span className="inline-block mr-2">📄</span>;
  return <span className="inline-block mr-2">📁</span>;
};

interface NotesComponentProps {
  refreshNotes?: React.MutableRefObject<(() => Promise<void>) | null>;
}

const NotesComponent: React.FC<NotesComponentProps> = ({ refreshNotes }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes logic
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/files');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const notesArr: Note[] = await res.json();
      setNotes(notesArr);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // If refreshNotes prop is provided, expose fetchNotes to parent via ref
  useEffect(() => {
    if (refreshNotes) {
      refreshNotes.current = fetchNotes;
    }
  }, [refreshNotes, fetchNotes]);

  // Group notes by folder, each with its own reorderable list
  const [orderedNotes, setOrderedNotes] = useState<Note[]>([]);
  useEffect(() => {
    setOrderedNotes(notes);
  }, [notes]);

  // Helper: group notes by folder
  const notesByFolder = orderedNotes.reduce(
    (acc, note) => {
      const folder = note.folder || 'Uncategorized';
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push(note);
      return acc;
    },
    {} as Record<string, Note[]>
  );

  // For drag state
  // Drag state not needed for Framer Motion Reorder

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 p-0 m-0">
      <div className="py-6 px-8 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Notes</h3>
      </div>
      <div className="py-8 px-8">
        {loading ? (
          <p className="text-base text-center py-8 text-gray-500">Loading notes...</p>
        ) : error ? (
          <p className="text-base text-center py-8 text-red-500">{error}</p>
        ) : Object.keys(notesByFolder).length === 0 ? (
          <p className="text-base text-center py-8 text-gray-500">No notes found.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(notesByFolder).map(([folder, folderNotes]) => (
              <div
                key={folder}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 shadow-sm"
              >
                <div className="flex items-center mb-4">
                  <Folder className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {folder}
                  </h4>
                  <span className="ml-2 text-xs text-gray-400">
                    {folderNotes.length} note{folderNotes.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <Reorder.Group
                  axis="y"
                  values={folderNotes.map(n => n.id)}
                  onReorder={newOrderIds => {
                    setOrderedNotes(prevNotes => {
                      // Reorder only notes in this folder, preserving order in other folders
                      const reordered: Note[] = [];
                      let folderIdx = 0;
                      for (let i = 0; i < prevNotes.length; i++) {
                        const note = prevNotes[i];
                        if ((note.folder || 'Uncategorized') === folder) {
                          // Place notes in the new order for this folder
                          const newId = newOrderIds[folderIdx++];
                          const newNote = prevNotes.find(n => n.id === newId);
                          if (newNote) reordered.push(newNote);
                        } else {
                          reordered.push(note);
                        }
                      }
                      return reordered;
                    });
                  }}
                  className="flex flex-col gap-4"
                  component={motion.div}
                >
                  <AnimatePresence>
                    {folderNotes.map(note => (
                      <Reorder.Item
                        key={note.id}
                        value={note.id}
                        component={motion.div}
                        layout
                        whileHover={{ scale: 1.01, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                        whileTap={{ scale: 0.97 }}
                        dragElastic={0.18}
                        className="p-4 rounded-lg cursor-pointer transition-colors border flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900"
                      >
                        {getFileIcon(note.name)}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-base font-medium truncate text-gray-900 dark:text-gray-100">
                            {note.name.replace('.md', '')}
                          </h5>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {note.readingTime}m
                            </span>
                            <span>{note.wordCount} words</span>
                          </div>
                          {note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{note.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            // TODO: Implement delete logic
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesComponent;
