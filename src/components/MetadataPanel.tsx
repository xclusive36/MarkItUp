'use client';

import React from 'react';
import { Calendar, Clock, FileText, Hash, Link2, Folder, TrendingUp, User } from 'lucide-react';
import { Note } from '@/lib/types';

interface MetadataPanelProps {
  note: Note | null;
  allNotes: Note[];
  theme?: 'light' | 'dark';
}

export default function MetadataPanel({ note, allNotes, theme = 'light' }: MetadataPanelProps) {
  if (!note) {
    return (
      <div
        className="p-4 text-center"
        style={{
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        }}
      >
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>No note selected</p>
        <p className="text-sm mt-1">Open a note to view its metadata</p>
      </div>
    );
  }

  // Calculate connection strength (how many notes link to this one)
  const backlinks = allNotes.filter(n => n.content.includes(`[[${note.name.replace('.md', '')}]]`));
  const connectionStrength = backlinks.length;

  // Calculate reading time (200 words per minute average)
  const readingTimeMinutes = Math.ceil((note.wordCount || 0) / 200);

  // Parse frontmatter if exists
  const frontmatterMatch = note.content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter: Record<string, string> = {};
  if (frontmatterMatch) {
    const frontmatterText = frontmatterMatch[1];
    frontmatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        frontmatter[key.trim()] = valueParts.join(':').trim();
      }
    });
  }

  const metadataItems = [
    {
      icon: FileText,
      label: 'File Name',
      value: note.name,
    },
    {
      icon: Folder,
      label: 'Folder',
      value: note.folder || 'Root',
    },
    {
      icon: Calendar,
      label: 'Created',
      value: note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'Unknown',
    },
    {
      icon: Clock,
      label: 'Last Modified',
      value: note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Unknown',
    },
    {
      icon: FileText,
      label: 'Word Count',
      value: (note.wordCount || 0).toLocaleString(),
    },
    {
      icon: Clock,
      label: 'Reading Time',
      value: `${readingTimeMinutes} min`,
    },
    {
      icon: Hash,
      label: 'Tags',
      value: note.tags.length > 0 ? note.tags.join(', ') : 'None',
    },
    {
      icon: Link2,
      label: 'Outgoing Links',
      value: (note.content.match(/\[\[([^\]]+)\]\]/g) || []).length.toString(),
    },
    {
      icon: Link2,
      label: 'Backlinks',
      value: connectionStrength.toString(),
    },
    {
      icon: TrendingUp,
      label: 'Connection Strength',
      value: connectionStrength === 0 ? 'Orphan' : connectionStrength > 5 ? 'Hub' : 'Connected',
      badge: connectionStrength === 0 ? 'red' : connectionStrength > 5 ? 'green' : 'blue',
    },
  ];

  return (
    <div className="overflow-y-auto h-full">
      {/* Basic Metadata */}
      <div className="p-4 space-y-3">
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}
        >
          File Information
        </h3>

        {metadataItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <Icon
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium mb-0.5"
                  style={{
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  {item.label}
                </div>
                <div
                  className="text-sm break-words flex items-center gap-2"
                  style={{
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                >
                  {item.value}
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 text-xs rounded-full"
                      style={{
                        backgroundColor:
                          item.badge === 'red'
                            ? theme === 'dark'
                              ? '#7f1d1d'
                              : '#fee2e2'
                            : item.badge === 'green'
                              ? theme === 'dark'
                                ? '#14532d'
                                : '#dcfce7'
                              : theme === 'dark'
                                ? '#1e3a8a'
                                : '#dbeafe',
                        color:
                          item.badge === 'red'
                            ? theme === 'dark'
                              ? '#fca5a5'
                              : '#991b1b'
                            : item.badge === 'green'
                              ? theme === 'dark'
                                ? '#86efac'
                                : '#166534'
                              : theme === 'dark'
                                ? '#93c5fd'
                                : '#1e40af',
                      }}
                    >
                      {item.badge === 'red' ? '⚠️' : item.badge === 'green' ? '⭐' : '🔗'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frontmatter Section */}
      {Object.keys(frontmatter).length > 0 && (
        <div
          className="p-4 border-t"
          style={{
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2"
            style={{
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
          >
            <User className="w-4 h-4" />
            Frontmatter
          </h3>
          <div className="space-y-2">
            {Object.entries(frontmatter).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <div
                  className="text-xs font-medium flex-shrink-0"
                  style={{
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                  }}
                >
                  {key}:
                </div>
                <div
                  className="text-sm break-words"
                  style={{
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      <div
        className="p-4 border-t"
        style={{
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }}
      >
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}
        >
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{
                color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              }}
            >
              {note.wordCount || 0}
            </div>
            <div
              className="text-xs"
              style={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Words
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{
                color: theme === 'dark' ? '#34d399' : '#10b981',
              }}
            >
              {note.tags.length}
            </div>
            <div
              className="text-xs"
              style={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Tags
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{
                color: theme === 'dark' ? '#f472b6' : '#ec4899',
              }}
            >
              {(note.content.match(/\[\[([^\]]+)\]\]/g) || []).length}
            </div>
            <div
              className="text-xs"
              style={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Links
            </div>
          </div>
          <div
            className="p-3 rounded-lg"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
            }}
          >
            <div
              className="text-2xl font-bold"
              style={{
                color: theme === 'dark' ? '#fbbf24' : '#f59e0b',
              }}
            >
              {connectionStrength}
            </div>
            <div
              className="text-xs"
              style={{
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              }}
            >
              Backlinks
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
