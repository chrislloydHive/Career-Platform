import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sql } from '@vercel/postgres';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Generate Insights] Starting for user:', session.user.id);

    // Get full profile including preferences
    const profileResult = await sql`
      SELECT
        name, bio, skills, strengths, interests, values, career_goals,
        education, experience, preferred_industries, preferred_locations,
        career_preferences
      FROM user_profiles
      WHERE user_id = ${session.user.id}
    `;

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = profileResult.rows[0];
    const preferences = profile.career_preferences || {};

    console.log('[Generate Insights] Profile loaded, generating insights...');

    // Build comprehensive prompt for AI
    const prompt = `You are a career advisor analyzing a user's profile and preferences to generate personalized career insights.

USER PROFILE:
Name: ${profile.name || 'Not provided'}
Bio: ${profile.bio || 'Not provided'}
Skills: ${JSON.stringify(profile.skills || [])}
Strengths: ${JSON.stringify(profile.strengths || [])}
Interests: ${JSON.stringify(profile.interests || [])}
Values: ${JSON.stringify(profile.values || [])}
Career Goals: ${JSON.stringify(profile.career_goals || [])}
Preferred Industries: ${JSON.stringify(profile.preferred_industries || [])}

CAREER PREFERENCES:
Ideal Role: ${preferences.idealRole || 'Not specified'}
What Matters Most: ${JSON.stringify(preferences.whatMatters || [])}
Work Environment: ${JSON.stringify(preferences.workEnvironment || [])}
Deal Breakers: ${JSON.stringify(preferences.dealBreakers || [])}
Motivations: ${JSON.stringify(preferences.motivations || [])}
Skills to Leverage: ${JSON.stringify(preferences.skillsToLeverage || [])}
Skills to Grow: ${JSON.stringify(preferences.skillsToGrow || [])}
Culture Fit: ${JSON.stringify(preferences.cultureFit || [])}
Work-Life Balance: ${preferences.workLifeBalance || 'Not specified'}
Compensation Priority: ${preferences.compensationPriority || 'Not specified'}

Based on this information, generate 3-5 actionable career insights. Each insight should:
1. Connect their background/skills with their stated preferences
2. Identify unique opportunities or angles they might not have considered
3. Point out potential mismatches or blind spots (kindly)
4. Suggest specific next steps or areas to explore

Format your response as a JSON array of insight objects:
[
  {
    "title": "Brief, compelling title",
    "content": "2-3 sentences of insight",
    "type": "opportunity|strength|caution|recommendation",
    "confidence": 0.0-1.0
  }
]

Be specific, honest, and helpful. Focus on insights they wouldn't get from a generic career test.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('[Generate Insights] AI response received');

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Parse JSON response
    let insights;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      insights = JSON.parse(jsonStr);
      console.log('[Generate Insights] Parsed', insights.length, 'insights');
    } catch (e) {
      console.error('[Generate Insights] Failed to parse AI response:', responseText.substring(0, 500));
      throw new Error('Failed to parse AI insights');
    }

    // Store insights in database
    console.log('[Generate Insights] Storing insights in database...');

    for (const insight of insights) {
      await sql`
        INSERT INTO ai_insights (user_id, insight, confidence, source, timestamp)
        VALUES (
          ${session.user.id},
          ${JSON.stringify({ title: insight.title, content: insight.content, type: insight.type })},
          ${insight.confidence || 0.8},
          ${'preferences_update'},
          NOW()
        )
      `;
    }

    console.log('[Generate Insights] Successfully stored', insights.length, 'insights');

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
    });

  } catch (error: any) {
    console.error('[Generate Insights] Error:', error);
    console.error('[Generate Insights] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
