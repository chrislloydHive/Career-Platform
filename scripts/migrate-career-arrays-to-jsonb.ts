import { sql } from '@vercel/postgres';

async function migrateArraysToJsonb() {
  try {
    const columns = [
      'skills', 'pros', 'cons', 'day_in_life', 'career_path',
      'companies', 'alternative_titles', 'related_roles', 'keywords'
    ];

    for (const col of columns) {
      console.log(`Converting ${col} to jsonb...`);

      await sql.query(`
        ALTER TABLE career_research
        ALTER COLUMN ${col} DROP DEFAULT
      `);

      await sql.query(`
        ALTER TABLE career_research
        ALTER COLUMN ${col} TYPE jsonb USING to_jsonb(${col})
      `);

      await sql.query(`
        ALTER TABLE career_research
        ALTER COLUMN ${col} SET DEFAULT '[]'::jsonb
      `);
    }

    console.log('✓ Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

migrateArraysToJsonb()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });