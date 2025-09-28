import { sql } from '@vercel/postgres';

async function addCareerDataColumns() {
  console.log('Adding salary_ranges and career_progression columns...');

  try {
    await sql`
      ALTER TABLE career_research
      ADD COLUMN IF NOT EXISTS salary_ranges JSONB DEFAULT '[]'::jsonb
    `;
    console.log('  ✓ Added salary_ranges column');

    await sql`
      ALTER TABLE career_research
      ADD COLUMN IF NOT EXISTS career_progression JSONB DEFAULT '[]'::jsonb
    `;
    console.log('  ✓ Added career_progression column');

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

addCareerDataColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });