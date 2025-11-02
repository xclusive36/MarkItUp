import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export interface UseModalStateReturn {
  aiChat: ModalState;
  writingAssistant: ModalState;
  knowledgeDiscovery: ModalState;
  researchAssistant: ModalState;
  knowledgeMap: ModalState;
  batchAnalyzer: ModalState;
  globalSearch: ModalState;
  commandPalette: ModalState;
  calendar: ModalState;
  graphAnalytics: ModalState;
  connectionSuggestions: ModalState;
  mocSuggestions: ModalState;
  keyboardHelp: ModalState;
  writingStats: ModalState;
  zenMode: ModalState;
  collabSettings: ModalState;
  userProfile: ModalState;
}

/**
 * Custom hook to manage all modal visibility states
 * Replaces 17+ individual useState calls with a single organized interface
 */
export function useModalState(): UseModalStateReturn {
  // AI-related modals
  const [showAIChat, setShowAIChat] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  const [showKnowledgeDiscovery, setShowKnowledgeDiscovery] = useState(false);
  const [showResearchAssistant, setShowResearchAssistant] = useState(false);
  const [showKnowledgeMap, setShowKnowledgeMap] = useState(false);
  const [showBatchAnalyzer, setShowBatchAnalyzer] = useState(false);

  // UI modals
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showWritingStats, setShowWritingStats] = useState(false);
  const [showZenMode, setShowZenMode] = useState(false);

  // Knowledge Graph modals
  const [showGraphAnalytics, setShowGraphAnalytics] = useState(false);
  const [showConnectionSuggestions, setShowConnectionSuggestions] = useState(false);
  const [showMOCSuggestions, setShowMOCSuggestions] = useState(false);

  // Collaboration modals
  const [showCollabSettings, setShowCollabSettings] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Helper function to create modal state object
  const createModalState = useCallback(
    (isOpen: boolean, setIsOpen: (value: boolean) => void): ModalState => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen(!isOpen),
    }),
    []
  );

  return {
    aiChat: createModalState(showAIChat, setShowAIChat),
    writingAssistant: createModalState(showWritingAssistant, setShowWritingAssistant),
    knowledgeDiscovery: createModalState(showKnowledgeDiscovery, setShowKnowledgeDiscovery),
    researchAssistant: createModalState(showResearchAssistant, setShowResearchAssistant),
    knowledgeMap: createModalState(showKnowledgeMap, setShowKnowledgeMap),
    batchAnalyzer: createModalState(showBatchAnalyzer, setShowBatchAnalyzer),
    globalSearch: createModalState(showGlobalSearch, setShowGlobalSearch),
    commandPalette: createModalState(showCommandPalette, setShowCommandPalette),
    calendar: createModalState(showCalendar, setShowCalendar),
    graphAnalytics: createModalState(showGraphAnalytics, setShowGraphAnalytics),
    connectionSuggestions: createModalState(
      showConnectionSuggestions,
      setShowConnectionSuggestions
    ),
    mocSuggestions: createModalState(showMOCSuggestions, setShowMOCSuggestions),
    keyboardHelp: createModalState(showKeyboardHelp, setShowKeyboardHelp),
    writingStats: createModalState(showWritingStats, setShowWritingStats),
    zenMode: createModalState(showZenMode, setShowZenMode),
    collabSettings: createModalState(showCollabSettings, setShowCollabSettings),
    userProfile: createModalState(showUserProfile, setShowUserProfile),
  };
}
