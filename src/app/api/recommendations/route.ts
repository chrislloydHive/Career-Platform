import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getUserProfile, buildUserContextPrompt, getQuestionnaireInsights } from '@/lib/storage/user-profile-db';
import { careerRecommendationsAI } from '@/lib/ai/career-recommendations-ai';
import { sql } from '@vercel/postgres';
import { JobCategory } from '@/types/career';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getUserProfile(session.user.id);
    const questionnaireData = await getQuestionnaireInsights(session.user.id);

    if (!userProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const userContext = buildUserContextPrompt(userProfile, questionnaireData || undefined);

    const careersResult = await sql`
      SELECT * FROM career_research
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    const exploredCareers = careersResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      description: row.description,
      salaryRanges: row.salary_ranges || [],
      careerProgression: row.career_progression || [],
      requiredSkills: [],
      dailyTasks: [],
    }));

    const interactionsResult = await sql`
      SELECT action, context, timestamp
      FROM interaction_history
      WHERE user_id = ${session.user.id}
      AND action IN ('career_search', 'career_research', 'chat_query')
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    const searchedJobs: string[] = [];
    const chatHistory: Array<{ query: string; timestamp: Date }> = [];

    interactionsResult.rows.forEach(row => {
      if (row.action === 'career_search' || row.action === 'career_research') {
        if (row.context && !searchedJobs.includes(row.context)) {
          searchedJobs.push(row.context);
        }
      } else if (row.action === 'chat_query') {
        chatHistory.push({
          query: row.context,
          timestamp: new Date(row.timestamp)
        });
      }
    });

    const questionnaireCompletion = questionnaireData?.completion_percentage || 0;

    const recommendations = await careerRecommendationsAI.generateRecommendations(
      userContext,
      {
        searchedJobs,
        exploredCareers: exploredCareers as unknown as JobCategory[],
        chatHistory,
        questionnaireCompletion,
      }
    );

    return NextResponse.json({
      success: true,
      recommendations,
      metadata: {
        exploredCount: exploredCareers.length,
        searchCount: searchedJobs.length,
        chatCount: chatHistory.length,
        questionnaireCompletion,
      }
    });
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}