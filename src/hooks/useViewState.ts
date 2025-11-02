import { useState } from 'react';

export type ViewMode = 'edit' | 'preview' | 'split';
export type CurrentView = 'editor' | 'graph' | 'search' | 'analytics' | 'plugins' | 'notes';

export interface UseViewStateReturn {
  // View mode state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Current view state
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;

  // Mobile sidebar state
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
  toggleMobileSidebar: () => void;

  // Left sidebar collapse state
  isLeftSidebarCollapsed: boolean;
  setIsLeftSidebarCollapsed: (collapsed: boolean) => void;
  toggleLeftSidebar: () => void;

  // Right panel state
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (open: boolean) => void;
  toggleRightPanel: () => void;

  isRightPanelCollapsed: boolean;
  setIsRightPanelCollapsed: (collapsed: boolean) => void;
  toggleRightPanelCollapse: () => void;

  // Mounting state
  isMounted: boolean;
  isInitializing: boolean;
  setIsInitializing: (initializing: boolean) => void;
}

/**
 * Custom hook to manage all view-related state
 * Consolidates view modes, current view, sidebar states, and mounting state
 */
export function useViewState(): UseViewStateReturn {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [currentView, setCurrentView] = useState<CurrentView>('editor');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Set mounted state immediately on hook initialization
  if (!isMounted) {
    setIsMounted(true);
  }

  return {
    viewMode,
    setViewMode,
    currentView,
    setCurrentView,
    showMobileSidebar,
    setShowMobileSidebar,
    toggleMobileSidebar: () => setShowMobileSidebar(prev => !prev),
    isLeftSidebarCollapsed,
    setIsLeftSidebarCollapsed,
    toggleLeftSidebar: () => setIsLeftSidebarCollapsed(prev => !prev),
    isRightPanelOpen,
    setIsRightPanelOpen,
    toggleRightPanel: () => setIsRightPanelOpen(prev => !prev),
    isRightPanelCollapsed,
    setIsRightPanelCollapsed,
    toggleRightPanelCollapse: () => setIsRightPanelCollapsed(prev => !prev),
    isMounted,
    isInitializing,
    setIsInitializing,
  };
}
