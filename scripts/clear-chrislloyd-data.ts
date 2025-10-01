import { sql } from '@vercel/postgres';

async function clearChrisLloydData() {
  try {
    console.log('Finding chrislloyd user accounts...');

    // Find all chrislloyd users
    const usersResult = await sql`
      SELECT id, email, name FROM users
      WHERE email LIKE '%chrislloyd%' OR name LIKE '%chris%lloyd%'
    `;

    console.log(`Found ${usersResult.rows.length} user(s):`, usersResult.rows);

    if (usersResult.rows.length === 0) {
      console.log('No chrislloyd users found.');
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

    // Delete the users themselves (this one must exist)
    const deleteUsersResult = await sql`
      DELETE FROM users WHERE id = ANY(${userIds})
    `;
    console.log(`✓ Deleted ${deleteUsersResult.rowCount} users`);

    console.log('\n✅ All chrislloyd data cleared successfully!');
    console.log('\nNext steps:');
    console.log('1. Clear browser cache and cookies for localhost:3000');
    console.log('2. Close and reopen your browser');
    console.log('3. Navigate to the site and sign up fresh');

  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}

clearChrisLloydData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
