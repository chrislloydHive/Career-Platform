import { Page } from 'puppeteer';
import { BaseScraper } from './base-scraper';
import { RawJob, JobSource, ScraperConfig } from '@/types';
import { ScraperErrorClass as ScraperError, ErrorCode } from '@/types';
import { normalizeSalary, normalizeLocation, generateJobId } from '../utils/normalize';

interface LinkedInJobElement {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  description: string;
  postedDate: string;
}

export class LinkedInScraper extends BaseScraper {
  private readonly BASE_URL = 'https://www.linkedin.com/jobs/search';

  getSourceName(): JobSource {
    return 'linkedin';
  }

  buildSearchUrl(config: ScraperConfig): string {
    const params = new URLSearchParams({
      keywords: config.searchQuery,
      location: config.location,
      f_TPR: this.getTimeParam(config.postedWithinDays),
      f_JT: this.getJobTypeParam(config.jobType),
      position: '1',
      pageNum: '0',
    });

    return `${this.BASE_URL}?${params.toString()}`;
  }

  private getTimeParam(days?: number): string {
    if (!days) return 'r2592000';
    if (days <= 1) return 'r86400';
    if (days <= 7) return 'r604800';
    if (days <= 30) return 'r2592000';
    return 'r2592000';
  }

  private getJobTypeParam(jobType?: string): string {
    const typeMap: Record<string, string> = {
      'full-time': 'F',
      'part-time': 'P',
      'contract': 'C',
      'temporary': 'T',
      'internship': 'I',
    };
    return jobType ? typeMap[jobType] || '' : '';
  }

  async scrapeJobs(page: Page, config: ScraperConfig): Promise<RawJob[]> {
    const jobs: RawJob[] = [];
    const maxResults = config.maxResults || 25;
    const url = this.buildSearchUrl(config);

    try {
      await this.retryWithBackoff(async () => {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
      });

      await this.randomDelay(2000, 4000);

      const isBlocked = await this.checkIfBlocked(page);
      if (isBlocked) {
        throw new ScraperError(
          this.getSourceName(),
          'LinkedIn blocked the request. Try again later or use authentication.',
          ErrorCode.SCRAPER_RATE_LIMITED,
          true
        );
      }

      await this.scrollPage(page);

      const jobCards = await this.extractJobCards(page, maxResults);

      for (const jobCard of jobCards.slice(0, maxResults)) {
        try {
          await this.randomDelay(2000, 3000);

          const job = await this.extractJobDetails(page, jobCard);
          if (job) {
            jobs.push(job);
          }
        } catch (error) {
          console.error(`Failed to extract job details:`, error);
          continue;
        }

        if (jobs.length >= maxResults) break;
      }

      return jobs;
    } catch (error) {
      if (error instanceof ScraperError) {
        throw error;
      }
      throw new ScraperError(
        this.getSourceName(),
        `LinkedIn scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorCode.SCRAPER_FAILED,
        true
      );
    }
  }

  private async checkIfBlocked(page: Page): Promise<boolean> {
    const indicators = [
      'authwall',
      'challenge',
      'captcha',
      'Access Denied',
      'Sign in to continue',
    ];

    const content = await page.content();
    return indicators.some(indicator => content.toLowerCase().includes(indicator.toLowerCase()));
  }

  private async scrollPage(page: Page): Promise<void> {
    try {
      await page.evaluate(async () => {
        const scrollDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < 3; i++) {
          window.scrollBy(0, window.innerHeight);
          await scrollDelay(1000 + Math.random() * 1000);
        }
      });

      await this.randomDelay(1000, 2000);
    } catch (error) {
      console.warn('Scroll failed:', error);
    }
  }

  private async extractJobCards(page: Page, maxResults: number): Promise<LinkedInJobElement[]> {
    try {
      await page.waitForSelector('.jobs-search__results-list, .jobs-search-results__list', {
        timeout: 10000,
      });
    } catch (error) {
      throw new ScraperError(
        this.getSourceName(),
        'Job listings not found on page',
        ErrorCode.SCRAPER_PARSE_ERROR,
        false
      );
    }

    const jobCards = await page.evaluate((max) => {
      const cards: LinkedInJobElement[] = [];
      const elements = document.querySelectorAll(
        '.job-search-card, .jobs-search-results__list-item, .base-card'
      );

      elements.forEach((element, index) => {
        if (index >= max) return;

        try {
          const titleEl = element.querySelector('.base-search-card__title, h3');
          const companyEl = element.querySelector('.base-search-card__subtitle, h4');
          const locationEl = element.querySelector('.job-search-card__location');
          const linkEl = element.querySelector('a[href*="/jobs/view/"]');
          const salaryEl = element.querySelector('.job-search-card__salary-info');

          const title = titleEl?.textContent?.trim() || '';
          const company = companyEl?.textContent?.trim() || '';
          const location = locationEl?.textContent?.trim() || '';
          const url = linkEl?.getAttribute('href') || '';
          const salary = salaryEl?.textContent?.trim();

          if (title && company && url) {
            cards.push({
              title,
              company,
              location,
              salary,
              url: url.startsWith('http') ? url : `https://www.linkedin.com${url}`,
              description: '',
              postedDate: '',
            });
          }
        } catch (err) {
          console.error('Error extracting job card:', err);
        }
      });

      return cards;
    }, maxResults);

    return jobCards;
  }

  private async extractJobDetails(
    page: Page,
    jobCard: LinkedInJobElement
  ): Promise<RawJob | null> {
    try {
      const description = await this.extractDescription(page, jobCard.url);

      const postedDate = await this.extractPostedDate(page);

      const normalizedSalary = jobCard.salary
        ? normalizeSalary(jobCard.salary)
        : undefined;

      const job: RawJob = {
        id: generateJobId(this.getSourceName(), jobCard.url),
        title: jobCard.title,
        company: jobCard.company,
        location: normalizeLocation(jobCard.location),
        salary: normalizedSalary,
        description: description || jobCard.title,
        url: jobCard.url,
        source: this.getSourceName(),
        postedDate: this.parsePostedDate(postedDate),
        scrapedAt: new Date(),
      };

      return job;
    } catch (error) {
      console.error(`Failed to extract job details for ${jobCard.url}:`, error);
      return null;
    }
  }

  private async extractDescription(page: Page, jobUrl: string): Promise<string> {
    try {
      const descriptionText = await page.evaluate(() => {
        const descEl = document.querySelector(
          '.show-more-less-html__markup, .description__text, .jobs-description'
        );
        return descEl?.textContent?.trim() || '';
      });

      return descriptionText.slice(0, 1000);
    } catch (error) {
      return '';
    }
  }

  private async extractPostedDate(page: Page): Promise<string> {
    try {
      const dateText = await page.evaluate(() => {
        const dateEl = document.querySelector(
          '.job-search-card__listdate, .jobs-unified-top-card__posted-date'
        );
        return dateEl?.textContent?.trim() || '';
      });
      return dateText;
    } catch (error) {
      return '';
    }
  }

  private parsePostedDate(dateStr: string): Date {
    const now = new Date();

    if (!dateStr) return now;

    const lowerDate = dateStr.toLowerCase();

    if (lowerDate.includes('just now') || lowerDate.includes('today')) {
      return now;
    }

    const minutesMatch = lowerDate.match(/(\d+)\s*minute/);
    if (minutesMatch) {
      return new Date(now.getTime() - parseInt(minutesMatch[1]) * 60 * 1000);
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