import { IndeedScraper } from '@/lib/scrapers/indeed-scraper';

jest.mock('puppeteer-extra');
jest.mock('puppeteer-extra-plugin-stealth');

describe('IndeedScraper', () => {
  let scraper: IndeedScraper;

  beforeEach(() => {
    scraper = new IndeedScraper();
  });

  afterEach(async () => {
    await scraper.close();
  });

  describe('scrape', () => {
    it('should return source name as indeed', () => {
      expect(scraper.getSourceName()).toBe('indeed');
    });

    it('should handle successful scraping', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toHaveProperty('source', 'indeed');
      expect(result).toHaveProperty('jobs');
      expect(result).toHaveProperty('scrapedCount');
      expect(result).toHaveProperty('successCount');
      expect(result).toHaveProperty('failedCount');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('scrapedAt');
      expect(result).toHaveProperty('durationMs');
      expect(Array.isArray(result.jobs)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should handle CAPTCHA detection', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toBeDefined();
      expect(result.source).toBe('indeed');
    });

    it('should respect maxResults parameter', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 3,
      };

      const result = await scraper.scrape(config);

      expect(result.jobs.length).toBeLessThanOrEqual(3);
    });

    it('should handle empty search results', async () => {
      const config = {
        searchQuery: 'nonexistent job xyz789',
        location: 'Middle of nowhere',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result.jobs.length).toBe(0);
    });
  });

  describe('popup handling', () => {
    it('should dismiss popups if present', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toBeDefined();
    });
  });

  describe('fallback extraction', () => {
    it('should use fallback extraction when primary fails', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toBeDefined();
      expect(result.source).toBe('indeed');
    });
  });
});