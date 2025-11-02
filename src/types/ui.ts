/**
 * UI-specific type definitions for better type safety
 * Prevents typos and ensures consistent usage across the application
 */

/**
 * Available view modes for the main content area
 */
export type ViewMode = 'edit' | 'preview' | 'split';

/**
 * Available main panel views
 */
export type MainView = 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';

/**
 * Button action types for the header
 */
export type ButtonAction =
  | 'command-palette'
  | 'calendar'
  | 'ai-chat'
  | 'writing-assistant'
  | 'knowledge-discovery'
  | 'research-assistant'
  | 'knowledge-map'
  | 'batch-analyzer'
  | 'user-profile'
  | 'collab-settings';

/**
 * Theme options
 */
export type Theme = 'light' | 'dark';

/**
 * Toast notification types
 */
export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Sidebar state
 */
export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

/**
 * Editor state
 */
export interface EditorState {
  content: string;
  cursorPosition: number;
  selection: {
    start: number;
    end: number;
  } | null;
}

/**
 * Save status states
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * AI provider options
 */
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama';

/**
 * AI status
 */
export type AIStatus = 'idle' | 'thinking' | 'streaming' | 'error';

/**
 * Search mode options
 */
export type SearchMode = 'keyword' | 'semantic' | 'hybrid' | 'regex';

/**
 * Sort options for notes
 */
export type NoteSortOption = 'name' | 'modified' | 'created' | 'size';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * View layout options
 */
export type LayoutOption = 'default' | 'wide' | 'focus' | 'zen';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

/**
 * Modal props interface
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Analytics event types (extend as needed)
 */
export type AnalyticsEvent =
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'note_viewed'
  | 'search_performed'
  | 'ai_chat_opened'
  | 'plugin_enabled'
  | 'theme_changed'
  | 'export_performed';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  icon?: string;
  category?: 'ai' | 'productivity' | 'knowledge' | 'ui' | 'integration';
}
