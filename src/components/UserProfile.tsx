'use client';

import React, { useState, useEffect } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useSimpleTheme } from '../contexts/SimpleThemeContext';
import { Participant } from '../lib/types';

interface UserProfileProps {
  onClose: () => void;
}

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  emailVerified: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, setCurrentUser, generateUserColor } = useCollaboration();
  const { theme } = useSimpleTheme();
  const isAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!isAuthDisabled);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [color, setColor] = useState(currentUser?.color || '#3B82F6');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Fetch authenticated user data if auth is enabled
  useEffect(() => {
    if (isAuthDisabled) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAuthUser(data.user);

          // Pre-fill fields with authenticated user data
          if (data.user.name) setName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthDisabled]);

  const handleSave = () => {
    if (!isAuthDisabled && !authUser && !name.trim()) {
      alert('Name is required');
      return;
    }

    // If auth is disabled OR no auth user, save to collaboration context
    if (isAuthDisabled || !authUser) {
      const updatedUser: Omit<Participant, 'id' | 'lastSeen' | 'isActive'> = {
        name: name.trim(),
        email: email.trim() || undefined,
        color,
        avatar: avatar.trim() || undefined,
      };

      setCurrentUser(updatedUser);
      onClose();
      return;
    }

    // If auth is enabled and user is logged in, save cursor color/avatar to collaboration context
    const updatedUser: Omit<Participant, 'id' | 'lastSeen' | 'isActive'> = {
      name: authUser.name || name.trim(),
      email: authUser.email || email.trim() || undefined,
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
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#6366F1',
    '#06B6D4',
    '#84CC16',
    '#F97316',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
          >
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#6b7280';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = theme === 'dark' ? '#9ca3af' : '#9ca3af';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div
            className="p-6 text-center"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Loading...
          </div>
        ) : (
          <>
            {/* Show account info banner if authenticated */}
            {authUser && (
              <div
                className="p-4 mx-6 mt-6 rounded-lg border"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#f0f9ff',
                  borderColor: theme === 'dark' ? '#374151' : '#bfdbfe',
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    <svg
                      className="w-5 h-5"
                      style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      {authUser.name || 'No name set'}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                    >
                      {authUser.email} • {authUser.plan} plan
                      {authUser.emailVerified && ' • ✓ Verified'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Display Name {authUser ? '(Read-only)' : '*'}
                </label>
                <input
                  type="text"
                  value={authUser ? authUser.name || 'Not set' : name}
                  onChange={e => !authUser && setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={!!authUser}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                />
                {authUser && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    To change your name, visit the Dashboard
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Email {authUser ? '(Read-only)' : '(Optional)'}
                </label>
                <input
                  type="email"
                  value={authUser ? authUser.email : email}
                  onChange={e => !authUser && setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!!authUser}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Avatar URL (Optional)
                </label>
                <input
                  type="url"
                  value={avatar}
                  onChange={e => setAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#f9fafb' : '#111827',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Cursor Color
                </label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full border-2"
                    style={{
                      backgroundColor: color,
                      borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    }}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={e => setColor(e.target.value)}
                    className="w-16 h-10 border rounded cursor-pointer"
                    style={{ borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
                  />
                  <button
                    onClick={handleRandomColor}
                    className="px-3 py-2 text-sm rounded-lg transition-colors"
                    style={{
                      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                      color: theme === 'dark' ? '#d1d5db' : '#374151',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark' ? '#4b5563' : '#e5e7eb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor =
                        theme === 'dark' ? '#374151' : '#f3f4f6';
                    }}
                  >
                    Random
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Quick Colors
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map(presetColor => (
                    <button
                      key={presetColor}
                      onClick={() => setColor(presetColor)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === presetColor ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: presetColor,
                        borderColor:
                          color === presetColor
                            ? theme === 'dark'
                              ? '#f9fafb'
                              : '#111827'
                            : theme === 'dark'
                              ? '#4b5563'
                              : '#d1d5db',
                      }}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb' }}
              >
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                >
                  Preview
                </label>
                <div className="flex items-center space-x-3">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={e => {
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
                    {(authUser?.name || name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: theme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      {authUser ? authUser.name || 'No name set' : name || 'Your Name'}
                    </div>
                    {(authUser ? authUser.email : email) && (
                      <div
                        className="text-xs"
                        style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                      >
                        {authUser ? authUser.email : email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div
          className="flex items-center justify-end space-x-3 p-6 border-t"
          style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#d1d5db' : '#374151',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4b5563' : '#e5e7eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
            }}
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
