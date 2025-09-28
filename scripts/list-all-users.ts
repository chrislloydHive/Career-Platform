import { sql } from '@vercel/postgres';

async function listAllUsers() {
  const users = await sql`
    SELECT id, email, name, created_at FROM users ORDER BY created_at DESC
  `;

  console.log(`Found ${users.rows.length} users:`);
  users.rows.forEach(user => {
    console.log(`- ${user.email} (${user.name}) [ID: ${user.id}]`);
  });

  for (const user of users.rows) {
    const careers = await sql`
      SELECT COUNT(*) as count FROM career_research WHERE user_id = ${user.id}
    `;
    console.log(`  Careers: ${careers.rows[0].count}`);
  }
}

listAllUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });