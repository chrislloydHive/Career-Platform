import { RawJob, JobSource, ScraperConfig, ScraperResult, ScraperError } from '@/types';
import { IScraper, SerpApiScraper, BaseScraper } from './scrapers';
import { SerpApiLinkedInScraper } from './scrapers/serpapi-linkedin-scraper';
import { SerpApiIndeedScraper } from './scrapers/serpapi-indeed-scraper';

export interface SearchProgress {
  source: JobSource;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress: number;
  jobsFound: number;
  error?: string;
}

export interface SearchEngineResult {
  jobs: RawJob[];
  totalJobs: number;
  uniqueJobs: number;
  duplicatesRemoved: number;
  scraperResults: ScraperResult[];
  errors: ScraperError[];
  successfulSources: JobSource[];
  failedSources: JobSource[];
  totalDurationMs: number;
  partialResults: boolean;
}

export interface SearchEngineConfig extends ScraperConfig {
  sources?: JobSource[];
  timeoutMs?: number;
  enableDeduplication?: boolean;
  onProgress?: (progress: SearchProgress[]) => void;
}

export class JobSearchEngine {
  private scrapers: Map<JobSource, IScraper>;
  private progress: Map<JobSource, SearchProgress>;
  private timeoutMs: number;

  constructor(timeoutMs: number = 60000) {
    this.scrapers = new Map();
    this.progress = new Map();
    this.timeoutMs = timeoutMs;

    this.scrapers.set('google_jobs', new SerpApiScraper() as unknown as BaseScraper);
    this.scrapers.set('linkedin', new SerpApiLinkedInScraper() as unknown as BaseScraper);
    this.scrapers.set('indeed', new SerpApiIndeedScraper() as unknown as BaseScraper);
  }

  async search(config: SearchEngineConfig): Promise<SearchEngineResult> {
    const startTime = Date.now();
    const sourcesToScrape = config.sources || ['google_jobs'];
    const enableDedup = config.enableDeduplication !== false;
    const timeoutMs = config.timeoutMs || this.timeoutMs;

    this.initializeProgress(sourcesToScrape);

    const scraperPromises = sourcesToScrape.map(source =>
      this.runScraperWithTimeout(source, config, timeoutMs)
    );

    const results = await Promise.allSettled(scraperPromises);

    const scraperResults: ScraperResult[] = [];
    const allJobs: RawJob[] = [];
    const allErrors: ScraperError[] = [];
    const successfulSources: JobSource[] = [];
    const failedSources: JobSource[] = [];
    let partialResults = false;

    results.forEach((result, index) => {
      const source = sourcesToScrape[index];

      if (result.status === 'fulfilled' && result.value) {
        scraperResults.push(result.value);
        allJobs.push(...result.value.jobs);
        allErrors.push(...result.value.errors);

        if (result.value.jobs.length > 0) {
          successfulSources.push(source);
        } else if (result.value.errors.length > 0) {
          failedSources.push(source);
          partialResults = true;
        }

        this.updateProgress(source, 'completed', 100, result.value.jobs.length);
      } else if (result.status === 'rejected') {
        const error = result.reason;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        allErrors.push({
          source,
          message: errorMessage,
          timestamp: new Date(),
        });

        failedSources.push(source);
        partialResults = true;

        const status = errorMessage.includes('timeout') ? 'timeout' : 'failed';
        this.updateProgress(source, status, 0, 0, errorMessage);
      }
    });

    const { uniqueJobs, duplicatesRemoved } = enableDedup
      ? this.deduplicateJobs(allJobs)
      : { uniqueJobs: allJobs, duplicatesRemoved: 0 };

    const totalDurationMs = Date.now() - startTime;

    return {
      jobs: uniqueJobs,
      totalJobs: allJobs.length,
      uniqueJobs: uniqueJobs.length,
      duplicatesRemoved,
      scraperResults,
      errors: allErrors,
      successfulSources,
      failedSources,
      totalDurationMs,
      partialResults,
    };
  }

  private async runScraperWithTimeout(
    source: JobSource,
    config: ScraperConfig,
    timeoutMs: number
  ): Promise<ScraperResult> {
    const scraper = this.scrapers.get(source);

    if (!scraper) {
      throw new Error(`Scraper for source "${source}" not found`);
    }

    this.updateProgress(source, 'running', 0, 0);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Scraper timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const scrapePromise = this.scrapeWithProgress(scraper, source, config);

    try {
      const result = await Promise.race([scrapePromise, timeoutPromise]);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        this.updateProgress(source, 'timeout', 0, 0, error.message);
      }
      throw error;
    } finally {
      if (scraper.close) {
        await scraper.close();
      }
    }
  }

  private async scrapeWithProgress(
    scraper: IScraper,
    source: JobSource,
    config: ScraperConfig
  ): Promise<ScraperResult> {
    const progressInterval = setInterval(() => {
      const current = this.progress.get(source);
      if (current && current.status === 'running' && current.progress < 90) {
        this.updateProgress(source, 'running', current.progress + 10, current.jobsFound);
      }
    }, 2000);

    try {
      const result = await scraper.scrape(config);
      clearInterval(progressInterval);
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    } finally {
      clearInterval(progressInterval);
    }
  }

  private initializeProgress(sources: JobSource[]): void {
    this.progress.clear();
    sources.forEach(source => {
      this.progress.set(source, {
        source,
        status: 'pending',
        progress: 0,
        jobsFound: 0,
      });
    });
  }

  private updateProgress(
    source: JobSource,
    status: SearchProgress['status'],
    progress: number,
    jobsFound: number,
    error?: string
  ): void {
    this.progress.set(source, {
      source,
      status,
      progress,
      jobsFound,
      error,
    });
  }

  getProgress(): SearchProgress[] {
    return Array.from(this.progress.values());
  }

  private deduplicateJobs(jobs: RawJob[]): {
    uniqueJobs: RawJob[];
    duplicatesRemoved: number;
  } {
    if (jobs.length === 0) {
      return { uniqueJobs: [], duplicatesRemoved: 0 };
    }

    const seenJobs = new Map<string, RawJob>();
    const batchSize = 100;

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);

      for (const job of batch) {
        const normalizedTitle = job.title.toLowerCase().trim();
        const normalizedCompany = job.company.toLowerCase().trim();
        const normalizedLocation = job.location.toLowerCase().trim();

        const exactKey = `${normalizedTitle}|${normalizedCompany}|${normalizedLocation}`;

        if (!seenJobs.has(exactKey)) {
          seenJobs.set(exactKey, job);
          continue;
        }

        const fuzzyKey = `${this.fuzzyMatch(normalizedTitle)}|${this.fuzzyMatch(normalizedCompany)}`;
        if (!seenJobs.has(fuzzyKey)) {
          seenJobs.set(fuzzyKey, job);
          continue;
        }

        const existing = seenJobs.get(fuzzyKey);
        if (existing && this.shouldReplaceJob(existing, job)) {
          seenJobs.set(fuzzyKey, job);
        }
      }
    }

    const uniqueJobs = Array.from(seenJobs.values());
    const duplicatesRemoved = jobs.length - uniqueJobs.length;

    return { uniqueJobs, duplicatesRemoved };
  }

  private fuzzyMatch(text: string): string {
    return text
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 50);
  }

  private shouldReplaceJob(existing: RawJob, candidate: RawJob): boolean {
    if (candidate.salary && !existing.salary) {
      return true;
    }

    if (candidate.description.length > existing.description.length) {
      return true;
    }

    if (candidate.postedDate > existing.postedDate) {
      return true;
    }

    return false;
  }

  async close(): Promise<void> {
    const closePromises = Array.from(this.scrapers.values()).map(scraper => {
      if (scraper.close) {
        return scraper.close().catch(err => console.error('Error closing scraper:', err));
      }
      return Promise.resolve();
    });

    await Promise.all(closePromises);
  }
}

export async function searchJobs(config: SearchEngineConfig): Promise<SearchEngineResult> {
  const engine = new JobSearchEngine(config.timeoutMs);

  try {
    const result = await engine.search(config);
    return result;
  } finally {
    await engine.close();
  }
}