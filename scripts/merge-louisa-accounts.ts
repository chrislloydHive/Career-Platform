import { sql } from '@vercel/postgres';

async function mergeLouisaAccounts() {
  const oldUserId = 'louisa';
  const newUserId = '0ae88d29-c436-482e-ae31-e4e9a4d8b955';

  console.log('Transferring careers from louisa@example.com to louisaklloyd@gmail.com...');

  await sql`
    UPDATE career_research
    SET user_id = ${newUserId}
    WHERE user_id = ${oldUserId}
  `;

  const count = await sql`
    SELECT COUNT(*) as count FROM career_research WHERE user_id = ${newUserId}
  `;

  console.log(`✓ Transferred careers: ${count.rows[0].count}`);

  console.log('Deleting old louisa@example.com account...');

  await sql`
    DELETE FROM user_profiles WHERE user_id = ${oldUserId}
  `;

  await sql`
    DELETE FROM users WHERE id = ${oldUserId}
  `;

  console.log('✓ Old account deleted');
}

mergeLouisaAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });