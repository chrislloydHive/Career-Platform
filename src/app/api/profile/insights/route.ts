import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Build profile summary from onboarding data
    const profileParts = [];

    if (data.bio) {
      profileParts.push(`Bio: ${data.bio}`);
    }

    if (data.workExperience) {
      const we = data.workExperience;
      const weParts = [];
      if (we.currentRole) weParts.push(`Current role: ${we.currentRole}`);
      if (we.currentCompany) weParts.push(`at ${we.currentCompany}`);
      if (we.yearsOfExperience) weParts.push(`${we.yearsOfExperience} of experience`);
      if (we.industry) weParts.push(`in ${we.industry}`);
      if (weParts.length > 0) {
        profileParts.push(`Work Experience: ${weParts.join(' ')}`);
      }
    }

    if (data.education) {
      const ed = data.education;
      const edParts = [];
      if (ed.highestDegree) edParts.push(ed.highestDegree);
      if (ed.fieldOfStudy) edParts.push(`in ${ed.fieldOfStudy}`);
      if (ed.graduationYear) edParts.push(`(${ed.graduationYear})`);
      if (edParts.length > 0) {
        profileParts.push(`Education: ${edParts.join(' ')}`);
      }
    }

    if (data.location?.currentLocation) {
      profileParts.push(`Location: ${data.location.currentLocation}`);
    }

    if (data.skills) {
      profileParts.push(`Skills: ${data.skills}`);
    }

    if (data.interests) {
      profileParts.push(`Interests: ${data.interests}`);
    }

    if (data.careerGoals) {
      profileParts.push(`Career Goals: ${data.careerGoals}`);
    }

    if (data.preferredIndustries) {
      profileParts.push(`Preferred Industries: ${data.preferredIndustries}`);
    }

    const profileSummary = profileParts.join('\n');

    if (!profileSummary.trim()) {
      return NextResponse.json({
        insights: "You're off to a great start! The assessment ahead will help us understand more about your unique strengths and preferences."
      });
    }

    // Generate insights using Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Based on this user's profile information, provide a brief, encouraging insight about their background and career potential. Keep it to 2-3 sentences. Be specific and personal, but warm and supportive.

Profile:
${profileSummary}

Provide just the insight text, no preamble.`
      }]
    });

    const insights = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('Failed to generate insights:', error);
    return NextResponse.json(
      {
        insights: "You're off to a great start! The assessment ahead will help us understand more about your unique strengths and preferences."
      },
      { status: 200 }
    );
  }
}
