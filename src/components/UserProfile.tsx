"use client";

import React, { useState } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { Participant } from '../lib/types';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, setCurrentUser, generateUserColor } = useCollaboration();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [color, setColor] = useState(currentUser?.color || '#3B82F6');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  const handleSave = () => {
    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    const updatedUser: Omit<Participant, 'id' | 'lastSeen' | 'isActive'> = {
      name: name.trim(),
      email: email.trim() || undefined,
      color,
      avatar: avatar.trim() || undefined,
    };

    setCurrentUser(updatedUser);
    onClose();
  };

  const handleRandomColor = () => {
    setColor(generateUserColor());
  };

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#6366F1', '#06B6D4', '#84CC16', '#F97316'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar URL (Optional)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cursor Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
              />
              <button
                onClick={handleRandomColor}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Random
              </button>
            </div>
          </div>

          {/* Predefined Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === presetColor 
                      ? 'border-gray-800 dark:border-white scale-110' 
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div className="flex items-center space-x-3">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${!avatar ? 'block' : 'hidden'}`}
                style={{ backgroundColor: color }}
              >
                {name.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {name || 'Your Name'}
                </div>
                {email && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
