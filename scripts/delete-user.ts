import { sql } from '@vercel/postgres';

async function deleteUser() {
  const userId = '69b69651-1d3a-439c-ba37-5c9199365ac9';

  await sql`DELETE FROM users WHERE id = ${userId}`;

  console.log('✓ Deleted user and all associated data');
}

deleteUser().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});