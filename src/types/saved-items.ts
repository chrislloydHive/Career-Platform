import { ScoredJob, JobCategory } from '@/types';

export type SavedItemType = 'job' | 'career';

export interface SavedJob {
  id: string;
  type: 'job';
  job: ScoredJob;
  savedAt: Date;
  notes?: string;
  tags?: string[];
}

export interface SavedCareer {
  id: string;
  type: 'career';
  career: JobCategory;
  savedAt: Date;
  notes?: string;
  tags?: string[];
}

export type SavedItem = SavedJob | SavedCareer;

export interface SavedItemsCollection {
  items: SavedItem[];
  lastModified: Date;
}
