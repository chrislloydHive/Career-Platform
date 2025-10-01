import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check profile completion
    const profileResult = await sql`
      SELECT
        resume_url,
        linkedin_url,
        career_preferences,
        last_updated
      FROM user_profiles
      WHERE user_id = ${userId}
    `;

    const hasProfile = profileResult.rows.length > 0;
    const profile = profileResult.rows[0];
    const hasResume = !!(profile?.resume_url);
    const hasPreferences = !!(profile?.career_preferences);
    const profileCompleted = hasResume || hasPreferences;

    // Check assessment completion
    const assessmentResult = await sql`
      SELECT id, saved_at, top_careers, completion_percentage
      FROM assessment_results
      WHERE user_id = ${userId}
      ORDER BY saved_at DESC
      LIMIT 1
    `;

    const assessmentCompleted = assessmentResult.rows.length > 0 &&
      assessmentResult.rows[0].completion_percentage >= 50;
    const assessmentId = assessmentResult.rows[0]?.id;
    const topCareerArchetypes = assessmentResult.rows[0]?.top_careers
      ? JSON.parse(assessmentResult.rows[0].top_careers).slice(0, 3).map((c: any) => c.careerTitle)
      : [];

    // Check saved items
    const savedItemsResult = await sql`
      SELECT item_type, COUNT(*) as count
      FROM saved_items
      WHERE user_id = ${userId}
      GROUP BY item_type
    `;

    const savedCareers = savedItemsResult.rows.find((r: any) => r.item_type === 'career')?.count || 0;
    const savedJobs = savedItemsResult.rows.find((r: any) => r.item_type === 'job')?.count || 0;

    // Check interaction history for exploration
    const interactionResult = await sql`
      SELECT COUNT(*) as count
      FROM interaction_history
      WHERE user_id = ${userId}
        AND action LIKE '%career%'
    `;

    const careersExplored = parseInt(interactionResult.rows[0]?.count || '0');

    // Check job searches
    const jobSearchResult = await sql`
      SELECT COUNT(*) as count
      FROM interaction_history
      WHERE user_id = ${userId}
        AND action LIKE '%job search%'
    `;

    const jobSearchesPerformed = parseInt(jobSearchResult.rows[0]?.count || '0');

    // Calculate overall progress (0-100)
    let progress = 0;
    if (profileCompleted) progress += 20;
    if (assessmentCompleted) progress += 25;
    if (savedCareers > 0) progress += 20;
    if (savedJobs > 0) progress += 25;
    if (jobSearchesPerformed > 0) progress += 10;

    // Determine current step based on what's been completed
    let currentStep = 1;
    if (profileCompleted) currentStep = 2;
    if (assessmentCompleted) currentStep = 3;
    if (savedCareers > 0) currentStep = 4;
    if (savedJobs > 0) currentStep = 5;

    // Recommended next step
    let recommendedNextStep = 1;
    if (profileCompleted && !assessmentCompleted) recommendedNextStep = 2;
    else if (assessmentCompleted && savedCareers === 0) recommendedNextStep = 3;
    else if (savedCareers > 0 && savedJobs === 0) recommendedNextStep = 4;
    else if (savedJobs > 0) recommendedNextStep = 5;

    const workflow = {
      profileCompleted,
      hasResume,
      hasPreferences,
      profileLastUpdated: profile?.last_updated ? new Date(profile.last_updated) : undefined,
      assessmentCompleted,
      assessmentId,
      topCareerArchetypes,
      assessmentDate: assessmentResult.rows[0]?.saved_at
        ? new Date(assessmentResult.rows[0].saved_at)
        : undefined,
      careersExplored: parseInt(careersExplored),
      savedCareers: parseInt(savedCareers),
      jobSearchesPerformed: parseInt(jobSearchesPerformed),
      savedJobs: parseInt(savedJobs),
      prepResourcesViewed: false, // Could track this in interactions
      overallProgress: progress,
      currentStep,
      recommendedNextStep,
    };

    return NextResponse.json({ workflow });
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow status' },
      { status: 500 }
    );
  }
}
