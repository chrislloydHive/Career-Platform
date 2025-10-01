import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { profile, topCareers } = await request.json();

    const prompt = `You are a career assessment expert analyzing someone's assessment results. Generate a deeply personalized, insightful summary that reveals their unique cognitive patterns and work style.

ASSESSMENT DATA:
- Completion: ${profile.completion}%
- Synthesized Insights: ${JSON.stringify(profile.synthesizedInsights || [])}
- Patterns: ${JSON.stringify(profile.patterns || {})}
- Top Career Matches: ${topCareers?.map((c: any) => `${c.careerTitle} (${Math.round(c.currentScore * 100)}%)`).join(', ') || 'None yet'}
- Discovered Insights: ${JSON.stringify(profile.insights?.slice(-10) || [])}

Write a warm, insightful 4-5 paragraph summary that includes:

1. **Opening Hook** - Start with something specific you noticed about how they think or approach decisions (not generic)

2. **Cognitive Pattern** - Describe their unique thinking style and what this reveals about them professionally

3. **Professional Superpower** - Identify their standout strength that makes them uniquely valuable

4. **Career Implication** - What this means for the types of roles/environments where they'll thrive

5. **Opportunity Statement** - End with an empowering statement about their career potential

TONE:
- Conversational but insightful
- Specific, not generic
- Make them feel seen and understood
- Professional but warm
- Avoid clichés and buzzwords

Write in second person ("you"). Make it feel like you really understand who they are.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Failed to generate assessment summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error.message },
      { status: 500 }
    );
  }
}
