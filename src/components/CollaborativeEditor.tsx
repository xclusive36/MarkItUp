'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  CollaborativeSession,
  Participant,
  CollaborativeOperation,
  CursorPosition,
  SelectionRange,
  CollaborativeSettings,
} from '../lib/types';

interface CollaborativeEditorProps {
  noteId: string;
  initialContent: string;
  participant: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>;
  settings: CollaborativeSettings;
  onContentChange: (content: string) => void;
  onSave: (content: string) => void;
}

interface ParticipantCursor {
  participant: Participant;
  element: HTMLElement;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  noteId,
  initialContent,
  participant,
  settings,
  onContentChange,
  onSave,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const yjsDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const cursorsRef = useRef<Map<string, ParticipantCursor>>(new Map());

  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');

  // Initialize YJS document and WebSocket provider
  useEffect(() => {
    if (!settings.enableCollaboration) return;

    // Create YJS document
    const yjsDoc = new Y.Doc();
    yjsDocRef.current = yjsDoc;

    // Create WebSocket provider for YJS sync - using correct port and path
    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? `wss://${window.location.host}/ws`
        : 'ws://localhost:3000/ws';

    const provider = new WebsocketProvider(wsUrl, noteId, yjsDoc);
    providerRef.current = provider;

    // Get shared text type
    const yText = yjsDoc.getText('content');

    // Set initial content if document is empty
    if (yText.length === 0 && initialContent) {
      yText.insert(0, initialContent);
    }

    // Listen for YJS text changes
    const handleYjsChange = () => {
      const content = yText.toString();
      onContentChange(content);
      if (editorRef.current && editorRef.current.value !== content) {
        // Save current cursor position
        const cursorStart = editorRef.current.selectionStart;
        const cursorEnd = editorRef.current.selectionEnd;

        // Update content
        editorRef.current.value = content;

        // Restore cursor position (or adjust if content changed)
        const maxPosition = content.length;
        const newStart = Math.min(cursorStart, maxPosition);
        const newEnd = Math.min(cursorEnd, maxPosition);

        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.setSelectionRange(newStart, newEnd);
          }
        }, 0);
      }
    };

    yText.observe(handleYjsChange);

    // Initialize Socket.IO connection
    initializeSocket();

    return () => {
      // Cleanup
      yText.unobserve(handleYjsChange);
      provider.destroy();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [noteId, settings.enableCollaboration]);

  const initializeSocket = () => {
    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      setIsConnected(true);
      // Join collaborative session
      socket.emit('join-session', noteId, participant);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      setIsConnected(false);
    });

    socket.on('session-joined', (sessionData: CollaborativeSession) => {
      setSession(sessionData);
      setParticipants(sessionData.participants);
    });

    socket.on('participant-joined', (newParticipant: Participant) => {
      setParticipants(prev => [...prev, newParticipant]);
    });

    socket.on('participant-left', (participantId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      // Remove cursor
      removeCursor(participantId);
    });

    socket.on('cursor-moved', (participantId: string, cursor: CursorPosition) => {
      if (settings.showOtherCursors) {
        updateCursor(participantId, cursor);
      }
    });

    socket.on('selection-changed', (participantId: string, selection: SelectionRange) => {
      if (settings.showOtherSelections) {
        updateSelection(participantId, selection);
      }
    });

    socket.on('document-saved', (timestamp: number) => {
      // Visual feedback for successful save
      showSaveIndicator();
    });

    socket.on('error', (error: string) => {
      console.error('Collaborative editing error:', error);
    });
  };

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = event.target.value;

      if (!settings.enableCollaboration || !yjsDocRef.current) {
        onContentChange(newContent);
        return;
      }

      const yText = yjsDocRef.current.getText('content');
      const currentContent = yText.toString();

      if (newContent !== currentContent) {
        // Calculate the difference between old and new content
        const diff = calculateTextDiff(currentContent, newContent);

        // Apply changes to YJS document
        yText.delete(diff.deleteStart, diff.deleteLength);
        if (diff.insertText) {
          yText.insert(diff.deleteStart, diff.insertText);
        }
      }

      onContentChange(newContent);
    },
    [settings.enableCollaboration, onContentChange]
  );

  const handleCursorMove = useCallback(() => {
    if (!settings.enableCollaboration || !socketRef.current || !editorRef.current) return;

    const textarea = editorRef.current;
    const cursor: CursorPosition = {
      line: getLineNumber(textarea.value, textarea.selectionStart),
      column: getColumnNumber(textarea.value, textarea.selectionStart),
      timestamp: Date.now(),
    };

    socketRef.current.emit('move-cursor', cursor);
  }, [settings.enableCollaboration]);

  const handleSelectionChange = useCallback(() => {
    if (!settings.enableCollaboration || !socketRef.current || !editorRef.current) return;

    const textarea = editorRef.current;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      const selection: SelectionRange = {
        start: {
          line: getLineNumber(textarea.value, textarea.selectionStart),
          column: getColumnNumber(textarea.value, textarea.selectionStart),
          timestamp: Date.now(),
        },
        end: {
          line: getLineNumber(textarea.value, textarea.selectionEnd),
          column: getColumnNumber(textarea.value, textarea.selectionEnd),
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      };

      socketRef.current.emit('change-selection', selection);
    }
  }, [settings.enableCollaboration]);

  const handleSave = useCallback(() => {
    if (!editorRef.current) return;

    const content = editorRef.current.value;
    onSave(content);

    if (settings.enableCollaboration && socketRef.current) {
      socketRef.current.emit('save-document', content);
    }
  }, [settings.enableCollaboration, onSave]);

  // Utility functions
  const calculateTextDiff = (oldText: string, newText: string) => {
    // Find the start of the difference
    let start = 0;
    while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
      start++;
    }

    // Find the end of the difference
    let oldEnd = oldText.length;
    let newEnd = newText.length;
    while (oldEnd > start && newEnd > start && oldText[oldEnd - 1] === newText[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }

    return {
      deleteStart: start,
      deleteLength: oldEnd - start,
      insertText: newText.substring(start, newEnd),
    };
  };

  const calculateDiff = (oldText: string, newText: string) => {
    // Legacy function for compatibility
    return calculateTextDiff(oldText, newText);
  };

  const getLineNumber = (text: string, position: number): number => {
    return text.substring(0, position).split('\n').length - 1;
  };

  const getColumnNumber = (text: string, position: number): number => {
    const lines = text.substring(0, position).split('\n');
    const lastLine = lines[lines.length - 1];
    return lastLine ? lastLine.length : 0;
  };

  const updateCursor = (participantId: string, cursor: CursorPosition) => {
    const participant = participants.find(p => p.id === participantId);
    if (!participant) return;

    // Create or update cursor element
    let cursorElement = cursorsRef.current.get(participantId)?.element;
    if (!cursorElement) {
      cursorElement = document.createElement('div');
      cursorElement.className = 'collaborative-cursor';
      cursorElement.style.position = 'absolute';
      cursorElement.style.width = '2px';
      cursorElement.style.height = '1.2em';
      cursorElement.style.backgroundColor = participant.color;
      cursorElement.style.zIndex = '1000';
      cursorElement.style.pointerEvents = 'none';

      const label = document.createElement('div');
      label.textContent = participant.name;
      label.style.position = 'absolute';
      label.style.top = '-1.5em';
      label.style.left = '0';
      label.style.fontSize = '0.75em';
      label.style.backgroundColor = participant.color;
      label.style.color = 'white';
      label.style.padding = '2px 4px';
      label.style.borderRadius = '2px';
      label.style.whiteSpace = 'nowrap';

      cursorElement.appendChild(label);

      if (editorRef.current?.parentElement) {
        editorRef.current.parentElement.appendChild(cursorElement);
      }

      cursorsRef.current.set(participantId, { participant, element: cursorElement });
    }

    // Position cursor based on line and column
    // This is a simplified positioning - in practice, you'd need more precise calculation
    const lineHeight = 1.2; // em
    const charWidth = 0.6; // em (approximate for monospace)

    cursorElement.style.top = `${cursor.line * lineHeight}em`;
    cursorElement.style.left = `${cursor.column * charWidth}ch`;
  };

  const updateSelection = (participantId: string, selection: SelectionRange) => {
    // Similar to cursor update but for selection ranges
    // Would create highlighted regions for other participants' selections
  };

  const removeCursor = (participantId: string) => {
    const cursorData = cursorsRef.current.get(participantId);
    if (cursorData) {
      cursorData.element.remove();
      cursorsRef.current.delete(participantId);
    }
  };

  const showSaveIndicator = () => {
    // Show a brief visual indicator that the document was saved
    // Implementation depends on your UI framework
  };

  if (!settings.enableCollaboration) {
    return (
      <textarea
        ref={editorRef}
        value={initialContent}
        onChange={handleTextChange}
        className="w-full h-full resize-none border-none outline-none bg-transparent"
        placeholder="Start writing..."
      />
    );
  }

  return (
    <div className="relative h-full">
      {/* Collaboration status bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {connectionStatus === 'connected'
              ? 'Connected'
              : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
          </span>
        </div>

        {participants.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {participants.length} participant{participants.length > 1 ? 's' : ''}:
            </span>
            {participants.slice(0, 5).map(p => (
              <div
                key={p.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                style={{ backgroundColor: p.color }}
                title={p.name}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {participants.length > 5 && (
              <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white font-medium">
                +{participants.length - 5}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="relative h-full">
        <textarea
          ref={editorRef}
          defaultValue={initialContent}
          onChange={handleTextChange}
          onMouseUp={handleCursorMove}
          onKeyUp={handleCursorMove}
          onSelect={handleSelectionChange}
          className="w-full h-full resize-none border-none outline-none bg-transparent p-4 font-mono"
          placeholder="Start writing..."
        />
      </div>

      {/* Save button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
          disabled={!isConnected && settings.enableCollaboration}
        >
          Save
        </button>
      </div>
    </div>
  );
};
