import { sql } from '@vercel/postgres';

async function createAiSuggestionsTable() {
  try {
    console.log('Creating ai_career_suggestions table...');

    await sql`
      CREATE TABLE IF NOT EXISTS ai_career_suggestions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        career_title VARCHAR(500) NOT NULL,
        category VARCHAR(255) NOT NULL,
        reasoning TEXT NOT NULL,
        match_score INTEGER NOT NULL,
        discovery_reason TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, career_title)
      )
    `;

    console.log('✓ Table created successfully');

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id
      ON ai_career_suggestions(user_id)
    `;

    console.log('✓ Index created successfully');

  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

createAiSuggestionsTable()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });