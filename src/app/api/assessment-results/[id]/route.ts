import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM assessment_results
      WHERE id = ${params.id} AND user_id = ${session.user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const assessment = result.rows[0];
    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        profile: {
          responses: assessment.questionnaire_state,
          insights: assessment.insights,
          synthesizedInsights: assessment.synthesized_insights,
          gaps: assessment.gaps,
          authenticityProfile: assessment.authenticity_profile,
          narrativeInsights: assessment.narrative_insights,
          confidenceEvolutions: assessment.confidence_evolutions,
          patterns: assessment.patterns,
          analysis: assessment.analysis,
          topCareers: assessment.top_careers,
          completion: assessment.completion_percentage
        },
        savedAt: assessment.saved_at,
        createdAt: assessment.created_at
      }
    });
  } catch (error) {
    console.error('Error loading assessment result:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment result' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      DELETE FROM assessment_results
      WHERE id = ${params.id} AND user_id = ${session.user.id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assessment result:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessment result' },
      { status: 500 }
    );
  }
}