import { sql } from '../db/client';
import { UserProfile, LOUISA_PROFILE } from '@/types/user-profile';

const USER_ID = 'louisa';

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const result = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${USER_ID}
    `;

    if (result.rows.length === 0) {
      await saveUserProfile(LOUISA_PROFILE);
      return LOUISA_PROFILE;
    }

    const row = result.rows[0];

    const interactions = await sql`
      SELECT action, context, ai_learning, timestamp
      FROM interaction_history
      WHERE user_id = ${USER_ID}
      ORDER BY timestamp ASC
      LIMIT 1000
    `;

    const insights = await sql`
      SELECT insight, confidence, source, timestamp
      FROM ai_insights
      WHERE user_id = ${USER_ID}
      ORDER BY timestamp ASC
      LIMIT 500
    `;

    const profile: UserProfile = {
      name: row.name,
      location: row.location,
      bio: row.bio,
      linkedInUrl: row.linkedin_url,
      resumeUrl: row.resume_url,
      education: row.education,
      experience: row.experience,
      skills: row.skills,
      strengths: row.strengths,
      interests: row.interests,
      values: row.values,
      careerGoals: row.career_goals,
      preferredIndustries: row.preferred_industries,
      preferredLocations: row.preferred_locations,
      careerPreferences: row.career_preferences,
      interactionHistory: interactions.rows.map(i => ({
        timestamp: new Date(i.timestamp),
        action: i.action,
        context: i.context,
        aiLearning: i.ai_learning,
      })),
      aiInsights: insights.rows.map(i => ({
        timestamp: new Date(i.timestamp),
        insight: i.insight,
        confidence: parseFloat(i.confidence),
        source: i.source,
      })),
      lastUpdated: new Date(row.last_updated),
    };

    return profile;
  } catch (error) {
    console.error('Error fetching user profile from database:', error);
    return LOUISA_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const existing = await sql`
      SELECT user_id FROM user_profiles WHERE user_id = ${USER_ID}
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE user_profiles SET
          name = ${profile.name},
          location = ${profile.location},
          bio = ${profile.bio},
          linkedin_url = ${profile.linkedInUrl || null},
          resume_url = ${profile.resumeUrl || null},
          education = ${JSON.stringify(profile.education)},
          experience = ${JSON.stringify(profile.experience)},
          skills = ${JSON.stringify(profile.skills)},
          strengths = ${JSON.stringify(profile.strengths)},
          interests = ${JSON.stringify(profile.interests)},
          values = ${JSON.stringify(profile.values)},
          career_goals = ${JSON.stringify(profile.careerGoals)},
          preferred_industries = ${JSON.stringify(profile.preferredIndustries)},
          preferred_locations = ${JSON.stringify(profile.preferredLocations)},
          career_preferences = ${JSON.stringify(profile.careerPreferences)},
          last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ${USER_ID}
      `;
    } else {
      await sql`
        INSERT INTO user_profiles (
          user_id, name, location, bio, linkedin_url, resume_url,
          education, experience, skills, strengths, interests, values,
          career_goals, preferred_industries, preferred_locations,
          career_preferences
        ) VALUES (
          ${USER_ID},
          ${profile.name},
          ${profile.location},
          ${profile.bio},
          ${profile.linkedInUrl || null},
          ${profile.resumeUrl || null},
          ${JSON.stringify(profile.education)},
          ${JSON.stringify(profile.experience)},
          ${JSON.stringify(profile.skills)},
          ${JSON.stringify(profile.strengths)},
          ${JSON.stringify(profile.interests)},
          ${JSON.stringify(profile.values)},
          ${JSON.stringify(profile.careerGoals)},
          ${JSON.stringify(profile.preferredIndustries)},
          ${JSON.stringify(profile.preferredLocations)},
          ${JSON.stringify(profile.careerPreferences)}
        )
      `;
    }
  } catch (error) {
    console.error('Failed to save user profile to database:', error);
    throw error;
  }
}

export async function addInteraction(action: string, context: string, aiLearning?: string): Promise<void> {
  try {
    await sql`
      INSERT INTO interaction_history (user_id, action, context, ai_learning)
      VALUES (${USER_ID}, ${action}, ${context}, ${aiLearning || null})
    `;

    const count = await sql`
      SELECT COUNT(*) as count FROM interaction_history WHERE user_id = ${USER_ID}
    `;

    const totalCount = parseInt(count.rows[0].count);
    if (totalCount > 1000) {
      await sql`
        DELETE FROM interaction_history
        WHERE id IN (
          SELECT id FROM interaction_history
          WHERE user_id = ${USER_ID}
          ORDER BY timestamp ASC
          LIMIT ${totalCount - 1000}
        )
      `;
    }

    await sql`
      UPDATE user_profiles SET last_updated = CURRENT_TIMESTAMP WHERE user_id = ${USER_ID}
    `;
  } catch (error) {
    console.error('Failed to add interaction:', error);
    throw error;
  }
}

export async function addAIInsight(insight: string, confidence: number, source: string): Promise<void> {
  try {
    await sql`
      INSERT INTO ai_insights (user_id, insight, confidence, source)
      VALUES (${USER_ID}, ${insight}, ${confidence}, ${source})
    `;

    const count = await sql`
      SELECT COUNT(*) as count FROM ai_insights WHERE user_id = ${USER_ID}
    `;

    const totalCount = parseInt(count.rows[0].count);
    if (totalCount > 500) {
      await sql`
        DELETE FROM ai_insights
        WHERE id IN (
          SELECT id FROM ai_insights
          WHERE user_id = ${USER_ID}
          ORDER BY timestamp ASC
          LIMIT ${totalCount - 500}
        )
      `;
    }

    await sql`
      UPDATE user_profiles SET last_updated = CURRENT_TIMESTAMP WHERE user_id = ${USER_ID}
    `;
  } catch (error) {
    console.error('Failed to add AI insight:', error);
    throw error;
  }
}

export function buildUserContextPrompt(profile: UserProfile): string {
  return `
# User Profile: ${profile.name}

## Background
${profile.bio}

## Current Location
${profile.location}

## CAREER PREFERENCES (CRITICAL FOR RECOMMENDATIONS)

### Ideal Role
${profile.careerPreferences.idealRole}

### What Matters Most
${profile.careerPreferences.whatMatters.map(item => `- ${item}`).join('\n')}

### Ideal Work Environment
${profile.careerPreferences.workEnvironment.map(item => `- ${item}`).join('\n')}

### Deal Breakers (MUST AVOID)
${profile.careerPreferences.dealBreakers.map(item => `- ${item}`).join('\n')}

### Key Motivations
${profile.careerPreferences.motivations.map(item => `- ${item}`).join('\n')}

### Skills to Leverage
${profile.careerPreferences.skillsToLeverage.map(item => `- ${item}`).join('\n')}

### Skills to Grow
${profile.careerPreferences.skillsToGrow.map(item => `- ${item}`).join('\n')}

### Culture Fit Requirements
${profile.careerPreferences.cultureFit.map(item => `- ${item}`).join('\n')}

### Work-Life Balance Priority
${profile.careerPreferences.workLifeBalance}

### Compensation Philosophy
${profile.careerPreferences.compensationPriority}

### Additional Context
${profile.careerPreferences.customNotes}

## Education
${profile.education.map(edu => `
- ${edu.degree} in ${edu.major}${edu.minor ? ` (Minor: ${edu.minor})` : ''} from ${edu.institution} (${edu.graduationYear})
${edu.honors && edu.honors.length > 0 ? `  Honors: ${edu.honors.join(', ')}` : ''}
`).join('\n')}

## Professional Experience
${profile.experience.map(exp => `
**${exp.title}** at ${exp.company} (${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ' - Present'})
${exp.description.map(d => `- ${d}`).join('\n')}
Key Skills: ${exp.skills?.join(', ') || 'N/A'}
`).join('\n')}

## Core Skills & Strengths
**Skills:** ${profile.skills.join(', ')}

**Strengths:** ${profile.strengths.join('; ')}

## Interests & Values
**Interests:** ${profile.interests.join(', ')}

**Values:** ${profile.values.join('; ')}

## Career Goals
${profile.careerGoals.map(goal => `- ${goal}`).join('\n')}

## Preferred Industries
${profile.preferredIndustries.join(', ')}

## Geographic Preferences
${profile.preferredLocations.join(', ')}

## Recent AI Insights (Last 10)
${profile.aiInsights.slice(-10).map(insight => `
- [${insight.timestamp.toLocaleDateString()}] ${insight.insight} (Confidence: ${Math.round(insight.confidence * 100)}%, Source: ${insight.source})
`).join('\n')}

## Recent Interactions (Last 20)
${profile.interactionHistory.slice(-20).map(interaction => `
- [${interaction.timestamp.toLocaleDateString()}] ${interaction.action}: ${interaction.context}
${interaction.aiLearning ? `  AI Learning: ${interaction.aiLearning}` : ''}
`).join('\n')}

---

IMPORTANT INSTRUCTIONS FOR AI:
1. Use this profile context in ALL responses and recommendations
2. Remember ${profile.name}'s unique combination: healthcare operations + marketing + fitness + visual merchandising
3. Pay special attention to her values around helping people and structured environments
4. Track patterns in her interactions and save insights using the addAIInsight function
5. Consider her geographic preferences (${profile.preferredLocations.join(', ')})
6. Build on previous insights to develop deeper understanding over time
7. Recognize her athletic discipline from Division I rowing (20+ hrs/week commitment)
8. Honor her preference for roles that combine creativity with strategy
9. Note her academic excellence (magna cum laude) and work ethic
10. Always consider how opportunities align with her career goals and values
`;
}

export function buildShortUserContext(profile: UserProfile): string {
  return `User: ${profile.name}, ${profile.location}. Marketing grad with healthcare ops, fitness training, and visual merchandising experience. Seeking roles combining marketing + health/wellness. Values: helping people, structure, creativity, growth. Recent insights: ${profile.aiInsights.slice(-3).map(i => i.insight).join('; ')}`;
}