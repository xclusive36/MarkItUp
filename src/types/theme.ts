/**
 * Theme System Types
 * Defines the structure for custom themes in MarkItUp
 */

export interface ThemeColors {
  // Background colors
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accent colors
  accentPrimary: string;
  accentSecondary: string;
  accentHover: string;

  // Border colors
  borderPrimary: string;
  borderSecondary: string;
  borderFocus: string;

  // UI element colors
  sidebarBg: string;
  sidebarText: string;
  toolbarBg: string;
  toolbarText: string;

  // Interactive colors
  linkColor: string;
  linkHover: string;
  buttonBg: string;
  buttonText: string;
  buttonHover: string;

  // Syntax highlighting
  syntaxKeyword: string;
  syntaxString: string;
  syntaxComment: string;
  syntaxNumber: string;
  syntaxFunction: string;
  syntaxVariable: string;

  // Status colors
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
}

export interface ThemeTypography {
  fontFamilyBase: string;
  fontFamilyHeading: string;
  fontFamilyMono: string;
  fontSizeBase: number; // in px
  lineHeight: number;
  letterSpacing: number; // in em
}

export interface ThemeLayout {
  borderRadius: number; // in px
  shadowIntensity: 'none' | 'subtle' | 'medium' | 'strong';
  paddingScale: number; // multiplier (e.g., 1.0 = normal, 1.2 = larger)
}

export interface CustomTheme {
  id: string;
  name: string;
  author: string;
  description?: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  createdAt: string;
  updatedAt: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  author: string;
  description: string;
  mode: 'light' | 'dark';
  preview?: string; // URL to preview image
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  popular?: boolean;
}

export interface ThemeExport {
  version: '1.0';
  theme: CustomTheme;
  exported: string;
}

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  rating: 'poor' | 'fair' | 'good' | 'excellent';
}
