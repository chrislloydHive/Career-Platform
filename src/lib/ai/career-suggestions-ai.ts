import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CareerSuggestion {
  title: string;
  category: string;
  reasoning: string;
  matchScore: number;
  discoveryReason: string;
  isAiSuggested: true;
}

export async function generateCareerSuggestions(
  responses: Record<string, unknown>,
  insights: Array<{ insight: string; area: string; confidence: number }>,
  currentMatches: Array<{ careerTitle: string; currentScore: number }>,
  responseCount: number
): Promise<CareerSuggestion[]> {
  // Only generate suggestions after sufficient data
  if (responseCount < 8) {
    return [];
  }

  // Generate suggestions every 5 questions after the 8th
  if ((responseCount - 8) % 5 !== 0) {
    return [];
  }

  const insightsSummary = insights
    .slice(-10)
    .map(i => `- ${i.insight} (${i.area}, ${Math.round(i.confidence * 100)}% confidence)`)
    .join('\n');

  const currentMatchesSummary = currentMatches
    .slice(0, 5)
    .map(m => `- ${m.careerTitle} (${Math.round(m.currentScore)}% match)`)
    .join('\n');

  const prompt = `You are a career discovery AI helping someone explore career paths they may not have considered.

Based on their questionnaire responses and discovered insights, suggest 2-3 UNEXPECTED or UNCONVENTIONAL career opportunities that:
1. They likely haven't thought about themselves
2. Align with their emerging patterns and interests
3. Are different from their current top matches
4. Could be genuinely exciting discoveries

Recent Insights:
${insightsSummary}

Current Top Matches (to avoid):
${currentMatchesSummary}

Requirements:
- Suggest careers that are creative, unexpected, or niche
- Look for cross-domain connections (e.g., someone analytical + creative might suit "Data Storytelling Designer")
- Consider emerging fields and hybrid roles
- Each suggestion should feel like a genuine discovery

Return ONLY a valid JSON array with 2-3 suggestions in this exact format:
[
  {
    "title": "Career Title",
    "category": "Category Name",
    "reasoning": "Brief 1-2 sentence explanation of why this career matches their profile",
    "matchScore": 75,
    "discoveryReason": "What makes this career an interesting discovery for them"
  }
]

Important: Return ONLY the JSON array, no other text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response:', content.text);
      return [];
    }

    const suggestions = JSON.parse(jsonMatch[0]) as Array<{
      title: string;
      category: string;
      reasoning: string;
      matchScore: number;
      discoveryReason: string;
    }>;

    return suggestions.map(s => ({
      ...s,
      isAiSuggested: true as const,
    }));
  } catch (error) {
    console.error('Failed to generate career suggestions:', error);
    return [];
  }
}