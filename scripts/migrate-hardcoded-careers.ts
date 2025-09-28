import { sql } from '@vercel/postgres';
import { careerResearchService } from '../src/lib/career-research/career-service';

async function migrateHardcodedCareers() {
  const louisaUserId = 'louisa';

  console.log('Fetching all hardcoded careers...');
  const careers = careerResearchService.getAllCareers();
  console.log(`Found ${careers.length} hardcoded careers`);

  console.log('\nMigrating to Louisa\'s account...');

  let successCount = 0;
  let skipCount = 0;

  for (const career of careers) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = career as any;
      await sql`
        INSERT INTO career_research (
          id, user_id, title, description, salary_range, education_required,
          skills, work_life_balance, job_security, growth_potential, match_score,
          pros, cons, day_in_life, career_path, companies, resources
        ) VALUES (
          ${c.id},
          ${louisaUserId},
          ${c.title},
          ${c.description || ''},
          ${c.salaryRanges?.[0] ? `$${c.salaryRanges[0].min.toLocaleString()} - $${c.salaryRanges[0].max.toLocaleString()}` : ''},
          ${''},
          ${JSON.stringify(c.requiredSkills?.map((s: { skill: string }) => s.skill) || [])},
          ${c.workLifeBalance || 0},
          ${c.jobSecurity || 0},
          ${c.growthPotential || 0},
          ${c.matchScore || 0},
          ${JSON.stringify(c.pros || [])},
          ${JSON.stringify(c.cons || [])},
          ${JSON.stringify(c.dayInLife || [])},
          ${JSON.stringify(c.careerPath || [])},
          ${JSON.stringify(c.companies || [])},
          ${JSON.stringify(c.resources || {})}
        )
        ON CONFLICT (id) DO NOTHING
      `;

      successCount++;
      console.log(`  ✓ ${career.title}`);
    } catch (err) {
      skipCount++;
      console.log(`  ⊘ ${career.title} (already exists)`);
    }
  }

  console.log(`\n✓ Migration complete!`);
  console.log(`  ${successCount} careers migrated`);
  console.log(`  ${skipCount} careers skipped (already existed)`);
}

migrateHardcodedCareers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });