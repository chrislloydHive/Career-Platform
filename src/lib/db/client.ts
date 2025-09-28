import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        bio TEXT,
        linkedin_url TEXT,
        resume_url TEXT,
        education JSONB NOT NULL DEFAULT '[]'::jsonb,
        experience JSONB NOT NULL DEFAULT '[]'::jsonb,
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
        interests JSONB NOT NULL DEFAULT '[]'::jsonb,
        values JSONB NOT NULL DEFAULT '[]'::jsonb,
        career_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
        preferred_industries JSONB NOT NULL DEFAULT '[]'::jsonb,
        preferred_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
        career_preferences JSONB NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS interaction_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        context TEXT NOT NULL,
        ai_learning TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_interaction_user ON interaction_history(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_interaction_timestamp ON interaction_history(timestamp DESC);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS ai_insights (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        insight TEXT NOT NULL,
        confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
        source TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_insights_user ON ai_insights(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON ai_insights(timestamp DESC);
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saved_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        item_type TEXT NOT NULL CHECK (item_type IN ('job', 'career')),
        item_data JSONB NOT NULL,
        notes TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saved_items_type ON saved_items(item_type);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saved_items_saved_at ON saved_items(saved_at DESC);
    `;

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export { sql };