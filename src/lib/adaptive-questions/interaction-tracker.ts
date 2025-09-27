export interface CareerInteraction {
  type: 'role_interest' | 'job_saved' | 'career_viewed' | 'chat_topic' | 'search_query';
  content: string;
  timestamp: Date;
  metadata?: {
    roleTitle?: string;
    company?: string;
    skills?: string[];
    industry?: string;
    jobFunction?: string;
  };
}

export class InteractionTracker {
  private static readonly STORAGE_KEY = 'career_interactions';
  private static readonly MAX_INTERACTIONS = 100;

  static trackRoleInterest(roleTitle: string, metadata?: {
    company?: string;
    skills?: string[];
    industry?: string;
    jobFunction?: string;
  }): void {
    this.addInteraction({
      type: 'role_interest',
      content: roleTitle,
      timestamp: new Date(),
      metadata,
    });
  }

  static trackJobSaved(roleTitle: string, metadata?: {
    company?: string;
    skills?: string[];
    industry?: string;
    jobFunction?: string;
  }): void {
    this.addInteraction({
      type: 'job_saved',
      content: roleTitle,
      timestamp: new Date(),
      metadata,
    });
  }

  static trackCareerViewed(careerPath: string, metadata?: {
    industry?: string;
    skills?: string[];
  }): void {
    this.addInteraction({
      type: 'career_viewed',
      content: careerPath,
      timestamp: new Date(),
      metadata,
    });
  }

  static trackChatTopic(topic: string, metadata?: Record<string, unknown>): void {
    this.addInteraction({
      type: 'chat_topic',
      content: topic,
      timestamp: new Date(),
      metadata,
    });
  }

  static trackSearchQuery(query: string, metadata?: {
    location?: string;
    industry?: string;
  }): void {
    this.addInteraction({
      type: 'search_query',
      content: query,
      timestamp: new Date(),
      metadata,
    });
  }

  static getRecentInteractions(limit?: number): CareerInteraction[] {
    const interactions = this.getAllInteractions();
    return limit ? interactions.slice(-limit) : interactions;
  }

  static getInteractionsByType(type: CareerInteraction['type']): CareerInteraction[] {
    return this.getAllInteractions().filter(i => i.type === type);
  }

  static clearInteractions(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private static addInteraction(interaction: CareerInteraction): void {
    if (typeof window === 'undefined') return;

    const interactions = this.getAllInteractions();
    interactions.push(interaction);

    const trimmed = interactions.slice(-this.MAX_INTERACTIONS);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  private static getAllInteractions(): CareerInteraction[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const interactions = JSON.parse(stored) as CareerInteraction[];
      return interactions.map(i => ({
        ...i,
        timestamp: new Date(i.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load interactions:', error);
      return [];
    }
  }
}