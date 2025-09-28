import { sql } from '@vercel/postgres';
import fs from 'fs/promises';
import path from 'path';

async function exportProductionCareers() {
  try {
    console.log('Querying production database for career cards...');

    const result = await sql`
      SELECT * FROM career_research
      ORDER BY created_at DESC
    `;

    console.log(`Found ${result.rows.length} career cards in production`);

    const outputDir = path.join(process.cwd(), 'data', 'careers-export');
    await fs.mkdir(outputDir, { recursive: true });

    const careers = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      salaryRange: row.salary_range,
      educationRequired: row.education_required,
      skills: row.skills,
      workLifeBalance: row.work_life_balance,
      jobSecurity: row.job_security,
      growthPotential: row.growth_potential,
      matchScore: row.match_score,
      pros: row.pros,
      cons: row.cons,
      dayInLife: row.day_in_life,
      careerPath: row.career_path,
      companies: row.companies,
      resources: row.resources,
    }));

    const outputPath = path.join(outputDir, 'all-careers.json');
    await fs.writeFile(outputPath, JSON.stringify(careers, null, 2));

    console.log(`✓ Exported ${careers.length} careers to ${outputPath}`);
    console.log('\nSample titles:');
    careers.slice(0, 10).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.title}`);
    });
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}

exportProductionCareers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });