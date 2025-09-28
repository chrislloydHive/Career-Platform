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
      SELECT
        id,
        title,
        description,
        completion_percentage,
        saved_at,
        created_at
      FROM assessment_results
      WHERE user_id = ${session.user.id}
      ORDER BY saved_at DESC
    `;

    return NextResponse.json({
      success: true,
      assessments: result.rows
    });
  } catch (error) {
    console.error('Error loading assessment results:', error);
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
        completion_percentage
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
        ${profile.completion || 0}
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