import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { generateCareerSuggestions } from '@/lib/ai/career-suggestions-ai';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { responses, insights, currentMatches, responseCount } = await request.json();

    console.log('[Career Suggestions] Generating suggestions for user:', session.user.id);
    console.log('[Career Suggestions] Response count:', responseCount);

    const suggestions = await generateCareerSuggestions(
      responses,
      insights,
      currentMatches,
      responseCount
    );

    console.log('[Career Suggestions] Generated', suggestions.length, 'suggestions');

    // Store suggestions in database
    if (suggestions.length > 0) {
      for (const suggestion of suggestions) {
        try {
          await sql`
            INSERT INTO ai_career_suggestions (
              user_id,
              career_title,
              category,
              reasoning,
              match_score,
              discovery_reason,
              created_at
            ) VALUES (
              ${session.user.id},
              ${suggestion.title},
              ${suggestion.category},
              ${suggestion.reasoning},
              ${suggestion.matchScore},
              ${suggestion.discoveryReason},
              NOW()
            )
            ON CONFLICT (user_id, career_title) DO UPDATE SET
              reasoning = ${suggestion.reasoning},
              match_score = ${suggestion.matchScore},
              discovery_reason = ${suggestion.discoveryReason},
              created_at = NOW()
          `;
        } catch (dbError) {
          console.error('[Career Suggestions] Failed to save suggestion:', dbError);
        }
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[Career Suggestions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate career suggestions' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT
        career_title,
        category,
        reasoning,
        match_score,
        discovery_reason,
        created_at
      FROM ai_career_suggestions
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    const suggestions = result.rows.map(row => ({
      title: row.career_title,
      category: row.category,
      reasoning: row.reasoning,
      matchScore: row.match_score,
      discoveryReason: row.discovery_reason,
      createdAt: row.created_at,
      isAiSuggested: true,
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('[Career Suggestions] Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career suggestions' },
      { status: 500 }
    );
  }
}
