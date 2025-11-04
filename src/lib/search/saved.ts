/**
 * Saved Searches
 *
 * Allows users to save and reuse complex search queries with filters.
 */

import { SearchFilters } from './filters';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters?: SearchFilters;
  description?: string;
  created: Date;
  lastUsed?: Date;
  useCount: number;
}

const STORAGE_KEY = 'markitup_saved_searches';

/**
 * Get all saved searches from localStorage
 */
export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const searches = JSON.parse(data);
    // Convert date strings back to Date objects
    return searches.map((s: SavedSearch) => ({
      ...s,
      created: new Date(s.created),
      lastUsed: s.lastUsed ? new Date(s.lastUsed) : undefined,
    }));
  } catch (error) {
    console.error('Error loading saved searches:', error);
    return [];
  }
}

/**
 * Save a new search or update existing one
 */
export function saveSearch(search: Omit<SavedSearch, 'id' | 'created' | 'useCount'>): SavedSearch {
  const searches = getSavedSearches();

  const newSearch: SavedSearch = {
    id: generateId(),
    created: new Date(),
    useCount: 0,
    ...search,
  };

  searches.push(newSearch);
  saveToStorage(searches);

  return newSearch;
}

/**
 * Update an existing saved search
 */
export function updateSavedSearch(id: string, updates: Partial<SavedSearch>): void {
  const searches = getSavedSearches();
  const index = searches.findIndex(s => s.id === id);

  if (index !== -1) {
    const existing = searches[index];
    if (existing) {
      searches[index] = { ...existing, ...updates };
      saveToStorage(searches);
    }
  }
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(id: string): void {
  const searches = getSavedSearches().filter(s => s.id !== id);
  saveToStorage(searches);
}

/**
 * Record that a saved search was used
 */
export function recordSearchUse(id: string): void {
  const searches = getSavedSearches();
  const index = searches.findIndex(s => s.id === id);

  if (index !== -1) {
    const search = searches[index];
    if (search) {
      search.useCount++;
      search.lastUsed = new Date();
      saveToStorage(searches);
    }
  }
}

/**
 * Get most frequently used searches
 */
export function getFrequentSearches(limit = 5): SavedSearch[] {
  return getSavedSearches()
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

/**
 * Get recently used searches
 */
export function getRecentSearches(limit = 5): SavedSearch[] {
  return getSavedSearches()
    .filter(s => s.lastUsed)
    .sort((a, b) => {
      const aTime = a.lastUsed?.getTime() || 0;
      const bTime = b.lastUsed?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

/**
 * Save searches array to localStorage
 */
function saveToStorage(searches: SavedSearch[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch (error) {
    console.error('Error saving searches:', error);
  }
}

/**
 * Generate unique ID for saved search
 */
function generateId(): string {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Export saved searches as JSON
 */
export function exportSavedSearches(): string {
  const searches = getSavedSearches();
  return JSON.stringify(searches, null, 2);
}

/**
 * Import saved searches from JSON
 */
export function importSavedSearches(json: string, merge = true): void {
  try {
    const imported = JSON.parse(json) as SavedSearch[];

    if (merge) {
      const existing = getSavedSearches();
      // Merge, avoiding duplicates by name
      const merged = [...existing];

      for (const search of imported) {
        if (!merged.some(s => s.name === search.name)) {
          merged.push({
            ...search,
            id: generateId(), // Generate new ID
            created: new Date(),
            useCount: 0,
          });
        }
      }

      saveToStorage(merged);
    } else {
      // Replace all
      const withNewIds = imported.map(search => ({
        ...search,
        id: generateId(),
        created: new Date(),
        useCount: 0,
      }));

      saveToStorage(withNewIds);
    }
  } catch (error) {
    console.error('Error importing searches:', error);
    throw new Error('Invalid saved searches file');
  }
}
