import { getJson } from 'serpapi';
import { RawJob, JobSource, ScraperConfig, JobType } from '@/types';
import { ScraperErrorClass as ScraperError, ErrorCode } from '@/types';
import { normalizeSalary, normalizeLocation, generateJobId } from '../utils/normalize';

interface SerpApiIndeedJob {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  job_link?: string;
  thumbnail?: string;
  posted_at?: string;
  salary?: string;
  job_type?: string;
}

export class SerpApiIndeedScraper {
  private apiKey: string;
  private maxRetries: number = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('SERPAPI_KEY not found. SerpAPI Indeed scraper will not work.');
    }
  }

  getSourceName(): JobSource {
    return 'indeed' as JobSource;
  }

  async scrape(config: ScraperConfig): Promise<{
    source: JobSource;
    jobs: RawJob[];
    scrapedCount: number;
    successCount: number;
    failedCount: number;
    errors: Array<{ source: JobSource; message: string; code?: string; timestamp: Date }>;
    scrapedAt: Date;
    durationMs: number;
  }> {
    const startTime = Date.now();
    const errors: Array<{ source: JobSource; message: string; code?: string; timestamp: Date }> = [];
    let jobs: RawJob[] = [];

    if (!this.apiKey) {
      errors.push({
        source: this.getSourceName(),
        message: 'SERPAPI_KEY not configured. Get your free API key at https://serpapi.com/users/sign_up',
        code: ErrorCode.SCRAPER_INVALID_CONFIG,
        timestamp: new Date(),
      });

      return {
        source: this.getSourceName(),
        jobs: [],
        scrapedCount: 0,
        successCount: 0,
        failedCount: 0,
        errors,
        scrapedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
    }

    try {
      const maxResults = config.maxResults || 25;

      const response = await this.fetchWithRetry({
        engine: 'indeed_jobs',
        q: config.searchQuery,
        location: config.location,
        api_key: this.apiKey,
      });

      if (response.error) {
        throw new ScraperError(
          this.getSourceName(),
          `SerpAPI Indeed error: ${response.error}`,
          ErrorCode.SCRAPER_FAILED,
          true
        );
      }

      if (response.jobs && Array.isArray(response.jobs)) {
        jobs = response.jobs
          .slice(0, maxResults)
          .map((job: SerpApiIndeedJob) => this.transformJob(job))
          .filter((job): job is RawJob => job !== null);
      }

      return {
        source: this.getSourceName(),
        jobs,
        scrapedCount: jobs.length,
        successCount: jobs.length,
        failedCount: Math.max(0, (config.maxResults || 0) - jobs.length),
        errors,
        scrapedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      console.error('SerpAPI Indeed scraper error:', error);
      if (error instanceof ScraperError) {
        errors.push({
          source: this.getSourceName(),
          message: error.message,
          code: error.code,
          timestamp: new Date(),
        });
      } else {
        errors.push({
          source: this.getSourceName(),
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }

      return {
        source: this.getSourceName(),
        jobs,
        scrapedCount: jobs.length,
        successCount: jobs.length,
        failedCount: Math.max(0, (config.maxResults || 0) - jobs.length),
        errors,
        scrapedAt: new Date(),
        durationMs: Date.now() - startTime,
      };
    }
  }

  private async fetchWithRetry(params: Record<string, unknown>): Promise<Record<string, unknown>> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await getJson(params);
      } catch (error) {
        if (i === this.maxRetries - 1) throw error;

        const backoffMs = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    throw new Error('Retry failed');
  }

  private transformJob(serpJob: SerpApiIndeedJob): RawJob | null {
    if (!serpJob.title || !serpJob.company) {
      return null;
    }

    const jobUrl = serpJob.job_link || '';
    const description = serpJob.description || serpJob.title;

    const salary = serpJob.salary
      ? normalizeSalary(serpJob.salary)
      : undefined;

    const postedDate = this.parsePostedDate(serpJob.posted_at);

    const jobId = generateJobId(
      this.getSourceName(),
      jobUrl || `${serpJob.company}-${serpJob.title}`
    );

    return {
      id: jobId,
      title: serpJob.title,
      company: serpJob.company,
      location: normalizeLocation(serpJob.location || 'Remote'),
      salary,
      description,
      url: jobUrl,
      source: this.getSourceName(),
      jobType: serpJob.job_type?.toLowerCase() as JobType | undefined,
      postedDate,
      scrapedAt: new Date(),
      metadata: {
        thumbnail: serpJob.thumbnail,
      },
    };
  }

  private parsePostedDate(dateStr?: string): Date {
    const now = new Date();

    if (!dateStr) return now;

    const lowerDate = dateStr.toLowerCase();

    if (lowerDate.includes('just posted') || lowerDate.includes('today')) {
      return now;
    }

    const hoursMatch = lowerDate.match(/(\d+)\s*hour/);
    if (hoursMatch) {
      return new Date(now.getTime() - parseInt(hoursMatch[1]) * 60 * 60 * 1000);
    }

    const daysMatch = lowerDate.match(/(\d+)\s*day/);
    if (daysMatch) {
      return new Date(now.getTime() - parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000);
    }

    if (lowerDate.includes('30+ days')) {
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const weeksMatch = lowerDate.match(/(\d+)\s*week/);
    if (weeksMatch) {
      return new Date(now.getTime() - parseInt(weeksMatch[1]) * 7 * 24 * 60 * 60 * 1000);
    }

    const monthsMatch = lowerDate.match(/(\d+)\s*month/);
    if (monthsMatch) {
      return new Date(now.getTime() - parseInt(monthsMatch[1]) * 30 * 24 * 60 * 60 * 1000);
    }

    return now;
  }
}