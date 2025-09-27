import { DiscoveredInsight } from '../adaptive-questions/adaptive-engine';
import { AdaptiveQuestion, ExplorationArea } from '../adaptive-questions/question-banks';
import { UserProfile } from '@/types/user-profile';

export interface InsightEvidence {
  type: 'question-response' | 'behavioral-pattern' | 'experience' | 'cross-domain';
  description: string;
  source: string;
  strength: number;
  timestamp?: Date;
}

export interface RelatedQuestion {
  question: string;
  purpose: 'clarify' | 'deepen' | 'challenge' | 'explore-consequence';
  area: ExplorationArea;
}

export interface CareerConnection {
  careerTitle: string;
  connectionStrength: number;
  explanation: string;
  insightRelevance: string;
  potentialRoles: string[];
}

export interface InsightRefinement {
  type: 'agree' | 'partially-agree' | 'disagree' | 'needs-context';
  userFeedback?: string;
  adjustedConfidence?: number;
  followUpQuestions: string[];
}

export interface ExploredInsight {
  insight: DiscoveredInsight;
  evidence: InsightEvidence[];
  relatedQuestions: RelatedQuestion[];
  careerConnections: CareerConnection[];
  refinementOptions: InsightRefinement[];
  narrativeExplanation: string;
}

export class InsightExplorer {
  constructor(
    private insight: DiscoveredInsight,
    private allInsights: DiscoveredInsight[],
    private userProfile?: UserProfile
  ) {}

  explore(): ExploredInsight {
    return {
      insight: this.insight,
      evidence: this.gatherEvidence(),
      relatedQuestions: this.generateRelatedQuestions(),
      careerConnections: this.findCareerConnections(),
      refinementOptions: this.createRefinementOptions(),
      narrativeExplanation: this.generateNarrativeExplanation(),
    };
  }

  private gatherEvidence(): InsightEvidence[] {
    const evidence: InsightEvidence[] = [];

    for (const source of this.insight.basedOn) {
      if (source.startsWith('Question:')) {
        evidence.push({
          type: 'question-response',
          description: source,
          source: source.replace('Question: ', ''),
          strength: 0.7,
        });
      } else if (source.includes('pattern')) {
        evidence.push({
          type: 'behavioral-pattern',
          description: source,
          source: 'Pattern recognition engine',
          strength: 0.8,
        });
      } else if (source.includes('experience') || source.includes('career')) {
        evidence.push({
          type: 'experience',
          description: source,
          source: 'Career history analysis',
          strength: 0.9,
        });
      } else {
        evidence.push({
          type: 'cross-domain',
          description: source,
          source: 'Cross-domain synthesis',
          strength: 0.75,
        });
      }
    }

    const relatedInsights = this.allInsights.filter(
      i => i.area === this.insight.area && i.insight !== this.insight.insight
    );

    if (relatedInsights.length >= 2) {
      evidence.push({
        type: 'cross-domain',
        description: `Corroborated by ${relatedInsights.length} related insights in ${this.insight.area}`,
        source: 'Insight synthesis',
        strength: 0.85,
      });
    }

    if (this.userProfile) {
      const experienceEvidence = this.findExperienceEvidence();
      evidence.push(...experienceEvidence);
    }

    return evidence.sort((a, b) => b.strength - a.strength);
  }

  private findExperienceEvidence(): InsightEvidence[] {
    if (!this.userProfile) return [];

    const evidence: InsightEvidence[] = [];
    const insightLower = this.insight.insight.toLowerCase();

    for (const exp of this.userProfile.experience) {
      const expText = `${exp.title} ${exp.description.join(' ')}`.toLowerCase();

      if (insightLower.includes('autonomous') || insightLower.includes('independent')) {
        if (expText.includes('managed') || expText.includes('owned') || expText.includes('led')) {
          evidence.push({
            type: 'experience',
            description: `At ${exp.company}: Demonstrated autonomy in ${exp.title} role`,
            source: `${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`,
            strength: 0.9,
          });
        }
      }

      if (insightLower.includes('communication') || insightLower.includes('relationship')) {
        if (expText.includes('customer') || expText.includes('client') || expText.includes('communication')) {
          evidence.push({
            type: 'experience',
            description: `At ${exp.company}: Built relationships and communicated effectively`,
            source: `${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`,
            strength: 0.9,
          });
        }
      }

      if (insightLower.includes('creative') || insightLower.includes('design')) {
        if (expText.includes('design') || expText.includes('content') || expText.includes('marketing')) {
          evidence.push({
            type: 'experience',
            description: `At ${exp.company}: Created content and designs`,
            source: `${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`,
            strength: 0.9,
          });
        }
      }

      if (insightLower.includes('health') || insightLower.includes('wellness')) {
        if (expText.includes('health') || expText.includes('patient') || expText.includes('fitness')) {
          evidence.push({
            type: 'experience',
            description: `At ${exp.company}: Contributed to health and wellness`,
            source: `${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`,
            strength: 0.95,
          });
        }
      }
    }

    return evidence;
  }

  private generateRelatedQuestions(): RelatedQuestion[] {
    const questions: RelatedQuestion[] = [];
    const insightLower = this.insight.insight.toLowerCase();

    if (insightLower.includes('autonomous') || insightLower.includes('independent')) {
      questions.push({
        question: 'When you have complete autonomy, how do you decide what to prioritize?',
        purpose: 'deepen',
        area: 'work-style',
      });
      questions.push({
        question: 'Can you think of a time when too much autonomy felt uncomfortable?',
        purpose: 'challenge',
        area: 'work-style',
      });
      questions.push({
        question: 'How would this preference affect your choice between startup vs established company?',
        purpose: 'explore-consequence',
        area: 'environment',
      });
    }

    if (insightLower.includes('collaborative') || insightLower.includes('team')) {
      questions.push({
        question: 'What makes a team collaboration feel productive vs draining for you?',
        purpose: 'clarify',
        area: 'people-interaction',
      });
      questions.push({
        question: 'Describe a team experience that didn\'t work well. What went wrong?',
        purpose: 'deepen',
        area: 'people-interaction',
      });
      questions.push({
        question: 'How many people on a team is ideal for you?',
        purpose: 'clarify',
        area: 'people-interaction',
      });
    }

    if (insightLower.includes('creative') || insightLower.includes('design')) {
      questions.push({
        question: 'What percentage of your ideal role would be creative work vs other responsibilities?',
        purpose: 'clarify',
        area: 'creativity',
      });
      questions.push({
        question: 'How do you handle feedback on creative work you\'re proud of?',
        purpose: 'deepen',
        area: 'creativity',
      });
      questions.push({
        question: 'Would you rather create something beautiful or something functional?',
        purpose: 'explore-consequence',
        area: 'values',
      });
    }

    if (insightLower.includes('growth') || insightLower.includes('learning')) {
      questions.push({
        question: 'What\'s the difference between learning that energizes you vs learning that feels like work?',
        purpose: 'clarify',
        area: 'learning-growth',
      });
      questions.push({
        question: 'Can you learn too much? When does exploration become overwhelming?',
        purpose: 'challenge',
        area: 'learning-growth',
      });
      questions.push({
        question: 'How will you know when it\'s time to stop exploring and start specializing?',
        purpose: 'explore-consequence',
        area: 'values',
      });
    }

    if (insightLower.includes('health') || insightLower.includes('wellness')) {
      questions.push({
        question: 'What aspect of health/wellness resonates most: prevention, treatment, or optimization?',
        purpose: 'deepen',
        area: 'values',
      });
      questions.push({
        question: 'Does your interest in health extend to mental health and wellbeing?',
        purpose: 'explore-consequence',
        area: 'values',
      });
    }

    if (insightLower.includes('remote') || insightLower.includes('flexible')) {
      questions.push({
        question: 'What would make you willing to give up remote work?',
        purpose: 'challenge',
        area: 'environment',
      });
      questions.push({
        question: 'How do you stay connected to team culture when remote?',
        purpose: 'clarify',
        area: 'people-interaction',
      });
    }

    if (questions.length < 3) {
      questions.push({
        question: 'What evidence would make you question this insight about yourself?',
        purpose: 'challenge',
        area: this.insight.area,
      });
      questions.push({
        question: 'How has this preference evolved over the past few years?',
        purpose: 'deepen',
        area: this.insight.area,
      });
    }

    return questions.slice(0, 5);
  }

  private findCareerConnections(): CareerConnection[] {
    const connections: CareerConnection[] = [];
    const insightLower = this.insight.insight.toLowerCase();

    if (insightLower.includes('autonomous') || insightLower.includes('independent')) {
      connections.push({
        careerTitle: 'Product Manager',
        connectionStrength: 0.85,
        explanation: 'Product managers own their product roadmap and make independent decisions about priorities and features.',
        insightRelevance: 'High autonomy with clear ownership boundaries',
        potentialRoles: ['Associate Product Manager', 'Product Manager', 'Senior Product Manager'],
      });
      connections.push({
        careerTitle: 'Health Tech Consultant',
        connectionStrength: 0.8,
        explanation: 'Consultants work independently with clients, managing their own projects and timelines.',
        insightRelevance: 'Self-directed work with healthcare expertise',
        potentialRoles: ['Healthcare Analyst', 'Health IT Consultant', 'Digital Health Consultant'],
      });
    }

    if (insightLower.includes('communication') || insightLower.includes('relationship')) {
      connections.push({
        careerTitle: 'Customer Success Manager',
        connectionStrength: 0.9,
        explanation: 'CSMs build long-term relationships with customers, understanding their needs and ensuring success.',
        insightRelevance: 'Relationship-building is the core skill',
        potentialRoles: ['Customer Success Associate', 'CSM', 'Senior CSM'],
      });
      connections.push({
        careerTitle: 'Patient Advocate',
        connectionStrength: 0.85,
        explanation: 'Patient advocates communicate between patients, providers, and systems to ensure quality care.',
        insightRelevance: 'Communication skills applied to healthcare',
        potentialRoles: ['Patient Navigator', 'Patient Advocate', 'Care Coordinator'],
      });
    }

    if (insightLower.includes('creative') || insightLower.includes('design')) {
      connections.push({
        careerTitle: 'UX Designer',
        connectionStrength: 0.9,
        explanation: 'UX designers create user experiences through research, design, and iteration.',
        insightRelevance: 'Creative problem-solving with measurable impact',
        potentialRoles: ['UX Designer', 'Product Designer', 'Senior UX Designer'],
      });
      connections.push({
        careerTitle: 'Content Strategist',
        connectionStrength: 0.85,
        explanation: 'Content strategists blend creativity with strategy to create compelling narratives.',
        insightRelevance: 'Creative storytelling meets business goals',
        potentialRoles: ['Content Designer', 'Content Strategist', 'Senior Content Strategist'],
      });
    }

    if (insightLower.includes('data') || insightLower.includes('analytical')) {
      connections.push({
        careerTitle: 'Healthcare Data Analyst',
        connectionStrength: 0.9,
        explanation: 'Analyze healthcare data to improve patient outcomes and operational efficiency.',
        insightRelevance: 'Analytical skills applied to healthcare',
        potentialRoles: ['Data Analyst', 'Healthcare Analyst', 'Senior Data Analyst'],
      });
    }

    if (insightLower.includes('health') || insightLower.includes('wellness')) {
      connections.push({
        careerTitle: 'Digital Health Product Manager',
        connectionStrength: 0.95,
        explanation: 'Lead digital health products that improve patient care and healthcare delivery.',
        insightRelevance: 'Combines health passion with product leadership',
        potentialRoles: ['Associate PM', 'Product Manager', 'Senior PM - Digital Health'],
      });
      connections.push({
        careerTitle: 'Health Program Coordinator',
        connectionStrength: 0.85,
        explanation: 'Design and manage health programs that serve communities and patients.',
        insightRelevance: 'Direct impact on health outcomes',
        potentialRoles: ['Program Coordinator', 'Program Manager', 'Director of Programs'],
      });
    }

    if (insightLower.includes('learning') || insightLower.includes('growth')) {
      connections.push({
        careerTitle: 'Learning & Development Specialist',
        connectionStrength: 0.8,
        explanation: 'Design learning experiences and development programs for employees.',
        insightRelevance: 'Help others grow while continuously learning',
        potentialRoles: ['L&D Coordinator', 'L&D Specialist', 'Senior L&D Manager'],
      });
    }

    return connections.sort((a, b) => b.connectionStrength - a.connectionStrength).slice(0, 4);
  }

  private createRefinementOptions(): InsightRefinement[] {
    return [
      {
        type: 'agree',
        followUpQuestions: [
          'This insight resonates. What career paths should we explore based on this?',
          'How can you leverage this strength in your next role?',
        ],
      },
      {
        type: 'partially-agree',
        followUpQuestions: [
          'Which part feels most accurate?',
          'What context or nuance is missing from this insight?',
          'Under what circumstances is this true vs not true for you?',
        ],
      },
      {
        type: 'disagree',
        followUpQuestions: [
          'What led the AI to this conclusion? Let\'s explore the disconnect.',
          'What would be a more accurate description of your preference?',
          'Are there specific experiences that contradict this insight?',
        ],
      },
      {
        type: 'needs-context',
        followUpQuestions: [
          'What additional information would make this insight more useful?',
          'How has this preference changed over time?',
          'What conditions bring out this preference most strongly?',
        ],
      },
    ];
  }

  private generateNarrativeExplanation(): string {
    const insightLower = this.insight.insight.toLowerCase();
    const confidence = Math.round(this.insight.confidence * 100);

    let narrative = `Based on your responses and career history, we're ${confidence}% confident that: ${this.insight.insight}. `;

    if (this.insight.basedOn.length > 0) {
      narrative += `This insight emerged from ${this.insight.basedOn.length} different signals across your responses. `;
    }

    const relatedCount = this.allInsights.filter(i => i.area === this.insight.area).length;
    if (relatedCount > 1) {
      narrative += `It's reinforced by ${relatedCount - 1} other insights in the ${this.insight.area.replace('-', ' ')} area. `;
    }

    if (this.insight.confidence >= 0.8) {
      narrative += `This is one of our highest-confidence insights about you.`;
    } else if (this.insight.confidence >= 0.6) {
      narrative += `We're fairly confident about this, but more exploration could strengthen or refine it.`;
    } else {
      narrative += `This is an emerging pattern worth exploring further.`;
    }

    return narrative;
  }

  refineInsight(refinement: InsightRefinement): DiscoveredInsight {
    let adjustedConfidence = this.insight.confidence;

    if (refinement.type === 'agree' && refinement.adjustedConfidence) {
      adjustedConfidence = Math.min(refinement.adjustedConfidence, 0.95);
    } else if (refinement.type === 'partially-agree' && refinement.adjustedConfidence) {
      adjustedConfidence = refinement.adjustedConfidence;
    } else if (refinement.type === 'disagree') {
      adjustedConfidence = Math.max(this.insight.confidence * 0.5, 0.2);
    }

    return {
      ...this.insight,
      confidence: adjustedConfidence,
      basedOn: [...this.insight.basedOn, `User feedback: ${refinement.type}`],
    };
  }
}