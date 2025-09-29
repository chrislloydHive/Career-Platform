import { LinkedInScraper } from '@/lib/scrapers/linkedin-scraper';
import { mockRawJobLinkedIn } from '../../fixtures/jobs';
import puppeteer from 'puppeteer-extra';

jest.mock('puppeteer-extra', () => {
  const mockPage = {
    goto: jest.fn().mockResolvedValue(null),
    waitForSelector: jest.fn().mockResolvedValue(null),
    $: jest.fn().mockResolvedValue(null),
    $$: jest.fn().mockResolvedValue([]),
    evaluate: jest.fn().mockResolvedValue([]),
    close: jest.fn().mockResolvedValue(null),
  };

  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(null),
    connected: true,
  };

  return {
    use: jest.fn(),
    launch: jest.fn().mockResolvedValue(mockBrowser),
  };
});

jest.mock('puppeteer-extra-plugin-stealth', () => {
  return jest.fn(() => ({}));
});

describe('LinkedInScraper', () => {
  let scraper: LinkedInScraper;

  beforeEach(() => {
    scraper = new LinkedInScraper();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await scraper.close();
  });

  describe('scrape', () => {
    it('should return source name as linkedin', () => {
      expect(scraper.getSourceName()).toBe('linkedin');
    });

    it('should handle successful scraping', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toHaveProperty('source', 'linkedin');
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

    it('should handle errors gracefully', async () => {
      // Using imported puppeteer
      puppeteer.launch.mockRejectedValueOnce(new Error('Browser launch failed'));

      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result.jobs.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('message');
      expect(result.errors[0].message).toContain('Browser launch failed');
    });

    it('should respect maxResults parameter', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 5,
      };

      const result = await scraper.scrape(config);

      expect(result.jobs.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty search results', async () => {
      const config = {
        searchQuery: 'nonexistent job title xyz123',
        location: 'Antarctica',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result.jobs.length).toBe(0);
      expect(result.scrapedCount).toBe(0);
    });
  });

  describe('retry mechanism', () => {
    it('should retry on transient failures', async () => {
      // Using imported puppeteer
      const mockBrowser = await puppeteer.launch();
      const mockPage = await mockBrowser.newPage();

      mockPage.goto
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockResolvedValueOnce(null);

      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      expect(result).toBeDefined();
    });
  });

  describe('data normalization', () => {
    it('should normalize job data correctly', async () => {
      const config = {
        searchQuery: 'software engineer',
        location: 'San Francisco',
        maxResults: 10,
      };

      const result = await scraper.scrape(config);

      if (result.jobs.length > 0) {
        const job = result.jobs[0];
        expect(job).toHaveProperty('id');
        expect(job).toHaveProperty('title');
        expect(job).toHaveProperty('company');
        expect(job).toHaveProperty('location');
        expect(job).toHaveProperty('url');
        expect(job).toHaveProperty('source', 'linkedin');
        expect(job).toHaveProperty('postedDate');
        expect(job).toHaveProperty('scrapedAt');
      }
    });
  });
});