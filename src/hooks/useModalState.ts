import { useState, useCallback, useMemo } from 'react';

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
 * Optimized with useMemo to prevent unnecessary re-renders
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

  // Create memoized modal states to prevent unnecessary re-renders
  const aiChat = useMemo(
    () => ({
      isOpen: showAIChat,
      open: () => setShowAIChat(true),
      close: () => setShowAIChat(false),
      toggle: () => setShowAIChat(prev => !prev),
    }),
    [showAIChat]
  );

  const writingAssistant = useMemo(
    () => ({
      isOpen: showWritingAssistant,
      open: () => setShowWritingAssistant(true),
      close: () => setShowWritingAssistant(false),
      toggle: () => setShowWritingAssistant(prev => !prev),
    }),
    [showWritingAssistant]
  );

  const knowledgeDiscovery = useMemo(
    () => ({
      isOpen: showKnowledgeDiscovery,
      open: () => setShowKnowledgeDiscovery(true),
      close: () => setShowKnowledgeDiscovery(false),
      toggle: () => setShowKnowledgeDiscovery(prev => !prev),
    }),
    [showKnowledgeDiscovery]
  );

  const researchAssistant = useMemo(
    () => ({
      isOpen: showResearchAssistant,
      open: () => setShowResearchAssistant(true),
      close: () => setShowResearchAssistant(false),
      toggle: () => setShowResearchAssistant(prev => !prev),
    }),
    [showResearchAssistant]
  );

  const knowledgeMap = useMemo(
    () => ({
      isOpen: showKnowledgeMap,
      open: () => setShowKnowledgeMap(true),
      close: () => setShowKnowledgeMap(false),
      toggle: () => setShowKnowledgeMap(prev => !prev),
    }),
    [showKnowledgeMap]
  );

  const batchAnalyzer = useMemo(
    () => ({
      isOpen: showBatchAnalyzer,
      open: () => setShowBatchAnalyzer(true),
      close: () => setShowBatchAnalyzer(false),
      toggle: () => setShowBatchAnalyzer(prev => !prev),
    }),
    [showBatchAnalyzer]
  );

  const globalSearch = useMemo(
    () => ({
      isOpen: showGlobalSearch,
      open: () => setShowGlobalSearch(true),
      close: () => setShowGlobalSearch(false),
      toggle: () => setShowGlobalSearch(prev => !prev),
    }),
    [showGlobalSearch]
  );

  const commandPalette = useMemo(
    () => ({
      isOpen: showCommandPalette,
      open: () => setShowCommandPalette(true),
      close: () => setShowCommandPalette(false),
      toggle: () => setShowCommandPalette(prev => !prev),
    }),
    [showCommandPalette]
  );

  const calendar = useMemo(
    () => ({
      isOpen: showCalendar,
      open: () => setShowCalendar(true),
      close: () => setShowCalendar(false),
      toggle: () => setShowCalendar(prev => !prev),
    }),
    [showCalendar]
  );

  const graphAnalytics = useMemo(
    () => ({
      isOpen: showGraphAnalytics,
      open: () => setShowGraphAnalytics(true),
      close: () => setShowGraphAnalytics(false),
      toggle: () => setShowGraphAnalytics(prev => !prev),
    }),
    [showGraphAnalytics]
  );

  const connectionSuggestions = useMemo(
    () => ({
      isOpen: showConnectionSuggestions,
      open: () => setShowConnectionSuggestions(true),
      close: () => setShowConnectionSuggestions(false),
      toggle: () => setShowConnectionSuggestions(prev => !prev),
    }),
    [showConnectionSuggestions]
  );

  const mocSuggestions = useMemo(
    () => ({
      isOpen: showMOCSuggestions,
      open: () => setShowMOCSuggestions(true),
      close: () => setShowMOCSuggestions(false),
      toggle: () => setShowMOCSuggestions(prev => !prev),
    }),
    [showMOCSuggestions]
  );

  const keyboardHelp = useMemo(
    () => ({
      isOpen: showKeyboardHelp,
      open: () => setShowKeyboardHelp(true),
      close: () => setShowKeyboardHelp(false),
      toggle: () => setShowKeyboardHelp(prev => !prev),
    }),
    [showKeyboardHelp]
  );

  const writingStats = useMemo(
    () => ({
      isOpen: showWritingStats,
      open: () => setShowWritingStats(true),
      close: () => setShowWritingStats(false),
      toggle: () => setShowWritingStats(prev => !prev),
    }),
    [showWritingStats]
  );

  const zenMode = useMemo(
    () => ({
      isOpen: showZenMode,
      open: () => setShowZenMode(true),
      close: () => setShowZenMode(false),
      toggle: () => setShowZenMode(prev => !prev),
    }),
    [showZenMode]
  );

  const collabSettings = useMemo(
    () => ({
      isOpen: showCollabSettings,
      open: () => setShowCollabSettings(true),
      close: () => setShowCollabSettings(false),
      toggle: () => setShowCollabSettings(prev => !prev),
    }),
    [showCollabSettings]
  );

  const userProfile = useMemo(
    () => ({
      isOpen: showUserProfile,
      open: () => setShowUserProfile(true),
      close: () => setShowUserProfile(false),
      toggle: () => setShowUserProfile(prev => !prev),
    }),
    [showUserProfile]
  );

  return {
    aiChat,
    writingAssistant,
    knowledgeDiscovery,
    researchAssistant,
    knowledgeMap,
    batchAnalyzer,
    globalSearch,
    commandPalette,
    calendar,
    graphAnalytics,
    connectionSuggestions,
    mocSuggestions,
    keyboardHelp,
    writingStats,
    zenMode,
    collabSettings,
    userProfile,
  };
}
