import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth/config';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM questionnaire_state
      WHERE user_id = ${session.user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ state: null });
    }

    const row = result.rows[0];
    return NextResponse.json({
      success: true,
      state: row.state,
      insights: row.insights,
      synthesizedInsights: row.synthesized_insights,
      gaps: row.gaps,
      authenticityProfile: row.authenticity_profile,
      narrativeInsights: row.narrative_insights,
      confidenceEvolutions: row.confidence_evolutions,
      lastQuestionId: row.last_question_id,
      completionPercentage: row.completion_percentage,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error loading questionnaire state:', error);
    return NextResponse.json(
      { error: 'Failed to load questionnaire state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('[Questionnaire API] POST request received');
    const session = await auth();
    if (!session?.user?.id) {
      console.error('[Questionnaire API] Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Questionnaire API] User ID:', session.user.id);
    const data = await request.json();
    console.log('[Questionnaire API] Data received:', {
      hasState: !!data.state,
      insightsCount: data.insights?.length || 0,
      lastQuestionId: data.lastQuestionId,
      completionPercentage: data.completionPercentage
    });

    console.log('[Questionnaire API] Preparing data for database save');
    const stateJson = JSON.stringify(data.state);
    const insightsJson = JSON.stringify(data.insights || []);
    const synthesizedInsightsJson = JSON.stringify(data.synthesizedInsights || []);
    const gapsJson = JSON.stringify(data.gaps || []);
    const authenticityProfileJson = data.authenticityProfile ? JSON.stringify(data.authenticityProfile) : null;
    const narrativeInsightsJson = JSON.stringify(data.narrativeInsights || []);
    const confidenceEvolutionsJson = JSON.stringify(data.confidenceEvolutions || []);

    console.log('[Questionnaire API] JSON sizes:', {
      state: stateJson.length,
      insights: insightsJson.length,
      synthesizedInsights: synthesizedInsightsJson.length,
      gaps: gapsJson.length,
      narrativeInsights: narrativeInsightsJson.length,
      confidenceEvolutions: confidenceEvolutionsJson.length,
    });

    console.log('[Questionnaire API] Executing SQL INSERT/UPDATE...');
    await sql`
      INSERT INTO questionnaire_state (
        user_id,
        state,
        insights,
        synthesized_insights,
        gaps,
        authenticity_profile,
        narrative_insights,
        confidence_evolutions,
        last_question_id,
        completion_percentage,
        updated_at
      ) VALUES (
        ${session.user.id},
        ${stateJson}::jsonb,
        ${insightsJson}::jsonb,
        ${synthesizedInsightsJson}::jsonb,
        ${gapsJson}::jsonb,
        ${authenticityProfileJson}::jsonb,
        ${narrativeInsightsJson}::jsonb,
        ${confidenceEvolutionsJson}::jsonb,
        ${data.lastQuestionId || null},
        ${data.completionPercentage || 0},
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        state = ${stateJson}::jsonb,
        insights = ${insightsJson}::jsonb,
        synthesized_insights = ${synthesizedInsightsJson}::jsonb,
        gaps = ${gapsJson}::jsonb,
        authenticity_profile = ${authenticityProfileJson}::jsonb,
        narrative_insights = ${narrativeInsightsJson}::jsonb,
        confidence_evolutions = ${confidenceEvolutionsJson}::jsonb,
        last_question_id = ${data.lastQuestionId || null},
        completion_percentage = ${data.completionPercentage || 0},
        updated_at = NOW()
    `;

    console.log('[Questionnaire API] SQL executed successfully');

    console.log('[Questionnaire API] Request completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Questionnaire API] ERROR saving questionnaire state:', error);
    console.error('[Questionnaire API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to save questionnaire state', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sql`
      DELETE FROM questionnaire_state
      WHERE user_id = ${session.user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting questionnaire state:', error);
    return NextResponse.json(
      { error: 'Failed to delete questionnaire state' },
      { status: 500 }
    );
  }
}