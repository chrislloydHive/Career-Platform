-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL DEFAULT 'louisa',
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Interaction History Table
CREATE TABLE IF NOT EXISTS interaction_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'louisa',
  action TEXT NOT NULL,
  context TEXT NOT NULL,
  ai_learning TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interaction_user ON interaction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_timestamp ON interaction_history(timestamp DESC);

-- AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'louisa',
  insight TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  source TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_insights_user ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON ai_insights(timestamp DESC);

-- Self Discovery Sessions Table (for adaptive questionnaire)
CREATE TABLE IF NOT EXISTS discovery_sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'louisa',
  session_data JSONB NOT NULL,
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_discovery_user ON discovery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_completed ON discovery_sessions(completed_at DESC);

-- Saved Items Table (for saved jobs and careers)
CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'louisa',
  item_type TEXT NOT NULL CHECK (item_type IN ('job', 'career')),
  item_data JSONB NOT NULL,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_type ON saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_saved_items_saved_at ON saved_items(saved_at DESC);