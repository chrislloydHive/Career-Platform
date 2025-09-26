import { JobSource } from '@/types';

export interface SearchMetrics {
  searchId: string;
  timestamp: Date;
  query: string;
  location?: string;
  sources: JobSource[];
  durationMs: number;
  jobsFound: number;
  successfulSources: JobSource[];
  failedSources: JobSource[];
  errors: number;
  cached: boolean;
}

export interface AggregatedMetrics {
  totalSearches: number;
  averageDuration: number;
  averageJobsFound: number;
  successRate: number;
  cacheHitRate: number;
  sourceSuccessRates: Record<JobSource, number>;
  errorRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  popularLocations: Array<{ location: string; count: number }>;
}

export class SearchAnalytics {
  private metrics: SearchMetrics[] = [];
  private maxMetrics: number = 1000;

  addMetric(metric: SearchMetrics): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getRecentMetrics(count: number = 10): SearchMetrics[] {
    return this.metrics.slice(-count);
  }

  getAggregatedMetrics(startTime?: Date, endTime?: Date): AggregatedMetrics {
    const filteredMetrics = this.filterByTimeRange(startTime, endTime);

    if (filteredMetrics.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalSearches = filteredMetrics.length;
    const totalDuration = filteredMetrics.reduce((sum, m) => sum + m.durationMs, 0);
    const totalJobs = filteredMetrics.reduce((sum, m) => sum + m.jobsFound, 0);
    const successfulSearches = filteredMetrics.filter(m => m.jobsFound > 0).length;
    const cachedSearches = filteredMetrics.filter(m => m.cached).length;
    const totalErrors = filteredMetrics.reduce((sum, m) => sum + m.errors, 0);

    const sourceStats = this.calculateSourceSuccessRates(filteredMetrics);
    const queryStats = this.calculatePopularQueries(filteredMetrics);
    const locationStats = this.calculatePopularLocations(filteredMetrics);

    return {
      totalSearches,
      averageDuration: totalDuration / totalSearches,
      averageJobsFound: totalJobs / totalSearches,
      successRate: (successfulSearches / totalSearches) * 100,
      cacheHitRate: (cachedSearches / totalSearches) * 100,
      sourceSuccessRates: sourceStats,
      errorRate: (totalErrors / totalSearches) * 100,
      popularQueries: queryStats,
      popularLocations: locationStats,
    };
  }

  private filterByTimeRange(startTime?: Date, endTime?: Date): SearchMetrics[] {
    return this.metrics.filter(metric => {
      const time = new Date(metric.timestamp);
      if (startTime && time < startTime) return false;
      if (endTime && time > endTime) return false;
      return true;
    });
  }

  private calculateSourceSuccessRates(metrics: SearchMetrics[]): Record<JobSource, number> {
    const sourceAttempts: Record<string, number> = {};
    const sourceSuccesses: Record<string, number> = {};

    metrics.forEach(metric => {
      metric.sources.forEach(source => {
        sourceAttempts[source] = (sourceAttempts[source] || 0) + 1;
      });

      metric.successfulSources.forEach(source => {
        sourceSuccesses[source] = (sourceSuccesses[source] || 0) + 1;
      });
    });

    const rates: Record<string, number> = {};
    Object.keys(sourceAttempts).forEach(source => {
      const attempts = sourceAttempts[source];
      const successes = sourceSuccesses[source] || 0;
      rates[source] = (successes / attempts) * 100;
    });

    return rates as Record<JobSource, number>;
  }

  private calculatePopularQueries(metrics: SearchMetrics[]): Array<{ query: string; count: number }> {
    const queryCounts: Record<string, number> = {};

    metrics.forEach(metric => {
      const normalized = metric.query.toLowerCase().trim();
      queryCounts[normalized] = (queryCounts[normalized] || 0) + 1;
    });

    return Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculatePopularLocations(metrics: SearchMetrics[]): Array<{ location: string; count: number }> {
    const locationCounts: Record<string, number> = {};

    metrics.forEach(metric => {
      if (metric.location) {
        const normalized = metric.location.toLowerCase().trim();
        locationCounts[normalized] = (locationCounts[normalized] || 0) + 1;
      }
    });

    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getEmptyMetrics(): AggregatedMetrics {
    return {
      totalSearches: 0,
      averageDuration: 0,
      averageJobsFound: 0,
      successRate: 0,
      cacheHitRate: 0,
      sourceSuccessRates: {} as Record<JobSource, number>,
      errorRate: 0,
      popularQueries: [],
      popularLocations: [],
    };
  }

  clear(): void {
    this.metrics = [];
  }

  export(): SearchMetrics[] {
    return [...this.metrics];
  }
}

export const searchAnalytics = new SearchAnalytics();