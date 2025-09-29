import { AnthropicClient } from './anthropic-client';

interface PersonalizedInsightRequest {
  profile: {
    responses: Record<string, unknown>;
    insights: Array<{ confidence: number; [key: string]: unknown }>;
    synthesizedInsights: Array<{ type: string; title: string; description: string; implications: string[] }>;
    authenticityProfile: Record<string, unknown>;
    patterns: Record<string, unknown>;
    analysis: { strengths?: string[] };
    topCareers: Array<{ title: string; match: number }>;
    completion: number;
  };
  careerRecommendations?: {
    topRecommendations: Array<{ jobTitle: string; matchScore: number; reasons: Array<{ factor: string; explanation: string }> }>;
  };
}

interface PersonalizedInsightResponse {
  primaryInsight: string;
  secondaryInsight: string;
  cognitivePattern: string;
  uniqueStrength: string;
  careerDirection: string;
  careerImplication: string;
  opportunityTease: string;
}

export class PersonalizedInsightsGenerator {
  private anthropicClient: AnthropicClient;

  constructor() {
    this.anthropicClient = new AnthropicClient();
  }

  async generatePersonalizedInsights(request: PersonalizedInsightRequest): Promise<PersonalizedInsightResponse> {
    // Check if Anthropic client is available
    if (!this.anthropicClient.isAvailable()) {
      console.warn('Anthropic API key not configured, using fallback insights');
      return this.getFallbackInsights(request);
    }

    const prompt = this.buildInsightPrompt(request);

    try {
      const response = await this.anthropicClient.generateResponse(
        'You are an expert career psychologist creating deeply personalized insights.',
        prompt
      );

      return this.parseInsightResponse(response);
    } catch (error) {
      console.error('Error generating personalized insights:', error);
      return this.getFallbackInsights(request);
    }
  }

  private buildInsightPrompt(request: PersonalizedInsightRequest): string {
    const { profile, careerRecommendations } = request;

    // Deep analysis of individual response patterns
    const responseAnalysis = this.analyzeIndividualResponses(profile.responses);
    const behavioralPatterns = this.identifyBehavioralPatterns(profile.responses);
    const decisionMakingStyle = this.analyzeDecisionMakingStyle(profile.responses);

    // Get the most significant insights
    const topInsights = profile.synthesizedInsights.slice(0, 3).map(i => `${i.title}: ${i.description}`);

    // Get top strengths
    const strengths = profile.analysis.strengths?.slice(0, 3) || [];

    // Get authenticity markers
    const authenticityMarkers = this.extractAuthenticityMarkers(profile.authenticityProfile);

    // Get career context
    const careerContext = careerRecommendations?.topRecommendations?.slice(0, 2).map(r =>
      `${r.jobTitle} (${r.matchScore}% match): ${r.reasons.slice(0, 2).map(reason => reason.explanation).join(', ')}`
    ) || [];

    // Create a unique assessment signature
    const assessmentSignature = this.createAssessmentSignature(profile, careerRecommendations);

    return `You are an expert career psychologist who creates deeply personalized insights. Based on this individual's UNIQUE assessment data, write personalized insights that feel like you've gotten inside their head.

INDIVIDUAL ASSESSMENT SIGNATURE: ${assessmentSignature}

DETAILED ANALYSIS:
Completion Level: ${profile.completion}%
Response Analysis: ${responseAnalysis}
Behavioral Patterns: ${behavioralPatterns}
Decision-Making Style: ${decisionMakingStyle}
Top Insights: ${topInsights.join(' | ')}
Key Strengths: ${strengths.join(', ')}
Authenticity Profile: ${authenticityMarkers}
Top Career Matches: ${careerContext.join(' | ')}

TASK: Generate insights that make the person think "Wow, this system really understands me!" Then "turn the corner" to show what this means for their career future.

STRUCTURE YOUR RESPONSE AS:
1. DISCOVERY PHASE: Deep psychological insights about them
2. IMPLICATION PHASE: What this means for their career trajectory
3. OPPORTUNITY TEASE: Compelling hint at their career potential

Focus on:
- Their unique cognitive/thinking patterns (and what careers need this)
- Why traditional career advice hasn't worked (and what type will)
- What secretly drives their decision-making (and where this leads)
- Their hidden professional superpowers (and where they're valuable)
- Specific behavioral patterns (and career environments that reward them)

Write in second person ("you") and make it feel like mind-reading that leads to career revelation.

Respond in this JSON format:
{
  "primaryInsight": "Main psychological insight about their mind/thinking pattern (2-3 sentences)",
  "secondaryInsight": "Secondary insight about their work style/decision-making (2-3 sentences)",
  "cognitivePattern": "Specific description of how they process information uniquely (1-2 sentences)",
  "uniqueStrength": "Their distinctive professional superpower that others miss (1-2 sentences)",
  "careerImplication": "What their psychological profile means for career success - the 'turn the corner' moment (2-3 sentences)",
  "opportunityTease": "Compelling tease about their career potential and what awaits them (1-2 sentences)",
  "careerDirection": "Why their specific recommended careers align with their psychological makeup (1-2 sentences)"
}`;
  }

  private analyzeResponsePatterns(responses: Record<string, unknown>): string {
    const patterns = [];
    const responseCount = Object.keys(responses).length;

    // Analyze response consistency
    const values = Object.values(responses).filter(v => typeof v === 'number' || typeof v === 'string');
    const numericValues = values.filter(v => typeof v === 'number') as number[];

    if (numericValues.length > 0) {
      const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericValues.length;

      if (variance > 1.5) {
        patterns.push('high response variability suggesting complex decision-making');
      } else {
        patterns.push('consistent response pattern indicating clear preferences');
      }
    }

    // Analyze response speed (simulated based on question count)
    if (responseCount > 50) {
      patterns.push('comprehensive engagement showing thoroughness');
    } else if (responseCount > 20) {
      patterns.push('balanced participation indicating thoughtful consideration');
    } else {
      patterns.push('focused responses showing decisive thinking');
    }

    return patterns.join(', ');
  }

  private analyzeIndividualResponses(responses: Record<string, unknown>): string {
    const analysis = [];
    const responseValues = Object.values(responses).filter(v => v !== null && v !== undefined);

    // Analyze response consistency
    const numericResponses = responseValues.filter(v => typeof v === 'number') as number[];
    const stringResponses = responseValues.filter(v => typeof v === 'string') as string[];

    if (numericResponses.length > 0) {
      const avg = numericResponses.reduce((a, b) => a + b, 0) / numericResponses.length;
      const variance = numericResponses.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / numericResponses.length;

      if (variance > 2) {
        analysis.push(`highly variable responses (variance: ${variance.toFixed(2)}) indicating complex decision-making`);
      } else if (variance < 0.5) {
        analysis.push(`consistent response pattern (variance: ${variance.toFixed(2)}) showing clear preferences`);
      } else {
        analysis.push(`moderate response variance (${variance.toFixed(2)}) suggesting balanced consideration`);
      }
    }

    // Analyze response distribution
    if (numericResponses.length > 0) {
      const extremeResponses = numericResponses.filter(v => v <= 2 || v >= 8).length;
      const extremeRatio = extremeResponses / numericResponses.length;

      if (extremeRatio > 0.6) {
        analysis.push('strong preference for extreme positions, indicating decisive personality');
      } else if (extremeRatio < 0.2) {
        analysis.push('preference for moderate positions, suggesting diplomatic approach');
      }
    }

    return analysis.join('; ');
  }

  private identifyBehavioralPatterns(responses: Record<string, unknown>): string {
    const patterns = [];
    const responseEntries = Object.entries(responses);

    // Look for question type clustering
    const collaborationQuestions = responseEntries.filter(([key]) =>
      key.toLowerCase().includes('team') || key.toLowerCase().includes('collaborate')
    );

    const creativityQuestions = responseEntries.filter(([key]) =>
      key.toLowerCase().includes('creative') || key.toLowerCase().includes('innovate')
    );

    const leadershipQuestions = responseEntries.filter(([key]) =>
      key.toLowerCase().includes('lead') || key.toLowerCase().includes('manage')
    );

    if (collaborationQuestions.length > 0) {
      const collabAvg = collaborationQuestions
        .filter(([, value]) => typeof value === 'number')
        .reduce((acc, [, value]) => acc + (value as number), 0) / collaborationQuestions.length;

      if (collabAvg > 7) {
        patterns.push('strong collaborative orientation');
      } else if (collabAvg < 4) {
        patterns.push('independent work preference');
      }
    }

    if (creativityQuestions.length > 0) {
      const creativeAvg = creativityQuestions
        .filter(([, value]) => typeof value === 'number')
        .reduce((acc, [, value]) => acc + (value as number), 0) / creativityQuestions.length;

      if (creativeAvg > 7) {
        patterns.push('high creative drive');
      }
    }

    return patterns.length > 0 ? patterns.join(', ') : 'mixed behavioral preferences indicating adaptability';
  }

  private analyzeDecisionMakingStyle(responses: Record<string, unknown>): string {
    const responseCount = Object.keys(responses).length;
    const nonNullResponses = Object.values(responses).filter(v => v !== null && v !== undefined).length;
    const completionRate = nonNullResponses / responseCount;

    if (completionRate > 0.9) {
      return 'thorough and comprehensive decision-maker who considers all options';
    } else if (completionRate > 0.7) {
      return 'balanced decision-maker who focuses on key factors';
    } else {
      return 'selective decision-maker who prioritizes efficiency over exhaustiveness';
    }
  }

  private createAssessmentSignature(profile: any, careerRecommendations?: any): string {
    // Create a short unique identifier for this specific assessment
    const signature = [
      `${profile.completion}%`,
      `${Object.keys(profile.responses).length}q`,
      `${profile.synthesizedInsights?.length || 0}i`,
      `${profile.analysis?.strengths?.length || 0}s`,
      `${careerRecommendations?.topRecommendations?.length || 0}c`
    ];

    return signature.join('-');
  }

  private extractAuthenticityMarkers(authenticityProfile: Record<string, unknown>): string {
    const markers = [];

    if (authenticityProfile.coreMotivation) {
      markers.push(`driven by "${authenticityProfile.coreMotivation}"`);
    }

    if (authenticityProfile.workStyle) {
      markers.push(`prefers ${authenticityProfile.workStyle} work environment`);
    }

    if (authenticityProfile.decisionMaking) {
      markers.push(`uses ${authenticityProfile.decisionMaking} decision-making approach`);
    }

    return markers.length > 0 ? markers.join(', ') : 'authentic self-expression valued highly';
  }

  private parseInsightResponse(response: string): PersonalizedInsightResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        primaryInsight: parsed.primaryInsight || '',
        secondaryInsight: parsed.secondaryInsight || '',
        cognitivePattern: parsed.cognitivePattern || '',
        uniqueStrength: parsed.uniqueStrength || '',
        careerImplication: parsed.careerImplication || '',
        opportunityTease: parsed.opportunityTease || '',
        careerDirection: parsed.careerDirection || ''
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        primaryInsight: "Your assessment reveals a unique approach to professional challenges.",
        secondaryInsight: "Your responses show a distinctive pattern of thinking that sets you apart.",
        cognitivePattern: "You process complex information in a methodical yet creative way.",
        uniqueStrength: "You have an ability to see connections that others overlook.",
        careerImplication: "This psychological profile points toward careers where your analytical depth and creative problem-solving are essential, not optional.",
        opportunityTease: "You're positioned for roles that most people can't handle—where complexity meets opportunity.",
        careerDirection: "Your recommended careers leverage your natural thinking style and reward your unique approach."
      };
    }
  }

  private getFallbackInsights(request: PersonalizedInsightRequest): PersonalizedInsightResponse {
    const { profile } = request;
    const hasHighCompletion = profile.completion >= 80;
    const hasCrossDomain = profile.synthesizedInsights.some(i => i.type === 'cross-domain');

    return {
      primaryInsight: hasHighCompletion
        ? "Your comprehensive responses reveal a mind that thrives on connecting disparate concepts. You don't just solve problems—you reframe them entirely, which explains why conventional career paths have felt constraining."
        : "Your thoughtful approach to each question shows you're someone who processes decisions through multiple lenses. This deliberate, multi-perspective thinking style is what makes you both thorough and innovative.",

      secondaryInsight: hasCrossDomain
        ? "Your responses across different domains reveal an intellectual restlessness—you're energized by variety and complexity, not content with surface-level engagement."
        : "Your focused response pattern indicates you value deep expertise over broad generalization, suggesting you're driven by mastery and meaningful contribution.",

      cognitivePattern: "You approach complex situations by first gathering comprehensive information, then synthesizing it into actionable insights.",

      uniqueStrength: hasCrossDomain
        ? "Your ability to bridge different fields and find unexpected connections is your professional superpower."
        : "Your capacity for deep, sustained focus combined with systems thinking sets you apart.",

      careerImplication: hasHighCompletion
        ? "Here's what this means for your career: you need roles where this cognitive complexity is an asset, not a liability. You're built for positions that reward intellectual agility and systems-level thinking."
        : "This psychological profile tells us something important—you belong in careers that value thoughtful analysis over quick decisions, where your deliberate approach becomes your competitive advantage.",

      opportunityTease: hasCrossDomain
        ? "You're wired for roles that don't exist in traditional job descriptions—the kind where organizations create positions around exceptional talent."
        : "The career paths opening up for you are where deep expertise meets high impact, where mastery translates directly into industry influence.",

      careerDirection: "Your recommended careers aren't just skill matches—they're designed around how your mind naturally operates and what secretly energizes you."
    };
  }
}