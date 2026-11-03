import { RecentSearchItem } from '../types';

const STORAGE_KEY = 'hi_recent_searches';
const MAX_SEARCHES = 10;

export function getRecentSearches(): RecentSearchItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentSearch(location: string): RecentSearchItem[] {
  const clean = location.trim();
  if (!clean) return getRecentSearches();

  const current = getRecentSearches();
  // Filter out duplicate (case insensitive)
  const filtered = current.filter(
    (item) => item.location.toLowerCase() !== clean.toLowerCase()
  );

  const updated: RecentSearchItem[] = [
    {
      id: Math.random().toString(36).substring(2, 9),
      location: clean,
      timestamp: Date.now()
    },
    ...filtered
  ].slice(0, MAX_SEARCHES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save recent search to localStorage', err);
  }

  return updated;
}

export function removeRecentSearch(id: string): RecentSearchItem[] {
  const current = getRecentSearches();
  const filtered = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Could not remove recent search', err);
  }
  return filtered;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear recent searches', err);
  }
}
