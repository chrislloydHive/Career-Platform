import { NextRequest, NextResponse } from 'next/server';
import { careerResearchService } from '@/lib/career-research/career-service';
import { CareerResearchQuery, CareerCategory } from '@/types/career';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'categories') {
      const categories = careerResearchService.getAllCategories();
      return NextResponse.json({
        success: true,
        data: categories,
      });
    }

    if (action === 'category') {
      const category = searchParams.get('category');
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category parameter required' },
          { status: 400 }
        );
      }

      const jobs = careerResearchService.findByCategory(category as CareerCategory);
      return NextResponse.json({
        success: true,
        data: jobs,
      });
    }

    if (action === 'job') {
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'ID parameter required' },
          { status: 400 }
        );
      }

      const job = careerResearchService.findById(id);
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job category not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: job,
      });
    }

    if (action === 'stats') {
      const category = searchParams.get('category');
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category parameter required' },
          { status: 400 }
        );
      }

      const stats = careerResearchService.getCategoryStats(category as CareerCategory);
      if (!stats) {
        return NextResponse.json(
          { success: false, error: 'No data for category' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'search') {
      const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || [];

      if (keywords.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Keywords parameter required' },
          { status: 400 }
        );
      }

      const results = careerResearchService.searchByKeywords(keywords);
      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Career research API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query: CareerResearchQuery = body;

    const matches = careerResearchService.findMatchingCareers(query);

    return NextResponse.json({
      success: true,
      data: {
        matches,
        total: matches.length,
      },
    });
  } catch (error) {
    console.error('Career research match API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}