import { sql } from '@vercel/postgres';

async function createQuestionnaireTable() {
  console.log('Creating questionnaire_state table...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS questionnaire_state (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        state JSONB NOT NULL,
        insights JSONB DEFAULT '[]'::jsonb,
        synthesized_insights JSONB DEFAULT '[]'::jsonb,
        gaps JSONB DEFAULT '[]'::jsonb,
        authenticity_profile JSONB,
        narrative_insights JSONB DEFAULT '[]'::jsonb,
        confidence_evolutions JSONB DEFAULT '[]'::jsonb,
        last_question_id TEXT,
        completion_percentage INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created questionnaire_state table');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_questionnaire_user_id ON questionnaire_state(user_id)
    `;
    console.log('✓ Created index on user_id');

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

createQuestionnaireTable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });