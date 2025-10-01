import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sql } from '@vercel/postgres';
import { getUserProfile } from '@/lib/storage/user-profile-db';

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
    const resumeUrl = onboardingData.resumeUrl || null;
    const linkedinUrl = onboardingData.linkedinUrl || null;

    // Use user-provided bio or build from onboarding data
    let bio = onboardingData.bio || '';
    if (!bio) {
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
      bio = bioParts.join(' • ') || 'Career explorer seeking new opportunities';
    }

    // Use user-provided skills or build from industry and education
    let skills: string[] = [];
    if (onboardingData.skills) {
      skills = onboardingData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else {
      if (workExperience.industry) skills.push(workExperience.industry);
      if (education.fieldOfStudy) skills.push(education.fieldOfStudy);
    }

    // Use user-provided interests or build from career goal
    let interests: string[] = [];
    if (onboardingData.interests) {
      interests = onboardingData.interests.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (primaryGoal) {
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

    // Use user-provided career goals or build from primary goal
    let careerGoals: string[] = [];
    if (onboardingData.careerGoals) {
      careerGoals = onboardingData.careerGoals.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (primaryGoal && timeframe) {
      careerGoals.push(`${primaryGoal.replace(/-/g, ' ')} (${timeframe.replace(/_/g, ' ')})`);
    }

    // Parse user-provided preferred industries
    const preferredIndustries: string[] = onboardingData.preferredIndustries
      ? onboardingData.preferredIndustries.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Check if profile exists
    const existing = await sql`
      SELECT user_id FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (existing.rows.length > 0) {
      // Update existing profile with onboarding data
      await sql`
        UPDATE user_profiles SET
          location = ${location.currentLocation || ''},
          bio = ${bio},
          linkedin_url = ${linkedinUrl},
          resume_url = ${resumeUrl},
          skills = ${JSON.stringify(skills)},
          interests = ${JSON.stringify(interests)},
          career_goals = ${JSON.stringify(careerGoals)},
          preferred_industries = ${JSON.stringify(preferredIndustries)},
          last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ${session.user.id}
      `;
    } else {
      // Create new profile with onboarding data
      await sql`
        INSERT INTO user_profiles (
          user_id, name, location, bio, linkedin_url, resume_url,
          education, experience, skills, strengths, interests, values,
          career_goals, preferred_industries, preferred_locations,
          career_preferences
        ) VALUES (
          ${session.user.id},
          ${session.user.name || 'User'},
          ${location.currentLocation || ''},
          ${bio},
          ${linkedinUrl},
          ${resumeUrl},
          ${JSON.stringify([])},
          ${JSON.stringify([])},
          ${JSON.stringify(skills)},
          ${JSON.stringify([])},
          ${JSON.stringify(interests)},
          ${JSON.stringify([])},
          ${JSON.stringify(careerGoals)},
          ${JSON.stringify(preferredIndustries)},
          ${JSON.stringify([])},
          ${JSON.stringify({
            idealRole: '',
            whatMatters: [],
            workEnvironment: [],
            dealBreakers: [],
            motivations: [],
            skillsToLeverage: [],
            skillsToGrow: [],
            cultureFit: [],
            workLifeBalance: 'balanced',
            compensationPriority: 'competitive',
            customNotes: ''
          })}
        )
      `;
    }

    // Log interaction
    await sql`
      INSERT INTO interaction_history (user_id, action, context, ai_learning)
      VALUES (
        ${session.user.id},
        ${'Completed Onboarding'},
        ${`Primary goal: ${primaryGoal}, Timeframe: ${timeframe}`},
        ${'Initial profile created from onboarding information'}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save onboarding data:', error);
    return NextResponse.json(
      { error: 'Failed to save onboarding data', details: error.message },
      { status: 500 }
    );
  }
}
