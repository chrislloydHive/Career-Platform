import { Page } from 'puppeteer';
import { BaseScraper } from './base-scraper';
import { RawJob, JobSource, ScraperConfig } from '@/types';
import { ScraperErrorClass as ScraperError, ErrorCode } from '@/types';
import { normalizeSalary, normalizeLocation, generateJobId, normalizeJobTitle, normalizeCompanyName, truncateDescription } from '../utils/normalize';

interface IndeedJobElement {
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  description: string;
  postedDate: string;
}

export class IndeedScraper extends BaseScraper {
  private readonly BASE_URL = 'https://www.indeed.com/jobs';

  getSourceName(): JobSource {
    return 'indeed';
  }

  buildSearchUrl(config: ScraperConfig): string {
    const params = new URLSearchParams({
      q: config.searchQuery,
      l: config.location,
      fromage: this.getDaysParam(config.postedWithinDays),
      radius: '25',
      sort: 'date',
    });

    if (config.jobType) {
      params.append('jt', this.getJobTypeParam(config.jobType));
    }

    return `${this.BASE_URL}?${params.toString()}`;
  }

  private getDaysParam(days?: number): string {
    if (!days) return '30';
    if (days <= 1) return '1';
    if (days <= 3) return '3';
    if (days <= 7) return '7';
    if (days <= 14) return '14';
    return '30';
  }

  private getJobTypeParam(jobType?: string): string {
    const typeMap: Record<string, string> = {
      'full-time': 'fulltime',
      'part-time': 'parttime',
      'contract': 'contract',
      'temporary': 'temporary',
      'internship': 'internship',
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
          'Indeed blocked the request. Detected CAPTCHA or anti-bot challenge.',
          ErrorCode.SCRAPER_RATE_LIMITED,
          true
        );
      }

      await this.dismissPopups(page);

      await this.scrollPage(page);

      const jobCards = await this.extractJobCards(page, maxResults);

      if (jobCards.length === 0) {
        await this.tryFallbackExtraction(page, jobs, maxResults);
        return jobs;
      }

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
        `Indeed scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorCode.SCRAPER_FAILED,
        true
      );
    }
  }

  private async checkIfBlocked(page: Page): Promise<boolean> {
    const indicators = [
      'recaptcha',
      'captcha',
      'hcaptcha',
      'cf-challenge',
      'Access Denied',
      'security check',
      'prove you\'re human',
      'unusual traffic',
    ];

    const content = await page.content();
    const url = page.url();

    if (url.includes('captcha') || url.includes('security')) {
      return true;
    }

    return indicators.some(indicator => content.toLowerCase().includes(indicator.toLowerCase()));
  }

  private async dismissPopups(page: Page): Promise<void> {
    try {
      const popupSelectors = [
        'button[aria-label="Close"]',
        '.popover-x-button',
        '.icl-CloseButton',
        '[data-testid="close-button"]',
        'button.close',
      ];

      for (const selector of popupSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            await this.randomDelay(500, 1000);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.warn('Failed to dismiss popups:', error);
    }
  }

  private async scrollPage(page: Page): Promise<void> {
    try {
      await page.evaluate(async () => {
        const scrollDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < 4; i++) {
          window.scrollBy(0, window.innerHeight * 0.8);
          await scrollDelay(800 + Math.random() * 1200);
        }

        window.scrollTo(0, 0);
        await scrollDelay(500);
      });

      await this.randomDelay(1000, 2000);
    } catch (error) {
      console.warn('Scroll failed:', error);
    }
  }

  private async extractJobCards(page: Page, maxResults: number): Promise<IndeedJobElement[]> {
    const selectors = [
      '#mosaic-provider-jobcards .job_seen_beacon',
      '.jobsearch-ResultsList .job_seen_beacon',
      '.mosaic-zone .result',
      '[data-testid="job-card"]',
      '.jobCard',
    ];

    let foundSelector: string | null = null;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        foundSelector = selector;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!foundSelector) {
      throw new ScraperError(
        this.getSourceName(),
        'Job listings not found on page. Indeed may have changed their layout.',
        ErrorCode.SCRAPER_PARSE_ERROR,
        false
      );
    }

    const jobCards = await page.evaluate((max) => {
      const cards: IndeedJobElement[] = [];

      const cardSelectors = [
        '.job_seen_beacon',
        '[data-testid="job-card"]',
        '.result',
        '.jobCard',
      ];

      let elements: NodeListOf<Element> | null = null;
      for (const sel of cardSelectors) {
        elements = document.querySelectorAll(sel);
        if (elements && elements.length > 0) break;
      }

      if (!elements || elements.length === 0) return cards;

      elements.forEach((element, index) => {
        if (index >= max) return;

        try {
          const titleSelectors = [
            'h2.jobTitle a span',
            '.jobTitle span[title]',
            'a[data-testid="job-title"]',
            '.job-title',
            'h2 span',
          ];

          const companySelectors = [
            '[data-testid="company-name"]',
            '.companyName',
            '.company',
            'span[data-testid="company-name"]',
          ];

          const locationSelectors = [
            '[data-testid="text-location"]',
            '.companyLocation',
            '.location',
          ];

          const salarySelectors = [
            '[data-testid="attribute_snippet_testid"]',
            '.salary-snippet',
            '.salaryText',
            '.metadata.salary-snippet-container',
          ];

          const linkSelectors = [
            'h2.jobTitle a',
            'a[data-testid="job-title"]',
            'a.jcs-JobTitle',
            '.jobTitle a',
          ];

          const findElement = (selectors: string[]): Element | null => {
            for (const sel of selectors) {
              const el = element.querySelector(sel);
              if (el) return el;
            }
            return null;
          };

          const titleEl = findElement(titleSelectors);
          const companyEl = findElement(companySelectors);
          const locationEl = findElement(locationSelectors);
          const salaryEl = findElement(salarySelectors);
          const linkEl = findElement(linkSelectors) as HTMLAnchorElement | null;

          const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
          const company = companyEl?.textContent?.trim() || '';
          const location = locationEl?.textContent?.trim() || '';
          const salary = salaryEl?.textContent?.trim();

          let url = linkEl?.getAttribute('href') || '';
          if (url && !url.startsWith('http')) {
            url = `https://www.indeed.com${url}`;
          }

          const jobKey = url.match(/jk=([^&]+)/)?.[1] || '';

          if (title && company && jobKey) {
            cards.push({
              title,
              company,
              location,
              salary,
              url: url || `https://www.indeed.com/viewjob?jk=${jobKey}`,
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

  private async tryFallbackExtraction(
    page: Page,
    jobs: RawJob[],
    maxResults: number
  ): Promise<void> {
    try {
      const fallbackCards = await page.evaluate(() => {
        const cards: IndeedJobElement[] = [];
        const allLinks = document.querySelectorAll('a[href*="viewjob"]');

        allLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const jobKey = href.match(/jk=([^&]+)/)?.[1];

          if (jobKey) {
            const parent = link.closest('.result, .job_seen_beacon, [data-testid="job-card"]');
            const title = link.textContent?.trim() || '';

            cards.push({
              title,
              company: 'Unknown Company',
              location: 'Unknown Location',
              url: href.startsWith('http') ? href : `https://www.indeed.com${href}`,
              description: title,
              postedDate: '',
            });
          }
        });

        return cards;
      });

      for (const card of fallbackCards.slice(0, maxResults)) {
        const job: RawJob = {
          id: generateJobId(this.getSourceName(), card.url),
          title: normalizeJobTitle(card.title),
          company: normalizeCompanyName(card.company),
          location: normalizeLocation(card.location),
          salary: card.salary ? normalizeSalary(card.salary) : undefined,
          description: card.description || card.title,
          url: card.url,
          source: this.getSourceName(),
          postedDate: new Date(),
          scrapedAt: new Date(),
        };
        jobs.push(job);
      }
    } catch (error) {
      console.error('Fallback extraction failed:', error);
    }
  }

  private async extractJobDetails(
    page: Page,
    jobCard: IndeedJobElement
  ): Promise<RawJob | null> {
    try {
      const description = await this.extractDescription(page, jobCard.url);

      const postedDate = await this.extractPostedDate(page);

      const normalizedSalary = jobCard.salary
        ? normalizeSalary(jobCard.salary)
        : undefined;

      const job: RawJob = {
        id: generateJobId(this.getSourceName(), jobCard.url),
        title: normalizeJobTitle(jobCard.title),
        company: normalizeCompanyName(jobCard.company),
        location: normalizeLocation(jobCard.location),
        salary: normalizedSalary,
        description: truncateDescription(description || jobCard.title, 1000),
        url: jobCard.url,
        source: this.getSourceName(),
        postedDate: this.parsePostedDate(postedDate),
        scrapedAt: new Date(),
      };

      return job;
    } catch (error) {
      console.error(`Failed to extract job details for ${jobCard.url}:`, error);

      const fallbackJob: RawJob = {
        id: generateJobId(this.getSourceName(), jobCard.url),
        title: normalizeJobTitle(jobCard.title),
        company: normalizeCompanyName(jobCard.company),
        location: normalizeLocation(jobCard.location),
        salary: jobCard.salary ? normalizeSalary(jobCard.salary) : undefined,
        description: jobCard.title,
        url: jobCard.url,
        source: this.getSourceName(),
        postedDate: new Date(),
        scrapedAt: new Date(),
      };
      return fallbackJob;
    }
  }

  private async extractDescription(page: Page, jobUrl: string): Promise<string> {
    try {
      const descriptionSelectors = [
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText',
        '[data-testid="job-description"]',
        '.jobDescription',
      ];

      const description = await page.evaluate((selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            return el.textContent?.trim() || '';
          }
        }
        return '';
      }, descriptionSelectors);

      return description;
    } catch (error) {
      return '';
    }
  }

  private async extractPostedDate(page: Page): Promise<string> {
    try {
      const dateSelectors = [
        '.jobsearch-JobMetadataFooter',
        '[data-testid="job-posted-date"]',
        '.date',
      ];

      const dateText = await page.evaluate((selectors) => {
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            const text = el.textContent?.trim() || '';
            if (text.includes('ago') || text.includes('today') || text.includes('Posted')) {
              return text;
            }
          }
        }
        return '';
      }, dateSelectors);

      return dateText;
    } catch (error) {
      return '';
    }
  }

  private parsePostedDate(dateStr: string): Date {
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