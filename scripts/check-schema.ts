import { sql } from '@vercel/postgres';

async function checkSchema() {
  const result = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'career_research'
    ORDER BY ordinal_position
  `;

  console.log('career_research table columns:');
  result.rows.forEach(row => {
    console.log(`  ${row.column_name}: ${row.data_type}`);
  });
}

checkSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });