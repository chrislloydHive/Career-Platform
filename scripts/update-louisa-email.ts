import { sql } from '@vercel/postgres';

async function updateLouisaEmail() {
  const oldEmail = 'louisa@example.com';
  const newEmail = 'louisaklloyd@gmail.com';

  console.log(`Updating Louisa's email from ${oldEmail} to ${newEmail}...`);

  await sql`
    UPDATE users
    SET email = ${newEmail}
    WHERE email = ${oldEmail}
  `;

  console.log('✓ Email updated successfully');
}

updateLouisaEmail()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });