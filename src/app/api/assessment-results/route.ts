import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth/config';
import { getUserProfile, buildUserContextPrompt, getQuestionnaireInsights } from '@/lib/storage/user-profile-db';
import { careerRecommendationsAI, CareerRecommendationsResponse } from '@/lib/ai/career-recommendations-ai';
import { JobCategory } from '@/types/career';

export async function GET() {
  try {
    const session = await auth();
    console.log('[Assessment Results GET] Session:', JSON.stringify({
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    }));

    if (!session?.user?.id) {
      console.error('[Assessment Results GET] No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Assessment Results GET] Fetching for user:', session.user.id);

    const result = await sql`
      SELECT
        id,
        title,
        description,
        completion_percentage,
        career_recommendations,
        saved_at,
        created_at
      FROM assessment_results
      WHERE user_id = ${session.user.id}
      ORDER BY saved_at DESC
    `;

    console.log('[Assessment Results GET] Found assessments:', result.rows.length);

    return NextResponse.json({
      success: true,
      assessments: result.rows
    });
  } catch (error) {
    console.error('[Assessment Results GET] Error loading assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment results' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      description,
      profile
    } = await request.json();

    if (!title || !profile) {
      return NextResponse.json(
        { error: 'Title and profile data are required' },
        { status: 400 }
      );
    }

    let careerRecommendationsResponse: CareerRecommendationsResponse = {
      topRecommendations: [],
      alternativePaths: []
    };
    try {
      const userProfile = await getUserProfile(session.user.id);
      const questionnaireData = await getQuestionnaireInsights(session.user.id);

      if (userProfile) {
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

        careerRecommendationsResponse = await careerRecommendationsAI.generateRecommendations(
          userContext,
          {
            searchedJobs,
            exploredCareers: exploredCareers as unknown as JobCategory[],
            chatHistory,
            questionnaireCompletion,
          }
        );
      }
    } catch (recommendationError) {
      console.error('Error generating career recommendations:', recommendationError);
    }

    const result = await sql`
      INSERT INTO assessment_results (
        user_id,
        title,
        description,
        questionnaire_state,
        insights,
        synthesized_insights,
        gaps,
        authenticity_profile,
        narrative_insights,
        confidence_evolutions,
        patterns,
        analysis,
        top_careers,
        completion_percentage,
        career_recommendations
      ) VALUES (
        ${session.user.id},
        ${title},
        ${description || null},
        ${JSON.stringify(profile.responses || {})}::jsonb,
        ${JSON.stringify(profile.insights || [])}::jsonb,
        ${JSON.stringify(profile.synthesizedInsights || [])}::jsonb,
        ${JSON.stringify(profile.gaps || [])}::jsonb,
        ${profile.authenticityProfile ? JSON.stringify(profile.authenticityProfile) : null}::jsonb,
        ${JSON.stringify(profile.narrativeInsights || [])}::jsonb,
        ${JSON.stringify(profile.confidenceEvolutions || [])}::jsonb,
        ${JSON.stringify(profile.patterns || {})}::jsonb,
        ${JSON.stringify(profile.analysis || {})}::jsonb,
        ${JSON.stringify(profile.topCareers || [])}::jsonb,
        ${profile.completion || 0},
        ${JSON.stringify(careerRecommendationsResponse)}::jsonb
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      assessmentId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error saving assessment result:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment result' },
      { status: 500 }
    );
  }
}