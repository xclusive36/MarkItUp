"use client";

import React, { useState } from 'react';
import { useSimpleTheme } from '../contexts/SimpleThemeContext';
import { CollaborativeSettings } from '../lib/types';

interface CollaborationSettingsProps {
  settings: CollaborativeSettings;
  onSettingsChange: (settings: CollaborativeSettings) => void;
}

export const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
  const { theme } = useSimpleTheme();
  const [localSettings, setLocalSettings] = useState<CollaborativeSettings>(settings);

  const handleChange = (key: keyof CollaborativeSettings, value: any) => {
    const updatedSettings = {
      ...localSettings,
      [key]: value,
    };
    setLocalSettings(updatedSettings);
    onSettingsChange(updatedSettings);
  };

  return (
    <div 
      className="space-y-6 p-6 rounded-lg shadow-lg"
      style={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff" }}>
      <div 
        className="border-b pb-4"
        style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
          Collaboration Settings
        </h3>
        <p 
          className="text-sm mt-1"
          style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          Configure how collaborative editing works for your documents.
        </p>
      </div>

      {/* Enable Collaboration */}
      <div className="flex items-center justify-between">
        <div>
          <label 
            className="text-sm font-medium"
            style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
            Enable Collaboration
          </label>
          <p 
            className="text-sm"
            style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            Allow real-time collaborative editing with other users
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.enableCollaboration}
            onChange={(e) => handleChange('enableCollaboration', e.target.checked)}
            className="sr-only peer"
          />
          <div 
            className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            style={{
              backgroundColor: localSettings.enableCollaboration ? "#3b82f6" : (theme === "dark" ? "#374151" : "#e5e7eb"),
              borderColor: theme === "dark" ? "#4b5563" : "#d1d5db"
            }}>
          </div>
        </label>
      </div>

      {/* Auto Save Interval */}
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
          Auto Save Interval (seconds)
        </label>
        <input
          type="number"
          min="5"
          max="300"
          value={localSettings.autoSaveInterval / 1000}
          onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) * 1000)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
            borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
            color: theme === "dark" ? "#f9fafb" : "#111827"
          }}
        />
        <p 
          className="text-sm mt-1"
          style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          How often to automatically save changes (5-300 seconds)
        </p>
      </div>

      {/* Conflict Resolution Strategy */}
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
          Conflict Resolution Strategy
        </label>
        <select
          value={localSettings.conflictResolutionStrategy}
          onChange={(e) => handleChange('conflictResolutionStrategy', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
            borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
            color: theme === "dark" ? "#f9fafb" : "#111827"
          }}
        >
          <option value="operational-transform">Operational Transform (Recommended)</option>
          <option value="last-write-wins">Last Write Wins</option>
          <option value="merge">Merge Conflicts</option>
        </select>
        <p 
          className="text-sm mt-1"
          style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          How to handle conflicting edits from multiple users
        </p>
      </div>

      {/* Show Other Cursors */}
      <div className="flex items-center justify-between">
        <div>
          <label 
            className="text-sm font-medium"
            style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
            Show Other Users' Cursors
          </label>
          <p 
            className="text-sm"
            style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            Display cursor positions of other collaborators
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.showOtherCursors}
            onChange={(e) => handleChange('showOtherCursors', e.target.checked)}
            className="sr-only peer"
          />
          <div 
            className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            style={{
              backgroundColor: localSettings.showOtherCursors ? "#3b82f6" : (theme === "dark" ? "#374151" : "#e5e7eb"),
              borderColor: theme === "dark" ? "#4b5563" : "#d1d5db"
            }}>
          </div>
        </label>
      </div>

      {/* Show Other Selections */}
      <div className="flex items-center justify-between">
        <div>
          <label 
            className="text-sm font-medium"
            style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
            Show Other Users' Selections
          </label>
          <p 
            className="text-sm"
            style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
            Highlight text selected by other collaborators
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.showOtherSelections}
            onChange={(e) => handleChange('showOtherSelections', e.target.checked)}
            className="sr-only peer"
          />
          <div 
            className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            style={{
              backgroundColor: localSettings.showOtherSelections ? "#3b82f6" : (theme === "dark" ? "#374151" : "#e5e7eb"),
              borderColor: theme === "dark" ? "#4b5563" : "#d1d5db"
            }}>
          </div>
        </label>
      </div>

      {/* Max Participants */}
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
          Maximum Participants
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={localSettings.maxParticipants}
          onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
            borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
            color: theme === "dark" ? "#f9fafb" : "#111827"
          }}
        />
        <p 
          className="text-sm mt-1"
          style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          Maximum number of users who can edit simultaneously (1-50)
        </p>
      </div>

      {/* Session Timeout */}
      <div>
        <label 
          className="block text-sm font-medium mb-2"
          style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="1440"
          value={localSettings.sessionTimeout / (1000 * 60)}
          onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) * 1000 * 60)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
            borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
            color: theme === "dark" ? "#f9fafb" : "#111827"
          }}
        />
        <p 
          className="text-sm mt-1"
          style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
          How long before inactive users are removed from sessions (1-1440 minutes)
        </p>
      </div>

      {/* Status Information */}
      {localSettings.enableCollaboration && (
        <div 
          className="border rounded-lg p-4"
          style={{
            backgroundColor: theme === "dark" ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
            borderColor: theme === "dark" ? "#1e40af" : "#bfdbfe"
          }}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: theme === "dark" ? "#93c5fd" : "#1e40af" }}>
                Collaboration Enabled
              </h4>
              <div 
                className="mt-2 text-sm"
                style={{ color: theme === "dark" ? "#bfdbfe" : "#1d4ed8" }}>
                <ul className="list-disc list-inside space-y-1">
                  <li>Real-time editing with conflict resolution</li>
                  <li>Automatic synchronization across all participants</li>
                  <li>Version history and change tracking</li>
                  <li>Secure WebSocket connections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning for disabling collaboration */}
      {!localSettings.enableCollaboration && (
        <div 
          className="border rounded-lg p-4"
          style={{
            backgroundColor: theme === "dark" ? "rgba(251, 191, 36, 0.1)" : "#fffbeb",
            borderColor: theme === "dark" ? "#d97706" : "#fde68a"
          }}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 
                className="text-sm font-medium"
                style={{ color: theme === "dark" ? "#fbbf24" : "#d97706" }}>
                Collaboration Disabled
              </h4>
              <p 
                className="mt-1 text-sm"
                style={{ color: theme === "dark" ? "#fde68a" : "#b45309" }}>
                Documents will be edited in single-user mode. Enable collaboration to work with others in real-time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
