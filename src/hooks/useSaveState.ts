import { useState } from 'react';

export interface UseSaveStateReturn {
  // Save status
  saveStatus: string;
  setSaveStatus: (status: string) => void;

  // Save timing
  lastSaved: Date | null;
  setLastSaved: (date: Date | null) => void;

  // Save progress
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;

  // Save errors
  saveError: string | null;
  setSaveError: (error: string | null) => void;

  // Helper methods
  clearSaveStatus: () => void;
  setSaveSuccess: (message?: string) => void;
  setSaveErrorWithTimeout: (error: string, timeout?: number) => void;
}

/**
 * Custom hook to manage save-related state
 * Consolidates save status, timing, progress, and error handling
 */
export function useSaveState(): UseSaveStateReturn {
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const clearSaveStatus = () => {
    setSaveStatus('');
    setSaveError(null);
  };

  const setSaveSuccess = (message: string = 'Note saved successfully! 🎉') => {
    setSaveStatus(message);
    setLastSaved(new Date());
    setSaveError(null);
    setIsSaving(false);
  };

  const setSaveErrorWithTimeout = (error: string, timeout: number = 3000) => {
    setSaveStatus(error);
    setSaveError(error);
    setIsSaving(false);
    setTimeout(() => {
      setSaveStatus('');
      setSaveError(null);
    }, timeout);
  };

  return {
    saveStatus,
    setSaveStatus,
    lastSaved,
    setLastSaved,
    isSaving,
    setIsSaving,
    saveError,
    setSaveError,
    clearSaveStatus,
    setSaveSuccess,
    setSaveErrorWithTimeout,
  };
}
