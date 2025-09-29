import { sql } from '@vercel/postgres';

async function debugAssessmentDisplay() {
  try {
    // Get the latest assessment
    const result = await sql`
      SELECT
        id,
        title,
        insights,
        synthesized_insights,
        narrative_insights,
        saved_at,
        created_at
      FROM assessment_results
      WHERE user_id = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70'
      ORDER BY saved_at DESC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      console.log('No assessments found');
      return;
    }

    const assessment = result.rows[0];
    console.log('=== ASSESSMENT DATABASE DATA ===');
    console.log('ID:', assessment.id);
    console.log('Title:', assessment.title);
    console.log('Saved at:', assessment.saved_at);
    console.log('Created at:', assessment.created_at);

    console.log('\n=== INSIGHTS FIELD ===');
    console.log('Raw insights type:', typeof assessment.insights);
    console.log('Raw insights value:', assessment.insights);

    if (assessment.insights) {
      let parsedInsights;
      try {
        parsedInsights = typeof assessment.insights === 'string'
          ? JSON.parse(assessment.insights)
          : assessment.insights;
        console.log('Parsed insights:', JSON.stringify(parsedInsights, null, 2));

        if (Array.isArray(parsedInsights)) {
          console.log('Insights count:', parsedInsights.length);
          parsedInsights.forEach((insight, i) => {
            console.log(`Insight ${i + 1}:`, insight);
          });
        }
      } catch (e) {
        console.log('Error parsing insights:', e);
      }
    }

    console.log('\n=== SYNTHESIZED INSIGHTS FIELD ===');
    console.log('Raw synthesized_insights type:', typeof assessment.synthesized_insights);
    console.log('Raw synthesized_insights value:', assessment.synthesized_insights);

    if (assessment.synthesized_insights) {
      let parsedSynthesized;
      try {
        parsedSynthesized = typeof assessment.synthesized_insights === 'string'
          ? JSON.parse(assessment.synthesized_insights)
          : assessment.synthesized_insights;
        console.log('Parsed synthesized insights:', JSON.stringify(parsedSynthesized, null, 2));
      } catch (e) {
        console.log('Error parsing synthesized insights:', e);
      }
    }

    console.log('\n=== NARRATIVE INSIGHTS FIELD ===');
    console.log('Raw narrative_insights type:', typeof assessment.narrative_insights);
    if (assessment.narrative_insights) {
      let parsedNarrative;
      try {
        parsedNarrative = typeof assessment.narrative_insights === 'string'
          ? JSON.parse(assessment.narrative_insights)
          : assessment.narrative_insights;
        console.log('Parsed narrative insights:', JSON.stringify(parsedNarrative, null, 2));
      } catch (e) {
        console.log('Error parsing narrative insights:', e);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugAssessmentDisplay();