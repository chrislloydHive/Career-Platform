import { sql } from '@vercel/postgres';

async function clearUserByEmail(email: string) {
  try {
    console.log(`Finding user with email: ${email}...`);

    // Find the user
    const usersResult = await sql`
      SELECT id, email, name FROM users
      WHERE email = ${email}
    `;

    console.log(`Found ${usersResult.rows.length} user(s):`, usersResult.rows);

    if (usersResult.rows.length === 0) {
      console.log('No user found with that email.');
      return;
    }

    const userIds = usersResult.rows.map(u => u.id);

    // Delete all related data for these users
    console.log('\nDeleting user data...');

    const tryDelete = async (tableName: string, query: () => Promise<any>) => {
      try {
        const result = await query();
        console.log(`✓ Deleted ${result.rowCount} ${tableName}`);
      } catch (error: any) {
        if (error.code === '42P01') {
          console.log(`✓ Skipped ${tableName} (table does not exist)`);
        } else {
          throw error;
        }
      }
    };

    await tryDelete('saved items', () => sql`DELETE FROM saved_items WHERE user_id = ANY(${userIds})`);
    await tryDelete('assessment results', () => sql`DELETE FROM assessment_results WHERE user_id = ANY(${userIds})`);
    await tryDelete('career research', () => sql`DELETE FROM career_research WHERE user_id = ANY(${userIds})`);
    await tryDelete('AI suggestions', () => sql`DELETE FROM ai_suggestions WHERE user_id = ANY(${userIds})`);
    await tryDelete('questionnaire responses', () => sql`DELETE FROM questionnaire_responses WHERE user_id = ANY(${userIds})`);
    await tryDelete('user profiles', () => sql`DELETE FROM user_profiles WHERE user_id = ANY(${userIds})`);
    await tryDelete('sessions', () => sql`DELETE FROM sessions WHERE user_id = ANY(${userIds})`);
    await tryDelete('accounts', () => sql`DELETE FROM accounts WHERE user_id = ANY(${userIds})`);

    // Delete the users themselves
    const deleteUsersResult = await sql`
      DELETE FROM users WHERE id = ANY(${userIds})
    `;
    console.log(`✓ Deleted ${deleteUsersResult.rowCount} users`);

    console.log('\n✅ User data cleared successfully!');

  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as argument');
  process.exit(1);
}

clearUserByEmail(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
