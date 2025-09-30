import { NextRequest, NextResponse } from 'next/server';
import { careerResearchAI } from '@/lib/ai/career-research-ai';
import { anthropicClient } from '@/lib/ai/anthropic-client';
import { getUserProfile, buildShortUserContext, addInteraction, getQuestionnaireInsights, buildUserContextPrompt } from '@/lib/storage/user-profile-db';
import { auth } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const userProfile = await getUserProfile(session.user.id);
    const questionnaireData = await getQuestionnaireInsights(session.user.id);
    const userContext = userProfile
      ? (questionnaireData
        ? buildUserContextPrompt(userProfile, questionnaireData || undefined, undefined)
        : buildShortUserContext(userProfile))
      : '';

    await addInteraction(session.user.id, 'career_research', jobTitle);

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