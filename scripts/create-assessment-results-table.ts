import { sql } from '@vercel/postgres';

async function createAssessmentResultsTable() {
  console.log('Creating assessment_results table...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        questionnaire_state JSONB NOT NULL,
        insights JSONB DEFAULT '[]'::jsonb,
        synthesized_insights JSONB DEFAULT '[]'::jsonb,
        gaps JSONB DEFAULT '[]'::jsonb,
        authenticity_profile JSONB,
        narrative_insights JSONB DEFAULT '[]'::jsonb,
        confidence_evolutions JSONB DEFAULT '[]'::jsonb,
        patterns JSONB DEFAULT '{}'::jsonb,
        analysis JSONB DEFAULT '{}'::jsonb,
        top_careers JSONB DEFAULT '[]'::jsonb,
        completion_percentage INTEGER DEFAULT 0,
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created assessment_results table');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id)
    `;
    console.log('✓ Created index on user_id');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_assessment_results_saved_at ON assessment_results(saved_at DESC)
    `;
    console.log('✓ Created index on saved_at');

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

createAssessmentResultsTable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });