import { NextRequest, NextResponse } from 'next/server';

interface CompanyJobListing {
  title: string;
  location: string;
  description: string;
  url: string;
  postedDate?: string;
  department?: string;
  employmentType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { companyUrl, keywords } = await request.json();

    if (!companyUrl) {
      return NextResponse.json(
        { error: 'Company URL is required' },
        { status: 400 }
      );
    }

    const url = new URL(companyUrl);
    const hostname = url.hostname.toLowerCase();

    let jobs: CompanyJobListing[] = [];

    if (hostname.includes('greenhouse.io')) {
      jobs = await scrapeGreenhouse(companyUrl, keywords);
    } else if (hostname.includes('lever.co')) {
      jobs = await scrapeLever(companyUrl, keywords);
    } else if (hostname.includes('workday.com') || companyUrl.includes('/careers')) {
      jobs = await scrapeGenericCareerPage(companyUrl, keywords);
    } else {
      jobs = await scrapeGenericCareerPage(companyUrl, keywords);
    }

    return NextResponse.json({
      success: true,
      jobs,
      source: hostname,
      count: jobs.length
    });
  } catch (error) {
    console.error('Company scraping error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape company jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function scrapeGreenhouse(url: string, keywords?: string[]): Promise<CompanyJobListing[]> {
  try {
    const apiUrl = url.replace('/board/', '/api/v1/boards/') + '/jobs?content=true';

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Greenhouse API returned ${response.status}`);
    }

    const data = await response.json();
    const jobs: CompanyJobListing[] = [];

    for (const job of data.jobs || []) {
      const matchesKeywords = !keywords || keywords.length === 0 ||
        keywords.some(kw =>
          job.title?.toLowerCase().includes(kw.toLowerCase()) ||
          job.content?.toLowerCase().includes(kw.toLowerCase())
        );

      if (matchesKeywords) {
        jobs.push({
          title: job.title || 'Untitled Position',
          location: job.location?.name || 'Not specified',
          description: stripHtml(job.content || '').substring(0, 500),
          url: job.absolute_url || url,
          postedDate: job.updated_at,
          department: job.departments?.[0]?.name,
          employmentType: job.metadata?.find((m: { name: string }) => m.name === 'Employment Type')?.value
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Greenhouse scraping error:', error);
    return [];
  }
}

async function scrapeLever(url: string, keywords?: string[]): Promise<CompanyJobListing[]> {
  try {
    const companyName = url.match(/jobs\.lever\.co\/([^/]+)/)?.[1];
    if (!companyName) {
      throw new Error('Invalid Lever URL');
    }

    const apiUrl = `https://api.lever.co/v0/postings/${companyName}?mode=json`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Lever API returned ${response.status}`);
    }

    const data = await response.json();
    const jobs: CompanyJobListing[] = [];

    for (const job of data || []) {
      const matchesKeywords = !keywords || keywords.length === 0 ||
        keywords.some(kw =>
          job.text?.toLowerCase().includes(kw.toLowerCase()) ||
          job.categories?.commitment?.toLowerCase().includes(kw.toLowerCase())
        );

      if (matchesKeywords) {
        jobs.push({
          title: job.text || 'Untitled Position',
          location: job.categories?.location || 'Not specified',
          description: stripHtml(job.description || job.descriptionPlain || '').substring(0, 500),
          url: job.hostedUrl || job.applyUrl || url,
          postedDate: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
          department: job.categories?.team,
          employmentType: job.categories?.commitment
        });
      }
    }

    return jobs;
  } catch (error) {
    console.error('Lever scraping error:', error);
    return [];
  }
}

async function scrapeGenericCareerPage(url: string, keywords?: string[]): Promise<CompanyJobListing[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobSearchBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`);
    }

    const html = await response.text();
    const jobs: CompanyJobListing[] = [];

    const jobTitlePatterns = [
      /<(?:h[2-4]|a|div)[^>]*class="[^"]*job[_-]?title[^"]*"[^>]*>([^<]+)</gi,
      /<(?:h[2-4]|a|div)[^>]*data-job[^>]*>([^<]+)</gi,
      /<(?:a)[^>]*href="[^"]*\/job[s]?\/[^"]*"[^>]*>([^<]+)</gi,
    ];

    const locationPatterns = [
      /<(?:span|div|p)[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)</gi,
      /<(?:span|div|p)[^>]*class="[^"]*city[^"]*"[^>]*>([^<]+)</gi,
    ];

    for (const pattern of jobTitlePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const title = stripHtml(match[1]).trim();

        const matchesKeywords = !keywords || keywords.length === 0 ||
          keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()));

        if (title && matchesKeywords && jobs.length < 50) {
          let location = 'Not specified';
          const contextStart = Math.max(0, match.index - 200);
          const contextEnd = Math.min(html.length, match.index + 500);
          const context = html.substring(contextStart, contextEnd);

          for (const locPattern of locationPatterns) {
            const locMatch = locPattern.exec(context);
            if (locMatch) {
              location = stripHtml(locMatch[1]).trim();
              break;
            }
          }

          jobs.push({
            title,
            location,
            description: `Position at ${new URL(url).hostname}`,
            url: url,
          });
        }
      }
    }

    return jobs.slice(0, 50);
  } catch (error) {
    console.error('Generic scraping error:', error);
    return [];
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}