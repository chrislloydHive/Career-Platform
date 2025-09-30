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

    const { documentUrls, linkedInUrl, additionalInfo } = await request.json();

    console.log('[Analyze] Starting analysis for user:', session.user.id);
    console.log('[Analyze] Input data:', {
      hasDocuments: !!documentUrls?.length,
      documentCount: documentUrls?.length || 0,
      hasLinkedIn: !!linkedInUrl,
      hasAdditionalInfo: !!additionalInfo,
    });

    // Check if we have any data to analyze
    if (!linkedInUrl && !additionalInfo && (!documentUrls || documentUrls.length === 0)) {
      console.error('[Analyze] No data provided for analysis');
      return NextResponse.json(
        { error: 'Please provide at least a LinkedIn URL, some information about yourself, or upload a document' },
        { status: 400 }
      );
    }

    // Fetch document contents (for now, we'll just analyze the text provided)
    // In a production system, you'd want to parse PDFs/DOCX files
    // For now, we'll use the additional info and LinkedIn URL

    let analysisPrompt = `You are analyzing a user's career profile to help them discover potential career paths.

Here's what we know about the user:

`;

    if (linkedInUrl) {
      analysisPrompt += `LinkedIn Profile: ${linkedInUrl}\n\n`;
    }

    if (additionalInfo) {
      analysisPrompt += `Additional Information:\n${additionalInfo}\n\n`;
    }

    if (documentUrls && documentUrls.length > 0) {
      analysisPrompt += `They have uploaded ${documentUrls.length} document(s) including:\n`;
      documentUrls.forEach((doc: any) => {
        analysisPrompt += `- ${doc.type}: ${doc.filename}\n`;
      });
      analysisPrompt += '\n';
    }

    analysisPrompt += `Based on this information, extract and analyze:

1. **Skills**: What technical and soft skills does this person have?
2. **Strengths**: What are their key strengths and abilities?
3. **Interests**: What topics, industries, or activities interest them?
4. **Values**: What matters to them in their work/career?
5. **Experience Level**: Are they entry-level, early career, mid-career, senior?
6. **Career Goals**: What are they looking for in their next role?
7. **Education**: What is their educational background?
8. **Work Style**: Do they prefer collaboration, independent work, creative work, analytical work, etc?

Format your response as a structured JSON object with these fields:
{
  "skills": ["skill1", "skill2", ...],
  "strengths": ["strength1", "strength2", ...],
  "interests": ["interest1", "interest2", ...],
  "values": ["value1", "value2", ...],
  "experienceLevel": "entry-level|early-career|mid-career|senior",
  "careerGoals": ["goal1", "goal2", ...],
  "education": "brief summary of education",
  "workStyle": "description of work style preferences",
  "bio": "2-3 sentence professional bio summarizing who they are",
  "confidence": 0.0-1.0
}

Only include information you can confidently infer from what was provided. Be honest about confidence level.`;

    console.log('[Analyze] Calling Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    console.log('[Analyze] Claude API call successful');
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('[Analyze] Response length:', responseText.length);

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      console.log('[Analyze] Parsing JSON response...');
      analysis = JSON.parse(jsonStr);
      console.log('[Analyze] Parsed analysis:', Object.keys(analysis));
    } catch (e) {
      console.error('[Analyze] Failed to parse AI response:', responseText.substring(0, 500));
      throw new Error('Failed to parse AI analysis');
    }

    // Store analysis in user_profiles table
    console.log('[Analyze] Storing analysis in database...');
    await sql`
      UPDATE user_profiles
      SET
        skills = ${JSON.stringify(analysis.skills || [])},
        strengths = ${JSON.stringify(analysis.strengths || [])},
        interests = ${JSON.stringify(analysis.interests || [])},
        values = ${JSON.stringify(analysis.values || [])},
        career_goals = ${JSON.stringify(analysis.careerGoals || [])},
        bio = ${analysis.bio || ''},
        linkedin_url = ${linkedInUrl || null},
        updated_at = NOW()
      WHERE user_id = ${session.user.id}
    `;
    console.log('[Analyze] Database updated successfully');

    // Store AI insight
    await sql`
      INSERT INTO ai_insights (user_id, insight, confidence, source, timestamp)
      VALUES (
        ${session.user.id},
        ${`Profile analyzed from uploaded documents. Experience level: ${analysis.experienceLevel}. Work style: ${analysis.workStyle}`},
        ${analysis.confidence || 0.8},
        ${'profile_upload'},
        NOW()
      )
    `;

    // Store document URLs
    if (documentUrls && documentUrls.length > 0) {
      await sql`
        UPDATE user_profiles
        SET uploaded_documents = ${JSON.stringify(documentUrls)}
        WHERE user_id = ${session.user.id}
      `;
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: 'Failed to analyze profile',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
