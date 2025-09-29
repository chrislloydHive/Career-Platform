import { sql } from '@vercel/postgres';

async function addCareerRecommendationsColumn() {
  console.log('Adding career_recommendations column to assessment_results table...');

  try {
    await sql`
      ALTER TABLE assessment_results
      ADD COLUMN IF NOT EXISTS career_recommendations JSONB DEFAULT '[]'::jsonb
    `;
    console.log('✓ Added career_recommendations column');

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

addCareerRecommendationsColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });