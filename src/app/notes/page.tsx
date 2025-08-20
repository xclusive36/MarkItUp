'use client';
import NotesComponent from '@/components/NotesComponent';
import { useCallback } from 'react';

// This assumes you have a way to refresh notes in the parent (e.g., via context or props)
// If not, you may need to lift state up or use a shared store.

export default function NotesPage({ refreshNotes }: { refreshNotes?: () => void }) {
  // If refreshNotes is not provided, fallback to a no-op
  const handleRefreshNotes = useCallback(() => {
    if (refreshNotes) refreshNotes();
    // Optionally, you could trigger a reload or event here
  }, [refreshNotes]);
  return <NotesComponent refreshNotes={handleRefreshNotes} />;
}
