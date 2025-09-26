import { SearchCriteria } from '@/types';

export interface SearchHistoryItem {
  id: string;
  criteria: SearchCriteria;
  timestamp: Date;
  resultsCount?: number;
  averageScore?: number;
}

const STORAGE_KEY = 'job_search_history';
const MAX_HISTORY_ITEMS = 20;

export function saveSearchToHistory(
  criteria: SearchCriteria,
  resultsCount?: number,
  averageScore?: number
): void {
  try {
    const history = getSearchHistory();

    const newItem: SearchHistoryItem = {
      id: `search-${Date.now()}`,
      criteria,
      timestamp: new Date(),
      resultsCount,
      averageScore,
    };

    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to save search history:', error);
  }
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored) as SearchHistoryItem[];

    return history.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load search history:', error);
    return [];
  }
}

export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear search history:', error);
  }
}

export function removeSearchFromHistory(id: string): void {
  try {
    const history = getSearchHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to remove search from history:', error);
  }
}

export function formatSearchSummary(item: SearchHistoryItem): string {
  const parts: string[] = [item.criteria.query];

  if (item.criteria.location) {
    parts.push(`in ${item.criteria.location}`);
  }

  if (item.criteria.salary?.min || item.criteria.salary?.max) {
    const salaryParts: string[] = [];
    if (item.criteria.salary.min) {
      salaryParts.push(`${item.criteria.salary.min / 1000}k+`);
    }
    if (item.criteria.salary.max && !item.criteria.salary.min) {
      salaryParts.push(`up to ${item.criteria.salary.max / 1000}k`);
    } else if (item.criteria.salary.max && item.criteria.salary.min) {
      salaryParts[0] = `${item.criteria.salary.min / 1000}k-${item.criteria.salary.max / 1000}k`;
    }
    if (salaryParts.length > 0) {
      parts.push(`(${salaryParts[0]})`);
    }
  }

  return parts.join(' ');
}

export function getRecentSearches(limit: number = 5): SearchHistoryItem[] {
  const history = getSearchHistory();
  return history.slice(0, limit);
}