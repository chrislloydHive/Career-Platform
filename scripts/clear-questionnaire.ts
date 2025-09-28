import { sql } from '@vercel/postgres';

async function clearQuestionnaire() {
  try {
    const userId = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70';

    await sql`
      DELETE FROM questionnaire_state
      WHERE user_id = ${userId}
    `;

    console.log('✓ Cleared questionnaire state for Chris Lloyd');
  } catch (error) {
    console.error('Failed to clear questionnaire:', error);
  }
}

clearQuestionnaire()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });