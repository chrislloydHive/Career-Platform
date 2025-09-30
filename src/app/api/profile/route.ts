import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, saveUserProfile } from '@/lib/storage/user-profile-db';
import { auth } from '@/lib/auth/config';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfile(session.user.id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch questionnaire insights
    const questionnaireData = await sql`
      SELECT insights, synthesized_insights, completion_percentage, state
      FROM questionnaire_state
      WHERE user_id = ${session.user.id}
    `;

    // Fetch interaction history
    const interactionHistory = await sql`
      SELECT action, context, timestamp
      FROM interaction_history
      WHERE user_id = ${session.user.id}
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    // Fetch AI insights
    const aiInsights = await sql`
      SELECT insight_type, content, confidence, created_at
      FROM ai_insights
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    // Fetch saved assessment results
    const assessmentResults = await sql`
      SELECT id, title, description, completion_percentage, saved_at, career_recommendations
      FROM assessment_results
      WHERE user_id = ${session.user.id}
      ORDER BY saved_at DESC
      LIMIT 10
    `;

    const enrichedProfile = {
      ...profile,
      questionnaireInsights: questionnaireData.rows[0] || null,
      interactionHistory: interactionHistory.rows || [],
      aiInsights: aiInsights.rows || [],
      assessmentResults: assessmentResults.rows || [],
    };

    return NextResponse.json({ success: true, profile: enrichedProfile });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const profile = await getUserProfile(session.user.id);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      lastUpdated: new Date()
    };

    await saveUserProfile(session.user.id, updatedProfile);

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}