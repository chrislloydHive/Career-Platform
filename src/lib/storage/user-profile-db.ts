import { sql } from '../db/client';
import { UserProfile } from '@/types/user-profile';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const result = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    const interactions = await sql`
      SELECT action, context, ai_learning, timestamp
      FROM interaction_history
      WHERE user_id = ${userId}
      ORDER BY timestamp ASC
      LIMIT 1000
    `;

    const insights = await sql`
      SELECT insight, confidence, source, timestamp
      FROM ai_insights
      WHERE user_id = ${userId}
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
    return null;
  }
}

export async function saveUserProfile(userId: string, profile: UserProfile): Promise<void> {
  try {
    const existing = await sql`
      SELECT user_id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE user_profiles SET
          name = ${profile.name},
          location = ${profile.location || ''},
          bio = ${profile.bio || ''},
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
        WHERE user_id = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO user_profiles (
          user_id, name, location, bio, linkedin_url, resume_url,
          education, experience, skills, strengths, interests, values,
          career_goals, preferred_industries, preferred_locations,
          career_preferences
        ) VALUES (
          ${userId},
          ${profile.name},
          ${profile.location || ''},
          ${profile.bio || ''},
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

export async function addInteraction(userId: string, action: string, context: string, aiLearning?: string): Promise<void> {
  try {
    await sql`
      INSERT INTO interaction_history (user_id, action, context, ai_learning)
      VALUES (${userId}, ${action}, ${context}, ${aiLearning || null})
    `;

    const count = await sql`
      SELECT COUNT(*) as count FROM interaction_history WHERE user_id = ${userId}
    `;

    const totalCount = parseInt(count.rows[0].count);
    if (totalCount > 1000) {
      await sql`
        DELETE FROM interaction_history
        WHERE id IN (
          SELECT id FROM interaction_history
          WHERE user_id = ${userId}
          ORDER BY timestamp ASC
          LIMIT ${totalCount - 1000}
        )
      `;
    }

    await sql`
      UPDATE user_profiles SET last_updated = CURRENT_TIMESTAMP WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to add interaction:', error);
    throw error;
  }
}

export async function addAIInsight(userId: string, insight: string, confidence: number, source: string): Promise<void> {
  try {
    await sql`
      INSERT INTO ai_insights (user_id, insight, confidence, source)
      VALUES (${userId}, ${insight}, ${confidence}, ${source})
    `;

    const count = await sql`
      SELECT COUNT(*) as count FROM ai_insights WHERE user_id = ${userId}
    `;

    const totalCount = parseInt(count.rows[0].count);
    if (totalCount > 500) {
      await sql`
        DELETE FROM ai_insights
        WHERE id IN (
          SELECT id FROM ai_insights
          WHERE user_id = ${userId}
          ORDER BY timestamp ASC
          LIMIT ${totalCount - 500}
        )
      `;
    }

    await sql`
      UPDATE user_profiles SET last_updated = CURRENT_TIMESTAMP WHERE user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to add AI insight:', error);
    throw error;
  }
}

export async function getQuestionnaireInsights(userId: string) {
  try {
    const result = await sql`
      SELECT insights, synthesized_insights, gaps, authenticity_profile,
             narrative_insights, completion_percentage
      FROM questionnaire_state
      WHERE user_id = ${userId}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching questionnaire insights:', error);
    return null;
  }
}

interface QuestionnaireInsight {
  insight: string;
  area: string;
  confidence: number;
}

interface SynthesizedInsight {
  title: string;
  type: string;
  description: string;
  implications: string[];
}

interface NarrativeInsight {
  title: string;
  narrative: string;
  themes: string[];
}

interface AuthenticPreference {
  preference: string;
}

interface AuthenticityProfileData {
  authenticityScore: number;
  authenticPreferences?: AuthenticPreference[];
  selfPerceptionGaps?: unknown[];
}

interface Gap {
  gap: string;
  area: string;
  importance: string;
}

interface QuestionnaireData {
  insights?: QuestionnaireInsight[];
  synthesized_insights?: SynthesizedInsight[];
  gaps?: Gap[];
  authenticity_profile?: AuthenticityProfileData;
  narrative_insights?: NarrativeInsight[];
  completion_percentage?: number;
}

export function buildUserContextPrompt(profile: UserProfile, questionnaireData?: QuestionnaireData): string {
  let questionnaireSection = '';

  if (questionnaireData) {
    const insights = questionnaireData.insights || [];
    const synthesized = questionnaireData.synthesized_insights || [];
    const gaps = questionnaireData.gaps || [];
    const authenticityProfile = questionnaireData.authenticity_profile;
    const narrativeInsights = questionnaireData.narrative_insights || [];
    const completionPercentage = questionnaireData.completion_percentage || 0;

    questionnaireSection = `
## SELF-DISCOVERY QUESTIONNAIRE INSIGHTS (${completionPercentage}% Complete)

### Discovered Patterns & Insights
${insights.length > 0 ? insights.map((i) => `- ${i.insight} (${i.area}, ${Math.round(i.confidence * 100)}% confidence)`).join('\n') : '- No insights discovered yet'}

### Cross-Domain Insights
${synthesized.length > 0 ? synthesized.map((s) => `
**${s.title}** (${s.type})
${s.description}
Implications:
${s.implications.map((imp: string) => `  - ${imp}`).join('\n')}
`).join('\n') : '- No cross-domain insights yet'}

### Narrative Insights (User's Story)
${narrativeInsights.length > 0 ? narrativeInsights.map((n) => `
**${n.title}**
${n.narrative}
Key themes: ${n.themes.join(', ')}
`).join('\n') : '- No narrative insights yet'}

### Authenticity Profile
${authenticityProfile ? `
Authenticity Score: ${Math.round(authenticityProfile.authenticityScore * 100)}%
Core Values: ${authenticityProfile.authenticPreferences?.map((p) => p.preference).join(', ') || 'N/A'}
Self-Perception Gaps: ${authenticityProfile.selfPerceptionGaps?.length || 0} identified
` : '- Not yet analyzed'}

### Knowledge Gaps to Explore
${gaps.length > 0 ? gaps.map((g) => `- ${g.gap} (${g.area}, ${g.importance} priority)`).join('\n') : '- No gaps identified yet'}

`;
  }

  return `
# User Profile: ${profile.name}

## Background
${profile.bio}

## Current Location
${profile.location}
${questionnaireSection}
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
2. Remember ${profile.name}'s unique background, skills, and experience
3. Pay special attention to their stated values and preferences
4. Track patterns in interactions and save insights using the addAIInsight function
5. Consider their geographic preferences (${profile.preferredLocations.join(', ')})
6. Build on previous insights to develop deeper understanding over time
7. Recognize their unique strengths: ${profile.strengths.slice(0, 3).join(', ')}
8. Honor their career goals and ideal work environment preferences
9. Consider their educational background and professional experience
10. Always consider how opportunities align with their career goals and values
`;
}

export function buildShortUserContext(profile: UserProfile): string {
  const topSkills = profile.skills.slice(0, 3).join(', ');
  const topValues = profile.values.slice(0, 3).join(', ');
  const recentInsights = profile.aiInsights.slice(-3).map(i => i.insight).join('; ');

  return `User: ${profile.name}, ${profile.location}. Skills: ${topSkills}. ${profile.careerPreferences.idealRole}. Values: ${topValues}. Recent insights: ${recentInsights || 'None yet'}`;
}