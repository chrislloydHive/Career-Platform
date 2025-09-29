import { sql } from '@vercel/postgres';

async function checkLatestAssessment() {
  try {
    const result = await sql`
      SELECT
        id,
        title,
        description,
        completion_percentage,
        saved_at,
        created_at,
        insights,
        synthesized_insights,
        narrative_insights,
        authenticity_profile,
        patterns,
        analysis
      FROM assessment_results
      WHERE user_id = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70'
      ORDER BY saved_at DESC
      LIMIT 1
    `;

    console.log('Latest assessment data:');
    console.log('ID:', result.rows[0]?.id);
    console.log('Title:', result.rows[0]?.title);
    console.log('Completion:', result.rows[0]?.completion_percentage);
    console.log('Has insights:', Boolean(result.rows[0]?.insights));
    console.log('Has synthesized_insights:', Boolean(result.rows[0]?.synthesized_insights));
    console.log('Has narrative_insights:', Boolean(result.rows[0]?.narrative_insights));
    console.log('Has authenticity_profile:', Boolean(result.rows[0]?.authenticity_profile));
    console.log('Has patterns:', Boolean(result.rows[0]?.patterns));
    console.log('Has analysis:', Boolean(result.rows[0]?.analysis));

    if (result.rows[0]?.insights) {
      const insights = typeof result.rows[0].insights === 'string'
        ? JSON.parse(result.rows[0].insights)
        : result.rows[0].insights;
      console.log('Insights length:', Array.isArray(insights) ? insights.length : 'Not array');
      if (Array.isArray(insights) && insights.length > 0) {
        console.log('First insight sample:', JSON.stringify(insights[0]).substring(0, 200) + '...');
      }
    }

    if (result.rows[0]?.narrative_insights) {
      const narrativeInsights = typeof result.rows[0].narrative_insights === 'string'
        ? JSON.parse(result.rows[0].narrative_insights)
        : result.rows[0].narrative_insights;
      console.log('Narrative insights length:', Array.isArray(narrativeInsights) ? narrativeInsights.length : 'Not array');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLatestAssessment();