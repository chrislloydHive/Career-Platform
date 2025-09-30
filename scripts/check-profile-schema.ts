import { sql } from '@vercel/postgres';

async function checkSchema() {
  try {
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      ORDER BY ordinal_position
    `;
    console.log('user_profiles columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
