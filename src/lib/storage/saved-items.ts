import { SavedItem, SavedJob, SavedCareer, SavedItemsCollection } from '@/types/saved-items';
import { ScoredJob, JobCategory } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';

const SAVED_ITEMS_FILE = path.join(process.cwd(), 'data', 'saved-items.json');

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

export async function getSavedItems(): Promise<SavedItem[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SAVED_ITEMS_FILE, 'utf-8');
    const collection: SavedItemsCollection = JSON.parse(data);
    return collection.items.map(item => ({
      ...item,
      savedAt: new Date(item.savedAt),
    }));
  } catch (error) {
    return [];
  }
}

export async function saveJob(job: ScoredJob, notes?: string, tags?: string[]): Promise<SavedJob> {
  await ensureDataDirectory();
  const items = await getSavedItems();

  const existingIndex = items.findIndex(
    item => item.type === 'job' && item.job.id === job.id
  );

  const savedJob: SavedJob = {
    id: `job-${job.id}`,
    type: 'job',
    job,
    savedAt: new Date(),
    notes,
    tags,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = savedJob;
  } else {
    items.push(savedJob);
  }

  await saveSavedItems(items);
  return savedJob;
}

export async function saveCareer(career: JobCategory, notes?: string, tags?: string[]): Promise<SavedCareer> {
  await ensureDataDirectory();
  const items = await getSavedItems();

  const existingIndex = items.findIndex(
    item => item.type === 'career' && item.career.id === career.id
  );

  const savedCareer: SavedCareer = {
    id: `career-${career.id}`,
    type: 'career',
    career,
    savedAt: new Date(),
    notes,
    tags,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = savedCareer;
  } else {
    items.push(savedCareer);
  }

  await saveSavedItems(items);
  return savedCareer;
}

export async function removeSavedItem(itemId: string): Promise<void> {
  const items = await getSavedItems();
  const filtered = items.filter(item => item.id !== itemId);
  await saveSavedItems(filtered);
}

export async function updateSavedItemNotes(itemId: string, notes: string): Promise<void> {
  const items = await getSavedItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.notes = notes;
    await saveSavedItems(items);
  }
}

export async function updateSavedItemTags(itemId: string, tags: string[]): Promise<void> {
  const items = await getSavedItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.tags = tags;
    await saveSavedItems(items);
  }
}

async function saveSavedItems(items: SavedItem[]): Promise<void> {
  const collection: SavedItemsCollection = {
    items,
    lastModified: new Date(),
  };
  await fs.writeFile(SAVED_ITEMS_FILE, JSON.stringify(collection, null, 2));
}

export async function isSaved(type: 'job', id: string): Promise<boolean>;
export async function isSaved(type: 'career', id: string): Promise<boolean>;
export async function isSaved(type: 'job' | 'career', id: string): Promise<boolean> {
  const items = await getSavedItems();
  return items.some(item => {
    if (type === 'job' && item.type === 'job') {
      return item.job.id === id;
    }
    if (type === 'career' && item.type === 'career') {
      return item.career.id === id;
    }
    return false;
  });
}