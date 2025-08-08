"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface SimpleCollaborativeEditorProps {
  noteId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  className?: string;
}

export const SimpleCollaborativeEditor: React.FC<SimpleCollaborativeEditorProps> = ({
  noteId,
  initialContent,
  onContentChange,
  className = '',
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const yjsDocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const isUpdatingFromYjs = useRef(false);
  
  const [participants, setParticipants] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [content, setContent] = useState<string>(initialContent);

  // Initialize YJS and Socket.IO
  useEffect(() => {
    // Create YJS document
    const yjsDoc = new Y.Doc();
    yjsDocRef.current = yjsDoc;

    // Create WebSocket provider for YJS sync
    const wsUrl = 'ws://localhost:3002/ws';
    const provider = new WebsocketProvider(wsUrl, noteId, yjsDoc);
    providerRef.current = provider;

    // Get shared text type
    const yText = yjsDoc.getText('content');
    
    // Flag to track if we've initialized the content
    let contentInitialized = false;

    // Listen for YJS text changes
    const handleYjsChange = () => {
      if (isUpdatingFromYjs.current) return;
      
      const newContent = yText.toString();
      setContent(newContent);
      onContentChange(newContent);
      
      if (editorRef.current && editorRef.current.value !== newContent) {
        // Save cursor position
        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;
        
        // Update content
        editorRef.current.value = newContent;
        
        // Restore cursor position
        requestAnimationFrame(() => {
          if (editorRef.current) {
            const maxPos = newContent.length;
            editorRef.current.setSelectionRange(
              Math.min(start, maxPos),
              Math.min(end, maxPos)
            );
          }
        });
      }
    };

    // Handle provider sync
    const handleProviderSync = (isSynced: boolean) => {
      if (isSynced && !contentInitialized) {
        // Only set initial content after sync and if document is empty
        if (yText.length === 0 && initialContent.trim()) {
          console.log('Setting initial content for empty document:', noteId);
          yText.insert(0, initialContent);
        } else if (yText.length > 0) {
          // Document has content, update our local state
          const existingContent = yText.toString();
          setContent(existingContent);
          onContentChange(existingContent);
          if (editorRef.current) {
            editorRef.current.value = existingContent;
          }
        }
        contentInitialized = true;
      }
    };

    yText.observe(handleYjsChange);
    provider.on('sync', handleProviderSync);

    // Setup Socket.IO for participant tracking
    const socket = io('http://localhost:3002', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      socket.emit('join-session', noteId, {
        name: `User ${Math.floor(Math.random() * 1000)}`,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      });
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('session-joined', (sessionData: any) => {
      setParticipants(sessionData.participants.length);
    });

    socket.on('participant-joined', () => {
      setParticipants(prev => prev + 1);
    });

    socket.on('participant-left', () => {
      setParticipants(prev => Math.max(0, prev - 1));
    });

    // Provider connection events
    provider.on('status', (event: any) => {
      console.log('YJS Provider status:', event.status);
      if (event.status === 'connected') {
        console.log('YJS WebSocket connected successfully');
      }
    });

    return () => {
      yText.unobserve(handleYjsChange);
      provider.off('sync', handleProviderSync);
      provider.destroy();
      socket.disconnect();
    };
  }, [noteId, initialContent, onContentChange]);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    
    if (!yjsDocRef.current) {
      onContentChange(newContent);
      return;
    }

    const yText = yjsDocRef.current.getText('content');
    const currentContent = yText.toString();

    if (newContent !== currentContent) {
      isUpdatingFromYjs.current = true;
      
      // Simple replacement strategy - replace entire content
      // In production, you'd want a more sophisticated diff algorithm
      yText.delete(0, yText.length);
      yText.insert(0, newContent);
      
      isUpdatingFromYjs.current = false;
    }

    onContentChange(newContent);
  }, [onContentChange]);

  return (
    <div className="relative h-full">
      {/* Status bar */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-gray-600 dark:text-gray-400">
            {connectionStatus === 'connected' ? 'Connected' : 
             connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        
        {participants > 0 && (
          <span className="text-gray-600 dark:text-gray-400">
            {participants} participant{participants > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Editor */}
      <textarea
        ref={editorRef}
        value={content}
        onChange={handleTextChange}
        className={`w-full h-full resize-none border-none outline-none bg-transparent p-4 font-mono ${className}`}
        placeholder="Start typing to test collaborative editing..."
        style={{ minHeight: 'calc(100% - 40px)' }}
      />
    </div>
  );
};
