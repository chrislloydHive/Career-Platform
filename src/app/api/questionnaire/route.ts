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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

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
        ${JSON.stringify(data.state)},
        ${JSON.stringify(data.insights || [])},
        ${JSON.stringify(data.synthesizedInsights || [])},
        ${JSON.stringify(data.gaps || [])},
        ${data.authenticityProfile ? JSON.stringify(data.authenticityProfile) : null},
        ${JSON.stringify(data.narrativeInsights || [])},
        ${JSON.stringify(data.confidenceEvolutions || [])},
        ${data.lastQuestionId || null},
        ${data.completionPercentage || 0},
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        state = ${JSON.stringify(data.state)},
        insights = ${JSON.stringify(data.insights || [])},
        synthesized_insights = ${JSON.stringify(data.synthesizedInsights || [])},
        gaps = ${JSON.stringify(data.gaps || [])},
        authenticity_profile = ${data.authenticityProfile ? JSON.stringify(data.authenticityProfile) : null},
        narrative_insights = ${JSON.stringify(data.narrativeInsights || [])},
        confidence_evolutions = ${JSON.stringify(data.confidenceEvolutions || [])},
        last_question_id = ${data.lastQuestionId || null},
        completion_percentage = ${data.completionPercentage || 0},
        updated_at = NOW()
    `;

    // Also update user profile with insights
    if (data.insights && data.insights.length > 0) {
      const insightTexts = data.insights.map((i: any) => i.insight);

      await sql`
        INSERT INTO ai_insights (user_id, insight, confidence, source)
        SELECT
          ${session.user.id},
          unnest(${insightTexts}::text[]),
          0.85,
          'self-discovery-questionnaire'
        ON CONFLICT DO NOTHING
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving questionnaire state:', error);
    return NextResponse.json(
      { error: 'Failed to save questionnaire state' },
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