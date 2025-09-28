import { sql } from '@vercel/postgres';

async function addCategoryColumn() {
  console.log('Adding category column to career_research table...');

  await sql`
    ALTER TABLE career_research
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'business'
  `;

  console.log('✓ Category column added');

  console.log('\nUpdating categories based on career data...');

  const categoryMapping = {
    'Registered Nurse': 'healthcare',
    'Medical Assistant': 'healthcare',
    'Frontend Software Engineer': 'tech',
    'Backend Software Engineer': 'tech',
    'Full Stack Software Engineer': 'tech',
    'Data Scientist': 'tech',
    'DevOps Engineer': 'tech',
    'Product Manager': 'tech',
    'UX/UI Designer': 'design',
    'Digital Marketing Manager': 'marketing',
    'Content Marketing Specialist': 'marketing',
    'Social Media Manager': 'marketing',
    'SEO Specialist': 'marketing',
    'Marketing Analyst': 'marketing',
    'Brand Marketing Manager': 'marketing',
    'Digital Marketing Coordinator': 'marketing',
    'Financial Analyst': 'finance',
    'Accountant': 'finance',
    'Financial Advisor': 'finance',
    'Investment Banker': 'finance',
    'Controller': 'finance',
    'Wellness Coordinator': 'wellness',
    'Corporate Wellness Specialist': 'wellness',
    'Fitness Program Manager': 'wellness',
    'Health Coach': 'wellness',
    'Recreational Therapist': 'wellness',
    'Wellness Center Director': 'wellness',
    'Fitness Marketing Specialist': 'wellness',
    'Sports Performance Analyst': 'wellness',
    'Graphic Designer': 'design',
    'Visual Merchandiser': 'design',
    'Brand Designer': 'design',
    'Marketing Designer': 'design',
    'Creative Director': 'design',
  };

  for (const [title, category] of Object.entries(categoryMapping)) {
    await sql`
      UPDATE career_research
      SET category = ${category}
      WHERE title = ${title}
    `;
    console.log(`  ✓ Updated ${title} -> ${category}`);
  }

  console.log('\n✓ All categories updated');
}

addCategoryColumn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });