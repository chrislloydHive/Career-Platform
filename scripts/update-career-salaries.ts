import { sql } from '@vercel/postgres';
import { careerResearchAI } from '../src/lib/ai/career-research-ai';

async function updateCareerSalaries() {
  console.log('Fetching existing careers...');

  const result = await sql`
    SELECT id, title, description, category, user_id
    FROM career_research
    WHERE user_id = 'aa72f0f3-fd33-45db-847b-2a6be7b8af70'
    ORDER BY created_at DESC
  `;

  console.log(`Found ${result.rows.length} careers to update\n`);

  for (const row of result.rows) {
    console.log(`Updating: ${row.title}...`);

    try {
      const enhancedCareer = await careerResearchAI.generateCareerProfile(
        row.title,
        row.description || '',
        'Generate complete salary ranges and career progression data'
      );

      const salaryRange = enhancedCareer.salaryRanges?.[0]
        ? `$${enhancedCareer.salaryRanges[0].min.toLocaleString()} - $${enhancedCareer.salaryRanges[0].max.toLocaleString()}`
        : '';

      await sql`
        UPDATE career_research
        SET
          skills = ${enhancedCareer.requiredSkills?.map(s => s.skill) || []},
          day_in_life = ${enhancedCareer.dailyTasks?.map(t => t.task) || []},
          career_path = ${enhancedCareer.careerProgression?.map(cp => cp.title) || []},
          salary_range = ${salaryRange},
          salary_ranges = ${JSON.stringify(enhancedCareer.salaryRanges || [])},
          career_progression = ${JSON.stringify(enhancedCareer.careerProgression || [])}
        WHERE id = ${row.id}
      `;

      console.log(`  ✓ Updated ${row.title}`);
      console.log(`    Salary ranges: ${enhancedCareer.salaryRanges?.length || 0} levels`);
      console.log(`    Career progression: ${enhancedCareer.careerProgression?.length || 0} levels`);
      if (enhancedCareer.salaryRanges && enhancedCareer.salaryRanges.length > 0) {
        enhancedCareer.salaryRanges.forEach(range => {
          console.log(`      ${range.experienceLevel}: $${range.min.toLocaleString()} - $${range.max.toLocaleString()}`);
        });
      }
      console.log('');

    } catch (error) {
      console.error(`  ✗ Failed to update ${row.title}:`, error);
    }
  }

  console.log('Done!');
}

updateCareerSalaries()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });