import { sql } from '@vercel/postgres';

async function addMissingColumns() {
  try {
    await sql`
      ALTER TABLE career_research
      ADD COLUMN IF NOT EXISTS alternative_titles text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS daily_tasks jsonb DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS industry_insights jsonb DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS work_environment jsonb DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS job_outlook jsonb DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS related_roles text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}'
    `;
    console.log('Successfully added missing columns');
  } catch (error) {
    console.error('Error adding columns:', error);
    throw error;
  }
}

addMissingColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });