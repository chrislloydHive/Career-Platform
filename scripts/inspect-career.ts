import { sql } from '@vercel/postgres';

async function inspectCareer() {
  const result = await sql`
    SELECT * FROM career_research
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.rows.length === 0) {
    console.log('No careers found');
    return;
  }

  const career = result.rows[0];
  console.log('Most recent career:');
  console.log('Title:', career.title);
  console.log('Category:', career.category);
  console.log('Description:', career.description);
  console.log('\nDaily tasks (day_in_life):', career.day_in_life);
  console.log('\nSkills:', career.skills);
  console.log('\nSalary ranges (jsonb):', JSON.stringify(career.salary_ranges, null, 2));
  console.log('\nCareer progression (jsonb):', JSON.stringify(career.career_progression, null, 2));
  console.log('\nEducation required:', career.education_required);
}

inspectCareer()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });