'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward, Calendar, Clock } from 'lucide-react';
import { Graph, GraphNode, GraphEdge, Note } from '@/lib/types';

interface GraphTimeMachineProps {
  notes: Note[];
  currentGraph: Graph;
  onGraphUpdate: (graph: Graph, date: Date) => void;
  className?: string;
}

interface TimeSnapshot {
  date: Date;
  graph: Graph;
  stats: {
    nodeCount: number;
    edgeCount: number;
    newNodes: string[];
    newEdges: number;
  };
}

const GraphTimeMachine: React.FC<GraphTimeMachineProps> = ({
  notes,
  currentGraph,
  onGraphUpdate,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [dateRange, setDateRange] = useState<{ min: Date; max: Date } | null>(null);

  // Generate timeline snapshots
  const snapshots = useMemo(() => {
    if (notes.length === 0) return [];

    // Group notes by creation date
    const notesByDate = new Map<string, Note[]>();
    let minDate = new Date();
    let maxDate = new Date(0);

    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const isoString = date.toISOString().split('T');
      const dateKey = isoString[0];

      if (!dateKey) return;

      if (date < minDate) minDate = date;
      if (date > maxDate) maxDate = date;

      if (!notesByDate.has(dateKey)) {
        notesByDate.set(dateKey, []);
      }
      const dateNotes = notesByDate.get(dateKey);
      if (dateNotes) {
        dateNotes.push(note);
      }
    });

    setDateRange({ min: minDate, max: maxDate });

    // Create snapshots for each date
    const snapshotList: TimeSnapshot[] = [];
    const allNodes: GraphNode[] = [];
    const allEdges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    const sortedDates = Array.from(notesByDate.keys()).sort();

    sortedDates.forEach(dateKey => {
      const dataNotes = notesByDate.get(dateKey);
      if (!dataNotes) return;
      const newNodes: string[] = [];
      let newEdgeCount = 0;

      dataNotes.forEach(note => {
        // Add node if not exists
        if (!nodeMap.has(note.id)) {
          const node: GraphNode = {
            id: note.id,
            name: note.name,
            group: note.folder || 'root',
            size: Math.max(5, Math.min(50, note.wordCount / 100)),
            color: getNodeColor(note.folder),
            tags: note.tags || [],
          };
          allNodes.push(node);
          nodeMap.set(note.id, node);
          newNodes.push(note.id);
        }

        // Extract links from note content
        const wikiLinkRegex = /\[\[(.*?)\]\]/g;
        const matches = note.content.matchAll(wikiLinkRegex);

        for (const match of matches) {
          const targetName = match[1];
          const targetNote = notes.find(
            n => n.name === targetName || n.name === `${targetName}.md`
          );

          if (
            targetNote &&
            !allEdges.some(e => e.source === note.id && e.target === targetNote.id)
          ) {
            allEdges.push({
              source: note.id,
              target: targetNote.id,
              type: 'link',
              weight: 1,
            });
            newEdgeCount++;
          }
        }

        // Extract tag connections
        note.tags?.forEach(tag => {
          const taggedNotes = notes.filter(n => n.tags?.includes(tag) && n.id !== note.id);
          taggedNotes.forEach(taggedNote => {
            if (!allEdges.some(e => e.source === note.id && e.target === taggedNote.id)) {
              allEdges.push({
                source: note.id,
                target: taggedNote.id,
                type: 'tag',
                weight: 0.5,
              });
              newEdgeCount++;
            }
          });
        });
      });

      snapshotList.push({
        date: new Date(dateKey),
        graph: {
          nodes: [...allNodes],
          edges: [...allEdges],
        },
        stats: {
          nodeCount: allNodes.length,
          edgeCount: allEdges.length,
          newNodes,
          newEdges: newEdgeCount,
        },
      });
    });

    return snapshotList;
  }, [notes]);

  // Get node color based on folder
  const getNodeColor = (folder?: string): string => {
    const colors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#10b981',
      '#14b8a6',
      '#06b6d4',
      '#0ea5e9',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#f43f5e',
    ];

    if (!folder) return '#6366f1';

    let hash = 0;
    for (let i = 0; i < folder.length; i++) {
      hash = (hash << 5) - hash + folder.charCodeAt(i);
      hash = hash & hash;
    }

    const color = colors[Math.abs(hash) % colors.length];
    return color || '#6366f1';
  };

  // Update graph when selected date changes
  useEffect(() => {
    if (snapshots.length === 0) return;

    // Find snapshot for selected date or closest before
    const snapshot = snapshots.reduce((closest, current) => {
      if (current.date <= selectedDate) {
        if (!closest || current.date > closest.date) {
          return current;
        }
      }
      return closest;
    }, snapshots[0]);

    if (snapshot) {
      onGraphUpdate(snapshot.graph, snapshot.date);
    }
  }, [selectedDate, snapshots, onGraphUpdate]);

  // Playback animation
  useEffect(() => {
    if (!isPlaying || !dateRange) return;

    const interval = setInterval(() => {
      setSelectedDate(prev => {
        const nextDate = new Date(prev);
        nextDate.setDate(nextDate.getDate() + 1 * playbackSpeed);

        if (nextDate > dateRange.max) {
          setIsPlaying(false);
          return dateRange.max;
        }

        return nextDate;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, dateRange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!dateRange) return;

    const value = parseInt(e.target.value);
    const totalDays = Math.floor(
      (dateRange.max.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayOffset = Math.floor((value / 100) * totalDays);

    const newDate = new Date(dateRange.min);
    newDate.setDate(newDate.getDate() + dayOffset);
    setSelectedDate(newDate);
  };

  const getSliderValue = (): number => {
    if (!dateRange) return 0;

    const totalDays = Math.floor(
      (dateRange.max.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24)
    );
    const currentDay = Math.floor(
      (selectedDate.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24)
    );

    return totalDays > 0 ? (currentDay / totalDays) * 100 : 0;
  };

  const jumpToStart = () => {
    if (dateRange) {
      setSelectedDate(dateRange.min);
      setIsPlaying(false);
    }
  };

  const jumpToEnd = () => {
    if (dateRange) {
      setSelectedDate(dateRange.max);
      setIsPlaying(false);
    }
  };

  const currentSnapshot = snapshots.find(
    s => s.date.toDateString() === selectedDate.toDateString()
  );

  if (snapshots.length === 0) {
    return (
      <div
        className={`p-4 rounded-lg text-center ${className}`}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-primary)',
          border: '1px solid',
          color: 'var(--text-secondary)',
        }}
      >
        No historical data available
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-lg space-y-4 ${className}`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
        border: '1px solid',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Graph Time Machine
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedDate.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Timeline Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={getSliderValue()}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent-primary) ${getSliderValue()}%, var(--bg-tertiary) ${getSliderValue()}%)`,
          }}
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>{dateRange?.min.toLocaleDateString()}</span>
          <span>{dateRange?.max.toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats */}
      {currentSnapshot && (
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {currentSnapshot.stats.nodeCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Nodes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>
              {currentSnapshot.stats.edgeCount}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Edges
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              +{currentSnapshot.stats.newNodes.length}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              New Nodes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              +{currentSnapshot.stats.newEdges}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              New Edges
            </div>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={jumpToStart}
          className="p-2 rounded hover:opacity-70 transition-opacity"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
          title="Jump to Start"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-3 rounded-lg hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <button
          onClick={jumpToEnd}
          className="p-2 rounded hover:opacity-70 transition-opacity"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          }}
          title="Jump to End"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="ml-4 flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Speed:
          </span>
          {[1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed as 1 | 2 | 4)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                playbackSpeed === speed ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor:
                  playbackSpeed === speed ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: playbackSpeed === speed ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphTimeMachine;
