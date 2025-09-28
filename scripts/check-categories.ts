import { sql } from '@vercel/postgres';

async function checkCategories() {
  const result = await sql`
    SELECT DISTINCT category FROM career_research WHERE category IS NOT NULL ORDER BY category
  `;

  console.log('Categories in database:');
  result.rows.forEach(row => {
    console.log(`  - ${row.category}`);
  });
}

checkCategories()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });