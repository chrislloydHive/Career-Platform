import { AdaptiveQuestion, ExplorationArea } from './question-banks';
import { CareerInteraction } from './interaction-tracker';

export interface DynamicQuestionContext {
  interactions: CareerInteraction[];
  existingResponses: Record<string, unknown>;
}

interface QuestionTemplate {
  trigger: (interactions: CareerInteraction[]) => boolean;
  generate: (context: DynamicQuestionContext) => AdaptiveQuestion | null;
  priority: number;
}

export class DynamicQuestionGenerator {
  private templates: QuestionTemplate[] = [];

  constructor() {
    this.initializeTemplates();
  }

  generateQuestionsFromContext(context: DynamicQuestionContext): AdaptiveQuestion[] {
    const questions: Array<{ question: AdaptiveQuestion; priority: number }> = [];

    for (const template of this.templates) {
      if (template.trigger(context.interactions)) {
        const question = template.generate(context);
        if (question) {
          questions.push({ question, priority: template.priority });
        }
      }
    }

    return questions
      .sort((a, b) => b.priority - a.priority)
      .map(q => q.question);
  }

  private initializeTemplates() {
    this.templates = [
      this.createRoleInterestTemplate(),
      this.createSkillPatternTemplate(),
      this.createIndustryFocusTemplate(),
      this.createWorkEnvironmentTemplate(),
      this.createTeamSizeTemplate(),
      this.createImpactScopeTemplate(),
      this.createCommunicationStyleTemplate(),
      this.createGrowthPathTemplate(),
      this.createCompanyStageTemplate(),
      this.createRoleResponsibilityTemplate(),
    ];
  }

  private createRoleInterestTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const roleInterests = interactions.filter(i =>
          i.type === 'role_interest' || i.type === 'job_saved'
        );
        return roleInterests.length >= 2;
      },
      generate: (context) => {
        const roles = context.interactions
          .filter(i => i.type === 'role_interest' || i.type === 'job_saved')
          .map(i => i.metadata?.roleTitle || i.content)
          .filter(Boolean);

        if (roles.length === 0) return null;

        const commonThemes = this.extractCommonThemes(roles);

        if (commonThemes.includes('education') || commonThemes.includes('teaching')) {
          return {
            id: `dynamic-teaching-${Date.now()}`,
            area: 'people-interaction',
            type: 'multiple-choice',
            text: `You've shown interest in roles involving teaching and education (like ${roles.slice(0, 2).join(' and ')}). Do you prefer explaining complex topics to individuals or groups?`,
            options: [
              {
                value: 'one-on-one',
                label: 'One-on-one - I prefer individual mentoring and personalized guidance',
                insight: 'Suggests strength in personalized coaching and relationship building'
              },
              {
                value: 'small-groups',
                label: 'Small groups (3-10 people) - I like intimate, interactive sessions',
                insight: 'Indicates facilitation skills and collaborative teaching style'
              },
              {
                value: 'large-groups',
                label: 'Large groups or presentations - I enjoy speaking to bigger audiences',
                insight: 'Points to public speaking confidence and scalable impact preference'
              },
              {
                value: 'mixed',
                label: 'Mix of both - I value variety in how I teach and communicate',
                insight: 'Shows adaptability and comfort across different formats'
              },
            ],
            weight: 'high',
          };
        }

        if (commonThemes.includes('management') || commonThemes.includes('leadership')) {
          return {
            id: `dynamic-leadership-${Date.now()}`,
            area: 'people-interaction',
            type: 'multiple-choice',
            text: `You've explored leadership roles like ${roles[0]}. What aspect of leading people energizes you most?`,
            options: [
              {
                value: 'developing-people',
                label: 'Developing people and watching them grow',
                insight: 'Strong coaching and talent development orientation'
              },
              {
                value: 'setting-vision',
                label: 'Setting vision and strategic direction',
                insight: 'Strategic thinking and big-picture leadership style'
              },
              {
                value: 'building-culture',
                label: 'Building team culture and cohesion',
                insight: 'Focus on organizational culture and team dynamics'
              },
              {
                value: 'driving-results',
                label: 'Driving results and achieving goals',
                insight: 'Results-oriented, execution-focused leadership'
              },
            ],
            weight: 'high',
          };
        }

        return null;
      },
      priority: 90,
    };
  }

  private createSkillPatternTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const skillPatterns = interactions
          .flatMap(i => i.metadata?.skills || []);
        return skillPatterns.length >= 5;
      },
      generate: (context) => {
        const allSkills = context.interactions
          .flatMap(i => i.metadata?.skills || [])
          .map(s => s.toLowerCase());

        const skillFrequency = allSkills.reduce((acc, skill) => {
          acc[skill] = (acc[skill] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topSkills = Object.entries(skillFrequency)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([skill]) => skill);

        if (topSkills.length === 0) return null;

        const hasAnalytical = topSkills.some(s =>
          s.includes('analysis') || s.includes('data') || s.includes('research')
        );
        const hasCreative = topSkills.some(s =>
          s.includes('design') || s.includes('creative') || s.includes('content')
        );

        if (hasAnalytical && hasCreative) {
          return {
            id: `dynamic-skill-blend-${Date.now()}`,
            area: 'problem-solving',
            type: 'multiple-choice',
            text: `The roles you're interested in require both analytical and creative skills. Which describes your ideal project workflow?`,
            options: [
              {
                value: 'analyze-then-create',
                label: 'Research and analyze first, then create solutions based on insights',
                insight: 'Data-informed creativity approach'
              },
              {
                value: 'create-then-validate',
                label: 'Brainstorm creative solutions first, then validate with analysis',
                insight: 'Creative-first, data-validated approach'
              },
              {
                value: 'iterative-blend',
                label: 'Constantly switch between creative ideation and analytical validation',
                insight: 'Highly integrated analytical-creative process'
              },
              {
                value: 'separate-phases',
                label: 'Keep analytical and creative work in separate, distinct phases',
                insight: 'Prefers clear separation of thinking modes'
              },
            ],
            weight: 'high',
          };
        }

        return null;
      },
      priority: 85,
    };
  }

  private createIndustryFocusTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const industries = interactions
          .map(i => i.metadata?.industry)
          .filter(Boolean);
        return industries.length >= 3;
      },
      generate: (context) => {
        const industries = context.interactions
          .map(i => i.metadata?.industry)
          .filter((i): i is string => Boolean(i));

        const industryFrequency = industries.reduce((acc, industry) => {
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const topIndustry = Object.entries(industryFrequency)
          .sort(([, a], [, b]) => b - a)[0]?.[0];

        if (!topIndustry) return null;

        return {
          id: `dynamic-industry-${Date.now()}`,
          area: 'values',
          type: 'multiple-choice',
          text: `You've been exploring roles in ${topIndustry}. What draws you to this industry specifically?`,
          options: [
            {
              value: 'mission-impact',
              label: 'The mission and social impact align with my values',
              insight: 'Values-driven career motivation'
            },
            {
              value: 'growth-innovation',
              label: 'The industry is growing and innovative',
              insight: 'Opportunity and innovation-focused'
            },
            {
              value: 'personal-connection',
              label: 'I have personal experience or connection to this field',
              insight: 'Authenticity and lived experience matter'
            },
            {
              value: 'skill-match',
              label: 'My skills are particularly valuable in this industry',
              insight: 'Pragmatic, skills-based career decisions'
            },
          ],
          weight: 'high',
        };
      },
      priority: 80,
    };
  }

  private createWorkEnvironmentTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const chatTopics = interactions
          .filter(i => i.type === 'chat_topic')
          .map(i => i.content.toLowerCase());

        return chatTopics.some(t =>
          t.includes('remote') || t.includes('office') || t.includes('hybrid') || t.includes('location')
        );
      },
      generate: (context) => {
        return {
          id: `dynamic-environment-${Date.now()}`,
          area: 'environment',
          type: 'scenario',
          text: `Based on your career conversations, how important is work location flexibility to you?`,
          options: [
            {
              value: 'fully-remote',
              label: 'Essential - I need fully remote work for my lifestyle',
              insight: 'Location independence is a top priority'
            },
            {
              value: 'hybrid-preferred',
              label: 'Preferred - I like hybrid but could adapt',
              insight: 'Values flexibility but open to compromise'
            },
            {
              value: 'in-person-preferred',
              label: 'I actually prefer in-person collaboration',
              insight: 'Values face-to-face interaction and office culture'
            },
            {
              value: 'role-dependent',
              label: 'It depends on the role and team',
              insight: 'Contextual decision-making on work environment'
            },
          ],
          weight: 'medium',
        };
      },
      priority: 75,
    };
  }

  private createTeamSizeTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const companies = interactions
          .map(i => i.metadata?.company)
          .filter(Boolean);
        return companies.length >= 2;
      },
      generate: (context) => {
        return {
          id: `dynamic-team-size-${Date.now()}`,
          area: 'work-style',
          type: 'multiple-choice',
          text: `Thinking about the companies you've explored, what team size appeals to you most?`,
          options: [
            {
              value: 'small-team',
              label: 'Small team (5-15 people) where I know everyone',
              insight: 'Prefers close-knit, collaborative environments'
            },
            {
              value: 'medium-team',
              label: 'Medium team (15-50) with specialized roles',
              insight: 'Values structure with manageable relationships'
            },
            {
              value: 'large-org',
              label: 'Large organization (50+) with many resources',
              insight: 'Comfortable in complex organizational structures'
            },
            {
              value: 'varied',
              label: 'Varied - depends on the work and culture',
              insight: 'Flexible and adaptable to different team dynamics'
            },
          ],
          weight: 'medium',
        };
      },
      priority: 70,
    };
  }

  private createImpactScopeTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const roleDescriptions = interactions
          .filter(i => i.type === 'role_interest')
          .map(i => i.content.toLowerCase());

        return roleDescriptions.length >= 2;
      },
      generate: (context) => {
        return {
          id: `dynamic-impact-${Date.now()}`,
          area: 'values',
          type: 'multiple-choice',
          text: `Looking at the roles you're considering, what kind of impact do you want your work to have?`,
          options: [
            {
              value: 'direct-individual',
              label: 'Direct impact on individuals (patients, clients, students)',
              insight: 'Person-centered impact orientation'
            },
            {
              value: 'team-organizational',
              label: 'Impact through team or organizational improvements',
              insight: 'Systems-level thinking and organizational impact'
            },
            {
              value: 'industry-field',
              label: 'Influence on entire industry or field',
              insight: 'Ambitious, field-shaping aspirations'
            },
            {
              value: 'multiple-levels',
              label: 'Multiple levels - from individual to systemic',
              insight: 'Multi-level impact perspective'
            },
          ],
          weight: 'high',
        };
      },
      priority: 85,
    };
  }

  private createCommunicationStyleTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const roles = interactions
          .filter(i => i.type === 'role_interest' || i.type === 'job_saved');
        return roles.length >= 3;
      },
      generate: (context) => {
        return {
          id: `dynamic-communication-${Date.now()}`,
          area: 'people-interaction',
          type: 'scenario',
          text: `In the roles you're exploring, which communication format would you find most energizing?`,
          options: [
            {
              value: 'written-async',
              label: 'Written communication (emails, docs, reports)',
              insight: 'Prefers thoughtful, asynchronous communication'
            },
            {
              value: 'presentations',
              label: 'Presentations and public speaking',
              insight: 'Confident presenter, enjoys structured communication'
            },
            {
              value: 'meetings-discussions',
              label: 'Meetings and real-time discussions',
              insight: 'Thrives in dynamic, interactive settings'
            },
            {
              value: 'one-on-one',
              label: 'One-on-one conversations',
              insight: 'Relationship-focused, prefers deeper connections'
            },
          ],
          weight: 'medium',
        };
      },
      priority: 70,
    };
  }

  private createGrowthPathTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const chatTopics = interactions
          .filter(i => i.type === 'chat_topic')
          .map(i => i.content.toLowerCase());

        return chatTopics.some(t =>
          t.includes('career') || t.includes('growth') || t.includes('future') || t.includes('next')
        );
      },
      generate: (context) => {
        return {
          id: `dynamic-growth-${Date.now()}`,
          area: 'learning-growth',
          type: 'multiple-choice',
          text: `When you think about your career path, what type of growth matters most to you?`,
          options: [
            {
              value: 'skill-mastery',
              label: 'Deep skill mastery - becoming an expert in my craft',
              insight: 'Individual contributor excellence path'
            },
            {
              value: 'people-leadership',
              label: 'People leadership - managing and developing teams',
              insight: 'Management and leadership track preference'
            },
            {
              value: 'strategic-influence',
              label: 'Strategic influence - shaping direction and decisions',
              insight: 'Strategic leadership and organizational impact'
            },
            {
              value: 'breadth-versatility',
              label: 'Breadth and versatility - exploring diverse roles',
              insight: 'Generalist orientation, values variety'
            },
          ],
          weight: 'high',
        };
      },
      priority: 80,
    };
  }

  private createCompanyStageTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const companies = interactions
          .map(i => i.metadata?.company)
          .filter(Boolean);
        return companies.length >= 2;
      },
      generate: (context) => {
        return {
          id: `dynamic-company-stage-${Date.now()}`,
          area: 'environment',
          type: 'multiple-choice',
          text: `Based on your job searches, what company stage appeals to you most?`,
          options: [
            {
              value: 'early-startup',
              label: 'Early startup (< 50 people) - high impact, high ambiguity',
              insight: 'Thrives in uncertainty, entrepreneurial mindset'
            },
            {
              value: 'growth-stage',
              label: 'Growth stage (50-500) - scaling with some structure',
              insight: 'Balance of opportunity and stability'
            },
            {
              value: 'established',
              label: 'Established company (500+) - resources and stability',
              insight: 'Values resources, structure, and stability'
            },
            {
              value: 'mission-over-stage',
              label: 'Stage matters less than mission and culture',
              insight: 'Values-driven, less concerned with company size'
            },
          ],
          weight: 'medium',
        };
      },
      priority: 75,
    };
  }

  private createRoleResponsibilityTemplate(): QuestionTemplate {
    return {
      trigger: (interactions) => {
        const roles = interactions
          .filter(i => i.type === 'role_interest' || i.type === 'job_saved')
          .map(i => i.metadata?.jobFunction)
          .filter(Boolean);

        return roles.length >= 2;
      },
      generate: (context) => {
        const functions = context.interactions
          .map(i => i.metadata?.jobFunction)
          .filter((f): f is string => Boolean(f));

        if (functions.length === 0) return null;

        const hasDiverse = new Set(functions).size >= 2;

        if (hasDiverse) {
          return {
            id: `dynamic-responsibility-${Date.now()}`,
            area: 'work-style',
            type: 'multiple-choice',
            text: `You're considering roles across different functions. Do you prefer focused expertise or diverse responsibilities?`,
            options: [
              {
                value: 'specialist',
                label: 'Specialist - Deep focus on one area of expertise',
                insight: 'Specialist orientation, values depth over breadth'
              },
              {
                value: 'generalist',
                label: 'Generalist - Variety across multiple areas',
                insight: 'Generalist mindset, values versatility'
              },
              {
                value: 't-shaped',
                label: 'T-shaped - Deep in one area, broad in others',
                insight: 'Balanced depth and breadth approach'
              },
              {
                value: 'evolving',
                label: 'Evolving - Different at different career stages',
                insight: 'Growth-oriented, adaptable career philosophy'
              },
            ],
            weight: 'high',
          };
        }

        return null;
      },
      priority: 80,
    };
  }

  private extractCommonThemes(roles: string[]): string[] {
    const themes: string[] = [];
    const rolesLower = roles.map(r => r.toLowerCase());

    const themePatterns = [
      { keywords: ['teach', 'education', 'train', 'instruct', 'tutor'], theme: 'education' },
      { keywords: ['manage', 'leader', 'director', 'supervisor', 'head'], theme: 'management' },
      { keywords: ['patient', 'clinical', 'healthcare', 'medical', 'nurse'], theme: 'healthcare' },
      { keywords: ['market', 'brand', 'campaign', 'social media', 'content'], theme: 'marketing' },
      { keywords: ['design', 'creative', 'visual', 'ux', 'ui'], theme: 'design' },
      { keywords: ['data', 'analyst', 'analytics', 'research'], theme: 'analytics' },
      { keywords: ['sales', 'account', 'business development', 'customer'], theme: 'sales' },
      { keywords: ['engineer', 'developer', 'technical', 'software'], theme: 'technical' },
    ];

    for (const pattern of themePatterns) {
      const matches = rolesLower.some(role =>
        pattern.keywords.some(keyword => role.includes(keyword))
      );
      if (matches) {
        themes.push(pattern.theme);
      }
    }

    return themes;
  }
}