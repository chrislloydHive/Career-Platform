import { Browser, Page } from 'puppeteer';
import { RawJob, JobSource, ScraperConfig, ScraperResult, ScraperError } from '@/types';
import { ScraperErrorClass, ErrorCode } from '@/types';

export interface IScraper {
  scrape(config: ScraperConfig): Promise<ScraperResult>;
  getSourceName(): JobSource;
  close?(): Promise<void>;
}

export abstract class BaseScraper implements IScraper {
  protected browser: Browser | null = null;
  protected maxRetries: number = 3;
  protected baseDelayMs: number = 2000;
  protected maxDelayMs: number = 3000;

  abstract getSourceName(): JobSource;
  abstract scrapeJobs(page: Page, config: ScraperConfig): Promise<RawJob[]>;
  abstract buildSearchUrl(config: ScraperConfig): string;

  async scrape(config: ScraperConfig): Promise<ScraperResult> {
    const startTime = Date.now();
    const errors: ScraperError[] = [];
    let jobs: RawJob[] = [];

    try {
      const browser = await this.getBrowser();
      const page = await this.createPage(browser);

      try {
        jobs = await this.scrapeJobs(page, config);
      } catch (error) {
        const scraperError = this.handleError(error);
        errors.push(scraperError);
        throw scraperError;
      } finally {
        await page.close();
      }
    } catch (error) {
      if (error instanceof ScraperErrorClass) {
        if (errors.length === 0) {
          errors.push({
            source: this.getSourceName(),
            message: error.message,
            code: error.code,
            timestamp: new Date(),
            context: error.context,
          });
        }
      } else {
        errors.push({
          source: this.getSourceName(),
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }
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

  protected async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    const puppeteer = await import('puppeteer');

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });

    return this.browser;
  }

  protected async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not:A-Brand";v="99"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
    });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
          { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
        ]
      });

      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });

      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

      Object.defineProperty(navigator, 'platform', { get: () => 'MacIntel' });

      Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });

      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });

      (window as unknown as { chrome: Record<string, unknown> }).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {}
      };

      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'prompt' })
        })
      });
    });

    return page;
  }

  protected async randomDelay(minMs?: number, maxMs?: number): Promise<void> {
    const min = minMs || this.baseDelayMs;
    const max = maxMs || this.maxDelayMs;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;

        const backoffMs = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    throw new Error('Retry failed');
  }

  protected handleError(error: unknown): ScraperError {
    if (error instanceof ScraperErrorClass) {
      return {
        source: this.getSourceName(),
        message: error.message,
        code: error.code,
        timestamp: new Date(),
        context: error.context,
      };
    }

    if (error instanceof Error) {
      let code = ErrorCode.SCRAPER_FAILED;
      let retryable = false;

      if (error.message.includes('timeout') || error.message.includes('Navigation timeout')) {
        code = ErrorCode.SCRAPER_TIMEOUT;
        retryable = true;
      } else if (error.message.includes('net::')) {
        code = ErrorCode.SCRAPER_NETWORK_ERROR;
        retryable = true;
      } else if (error.message.includes('blocked') || error.message.includes('captcha')) {
        code = ErrorCode.SCRAPER_RATE_LIMITED;
        retryable = false;
      }

      return {
        source: this.getSourceName(),
        message: error.message,
        code: code,
        timestamp: new Date(),
      };
    }

    return {
      source: this.getSourceName(),
      message: 'Unknown error occurred',
      timestamp: new Date(),
    };
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}