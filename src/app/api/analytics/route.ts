import { NextRequest, NextResponse } from 'next/server';
import { searchAnalytics } from '@/lib/analytics';
import { searchCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'metrics') {
    const startTimeParam = searchParams.get('startTime');
    const endTimeParam = searchParams.get('endTime');

    const startTime = startTimeParam ? new Date(startTimeParam) : undefined;
    const endTime = endTimeParam ? new Date(endTimeParam) : undefined;

    const metrics = searchAnalytics.getAggregatedMetrics(startTime, endTime);
    const cacheStats = searchCache.getStats();

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        cache: cacheStats,
      },
    });
  }

  if (action === 'recent') {
    const count = parseInt(searchParams.get('count') || '10', 10);
    const recentSearches = searchAnalytics.getRecentMetrics(count);

    return NextResponse.json({
      success: true,
      data: {
        searches: recentSearches,
      },
    });
  }

  return NextResponse.json({
    success: false,
    error: 'Invalid action parameter',
  }, { status: 400 });
}

export async function DELETE() {
  searchAnalytics.clear();
  searchCache.clear();

  return NextResponse.json({
    success: true,
    message: 'Analytics and cache cleared',
  });
}