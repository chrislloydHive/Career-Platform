import { sql } from '@vercel/postgres';

async function listCareers() {
  const result = await sql`
    SELECT id, title, category, user_id, created_at
    FROM career_research
    ORDER BY created_at DESC
    LIMIT 10
  `;

  console.log('Recent careers in database:');
  result.rows.forEach(row => {
    console.log(`  [${row.created_at}] ${row.title} (${row.category}) - User: ${row.user_id}`);
  });

  console.log(`\nTotal: ${result.rows.length} careers`);
}

listCareers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });