'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  lastUpdate: number; // Add timestamp to force re-renders
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);
  // const [hasManualOverride, setHasManualOverride] = useState(false); // Commented out: not used
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Initialize theme and set up system theme listener
  useEffect(() => {
    if (isInitialized) return;

    const savedTheme = localStorage.getItem('theme');
    // const hasManualSetting = localStorage.getItem('hasManualTheme') === 'true'; // Commented out: not used

    if (savedTheme === 'light' || savedTheme === 'dark') {
      console.log('Using saved theme:', savedTheme);
      setTheme(savedTheme);
      // setHasManualOverride(hasManualSetting); // Commented out: state not used
      updateDocumentTheme(savedTheme);
    } else {
      // No saved theme, use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      console.log('Using system theme:', systemTheme);
      setTheme(systemTheme);
      // setHasManualOverride(false); // Commented out: state not used
      updateDocumentTheme(systemTheme);
    }

    // Set up system theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    console.log(
      '🎧 Setting up system theme listener. Current system theme:',
      mediaQuery.matches ? 'dark' : 'light'
    );

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      console.log('🌟 SYSTEM THEME CHANGE DETECTED! New theme:', newSystemTheme);
      console.log('🌟 Event details:', e);

      // Force React state update first
      setTheme(prevTheme => {
        console.log('🔄 Updating React state from', prevTheme, 'to', newSystemTheme);
        return newSystemTheme;
      });

      // Apply theme to DOM immediately
      updateDocumentTheme(newSystemTheme);

      // Update localStorage to reflect current theme
      localStorage.setItem('theme', newSystemTheme);

      // Force a re-render by updating timestamp
      setTimeout(() => {
        console.log('🔄 Forcing component re-render with timestamp');
        setLastUpdate(Date.now());
      }, 0);

      console.log('🌟 System theme change applied');
    };

    // Add the listener
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    console.log('🎧 System theme listener added successfully');

    // Test the listener is working
    console.log('🧪 Testing system theme detection...');
    console.log('🧪 MediaQuery object:', mediaQuery);
    console.log('🧪 Current matches:', mediaQuery.matches);

    setIsInitialized(true);

    return () => {
      console.log('🎧 Removing system theme listener');
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isInitialized]);

  const updateDocumentTheme = (newTheme: Theme) => {
    const html = document.documentElement;

    console.log('🎯 BEFORE - HTML classes:', html.classList.toString());

    // Remove both light and dark classes
    html.classList.remove('light', 'dark');

    // Add the new theme class
    html.classList.add(newTheme);

    console.log('🎯 AFTER - HTML classes:', html.classList.toString());
    console.log('🎯 Theme applied:', newTheme);

    // Force a style recalculation
    html.style.colorScheme = newTheme;

    // Double check the class was applied
    setTimeout(() => {
      console.log('🎯 VERIFICATION - HTML classes after timeout:', html.classList.toString());
      console.log('🎯 VERIFICATION - Has dark class:', html.classList.contains('dark'));
      console.log('🎯 VERIFICATION - Has light class:', html.classList.contains('light'));
    }, 100);
  };

  const toggleTheme = () => {
    if (!isInitialized) return;

    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    console.log('TOGGLE: Switching from', theme, 'to', newTheme);

    // Update state
    setTheme(newTheme);
    setLastUpdate(Date.now());

    // Save to localStorage (this marks it as user preference)
    localStorage.setItem('theme', newTheme);

    // Update document immediately
    updateDocumentTheme(newTheme);

    console.log('TOGGLE: Complete. New theme:', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lastUpdate }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
