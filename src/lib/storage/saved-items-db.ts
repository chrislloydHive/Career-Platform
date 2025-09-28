import { sql } from '../db/client';
import { SavedItem, SavedJob, SavedCareer } from '@/types/saved-items';
import { ScoredJob, JobCategory } from '@/types';
import { auth } from '@/lib/auth/config';

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

export async function getSavedItems(): Promise<SavedItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  try {
    const result = await sql`
      SELECT * FROM saved_items WHERE user_id = ${userId}
      ORDER BY saved_at DESC
    `;

    return result.rows.map(row => {
      const baseItem = {
        id: row.id,
        savedAt: new Date(row.saved_at),
        notes: row.notes,
        tags: row.tags,
      };

      if (row.item_type === 'job') {
        return {
          ...baseItem,
          type: 'job' as const,
          job: row.item_data as ScoredJob,
        };
      } else {
        return {
          ...baseItem,
          type: 'career' as const,
          career: row.item_data as JobCategory,
        };
      }
    });
  } catch (error) {
    console.error('Error fetching saved items from database:', error);
    return [];
  }
}

export async function saveJob(job: ScoredJob, notes?: string, tags?: string[]): Promise<SavedJob> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  try {
    const itemId = `job-${job.id}`;
    const savedAt = new Date();

    const existing = await sql`
      SELECT id FROM saved_items WHERE id = ${itemId} AND user_id = ${userId}
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE saved_items SET
          item_data = ${JSON.stringify(job)},
          notes = ${notes || null},
          tags = ${JSON.stringify(tags || [])},
          last_modified = CURRENT_TIMESTAMP
        WHERE id = ${itemId} AND user_id = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO saved_items (id, user_id, item_type, item_data, notes, tags, saved_at)
        VALUES (
          ${itemId},
          ${userId},
          'job',
          ${JSON.stringify(job)},
          ${notes || null},
          ${JSON.stringify(tags || [])},
          ${savedAt.toISOString()}
        )
      `;
    }

    return {
      id: itemId,
      type: 'job',
      job,
      savedAt,
      notes,
      tags,
    };
  } catch (error) {
    console.error('Failed to save job to database:', error);
    throw error;
  }
}

export async function saveCareer(career: JobCategory, notes?: string, tags?: string[]): Promise<SavedCareer> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  try {
    const itemId = `career-${career.id}`;
    const savedAt = new Date();

    const existing = await sql`
      SELECT id FROM saved_items WHERE id = ${itemId} AND user_id = ${userId}
    `;

    if (existing.rows.length > 0) {
      await sql`
        UPDATE saved_items SET
          item_data = ${JSON.stringify(career)},
          notes = ${notes || null},
          tags = ${JSON.stringify(tags || [])},
          last_modified = CURRENT_TIMESTAMP
        WHERE id = ${itemId} AND user_id = ${userId}
      `;
    } else {
      await sql`
        INSERT INTO saved_items (id, user_id, item_type, item_data, notes, tags, saved_at)
        VALUES (
          ${itemId},
          ${userId},
          'career',
          ${JSON.stringify(career)},
          ${notes || null},
          ${JSON.stringify(tags || [])},
          ${savedAt.toISOString()}
        )
      `;
    }

    return {
      id: itemId,
      type: 'career',
      career,
      savedAt,
      notes,
      tags,
    };
  } catch (error) {
    console.error('Failed to save career to database:', error);
    throw error;
  }
}

export async function removeSavedItem(itemId: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  try {
    await sql`
      DELETE FROM saved_items WHERE id = ${itemId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to remove saved item from database:', error);
    throw error;
  }
}

export async function updateSavedItemNotes(itemId: string, notes: string): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  try {
    await sql`
      UPDATE saved_items SET
        notes = ${notes},
        last_modified = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to update saved item notes:', error);
    throw error;
  }
}

export async function updateSavedItemTags(itemId: string, tags: string[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Not authenticated');

  try {
    await sql`
      UPDATE saved_items SET
        tags = ${JSON.stringify(tags)},
        last_modified = CURRENT_TIMESTAMP
      WHERE id = ${itemId} AND user_id = ${userId}
    `;
  } catch (error) {
    console.error('Failed to update saved item tags:', error);
    throw error;
  }
}

export async function isSaved(type: 'job', id: string): Promise<boolean>;
export async function isSaved(type: 'career', id: string): Promise<boolean>;
export async function isSaved(type: 'job' | 'career', id: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const itemId = `${type}-${id}`;
    const result = await sql`
      SELECT id FROM saved_items WHERE id = ${itemId} AND user_id = ${userId}
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Failed to check if item is saved:', error);
    return false;
  }
}