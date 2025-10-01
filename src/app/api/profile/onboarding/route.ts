import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { userProfiles, interactionHistory } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const onboardingData = await request.json();

    // Extract relevant information from onboarding data
    const workExperience = onboardingData.workExperience || {};
    const education = onboardingData.education || {};
    const location = onboardingData.location || {};
    const primaryGoal = onboardingData.primaryGoal || '';
    const timeframe = onboardingData.timeframe || '';

    // Build bio from onboarding data
    const bioParts = [];
    if (workExperience.currentRole) {
      bioParts.push(`${workExperience.currentRole}${workExperience.currentCompany ? ` at ${workExperience.currentCompany}` : ''}`);
    }
    if (workExperience.yearsOfExperience) {
      bioParts.push(`${workExperience.yearsOfExperience} of experience`);
    }
    if (education.highestDegree && education.fieldOfStudy) {
      bioParts.push(`${education.highestDegree} in ${education.fieldOfStudy}`);
    }
    if (location.currentLocation) {
      bioParts.push(`based in ${location.currentLocation}`);
    }

    const bio = bioParts.join(' • ') || 'Career explorer seeking new opportunities';

    // Build skills array from industry and field of study
    const skills: string[] = [];
    if (workExperience.industry) skills.push(workExperience.industry);
    if (education.fieldOfStudy) skills.push(education.fieldOfStudy);

    // Build interests from career goal
    const interests: string[] = [];
    if (primaryGoal) {
      // Map goal IDs to readable interests
      const goalMap: Record<string, string> = {
        'find-new-career': 'Career exploration',
        'career-change': 'Career transition',
        'skill-development': 'Professional development',
        'job-search': 'Job search',
        'promotion': 'Career advancement',
      };
      if (goalMap[primaryGoal]) {
        interests.push(goalMap[primaryGoal]);
      }
    }

    // Build career goals
    const careerGoals: string[] = [];
    if (primaryGoal && timeframe) {
      careerGoals.push(`${primaryGoal.replace('-', ' ')} (${timeframe.replace('_', ' ')})`);
    }

    // Check if profile exists
    const existingProfiles = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfiles.length > 0) {
      // Update existing profile with onboarding data
      await db.update(userProfiles)
        .set({
          bio,
          skills,
          interests,
          careerGoals,
          onboardingData: onboardingData,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, session.user.id));
    } else {
      // Create new profile with onboarding data
      await db.insert(userProfiles).values({
        userId: session.user.id,
        bio,
        skills,
        interests,
        careerGoals,
        strengths: [],
        aiInsights: [],
        interactionHistory: [],
        onboardingData: onboardingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Log interaction
    await db.insert(interactionHistory).values({
      userId: session.user.id,
      action: 'Completed Onboarding',
      context: `Primary goal: ${primaryGoal}, Timeframe: ${timeframe}`,
      aiLearning: 'Initial profile created from onboarding information',
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data', details: error.message },
      { status: 500 }
    );
  }
}
