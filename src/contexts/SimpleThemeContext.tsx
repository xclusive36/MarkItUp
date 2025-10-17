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

// Import theme utilities
const getActiveThemeId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('markitup-active-theme');
  }
  return null;
};

interface CustomTheme {
  id: string;
  name: string;
  colors?: Record<string, string>;
  typography?: {
    fontFamilyBase?: string;
    fontFamilyHeading?: string;
    fontFamilyMono?: string;
    fontSizeBase?: number;
    lineHeight?: number;
    letterSpacing?: number;
  };
  layout?: {
    borderRadius?: number;
    paddingScale?: number;
    shadowIntensity?: 'none' | 'subtle' | 'medium' | 'strong';
  };
}

const loadThemeById = (id: string): CustomTheme | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('markitup-custom-themes');
    if (stored) {
      try {
        const themes = JSON.parse(stored) as CustomTheme[];
        return themes.find(t => t.id === id) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
};

const applyStoredTheme = (theme: CustomTheme): void => {
  if (!theme) return;

  const root = document.documentElement;

  // Apply colors
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--theme-${cssVar}`, value);
    });
  }

  // Apply typography
  if (theme.typography) {
    const {
      fontFamilyBase,
      fontFamilyHeading,
      fontFamilyMono,
      fontSizeBase,
      lineHeight,
      letterSpacing,
    } = theme.typography;
    if (fontFamilyBase) root.style.setProperty('--theme-font-base', fontFamilyBase);
    if (fontFamilyHeading) root.style.setProperty('--theme-font-heading', fontFamilyHeading);
    if (fontFamilyMono) root.style.setProperty('--theme-font-mono', fontFamilyMono);
    if (fontSizeBase) root.style.setProperty('--theme-font-size', `${fontSizeBase}px`);
    if (lineHeight) root.style.setProperty('--theme-line-height', lineHeight.toString());
    if (letterSpacing) root.style.setProperty('--theme-letter-spacing', `${letterSpacing}px`);
  }

  // Apply layout
  if (theme.layout) {
    const { borderRadius, paddingScale, shadowIntensity } = theme.layout;
    if (borderRadius !== undefined)
      root.style.setProperty('--theme-border-radius', `${borderRadius}px`);
    if (paddingScale) root.style.setProperty('--theme-padding-scale', paddingScale.toString());

    // Shadow intensity
    if (shadowIntensity) {
      const shadows: Record<string, string> = {
        none: 'none',
        subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        strong: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
      };
      root.style.setProperty('--theme-shadow', shadows[shadowIntensity] || shadows.medium);
    }
  }
};

// Direct DOM theme application
const applyThemeToDOM = (theme: Theme) => {
  const html = document.documentElement;

  // Remove all theme classes
  html.classList.remove('light', 'dark');

  // Add new theme class
  html.classList.add(theme);

  // Force CSS recalculation
  html.style.colorScheme = theme;

  // Use CSS variable for body background instead of hardcoding
  // This allows custom themes to override
  document.body.style.backgroundColor = 'var(--bg-primary)';
};

// Force all React components to re-render
const forceAllComponentsUpdate = () => {
  globalForceUpdate = Date.now();

  // Dispatch custom event to trigger updates
  window.dispatchEvent(
    new CustomEvent('theme-force-update', {
      detail: { theme: globalTheme, timestamp: globalForceUpdate },
    })
  );
};

export function SimpleThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(globalTheme);
  const [forceUpdate, setForceUpdate] = useState(globalForceUpdate);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const initialTheme = savedTheme || systemTheme;

    globalTheme = initialTheme;
    setTheme(initialTheme);
    applyThemeToDOM(initialTheme);

    // Restore custom theme if one was applied
    const activeThemeId = getActiveThemeId();
    if (activeThemeId) {
      const customTheme = loadThemeById(activeThemeId);
      if (customTheme) {
        applyStoredTheme(customTheme);
      }
    }

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
