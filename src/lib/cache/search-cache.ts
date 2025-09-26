import { RawJob, SearchCriteria } from '@/types';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface SearchCacheResult {
  jobs: RawJob[];
  metadata: {
    totalJobsFound: number;
    uniqueJobs: number;
    duplicatesRemoved: number;
    successfulSources: string[];
    failedSources: string[];
    partialResults: boolean;
    searchDurationMs: number;
  };
}

export class SearchCache {
  private cache: Map<string, CacheEntry<SearchCacheResult>>;
  private defaultTTL: number;
  private maxSize: number;

  constructor(defaultTTL: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
  }

  generateKey(criteria: Partial<SearchCriteria>): string {
    const normalized = {
      query: criteria.query?.toLowerCase().trim(),
      location: criteria.location?.toLowerCase().trim(),
      sources: criteria.sources?.sort().join(','),
      jobTypes: criteria.jobTypes?.sort().join(','),
      maxResults: criteria.maxResults,
      postedWithinDays: criteria.postedWithinDays,
    };
    return JSON.stringify(normalized);
  }

  get(key: string): SearchCacheResult | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: SearchCacheResult, ttl?: number): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private findOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  getSize(): number {
    return this.cache.size;
  }

  getStats(): {
    size: number;
    maxSize: number;
    utilization: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100,
    };
  }
}

export const searchCache = new SearchCache();