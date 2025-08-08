"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CollaborativeSettings, Participant } from '../lib/types';

interface CollaborationContextType {
  settings: CollaborativeSettings;
  currentUser: Omit<Participant, 'id' | 'lastSeen' | 'isActive'> | null;
  updateSettings: (settings: Partial<CollaborativeSettings>) => void;
  setCurrentUser: (user: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>) => void;
  generateUserColor: () => string;
}

const defaultSettings: CollaborativeSettings = {
  enableCollaboration: false,
  autoSaveInterval: 30000, // 30 seconds
  conflictResolutionStrategy: 'operational-transform',
  showOtherCursors: true,
  showOtherSelections: true,
  maxParticipants: 10,
  sessionTimeout: 1800000, // 30 minutes
};

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

const STORAGE_KEY = 'markitup_collaboration_settings';
const USER_STORAGE_KEY = 'markitup_collaboration_user';

const userColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
];

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<CollaborativeSettings>(defaultSettings);
  const [currentUser, setCurrentUserState] = useState<Omit<Participant, 'id' | 'lastSeen' | 'isActive'> | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }

      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCurrentUserState(parsed);
      } else {
        // Create a default user
        const defaultUser = {
          name: `User ${Math.floor(Math.random() * 1000)}`,
          color: generateUserColor(),
        };
        setCurrentUserState(defaultUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }
    } catch (error) {
      console.error('Error loading collaboration settings:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving collaboration settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<CollaborativeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setCurrentUser = (user: Omit<Participant, 'id' | 'lastSeen' | 'isActive'>) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const generateUserColor = (): string => {
    const usedColors = new Set(); // In a real app, you'd track used colors
    const availableColors = userColors.filter(color => !usedColors.has(color));
    
    if (availableColors.length === 0) {
      // Generate a random color if all predefined colors are used
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }
    
    return availableColors[Math.floor(Math.random() * availableColors.length)];
  };

  const value: CollaborationContextType = {
    settings,
    currentUser,
    updateSettings,
    setCurrentUser,
    generateUserColor,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = (): CollaborationContextType => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
