import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Note } from '@/lib/types';
// import { FolderDragItem, NoteDragItem } from './NotesDndTypes';
import { Folder, Clock, X } from 'lucide-react';
import { useToast } from './ToastProvider';

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
  const { showToast } = useToast();

  // Fetch notes logic (with order persistence)
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [notesRes, orderRes] = await Promise.all([
        fetch('/api/files'),
        fetch('/api/files/order'),
      ]);
      if (!notesRes.ok) throw new Error('Failed to fetch notes');
      const notesArr: Note[] = await notesRes.json();
      let ordered: Note[] = notesArr;
      if (orderRes.ok) {
        const orderArr: { id: string; folder?: string }[] = await orderRes.json();
        if (Array.isArray(orderArr) && orderArr.length > 0) {
          // Map by id for fast lookup
          const notesMap = Object.fromEntries(notesArr.map(n => [n.id, n]));
          ordered = orderArr
            .map(o => {
              const n = notesMap[o.id];
              if (n) {
                // If folder changed, update it
                if (o.folder !== undefined) n.folder = o.folder;
                return n;
              }
              return null;
            })
            .filter(Boolean) as Note[];
          // Add any notes not in orderArr at the end
          const orderedIds = new Set(orderArr.map(o => o.id));
          ordered = [...ordered, ...notesArr.filter(n => !orderedIds.has(n.id))];
        }
      }
      setNotes(ordered);
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

  const folderOrder = Object.keys(notesByFolder);

  // Drag and drop handler (persist order)
  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceFolder = source.droppableId;
    const destFolder = destination.droppableId;
    const sourceIdx = source.index;
    const destIdx = destination.index;

    if (sourceFolder === destFolder && sourceIdx === destIdx) return;

    let movedNoteName = '';
    let movedToFolder = '';
    let movedBetweenFolders = false;

    setOrderedNotes(prevNotes => {
      // Recompute folder grouping and order from prevNotes
      const notesByFolderCopy: Record<string, Note[]> = {};
      for (const n of prevNotes) {
        const folder = n.folder || 'Uncategorized';
        if (!notesByFolderCopy[folder]) notesByFolderCopy[folder] = [];
        notesByFolderCopy[folder].push(n);
      }
      const folderOrderLocal = Object.keys(notesByFolderCopy);

      // Make shallow copies to avoid mutating state
      for (const key in notesByFolderCopy) {
        notesByFolderCopy[key] = notesByFolderCopy[key].slice();
      }

      const moved = notesByFolderCopy[sourceFolder]?.[sourceIdx];
      if (!moved) return prevNotes; // Guard: nothing to move

      // If moving between folders, move the file on the server first
      if (sourceFolder !== destFolder) {
        const oldPath = moved.folder ? `${moved.folder}/${moved.name}` : moved.name;
        const newPath = destFolder === 'Uncategorized' ? moved.name : `${destFolder}/${moved.name}`;
        console.log('Moving note:', { from: oldPath, to: newPath }); // Debug log
        fetch('/api/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: oldPath, to: newPath }),
        });
        movedNoteName = moved.name.replace('.md', '');
        movedToFolder = destFolder;
        movedBetweenFolders = true;
      }

      notesByFolderCopy[sourceFolder].splice(sourceIdx, 1);
      // Always create a new object for the moved note
      const movedNote =
        sourceFolder !== destFolder
          ? { ...moved, folder: destFolder === 'Uncategorized' ? '' : destFolder }
          : { ...moved };
      notesByFolderCopy[destFolder].splice(destIdx, 0, movedNote);
      // Flatten back to array, preserving folder order
      const newOrder = folderOrderLocal.flatMap(f => notesByFolderCopy[f]);

      // Persist order to backend
      fetch('/api/files/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder.map(n => ({ id: n.id, folder: n.folder }))),
      });

      return newOrder;
    });

    // Only show toast after the state update and only for folder moves
    if (sourceFolder !== destFolder) {
      showToast(`Moved "${movedNoteName}" to "${movedToFolder}"`, 'success');
    }
  };

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
        ) : folderOrder.length === 0 ? (
          <p className="text-base text-center py-8 text-gray-500">No notes found.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-8">
              {folderOrder.map(folder => (
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
                      {notesByFolder[folder].length} note
                      {notesByFolder[folder].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <Droppable droppableId={folder}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex flex-col gap-4 min-h-[40px]"
                        style={{ background: snapshot.isDraggingOver ? '#e0e7ef' : undefined }}
                      >
                        {notesByFolder[folder].map((note, idx) => (
                          <Draggable key={note.id} draggableId={note.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 rounded-lg cursor-pointer transition-colors border flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-900 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default NotesComponent;
