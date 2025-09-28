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
      await sql`
        INSERT INTO career_research (
          id, user_id, title, description, salary_range, education_required,
          skills, work_life_balance, job_security, growth_potential, match_score,
          pros, cons, day_in_life, career_path, companies, resources
        ) VALUES (
          ${career.id},
          ${louisaUserId},
          ${career.title},
          ${career.description || ''},
          ${career.salaryRanges?.[0] ? `$${career.salaryRanges[0].min.toLocaleString()} - $${career.salaryRanges[0].max.toLocaleString()}` : ''},
          ${career.educationRequired || ''},
          ${career.requiredSkills?.map(s => s.skill) || []},
          ${career.workLifeBalance || 0},
          ${career.jobSecurity || 0},
          ${career.growthPotential || 0},
          ${career.matchScore || 0},
          ${career.pros || []},
          ${career.cons || []},
          ${career.dayInLife || []},
          ${career.careerPath || []},
          ${career.companies || []},
          ${JSON.stringify(career.resources || {})}
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