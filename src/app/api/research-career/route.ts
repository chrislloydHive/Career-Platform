import { NextRequest, NextResponse } from 'next/server';
import { careerResearchAI } from '@/lib/ai/career-research-ai';
import { anthropicClient } from '@/lib/ai/anthropic-client';
import { getUserProfile, buildShortUserContext, addInteraction } from '@/lib/storage/user-profile';

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, searchResults, additionalContext } = await request.json();

    if (!jobTitle) {
      return NextResponse.json(
        { error: 'Job title is required' },
        { status: 400 }
      );
    }

    if (!anthropicClient.isAvailable()) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set ANTHROPIC_API_KEY.' },
        { status: 503 }
      );
    }

    const userProfile = await getUserProfile();
    const userContext = buildShortUserContext(userProfile);

    await addInteraction('career_research', jobTitle);

    const careerProfile = await careerResearchAI.generateCareerProfile(
      jobTitle,
      searchResults || '',
      additionalContext,
      userContext
    );

    return NextResponse.json({
      success: true,
      career: careerProfile
    });
  } catch (error) {
    console.error('Career research error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate career profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}