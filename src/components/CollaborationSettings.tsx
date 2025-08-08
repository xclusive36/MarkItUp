"use client";

import React, { useState } from 'react';
import { CollaborativeSettings } from '../lib/types';

interface CollaborationSettingsProps {
  settings: CollaborativeSettings;
  onSettingsChange: (settings: CollaborativeSettings) => void;
}

export const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  settings,
  onSettingsChange,
}) => {
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
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Collaboration Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure how collaborative editing works for your documents.
        </p>
      </div>

      {/* Enable Collaboration */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Enable Collaboration
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Auto Save Interval */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Auto Save Interval (seconds)
        </label>
        <input
          type="number"
          min="5"
          max="300"
          value={localSettings.autoSaveInterval / 1000}
          onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) * 1000)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          How often to automatically save changes (5-300 seconds)
        </p>
      </div>

      {/* Conflict Resolution Strategy */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Conflict Resolution Strategy
        </label>
        <select
          value={localSettings.conflictResolutionStrategy}
          onChange={(e) => handleChange('conflictResolutionStrategy', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="operational-transform">Operational Transform (Recommended)</option>
          <option value="last-write-wins">Last Write Wins</option>
          <option value="merge">Merge Conflicts</option>
        </select>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          How to handle conflicting edits from multiple users
        </p>
      </div>

      {/* Show Other Cursors */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Show Other Users' Cursors
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Show Other Selections */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            Show Other Users' Selections
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Max Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Maximum Participants
        </label>
        <input
          type="number"
          min="1"
          max="50"
          value={localSettings.maxParticipants}
          onChange={(e) => handleChange('maxParticipants', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Maximum number of users who can edit simultaneously (1-50)
        </p>
      </div>

      {/* Session Timeout */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          min="1"
          max="1440"
          value={localSettings.sessionTimeout / (1000 * 60)}
          onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) * 1000 * 60)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          How long before inactive users are removed from sessions (1-1440 minutes)
        </p>
      </div>

      {/* Status Information */}
      {localSettings.enableCollaboration && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Collaboration Enabled
              </h4>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
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
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Collaboration Disabled
              </h4>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Documents will be edited in single-user mode. Enable collaboration to work with others in real-time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
