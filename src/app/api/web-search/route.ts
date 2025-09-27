import { NextRequest, NextResponse } from 'next/server';
import { CareerWebSearchResult } from '@/lib/web-search/career-search-service';

export async function POST(request: NextRequest) {
  try {
    const { query, maxResults = 5 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const searchResults = await performWebSearch(query, maxResults);

    return NextResponse.json({
      results: searchResults,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Web search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform web search' },
      { status: 500 }
    );
  }
}

async function performWebSearch(query: string, maxResults: number): Promise<CareerWebSearchResult[]> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const mockResults: CareerWebSearchResult[] = [
    {
      title: `${query} - Career Overview`,
      snippet: `Learn about ${query} including job duties, salary expectations, required skills, and career growth opportunities. Updated information for 2025.`,
      url: searchUrl,
      source: 'Career Guide',
      relevanceScore: 0.95,
    },
    {
      title: `How Much Does ${query} Make?`,
      snippet: `The average salary for ${query} ranges from $60,000 to $120,000 per year depending on experience, location, and company size.`,
      url: searchUrl,
      source: 'Salary Database',
      relevanceScore: 0.90,
    },
    {
      title: `Day in the Life of ${query}`,
      snippet: `Typical responsibilities include analyzing data, collaborating with teams, attending meetings, and working on projects. Work-life balance varies by company.`,
      url: searchUrl,
      source: 'Career Insights',
      relevanceScore: 0.85,
    },
    {
      title: `${query} Skills and Requirements`,
      snippet: `Key skills needed include problem-solving, communication, technical expertise, and relevant education. Most positions require a bachelor's degree.`,
      url: searchUrl,
      source: 'Job Requirements Guide',
      relevanceScore: 0.88,
    },
    {
      title: `${query} Job Market Trends 2025`,
      snippet: `The job market for ${query} is growing with increased demand across industries. Remote work options are becoming more common.`,
      url: searchUrl,
      source: 'Market Analysis',
      relevanceScore: 0.82,
    },
  ];

  return mockResults.slice(0, maxResults);
}