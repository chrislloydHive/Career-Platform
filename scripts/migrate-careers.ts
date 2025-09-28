import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';

async function migrateCareers() {
  console.log('Creating career_research table...');

  await sql`
    CREATE TABLE IF NOT EXISTS career_research (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      salary_range TEXT,
      education_required TEXT,
      skills TEXT[],
      work_life_balance INTEGER,
      job_security INTEGER,
      growth_potential INTEGER,
      match_score INTEGER,
      pros TEXT[],
      cons TEXT[],
      day_in_life TEXT[],
      career_path TEXT[],
      companies TEXT[],
      resources JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('✓ Table created');

  const louisaUserId = 'louisa';
  const careersDir = path.join(process.cwd(), 'data', 'careers');
  const indexPath = path.join(careersDir, 'index.json');

  try {
    const indexContent = await fs.readFile(indexPath, 'utf-8');
    const careerFiles = JSON.parse(indexContent) as string[];

    console.log(`\nMigrating ${careerFiles.length} career files for Louisa...`);

    for (const fileName of careerFiles) {
      const filePath = path.join(careersDir, fileName);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const career = JSON.parse(content);

        await sql`
          INSERT INTO career_research (
            id, user_id, title, description, salary_range, education_required,
            skills, work_life_balance, job_security, growth_potential, match_score,
            pros, cons, day_in_life, career_path, companies, resources
          ) VALUES (
            ${career.id || `career-${Date.now()}`},
            ${louisaUserId},
            ${career.title},
            ${career.description || ''},
            ${career.salaryRange || ''},
            ${career.educationRequired || ''},
            ${career.skills || []},
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

        console.log(`  ✓ Migrated: ${career.title}`);
      } catch (err) {
        console.error(`  ✗ Error migrating ${fileName}:`, err);
      }
    }

    console.log('\n✓ Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

migrateCareers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });