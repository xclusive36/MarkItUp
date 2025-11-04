'use client';

import React, { useMemo } from 'react';
import { Link2, FileText, ChevronRight } from 'lucide-react';
import { Note } from '@/lib/types';

interface Backlink {
  note: Note;
  contextSnippets: string[];
}

interface BacklinksPanelProps {
  currentNote: Note | null;
  allNotes: Note[];
  onNoteClick?: (noteId: string) => void;
  theme?: 'light' | 'dark';
}

export const BacklinksPanel: React.FC<BacklinksPanelProps> = ({
  currentNote,
  allNotes,
  onNoteClick,
}) => {
  // Find all notes that link to the current note
  const backlinks = useMemo(() => {
    if (!currentNote) return [];

    const currentNoteName = currentNote.name.replace('.md', '');
    const links: Backlink[] = [];

    allNotes.forEach(note => {
      if (note.id === currentNote.id) return; // Skip self

      // Find wikilinks that reference the current note
      const wikilinkPattern = /\[\[([^\]]+)\]\]/g;
      const matches = [...note.content.matchAll(wikilinkPattern)];

      const relevantMatches = matches.filter(match => {
        const matchText = match[1];
        if (!matchText) return false;
        const linkedName = matchText.split('|')[0]?.trim();
        return linkedName === currentNoteName;
      });

      if (relevantMatches.length > 0) {
        // Extract context snippets (surrounding text)
        const snippets = relevantMatches.map(match => {
          const matchIndex = match.index || 0;
          const start = Math.max(0, matchIndex - 50);
          const end = Math.min(note.content.length, matchIndex + match[0].length + 50);
          let snippet = note.content.substring(start, end);

          // Add ellipsis if truncated
          if (start > 0) snippet = '...' + snippet;
          if (end < note.content.length) snippet = snippet + '...';

          return snippet.trim();
        });

        links.push({
          note,
          contextSnippets: snippets,
        });
      }
    });

    return links;
  }, [currentNote, allNotes]);

  if (!currentNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Link2 className="w-12 h-12 mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No note selected.
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Open a note to see its backlinks.
        </p>
      </div>
    );
  }

  if (backlinks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Link2 className="w-12 h-12 mb-3 opacity-30" style={{ color: 'var(--text-secondary)' }} />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          No backlinks found.
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Other notes will appear here when they link to this note.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4">
        <div
          className="text-xs font-medium px-2 py-1 rounded inline-block"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          {backlinks.length} backlink{backlinks.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {backlinks.map(backlink => (
          <div
            key={backlink.note.id}
            className="rounded-lg border p-3 cursor-pointer transition-all"
            style={{
              borderColor: 'var(--border-secondary)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => onNoteClick?.(backlink.note.id)}
          >
            {/* Note header */}
            <div className="flex items-center gap-2 mb-2">
              <FileText
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              />
              <span
                className="text-sm font-medium flex-1 truncate"
                style={{ color: 'var(--text-primary)' }}
                title={backlink.note.name}
              >
                {backlink.note.name.replace('.md', '')}
              </span>
              <ChevronRight
                className="w-4 h-4 flex-shrink-0"
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>

            {/* Folder info */}
            {backlink.note.folder && (
              <div
                className="text-xs mb-2 flex items-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <span>📁 {backlink.note.folder}</span>
              </div>
            )}

            {/* Context snippets */}
            <div className="space-y-2">
              {backlink.contextSnippets.slice(0, 2).map((snippet, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded font-mono"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                  }}
                >
                  {snippet}
                </div>
              ))}
              {backlink.contextSnippets.length > 2 && (
                <div className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>
                  +{backlink.contextSnippets.length - 2} more reference
                  {backlink.contextSnippets.length - 2 !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Note stats */}
            <div
              className="flex items-center gap-3 mt-2 pt-2 border-t text-xs"
              style={{
                borderColor: 'var(--border-secondary)',
                color: 'var(--text-tertiary)',
              }}
            >
              <span>{backlink.note.wordCount} words</span>
              <span>·</span>
              <span>{backlink.note.tags.length} tags</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BacklinksPanel;
