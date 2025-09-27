import { UserProfile } from '@/types/user-profile';
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';
import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';

export interface NarrativeInsight {
  originalInsight: string;
  narrative: string;
  evidenceStory: string[];
  experienceConnections: ExperienceConnection[];
  confidence: number;
  type: 'strength' | 'preference' | 'hidden-interest' | 'growth-area';
}

export interface ExperienceConnection {
  experienceTitle: string;
  company: string;
  connection: string;
  relevance: number;
}

export interface StoryTemplate {
  pattern: RegExp;
  narrativeBuilder: (insight: DiscoveredInsight, profile: UserProfile) => string;
  experienceMatcher: (insight: DiscoveredInsight, profile: UserProfile) => ExperienceConnection[];
}

export class NarrativeInsightGenerator {
  private storyTemplates: StoryTemplate[] = [];

  constructor(
    private profile: UserProfile,
    private responses: Record<string, QuestionResponse>,
    private insights: DiscoveredInsight[]
  ) {
    this.initializeStoryTemplates();
  }

  private initializeStoryTemplates() {
    this.storyTemplates = [
      {
        pattern: /autonomous|independent|freedom|self-directed/i,
        narrativeBuilder: (insight, profile) => {
          const relevantExp = this.findRelevantExperience(insight, profile, ['independent', 'managed', 'owned', 'created', 'developed']);

          if (relevantExp.length > 0) {
            const exp = relevantExp[0];
            return `You thrive when given clear goals and the freedom to achieve them your way. Your experience at ${exp.company}, where you ${this.extractKeyAction(exp)}, validates this preference. You've consistently sought roles where you can take ownership and drive results independently.`;
          }

          return `You thrive when given clear goals and the freedom to achieve them your way. Your career journey shows a consistent pattern of seeking roles with high autonomy and ownership.`;
        },
        experienceMatcher: (insight, profile) => this.matchAutonomyExperiences(profile),
      },
      {
        pattern: /collaborative|team|group|together/i,
        narrativeBuilder: (insight, profile) => {
          const relevantExp = this.findRelevantExperience(insight, profile, ['collaborated', 'team', 'coordinated', 'partnered', 'worked with']);

          if (relevantExp.length > 0) {
            const exp = relevantExp[0];
            return `You excel in collaborative environments where ideas flow freely between team members. At ${exp.company}, you demonstrated this through ${this.extractKeyAction(exp)}. You bring energy to team settings and help others succeed.`;
          }

          return `You excel in collaborative environments where ideas flow freely between team members. Your natural ability to work with others creates positive team dynamics.`;
        },
        experienceMatcher: (insight, profile) => this.matchCollaborationExperiences(profile),
      },
      {
        pattern: /communication|relationship|people|customer|client/i,
        narrativeBuilder: (insight, profile) => {
          const relevantExp = this.findRelevantExperience(insight, profile, ['communication', 'customer', 'client', 'relationship', 'engagement']);

          if (relevantExp.length > 0) {
            const exp = relevantExp[0];
            return `Building meaningful connections comes naturally to you. Your time at ${exp.company} showcased this strength, particularly when you ${this.extractKeyAction(exp)}. You have a gift for understanding what people need and communicating effectively.`;
          }

          return `Building meaningful connections comes naturally to you. You have a gift for understanding what people need and communicating effectively.`;
        },
        experienceMatcher: (insight, profile) => this.matchCommunicationExperiences(profile),
      },
      {
        pattern: /creative|innovative|design|visual|content/i,
        narrativeBuilder: (insight, profile) => {
          const relevantExp = this.findRelevantExperience(insight, profile, ['designed', 'created', 'developed', 'content', 'visual', 'marketing']);

          if (relevantExp.length > 0) {
            const exp = relevantExp[0];
            return `Your creative instincts drive much of your best work. This was evident at ${exp.company}, where ${this.extractKeyAction(exp)}. You see possibilities others miss and transform ideas into compelling reality.`;
          }

          return `Your creative instincts drive much of your best work. You see possibilities others miss and transform ideas into compelling reality.`;
        },
        experienceMatcher: (insight, profile) => this.matchCreativeExperiences(profile),
      },
      {
        pattern: /analytical|data|problem|logic|technical/i,
        narrativeBuilder: (insight, profile) => {
          const relevantExp = this.findRelevantExperience(insight, profile, ['analyzed', 'data', 'research', 'evaluated', 'assessed', 'technical']);

          if (relevantExp.length > 0) {
            const exp = relevantExp[0];
            return `You approach challenges with analytical rigor and curiosity. Your work at ${exp.company} demonstrated this capability when ${this.extractKeyAction(exp)}. You dig into complexity and emerge with clarity.`;
          }

          return `You approach challenges with analytical rigor and curiosity. You dig into complexity and emerge with clarity.`;
        },
        experienceMatcher: (insight, profile) => this.matchAnalyticalExperiences(profile),
      },
      {
        pattern: /learning|growth|development|skill/i,
        narrativeBuilder: (insight, profile) => {
          const industries = [...new Set(profile.experience.map(e => this.categorizeIndustry(e.company, e.title)))];

          if (industries.length >= 3) {
            return `Your career path reveals an insatiable curiosity. You've explored ${industries.length} different industries—${industries.slice(0, 3).join(', ')}—each time absorbing new skills and perspectives. This continuous learning mindset is your secret weapon.`;
          }

          return `Your career path reveals an insatiable curiosity. You're constantly absorbing new skills and perspectives, treating every role as a learning opportunity.`;
        },
        experienceMatcher: (insight, profile) => this.matchLearningExperiences(profile),
      },
      {
        pattern: /health|wellness|fitness|patient|care/i,
        narrativeBuilder: (insight, profile) => {
          const healthExp = profile.experience.filter(e =>
            this.categorizeIndustry(e.company, e.title) === 'healthcare' ||
            e.company.toLowerCase().includes('health') ||
            e.title.toLowerCase().includes('health')
          );

          if (healthExp.length > 0) {
            return `Your healthcare background isn't just professional—it reflects a deeper value around improving people's lives. From ${healthExp.map(e => e.company).join(' to ')}, you've consistently chosen work that directly impacts wellbeing. This purpose-driven approach shapes your career decisions.`;
          }

          return `You're drawn to work that directly impacts people's wellbeing. This purpose-driven approach shapes your career decisions.`;
        },
        experienceMatcher: (insight, profile) => this.matchHealthExperiences(profile),
      },
      {
        pattern: /remote|flexible|work-life|balance/i,
        narrativeBuilder: (insight, profile) => {
          const spokaneYears = profile.experience
            .filter(e => e.location?.toLowerCase().includes('spokane'))
            .reduce((sum, e) => {
              const start = new Date(e.startDate).getFullYear();
              const end = e.endDate ? new Date(e.endDate).getFullYear() : new Date().getFullYear();
              return sum + (end - start);
            }, 0);

          if (spokaneYears > 0) {
            return `You've built your career in Spokane while maintaining ambitious professional goals—a choice that reveals your priorities. You value quality of life, affordability, and community connection, but you're not willing to sacrifice career growth. Remote work isn't just convenient; it's your strategy for having both.`;
          }

          return `You value quality of life and flexibility without sacrificing professional ambition. This balance shapes how you evaluate opportunities.`;
        },
        experienceMatcher: (insight, profile) => this.matchFlexibilityExperiences(profile),
      },
    ];
  }

  generateNarrativeInsights(): NarrativeInsight[] {
    const narratives: NarrativeInsight[] = [];

    for (const insight of this.insights) {
      const narrative = this.generateNarrative(insight);
      narratives.push(narrative);
    }

    return narratives.sort((a, b) => b.confidence - a.confidence);
  }

  private generateNarrative(insight: DiscoveredInsight): NarrativeInsight {
    for (const template of this.storyTemplates) {
      if (template.pattern.test(insight.insight)) {
        const narrative = template.narrativeBuilder(insight, this.profile);
        const experienceConnections = template.experienceMatcher(insight, this.profile);
        const evidenceStory = this.buildEvidenceStory(insight, experienceConnections);

        return {
          originalInsight: insight.insight,
          narrative,
          evidenceStory,
          experienceConnections,
          confidence: insight.confidence,
          type: insight.type,
        };
      }
    }

    return this.generateGenericNarrative(insight);
  }

  private generateGenericNarrative(insight: DiscoveredInsight): NarrativeInsight {
    const relevantExp = this.findRelevantExperience(insight, this.profile, this.extractKeywords(insight.insight));

    let narrative = insight.insight;

    if (relevantExp.length > 0) {
      const exp = relevantExp[0];
      narrative = `${insight.insight} This pattern emerged clearly during your time at ${exp.company}, where ${this.extractKeyAction(exp)}.`;
    }

    const experienceConnections = this.matchGenericExperiences(insight);
    const evidenceStory = this.buildEvidenceStory(insight, experienceConnections);

    return {
      originalInsight: insight.insight,
      narrative,
      evidenceStory,
      experienceConnections,
      confidence: insight.confidence,
      type: insight.type,
    };
  }

  private buildEvidenceStory(insight: DiscoveredInsight, connections: ExperienceConnection[]): string[] {
    const stories: string[] = [];

    if (connections.length > 0) {
      const topConnections = connections.slice(0, 3);

      for (const conn of topConnections) {
        stories.push(`At ${conn.company}: ${conn.connection}`);
      }
    }

    if (insight.basedOn.length > 0) {
      const responseCount = insight.basedOn.length;
      stories.push(`Validated through ${responseCount} question${responseCount > 1 ? 's' : ''}`);
    }

    stories.push(`Confidence: ${Math.round(insight.confidence * 100)}%`);

    return stories;
  }

  private findRelevantExperience(
    insight: DiscoveredInsight,
    profile: UserProfile,
    keywords: string[]
  ): typeof profile.experience {
    const scored = profile.experience.map(exp => {
      let score = 0;
      const expText = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();

      for (const keyword of keywords) {
        if (expText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }

      return { exp, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(s => s.exp);
  }

  private extractKeyAction(exp: typeof this.profile.experience[0]): string {
    if (exp.description.length > 0) {
      const firstDesc = exp.description[0].toLowerCase();

      if (firstDesc.length > 100) {
        return firstDesc.substring(0, 97) + '...';
      }

      return firstDesc;
    }

    return `worked as ${exp.title}`;
  }

  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  private categorizeIndustry(company: string, title: string): string {
    const text = `${company} ${title}`.toLowerCase();

    if (text.includes('health') || text.includes('patient') || text.includes('clinic') || text.includes('medical')) {
      return 'healthcare';
    }
    if (text.includes('fitness') || text.includes('gym') || text.includes('trainer')) {
      return 'fitness';
    }
    if (text.includes('market') || text.includes('social media') || text.includes('brand')) {
      return 'marketing';
    }
    if (text.includes('retail') || text.includes('store') || text.includes('sales')) {
      return 'retail';
    }
    if (text.includes('tech') || text.includes('software') || text.includes('data')) {
      return 'technology';
    }

    return 'other';
  }

  private matchAutonomyExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .map(exp => {
        const text = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();
        let relevance = 0;

        const autonomyKeywords = ['managed', 'owned', 'independently', 'created', 'developed', 'led', 'initiated', 'designed'];
        for (const keyword of autonomyKeywords) {
          if (text.includes(keyword)) relevance += 0.2;
        }

        return {
          experienceTitle: exp.title,
          company: exp.company,
          connection: `Managed projects and initiatives independently with minimal oversight`,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter(c => c.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);
  }

  private matchCollaborationExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .map(exp => {
        const text = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();
        let relevance = 0;

        const collabKeywords = ['team', 'collaborated', 'coordinated', 'partnered', 'worked with', 'cross-functional'];
        for (const keyword of collabKeywords) {
          if (text.includes(keyword)) relevance += 0.2;
        }

        return {
          experienceTitle: exp.title,
          company: exp.company,
          connection: `Collaborated effectively with team members and stakeholders`,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter(c => c.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);
  }

  private matchCommunicationExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .map(exp => {
        const text = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();
        let relevance = 0;

        const commKeywords = ['communication', 'customer', 'client', 'engagement', 'relationship', 'presented'];
        for (const keyword of commKeywords) {
          if (text.includes(keyword)) relevance += 0.2;
        }

        return {
          experienceTitle: exp.title,
          company: exp.company,
          connection: `Built and maintained strong relationships through effective communication`,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter(c => c.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);
  }

  private matchCreativeExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .map(exp => {
        const text = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();
        let relevance = 0;

        const creativeKeywords = ['designed', 'created', 'content', 'visual', 'marketing', 'brand', 'social media'];
        for (const keyword of creativeKeywords) {
          if (text.includes(keyword)) relevance += 0.2;
        }

        return {
          experienceTitle: exp.title,
          company: exp.company,
          connection: `Created compelling content and designs that engaged audiences`,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter(c => c.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);
  }

  private matchAnalyticalExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .map(exp => {
        const text = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();
        let relevance = 0;

        const analyticalKeywords = ['analyzed', 'data', 'research', 'evaluated', 'assessed', 'measured'];
        for (const keyword of analyticalKeywords) {
          if (text.includes(keyword)) relevance += 0.2;
        }

        return {
          experienceTitle: exp.title,
          company: exp.company,
          connection: `Analyzed data and information to drive informed decisions`,
          relevance: Math.min(relevance, 1),
        };
      })
      .filter(c => c.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);
  }

  private matchLearningExperiences(profile: UserProfile): ExperienceConnection[] {
    const industries = profile.experience.map(exp => ({
      exp,
      industry: this.categorizeIndustry(exp.company, exp.title),
    }));

    const uniqueIndustries = new Set(industries.map(i => i.industry));

    return Array.from(uniqueIndustries).map(industry => {
      const exps = industries.filter(i => i.industry === industry);

      return {
        experienceTitle: exps[0].exp.title,
        company: exps[0].exp.company,
        connection: `Gained ${industry} industry expertise through hands-on experience`,
        relevance: 0.8,
      };
    });
  }

  private matchHealthExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .filter(exp => this.categorizeIndustry(exp.company, exp.title) === 'healthcare')
      .map(exp => ({
        experienceTitle: exp.title,
        company: exp.company,
        connection: `Contributed to patient care and healthcare service delivery`,
        relevance: 0.9,
      }));
  }

  private matchFlexibilityExperiences(profile: UserProfile): ExperienceConnection[] {
    return profile.experience
      .filter(exp => exp.location?.toLowerCase().includes('spokane'))
      .map(exp => ({
        experienceTitle: exp.title,
        company: exp.company,
        connection: `Built career in Spokane while maintaining professional growth`,
        relevance: 0.85,
      }));
  }

  private matchGenericExperiences(insight: DiscoveredInsight): ExperienceConnection[] {
    const keywords = this.extractKeywords(insight.insight);
    const relevant = this.findRelevantExperience(insight, this.profile, keywords);

    return relevant.slice(0, 3).map(exp => ({
      experienceTitle: exp.title,
      company: exp.company,
      connection: this.extractKeyAction(exp),
      relevance: 0.6,
    }));
  }
}