import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

async function createLouisa() {
  const email = 'louisa@example.com';
  const password = 'louisa2507$';
  const name = 'Louisa Lloyd';
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = 'louisa';

  await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${userId}, ${email}, ${passwordHash}, ${name})
    ON CONFLICT (email) DO NOTHING
  `;

  const emptyCareerPreferences = {
    whatMatters: [],
    idealRole: '',
    workEnvironment: [],
    dealBreakers: [],
    motivations: [],
    skillsToLeverage: [],
    skillsToGrow: [],
    cultureFit: [],
    workLifeBalance: '',
    compensationPriority: '',
    customNotes: ''
  };

  await sql`
    INSERT INTO user_profiles (
      user_id, name, location, bio,
      education, experience, skills, strengths, interests, values,
      career_goals, preferred_industries, preferred_locations, career_preferences
    ) VALUES (
      ${userId}, ${name}, '', '',
      '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
      '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, ${JSON.stringify(emptyCareerPreferences)}::jsonb
    )
    ON CONFLICT (user_id) DO NOTHING
  `;

  console.log('✓ Created Louisa account');
  console.log('Email:', email);
  console.log('Password:', password);
}

createLouisa()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });