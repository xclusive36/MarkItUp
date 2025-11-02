/**
 * Example: File Manager with Loading States
 * This example shows how to use the loading state hook
 */

'use client';

import { useState, useEffect } from 'react';
import { useLoadingState, useOptimisticUpdate } from '@/hooks/useLoadingState';
import { LoadingSpinner, Skeleton } from '@/components/LoadingSpinner';

interface File {
  id: string;
  name: string;
  updatedAt: string;
}

export function FileManagerWithLoading() {
  const [files, setFiles] = useState<File[]>([]);
  
  // Loading state for fetching files
  const { isLoading, error, execute } = useLoadingState<File[]>();
  
  // Optimistic updates for delete operations
  const { optimisticUpdate, isOptimistic } = useOptimisticUpdate();

  // Load files on mount
  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFiles = async () => {
    const data = await execute(async () => {
      const response = await fetch('/api/files');
      return response.json();
    });

    if (data) {
      setFiles(data);
    }
  };

  const handleDelete = async (fileId: string) => {
    const result = await optimisticUpdate(
      // Optimistic: Remove from UI immediately
      () => setFiles(prev => prev.filter(f => f.id !== fileId)),
      
      // API call
      async () => {
        const response = await fetch(`/api/files/${fileId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete failed');
        return response.json();
      },
      
      // Revert on error
      () => loadFiles()
    );

    if (!result.success) {
      alert('Failed to delete file');
    }
  };

  // Loading skeleton
  if (isLoading && files.length === 0) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-16 w-full" count={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">Error: {error.message}</p>
        <button 
          onClick={loadFiles}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Files</h2>
        
        {isLoading && <LoadingSpinner label="Loading..." />}
        {isOptimistic && <LoadingSpinner label="Updating..." />}
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
          >
            <div>
              <h3 className="font-semibold">{file.name}</h3>
              <p className="text-sm text-gray-500">
                Updated: {new Date(file.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => handleDelete(file.id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}

        {files.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No files found
          </p>
        )}
      </div>
    </div>
  );
}
