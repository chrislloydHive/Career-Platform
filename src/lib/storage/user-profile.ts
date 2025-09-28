import fs from 'fs/promises';
import path from 'path';
import { UserProfile, LOUISA_PROFILE } from '@/types/user-profile';

const PROFILE_DIR = path.join(process.cwd(), 'data');
const PROFILE_FILE = path.join(PROFILE_DIR, 'user-profile.json');

export async function getUserProfile(): Promise<UserProfile> {
  try {
    await fs.mkdir(PROFILE_DIR, { recursive: true });

    const data = await fs.readFile(PROFILE_FILE, 'utf-8');
    const profile = JSON.parse(data) as UserProfile;

    profile.interactionHistory = profile.interactionHistory.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
    profile.aiInsights = profile.aiInsights.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
    profile.lastUpdated = new Date(profile.lastUpdated);

    if (!profile.careerPreferences) {
      profile.careerPreferences = LOUISA_PROFILE.careerPreferences;
      await saveUserProfile(profile);
    }

    return profile;
  } catch {
    await saveUserProfile(LOUISA_PROFILE);
    return LOUISA_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await fs.mkdir(PROFILE_DIR, { recursive: true });
    await fs.writeFile(PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save user profile:', error);
    throw error;
  }
}

export async function addInteraction(action: string, context: string, aiLearning?: string): Promise<void> {
  const profile = await getUserProfile();

  profile.interactionHistory.push({
    timestamp: new Date(),
    action,
    context,
    aiLearning
  });

  if (profile.interactionHistory.length > 1000) {
    profile.interactionHistory = profile.interactionHistory.slice(-1000);
  }

  profile.lastUpdated = new Date();
  await saveUserProfile(profile);
}

export async function addAIInsight(insight: string, confidence: number, source: string): Promise<void> {
  const profile = await getUserProfile();

  profile.aiInsights.push({
    timestamp: new Date(),
    insight,
    confidence,
    source
  });

  if (profile.aiInsights.length > 500) {
    profile.aiInsights = profile.aiInsights.slice(-500);
  }

  profile.lastUpdated = new Date();
  await saveUserProfile(profile);
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