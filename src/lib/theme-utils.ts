import { CustomTheme, ThemeExport, ContrastResult } from '../types/theme';

const THEME_STORAGE_KEY = 'markitup-custom-themes';
const ACTIVE_THEME_KEY = 'markitup-active-theme';

/**
 * Apply a theme by injecting CSS custom properties
 */
export function applyTheme(theme: CustomTheme): void {
  const root = document.documentElement;

  // Colors
  root.style.setProperty('--theme-bg-primary', theme.colors.bgPrimary);
  root.style.setProperty('--theme-bg-secondary', theme.colors.bgSecondary);
  root.style.setProperty('--theme-bg-tertiary', theme.colors.bgTertiary);
  root.style.setProperty('--theme-bg-hover', theme.colors.bgTertiary); // Use tertiary for hover
  root.style.setProperty('--theme-text-primary', theme.colors.textPrimary);
  root.style.setProperty('--theme-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted);
  root.style.setProperty('--theme-accent-primary', theme.colors.accentPrimary);
  root.style.setProperty('--theme-accent-secondary', theme.colors.accentSecondary);
  root.style.setProperty('--theme-accent-hover', theme.colors.accentHover);

  // Generate accent background (10% opacity of accent primary)
  const accentBg = theme.colors.accentPrimary + '1A'; // Add alpha for ~10% opacity
  root.style.setProperty('--theme-accent-bg', accentBg);

  // Generate accent border (lighter version of accent primary)
  root.style.setProperty('--theme-accent-border', theme.colors.accentPrimary);

  root.style.setProperty('--theme-border-primary', theme.colors.borderPrimary);
  root.style.setProperty('--theme-border-secondary', theme.colors.borderSecondary);
  root.style.setProperty('--theme-border-focus', theme.colors.borderFocus);
  root.style.setProperty('--theme-sidebar-bg', theme.colors.sidebarBg);
  root.style.setProperty('--theme-sidebar-text', theme.colors.sidebarText);
  root.style.setProperty('--theme-toolbar-bg', theme.colors.toolbarBg);
  root.style.setProperty('--theme-toolbar-text', theme.colors.toolbarText);
  root.style.setProperty('--theme-link-color', theme.colors.linkColor);
  root.style.setProperty('--theme-link-hover', theme.colors.linkHover);
  root.style.setProperty('--theme-button-bg', theme.colors.buttonBg);
  root.style.setProperty('--theme-button-text', theme.colors.buttonText);
  root.style.setProperty('--theme-button-hover', theme.colors.buttonHover);
  root.style.setProperty('--theme-syntax-keyword', theme.colors.syntaxKeyword);
  root.style.setProperty('--theme-syntax-string', theme.colors.syntaxString);
  root.style.setProperty('--theme-syntax-comment', theme.colors.syntaxComment);
  root.style.setProperty('--theme-syntax-number', theme.colors.syntaxNumber);
  root.style.setProperty('--theme-syntax-function', theme.colors.syntaxFunction);
  root.style.setProperty('--theme-syntax-variable', theme.colors.syntaxVariable);
  root.style.setProperty('--theme-success-color', theme.colors.successColor);
  root.style.setProperty('--theme-warning-color', theme.colors.warningColor);
  root.style.setProperty('--theme-error-color', theme.colors.errorColor);
  root.style.setProperty('--theme-info-color', theme.colors.infoColor);

  // Typography
  root.style.setProperty('--theme-font-base', theme.typography.fontFamilyBase);
  root.style.setProperty('--theme-font-heading', theme.typography.fontFamilyHeading);
  root.style.setProperty('--theme-font-mono', theme.typography.fontFamilyMono);
  root.style.setProperty('--theme-font-size', `${theme.typography.fontSizeBase}px`);
  root.style.setProperty('--theme-line-height', theme.typography.lineHeight.toString());
  root.style.setProperty('--theme-letter-spacing', `${theme.typography.letterSpacing}px`);

  // Layout
  root.style.setProperty('--theme-border-radius', `${theme.layout.borderRadius}px`);
  root.style.setProperty('--theme-padding-scale', theme.layout.paddingScale.toString());

  // Shadow intensity
  const shadowIntensity = getShadowValue(theme.layout.shadowIntensity);
  root.style.setProperty('--theme-shadow', shadowIntensity);

  // Store active theme ID
  localStorage.setItem(ACTIVE_THEME_KEY, theme.id);
}

/**
 * Get shadow CSS value based on intensity
 */
function getShadowValue(intensity: 'none' | 'subtle' | 'medium' | 'strong'): string {
  const shadows = {
    none: 'none',
    subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    strong: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  };
  return shadows[intensity];
}

/**
 * Save a custom theme to localStorage
 */
export function saveTheme(theme: CustomTheme): void {
  const themes = getAllThemes();
  const existingIndex = themes.findIndex(t => t.id === theme.id);

  if (existingIndex >= 0) {
    // Update existing theme
    themes[existingIndex] = {
      ...theme,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Add new theme
    themes.push({
      ...theme,
      createdAt: theme.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themes));
}

/**
 * Load a theme by ID from localStorage
 */
export function loadTheme(id: string): CustomTheme | null {
  const themes = getAllThemes();
  return themes.find(t => t.id === id) || null;
}

/**
 * Delete a theme from localStorage
 */
export function deleteTheme(id: string): void {
  const themes = getAllThemes();
  const filtered = themes.filter(t => t.id !== id);
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Get all saved themes from localStorage
 */
export function getAllThemes(): CustomTheme[] {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as CustomTheme[];
  } catch {
    return [];
  }
}

/**
 * Get the currently active theme ID
 */
export function getActiveThemeId(): string | null {
  return localStorage.getItem(ACTIVE_THEME_KEY);
}

/**
 * Clear the active theme (reset to default)
 */
export function clearActiveTheme(): void {
  localStorage.removeItem(ACTIVE_THEME_KEY);

  // Remove all theme CSS variables from the root element
  const root = document.documentElement;
  const themeVars = [
    '--theme-bg-primary',
    '--theme-bg-secondary',
    '--theme-bg-tertiary',
    '--theme-text-primary',
    '--theme-text-secondary',
    '--theme-text-muted',
    '--theme-accent-primary',
    '--theme-accent-secondary',
    '--theme-accent-hover',
    '--theme-border-primary',
    '--theme-border-secondary',
    '--theme-border-focus',
    '--theme-sidebar-bg',
    '--theme-sidebar-text',
    '--theme-toolbar-bg',
    '--theme-toolbar-text',
    '--theme-link-color',
    '--theme-link-hover',
    '--theme-button-bg',
    '--theme-button-text',
    '--theme-button-hover',
    '--theme-syntax-keyword',
    '--theme-syntax-string',
    '--theme-syntax-comment',
    '--theme-syntax-number',
    '--theme-syntax-function',
    '--theme-syntax-variable',
    '--theme-success-color',
    '--theme-warning-color',
    '--theme-error-color',
    '--theme-info-color',
    '--theme-font-base',
    '--theme-font-heading',
    '--theme-font-mono',
    '--theme-font-size',
    '--theme-line-height',
    '--theme-letter-spacing',
    '--theme-border-radius',
    '--theme-padding-scale',
    '--theme-shadow',
  ];

  themeVars.forEach(varName => {
    root.style.removeProperty(varName);
  });
}

/**
 * Export a theme as JSON
 */
export function exportTheme(theme: CustomTheme): ThemeExport {
  return {
    version: '1.0',
    theme,
    exported: new Date().toISOString(),
  };
}

/**
 * Import a theme from JSON
 */
export function importTheme(json: string): CustomTheme {
  const data = JSON.parse(json) as ThemeExport;

  // Validate version
  if (data.version !== '1.0') {
    throw new Error('Unsupported theme version');
  }

  // Validate required fields
  if (!data.theme || !data.theme.id || !data.theme.name || !data.theme.colors) {
    throw new Error('Invalid theme format');
  }

  return data.theme;
}

/**
 * Download theme as JSON file
 */
export function downloadTheme(theme: CustomTheme): void {
  const exportData = exportTheme(theme);
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${theme.id}-theme.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Check color contrast ratio for accessibility
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const fgLuminance = getRelativeLuminance(foreground);
  const bgLuminance = getRelativeLuminance(background);

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);

  const wcagAA = ratio >= 4.5;
  const wcagAAA = ratio >= 7.0;

  let rating: 'poor' | 'fair' | 'good' | 'excellent';
  if (ratio >= 7.0) rating = 'excellent';
  else if (ratio >= 4.5) rating = 'good';
  else if (ratio >= 3.0) rating = 'fair';
  else rating = 'poor';

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA,
    wcagAAA,
    rating,
  };
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(channel => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Generate a unique theme ID
 */
export function generateThemeId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Validate theme completeness
 */
export function validateTheme(theme: Partial<CustomTheme>): string[] {
  const errors: string[] = [];

  if (!theme.id) errors.push('Theme ID is required');
  if (!theme.name) errors.push('Theme name is required');
  if (!theme.colors) errors.push('Theme colors are required');
  if (!theme.typography) errors.push('Theme typography is required');
  if (!theme.layout) errors.push('Theme layout is required');

  return errors;
}
