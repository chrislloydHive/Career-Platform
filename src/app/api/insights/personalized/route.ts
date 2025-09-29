import { NextRequest, NextResponse } from 'next/server';
import { PersonalizedInsightsGenerator } from '@/lib/ai/personalized-insights-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.profile) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    const generator = new PersonalizedInsightsGenerator();
    const insights = await generator.generatePersonalizedInsights(body);

    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error generating personalized insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}