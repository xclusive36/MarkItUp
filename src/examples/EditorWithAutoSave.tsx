/**
 * Example: Markdown Editor with Auto-Save
 * This example shows how to integrate the new auto-save functionality
 */

'use client';

import { useState } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EditorWithAutoSaveProps {
  filename: string;
  initialContent: string;
}

export function EditorWithAutoSave({ filename, initialContent }: EditorWithAutoSaveProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Auto-save with 2 second debounce
  const { isSaving, saveNow } = useAutoSave(
    content,
    async (contentToSave) => {
      const response = await fetch(`/api/files/${filename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave, overwrite: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }
    },
    {
      delay: 2000,
      enabled: true,
      onSaveStart: () => setSaveStatus('saving'),
      onSaveSuccess: () => setSaveStatus('saved'),
      onSaveError: () => setSaveStatus('error'),
    }
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with save status */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">{filename}</h2>
        
        <div className="flex items-center gap-2">
          {isSaving && <LoadingSpinner size="sm" />}
          
          <span className={`text-sm ${
            saveStatus === 'saved' ? 'text-green-600' :
            saveStatus === 'saving' ? 'text-blue-600' :
            'text-red-600'
          }`}>
            {saveStatus === 'saved' && '✓ Saved'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'error' && '✗ Error saving'}
          </span>

          <button
            onClick={saveNow}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Now
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-4 font-mono resize-none outline-none"
        placeholder="Start typing..."
      />
    </div>
  );
}
