'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  forceUpdate: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Global theme management - bypasses React state issues
let globalTheme: Theme = 'light';
let globalForceUpdate = 0;

// Direct DOM theme application
const applyThemeToDOM = (theme: Theme) => {
  const html = document.documentElement;
  
  // Remove all theme classes
  html.classList.remove('light', 'dark');
  
  // Add new theme class
  html.classList.add(theme);
  
  // Force CSS recalculation
  html.style.colorScheme = theme;
  
  // Force body background
  document.body.style.backgroundColor = theme === 'dark' ? '#111827' : '#f9fafb';
};

// Force all React components to re-render
const forceAllComponentsUpdate = () => {
  globalForceUpdate = Date.now();
  
  // Dispatch custom event to trigger updates
  window.dispatchEvent(new CustomEvent('theme-force-update', { 
    detail: { theme: globalTheme, timestamp: globalForceUpdate } 
  }));
};

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(globalTheme);
  const [forceUpdate, setForceUpdate] = useState(globalForceUpdate);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || systemTheme;
    
    globalTheme = initialTheme;
    setTheme(initialTheme);
    applyThemeToDOM(initialTheme);
    
    // System theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      
      // Update global state
      globalTheme = newTheme;
      localStorage.setItem('theme', newTheme);
      
      // Apply to DOM immediately
      applyThemeToDOM(newTheme);
      
      // Force React update
      setTheme(newTheme);
      forceAllComponentsUpdate();
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    
    // Listen for force updates
    const handleForceUpdate = (event: CustomEvent) => {
      setTheme(event.detail.theme);
      setForceUpdate(event.detail.timestamp);
    };
    
    window.addEventListener('theme-force-update', handleForceUpdate as EventListener);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      window.removeEventListener('theme-force-update', handleForceUpdate as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = globalTheme === 'light' ? 'dark' : 'light';
    
    // Update global state
    globalTheme = newTheme;
    localStorage.setItem('theme', newTheme);
    
    // Apply to DOM immediately
    applyThemeToDOM(newTheme);
    
    // Force React update
    setTheme(newTheme);
    forceAllComponentsUpdate();
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, forceUpdate }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSimpleTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useSimpleTheme must be used within a SimpleThemeProvider');
  }
  return context;
}
