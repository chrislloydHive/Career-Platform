import { sql } from '@vercel/postgres';

async function listAllUsers() {
  try {
    const result = await sql`
      SELECT id, email, name, created_at FROM users
      ORDER BY created_at DESC
    `;

    console.log(`Found ${result.rows.length} total users:\n`);
    result.rows.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} (${user.name}) - Created: ${user.created_at}`);
      console.log(`   ID: ${user.id}\n`);
    });

  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}

listAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
