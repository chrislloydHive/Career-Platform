import { sql } from '@vercel/postgres';

async function addActiveTabColumn() {
  try {
    await sql`
      ALTER TABLE career_research
      ADD COLUMN IF NOT EXISTS active_tab text DEFAULT 'overview'
    `;
    console.log('Successfully added active_tab column');
  } catch (error) {
    console.error('Error adding active_tab column:', error);
    throw error;
  }
}

addActiveTabColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });