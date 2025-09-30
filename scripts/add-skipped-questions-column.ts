import { sql } from '@vercel/postgres';

async function addSkippedQuestionsColumn() {
  try {
    console.log('Adding skipped_questions column to questionnaire_state table...');

    await sql`
      ALTER TABLE questionnaire_state
      ADD COLUMN IF NOT EXISTS skipped_questions JSONB DEFAULT '[]'::jsonb
    `;

    console.log('✓ Successfully added skipped_questions column');
  } catch (error) {
    console.error('Error adding column:', error);
    throw error;
  }
}

addSkippedQuestionsColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });