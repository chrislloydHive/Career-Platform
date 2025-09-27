import { sql } from './client';
import { UserProfile } from '@/types/user-profile';
import { SavedItemsCollection } from '@/types/saved-items';
import fs from 'fs/promises';
import path from 'path';

export async function migrateFromJSON() {
  try {
    const profilePath = path.join(process.cwd(), 'data', 'user-profile.json');
    const data = await fs.readFile(profilePath, 'utf-8');
    const profile: UserProfile = JSON.parse(data);

    const existing = await sql`
      SELECT user_id FROM user_profiles WHERE user_id = 'louisa'
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE user_profiles SET
          name = ${profile.name},
          location = ${profile.location},
          bio = ${profile.bio},
          linkedin_url = ${profile.linkedInUrl || null},
          resume_url = ${profile.resumeUrl || null},
          education = ${JSON.stringify(profile.education)},
          experience = ${JSON.stringify(profile.experience)},
          skills = ${JSON.stringify(profile.skills)},
          strengths = ${JSON.stringify(profile.strengths)},
          interests = ${JSON.stringify(profile.interests)},
          values = ${JSON.stringify(profile.values)},
          career_goals = ${JSON.stringify(profile.careerGoals)},
          preferred_industries = ${JSON.stringify(profile.preferredIndustries)},
          preferred_locations = ${JSON.stringify(profile.preferredLocations)},
          career_preferences = ${JSON.stringify(profile.careerPreferences)},
          last_updated = ${new Date(profile.lastUpdated)}
        WHERE user_id = 'louisa'
      `;
      console.log('Updated existing profile');
    } else {
      await sql`
        INSERT INTO user_profiles (
          user_id, name, location, bio, linkedin_url, resume_url,
          education, experience, skills, strengths, interests, values,
          career_goals, preferred_industries, preferred_locations,
          career_preferences, last_updated, created_at
        ) VALUES (
          'louisa',
          ${profile.name},
          ${profile.location},
          ${profile.bio},
          ${profile.linkedInUrl || null},
          ${profile.resumeUrl || null},
          ${JSON.stringify(profile.education)},
          ${JSON.stringify(profile.experience)},
          ${JSON.stringify(profile.skills)},
          ${JSON.stringify(profile.strengths)},
          ${JSON.stringify(profile.interests)},
          ${JSON.stringify(profile.values)},
          ${JSON.stringify(profile.careerGoals)},
          ${JSON.stringify(profile.preferredIndustries)},
          ${JSON.stringify(profile.preferredLocations)},
          ${JSON.stringify(profile.careerPreferences)},
          ${new Date(profile.lastUpdated)},
          CURRENT_TIMESTAMP
        )
      `;
      console.log('Created new profile');
    }

    if (profile.interactionHistory && profile.interactionHistory.length > 0) {
      await sql`DELETE FROM interaction_history WHERE user_id = 'louisa'`;

      for (const interaction of profile.interactionHistory) {
        await sql`
          INSERT INTO interaction_history (user_id, action, context, ai_learning, timestamp)
          VALUES (
            'louisa',
            ${interaction.action},
            ${interaction.context},
            ${interaction.aiLearning || null},
            ${new Date(interaction.timestamp)}
          )
        `;
      }
      console.log(`Migrated ${profile.interactionHistory.length} interactions`);
    }

    if (profile.aiInsights && profile.aiInsights.length > 0) {
      await sql`DELETE FROM ai_insights WHERE user_id = 'louisa'`;

      for (const insight of profile.aiInsights) {
        await sql`
          INSERT INTO ai_insights (user_id, insight, confidence, source, timestamp)
          VALUES (
            'louisa',
            ${insight.insight},
            ${insight.confidence},
            ${insight.source},
            ${new Date(insight.timestamp)}
          )
        `;
      }
      console.log(`Migrated ${profile.aiInsights.length} AI insights`);
    }

    try {
      const savedItemsPath = path.join(process.cwd(), 'data', 'saved-items.json');
      const savedItemsData = await fs.readFile(savedItemsPath, 'utf-8');
      const savedItemsCollection: SavedItemsCollection = JSON.parse(savedItemsData);

      await sql`DELETE FROM saved_items WHERE user_id = 'louisa'`;

      for (const item of savedItemsCollection.items) {
        await sql`
          INSERT INTO saved_items (id, user_id, item_type, item_data, notes, tags, saved_at, last_modified)
          VALUES (
            ${item.id},
            'louisa',
            ${item.type},
            ${JSON.stringify(item.type === 'job' ? item.job : item.career)},
            ${item.notes || null},
            ${JSON.stringify(item.tags || [])},
            ${new Date(item.savedAt)},
            ${new Date(savedItemsCollection.lastModified)}
          )
        `;
      }
      console.log(`Migrated ${savedItemsCollection.items.length} saved items`);
    } catch (error) {
      console.log('No saved items to migrate or error:', error);
    }

    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}