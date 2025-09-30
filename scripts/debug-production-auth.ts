import { sql } from '@vercel/postgres';

async function debugProductionAuth() {
  console.log('=== Users Table ===');
  const users = await sql`
    SELECT id, email, name, created_at FROM users ORDER BY created_at DESC
  `;
  console.log(`Found ${users.rows.length} users:`);
  users.rows.forEach(user => {
    console.log(`- ${user.email} (${user.name})`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Created: ${user.created_at}`);
  });

  console.log('\n=== Assessment Results by User ===');
  for (const user of users.rows) {
    const assessments = await sql`
      SELECT id, title, saved_at FROM assessment_results WHERE user_id = ${user.id}
    `;
    console.log(`\n${user.email}:`);
    console.log(`  User ID: ${user.id}`);
    console.log(`  Assessments: ${assessments.rows.length}`);
    assessments.rows.forEach(a => {
      console.log(`    - ${a.title} (saved: ${a.saved_at})`);
    });
  }

  console.log('\n=== All Assessment Results (with user_id) ===');
  const allAssessments = await sql`
    SELECT id, user_id, title, saved_at FROM assessment_results ORDER BY saved_at DESC
  `;
  console.log(`Found ${allAssessments.rows.length} total assessments:`);
  allAssessments.rows.forEach(a => {
    console.log(`- ${a.title}`);
    console.log(`  User ID: ${a.user_id}`);
    console.log(`  Saved: ${a.saved_at}`);
  });
}

debugProductionAuth()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });