"use client";

import React, { useState } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { CollaborativeEditor } from '../components/CollaborativeEditor';
import { CollaborationSettings } from '../components/CollaborationSettings';
import { UserProfile } from '../components/UserProfile';
import { Users, Settings, User, Share } from 'lucide-react';

interface CollaborativePageProps {
  noteId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  onSave: (content: string) => void;
}

export const CollaborativePage: React.FC<CollaborativePageProps> = ({
  noteId,
  initialContent,
  onContentChange,
  onSave,
}) => {
  const { settings, currentUser, updateSettings } = useCollaboration();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const generateShareLink = () => {
    const shareUrl = `${window.location.origin}/collaborate/${noteId}`;
    return shareUrl;
  };

  const copyShareLink = () => {
    const shareUrl = generateShareLink();
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Collaboration Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Collaborative Editor
          </h2>
          
          {settings.enableCollaboration && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>Real-time collaboration enabled</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Share Button */}
          <button
            onClick={() => setShowShareDialog(true)}
            disabled={!settings.enableCollaboration}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{currentUser?.name || 'Profile'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1">
        {settings.enableCollaboration && currentUser ? (
          <CollaborativeEditor
            noteId={noteId}
            initialContent={initialContent}
            participant={currentUser}
            settings={settings}
            onContentChange={onContentChange}
            onSave={onSave}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Collaborative Editing Disabled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enable collaboration in settings to work with others in real-time.
              </p>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
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
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CollaborationSettings
              settings={settings}
              onSettingsChange={updateSettings}
            />
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Document
              </h2>
              <button
                onClick={() => setShowShareDialog(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share this link with others to collaborate on this document in real-time.
              </p>
              
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="text"
                  value={generateShareLink()}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Copy
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Collaboration Features
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Real-time editing with conflict resolution</li>
                        <li>Live cursor and selection tracking</li>
                        <li>Automatic save and sync</li>
                        <li>User presence indicators</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativePage;
