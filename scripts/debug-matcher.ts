import { sql } from '@vercel/postgres';

async function debugMatcher() {
  try {
    const userId = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70';

    const questionnaire = await sql`
      SELECT * FROM questionnaire_state
      WHERE user_id = ${userId}
    `;

    if (questionnaire.rows.length > 0) {
      const state = questionnaire.rows[0].state;
      const insights = questionnaire.rows[0].insights;

      console.log('=== QUESTIONNAIRE STATE ===');
      console.log('Responses count:', Object.keys(state.responses || {}).length);
      console.log('Asked questions:', state.askedQuestions?.length || 0);
      console.log('Insights count:', insights?.length || 0);
      console.log('\nInsights:', JSON.stringify(insights, null, 2));
      console.log('\nSample responses:', Object.keys(state.responses || {}).slice(0, 5));
    } else {
      console.log('No questionnaire state found');
    }

    const careers = await sql`
      SELECT title FROM career_research
      WHERE user_id = ${userId}
    `;
    console.log('\n=== USER CAREERS ===');
    console.log('Career count:', careers.rows.length);
    console.log('Careers:', careers.rows.map(r => r.title));

  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugMatcher()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });