import { getJson } from 'serpapi';
import { RawJob, JobSource, ScraperConfig, JobType } from '@/types';
import { ScraperErrorClass as ScraperError, ErrorCode } from '@/types';
import { normalizeSalary, normalizeLocation, generateJobId } from '../utils/normalize';

interface SerpApiJob {
  title?: string;
  company_name?: string;
  location?: string;
  via?: string;
  description?: string;
  job_highlights?: Array<{ title: string; items: string[] }>;
  related_links?: Array<{ link: string; text: string }>;
  thumbnail?: string;
  extensions?: string[];
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
  };
  apply_options?: Array<{ title: string; link: string }>;
}

export class SerpApiScraper {
  private apiKey: string;
  private maxRetries: number = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_KEY || '';
    if (!this.apiKey) {
      console.warn('SERPAPI_KEY not found. SerpAPI scraper will not work.');
    }
  }

  getSourceName(): JobSource {
    return 'google_jobs' as JobSource;
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
      const query = this.buildQuery(config);
      const maxResults = config.maxResults || 25;

      const response = await this.fetchWithRetry({
        engine: 'google_jobs',
        q: query,
        location: config.location,
        hl: 'en',
        api_key: this.apiKey,
        num: Math.min(maxResults, 100),
      });

      if (response.error) {
        throw new ScraperError(
          this.getSourceName(),
          `SerpAPI error: ${response.error}`,
          ErrorCode.SCRAPER_FAILED,
          true
        );
      }

      if (response.jobs_results && Array.isArray(response.jobs_results)) {
        jobs = response.jobs_results
          .slice(0, maxResults)
          .map((job: SerpApiJob) => this.transformJob(job))
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

  private buildQuery(config: ScraperConfig): string {
    let query = config.searchQuery;

    if (config.jobType) {
      query += ` ${config.jobType}`;
    }

    return query;
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

  private transformJob(serpJob: SerpApiJob): RawJob | null {
    if (!serpJob.title || !serpJob.company_name) {
      return null;
    }

    const applyLink = serpJob.apply_options?.[0]?.link || '';
    const description = this.buildDescription(serpJob);

    const salary = serpJob.detected_extensions?.salary
      ? normalizeSalary(serpJob.detected_extensions.salary)
      : undefined;

    const postedDate = this.parsePostedDate(serpJob.detected_extensions?.posted_at);

    const jobId = generateJobId(
      this.getSourceName(),
      applyLink || `${serpJob.company_name}-${serpJob.title}`
    );

    return {
      id: jobId,
      title: serpJob.title,
      company: serpJob.company_name,
      location: normalizeLocation(serpJob.location || 'Remote'),
      salary,
      description,
      url: applyLink,
      source: this.getSourceName(),
      jobType: serpJob.detected_extensions?.schedule_type?.toLowerCase() as JobType | undefined,
      postedDate,
      scrapedAt: new Date(),
      metadata: {
        via: serpJob.via,
        thumbnail: serpJob.thumbnail,
        extensions: serpJob.extensions,
      },
    };
  }

  private buildDescription(serpJob: SerpApiJob): string {
    let description = serpJob.description || '';

    if (serpJob.job_highlights && Array.isArray(serpJob.job_highlights)) {
      serpJob.job_highlights.forEach(highlight => {
        if (highlight.items && Array.isArray(highlight.items)) {
          description += `\n\n${highlight.title}:\n${highlight.items.join('\n')}`;
        }
      });
    }

    return description.trim().slice(0, 2000);
  }

  private parsePostedDate(dateStr?: string): Date {
    const now = new Date();

    if (!dateStr) return now;

    const lowerDate = dateStr.toLowerCase();

    if (lowerDate.includes('just now') || lowerDate.includes('today')) {
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