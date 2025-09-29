import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT * FROM assessment_results
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const assessment = result.rows[0];

    // Handle backward compatibility for career recommendations format
    let careerRecommendations = assessment.career_recommendations;
    if (Array.isArray(careerRecommendations)) {
      // Old format: array of recommendations - convert to new format
      careerRecommendations = {
        topRecommendations: careerRecommendations,
        alternativePaths: []
      };
    } else if (!careerRecommendations) {
      // No recommendations - set default structure
      careerRecommendations = {
        topRecommendations: [],
        alternativePaths: []
      };
    }

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
        careerRecommendations,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      DELETE FROM assessment_results
      WHERE id = ${id} AND user_id = ${session.user.id}
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