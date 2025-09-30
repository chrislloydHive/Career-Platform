import { sql } from '@vercel/postgres';

async function addUploadedDocumentsColumn() {
  try {
    console.log('Adding uploaded_documents column to user_profiles table...');

    await sql`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS uploaded_documents JSONB DEFAULT '[]'::jsonb
    `;

    console.log('✅ Successfully added uploaded_documents column');

    // Verify the column was added
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user_profiles'
      AND column_name = 'uploaded_documents'
    `;

    console.log('Column details:', result.rows);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

addUploadedDocumentsColumn();
