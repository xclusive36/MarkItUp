"use client";

import React, { useState } from 'react';
import { useCollaboration } from '../contexts/CollaborationContext';
import { useSimpleTheme } from '../contexts/SimpleThemeContext';
import { Participant } from '../lib/types';

interface UserProfileProps {
  onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, setCurrentUser, generateUserColor } = useCollaboration();
  const { theme } = useSimpleTheme();
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
      <div 
        className="rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{ backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff" }}>
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
          <h2 
            className="text-lg font-semibold"
            style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
            User Profile
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: theme === "dark" ? "#9ca3af" : "#9ca3af" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme === "dark" ? "#d1d5db" : "#6b7280";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme === "dark" ? "#9ca3af" : "#9ca3af";
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
              Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#f9fafb" : "#111827"
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
              Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#f9fafb" : "#111827"
              }}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
              Avatar URL (Optional)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: theme === "dark" ? "#374151" : "#ffffff",
                borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
                color: theme === "dark" ? "#f9fafb" : "#111827"
              }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
              Cursor Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: theme === "dark" ? "#4b5563" : "#d1d5db"
                }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 border rounded cursor-pointer"
                style={{ borderColor: theme === "dark" ? "#4b5563" : "#d1d5db" }}
              />
              <button
                onClick={handleRandomColor}
                className="px-3 py-2 text-sm rounded-lg transition-colors"
                style={{
                  backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
                  color: theme === "dark" ? "#d1d5db" : "#374151"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === "dark" ? "#4b5563" : "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === "dark" ? "#374151" : "#f3f4f6";
                }}
              >
                Random
              </button>
            </div>
          </div>

          {/* Predefined Colors */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
              Quick Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((presetColor) => (
                <button
                  key={presetColor}
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === presetColor 
                      ? 'scale-110' 
                      : 'hover:scale-105'
                  }`}
                  style={{ 
                    backgroundColor: presetColor,
                    borderColor: color === presetColor 
                      ? (theme === "dark" ? "#f9fafb" : "#111827")
                      : (theme === "dark" ? "#4b5563" : "#d1d5db")
                  }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div 
            className="rounded-lg p-4"
            style={{ backgroundColor: theme === "dark" ? "#374151" : "#f9fafb" }}>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme === "dark" ? "#d1d5db" : "#374151" }}>
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
                <div 
                  className="text-sm font-medium"
                  style={{ color: theme === "dark" ? "#f9fafb" : "#111827" }}>
                  {name || 'Your Name'}
                </div>
                {email && (
                  <div 
                    className="text-xs"
                    style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                    {email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div 
          className="flex items-center justify-end space-x-3 p-6 border-t"
          style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: theme === "dark" ? "#374151" : "#f3f4f6",
              color: theme === "dark" ? "#d1d5db" : "#374151"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === "dark" ? "#4b5563" : "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === "dark" ? "#374151" : "#f3f4f6";
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
