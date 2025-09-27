import { initializeDatabase } from '../src/lib/db/client';
import { migrateFromJSON } from '../src/lib/db/migrate';

async function main() {
  console.log('Initializing database...');

  try {
    await initializeDatabase();
    console.log('✓ Database tables created');

    console.log('\nMigrating data from JSON files...');
    const result = await migrateFromJSON();
    console.log(`✓ ${result.message}`);

    console.log('\nDatabase setup complete!');
  } catch (error) {
    console.error('✗ Database setup failed:', error);
    process.exit(1);
  }
}

main();