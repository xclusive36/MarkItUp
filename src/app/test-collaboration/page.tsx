"use client";

import { useState } from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { CollaborationSettings } from '../../components/CollaborationSettings';
import { UserProfile } from '../../components/UserProfile';
import { SimpleCollaborativeEditor } from '../../components/SimpleCollaborativeEditor';

export default function CollaborationTest() {
  const { settings, currentUser, updateSettings } = useCollaboration();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [content, setContent] = useState('# Collaboration Test\n\nThis is a test document for collaborative editing. Start typing here...');

  const handleSave = async (contentToSave: string) => {
    console.log('Saving content:', contentToSave);
    // In a real app, you'd save to your backend
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Collaborative Editing Test
          </h1>
          
          {/* Status Display */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`px-4 py-2 rounded-lg ${
              settings.enableCollaboration 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              Status: {settings.enableCollaboration ? 'Collaborative Mode' : 'Solo Mode'}
            </div>
            
            {currentUser && (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: currentUser.color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Collaboration Settings
            </button>
            
            <button
              onClick={() => setShowProfile(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Setup User Profile
            </button>
            
            <button
              onClick={() => updateSettings({ enableCollaboration: !settings.enableCollaboration })}
              className={`px-4 py-2 rounded-lg transition-colors ${
                settings.enableCollaboration 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {settings.enableCollaboration ? 'Disable' : 'Enable'} Collaboration
            </button>
          </div>

          {/* Settings Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Settings:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Collaboration:</span> {settings.enableCollaboration ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <span className="font-medium">Auto-save interval:</span> {settings.autoSaveInterval / 1000}s
              </div>
              <div>
                <span className="font-medium">Conflict resolution:</span> {settings.conflictResolutionStrategy}
              </div>
              <div>
                <span className="font-medium">Show cursors:</span> {settings.showOtherCursors ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Max participants:</span> {settings.maxParticipants}
              </div>
              <div>
                <span className="font-medium">Session timeout:</span> {settings.sessionTimeout / 60000}min
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" style={{ height: '500px' }}>
          {settings.enableCollaboration ? (
            <SimpleCollaborativeEditor
              noteId="test-document"
              initialContent={content}
              onContentChange={setContent}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Collaboration Not Enabled
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enable collaboration to start real-time editing.
                </p>
                <button
                  onClick={() => updateSettings({ enableCollaboration: true })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enable Collaboration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Collaboration Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <CollaborationSettings
              settings={settings}
              onSettingsChange={updateSettings}
            />
          </div>
        </div>
      )}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
