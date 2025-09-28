import { sql } from '@vercel/postgres';

async function checkUser() {
  const result = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE email = 'chrislloyd@hive8.us'
  `;

  console.log('Users found:', result.rows.length);
  console.log(JSON.stringify(result.rows, null, 2));
}

checkUser().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});