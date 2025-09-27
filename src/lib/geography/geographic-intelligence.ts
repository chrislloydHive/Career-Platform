import { UserProfile } from '@/types/user-profile';
import { AdaptiveQuestion, ExplorationArea } from '../adaptive-questions/question-banks';
import { QuestionResponse } from '../adaptive-questions/adaptive-engine';

export type LocationType = 'major-metro' | 'mid-size-city' | 'small-city' | 'suburban' | 'rural';
export type RemotePreference = 'fully-remote' | 'remote-first' | 'hybrid-flexible' | 'hybrid-required' | 'in-office';

export interface LocationExperience {
  location: string;
  locationType: LocationType;
  yearsLived: number;
  workExperience: {
    company: string;
    title: string;
    duration: string;
  }[];
  satisfactionFactors: string[];
  challenges: string[];
}

export interface GeographicProfile {
  currentLocation: string;
  currentLocationType: LocationType;
  locationHistory: LocationExperience[];
  preferredLocations: string[];
  remotePreference: RemotePreference;
  mobilityScore: number;
  locationFlexibility: number;
  urbanVsSmallCityPreference: number;
}

export interface LocationImpact {
  factor: 'career-opportunity' | 'cost-of-living' | 'lifestyle' | 'community' | 'family-proximity' | 'outdoor-access';
  importance: number;
  currentSatisfaction: number;
  idealState: string;
  tradeoffs: string[];
}

export interface GeographicInsight {
  type: 'preference' | 'trade-off' | 'opportunity' | 'constraint' | 'remote-fit';
  insight: string;
  confidence: number;
  locationSpecific: boolean;
  recommendations: string[];
}

export class GeographicIntelligence {
  private profile: UserProfile;
  private responses: Record<string, QuestionResponse>;

  constructor(profile: UserProfile, responses: Record<string, QuestionResponse>) {
    this.profile = profile;
    this.responses = responses;
  }

  buildGeographicProfile(): GeographicProfile {
    const currentLocation = this.profile.location;
    const currentLocationType = this.categorizeLocation(currentLocation);

    const locationHistory = this.extractLocationHistory();
    const preferredLocations = this.profile.preferredLocations;
    const remotePreference = this.inferRemotePreference();
    const mobilityScore = this.calculateMobilityScore();
    const locationFlexibility = this.calculateLocationFlexibility();
    const urbanVsSmallCityPreference = this.calculateUrbanPreference();

    return {
      currentLocation,
      currentLocationType,
      locationHistory,
      preferredLocations,
      remotePreference,
      mobilityScore,
      locationFlexibility,
      urbanVsSmallCityPreference,
    };
  }

  private categorizeLocation(location: string): LocationType {
    const locationLower = location.toLowerCase();

    const majorMetros = ['seattle', 'san francisco', 'new york', 'los angeles', 'chicago', 'boston', 'austin', 'denver'];
    const midSizeCities = ['portland', 'salt lake', 'boise', 'reno'];
    const smallCities = ['spokane', 'bellingham', 'yakima', 'wenatchee'];

    for (const metro of majorMetros) {
      if (locationLower.includes(metro)) return 'major-metro';
    }

    for (const city of midSizeCities) {
      if (locationLower.includes(city)) return 'mid-size-city';
    }

    for (const city of smallCities) {
      if (locationLower.includes(city)) return 'small-city';
    }

    return 'small-city';
  }

  private extractLocationHistory(): LocationExperience[] {
    const history: LocationExperience[] = [];
    const locationMap = new Map<string, LocationExperience>();

    for (const exp of this.profile.experience) {
      const location = exp.location || this.profile.location;

      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location,
          locationType: this.categorizeLocation(location),
          yearsLived: 0,
          workExperience: [],
          satisfactionFactors: [],
          challenges: [],
        });
      }

      const locExp = locationMap.get(location)!;
      locExp.workExperience.push({
        company: exp.company,
        title: exp.title,
        duration: `${exp.startDate} - ${exp.endDate || 'Present'}`,
      });

      const startYear = parseInt(exp.startDate.split(' ')[1] || new Date().getFullYear().toString());
      const endYear = exp.endDate ? parseInt(exp.endDate.split(' ')[1]) : new Date().getFullYear();
      locExp.yearsLived = Math.max(locExp.yearsLived, endYear - startYear);
    }

    for (const locExp of locationMap.values()) {
      history.push(locExp);
    }

    return history.sort((a, b) => b.yearsLived - a.yearsLived);
  }

  private inferRemotePreference(): RemotePreference {
    const preferredLocations = this.profile.preferredLocations.join(' ').toLowerCase();

    if (preferredLocations.includes('remote')) {
      if (preferredLocations.includes('pacific northwest') || preferredLocations.includes('spokane')) {
        return 'remote-first';
      }
      return 'fully-remote';
    }

    const workEnvironment = this.profile.careerPreferences.workEnvironment.join(' ').toLowerCase();
    if (workEnvironment.includes('hybrid') || workEnvironment.includes('flexibility')) {
      return 'hybrid-flexible';
    }

    const locationCount = this.profile.preferredLocations.filter(loc => !loc.toLowerCase().includes('remote')).length;
    if (locationCount <= 2) {
      return 'hybrid-required';
    }

    return 'hybrid-flexible';
  }

  private calculateMobilityScore(): number {
    let score = 0.5;

    const locationHistory = this.extractLocationHistory();
    if (locationHistory.length >= 2) {
      score += 0.3;
    }

    const hasRemotePreference = this.profile.preferredLocations.some(loc =>
      loc.toLowerCase().includes('remote')
    );
    if (hasRemotePreference) {
      score += 0.2;
    }

    const familyValue = this.profile.values.some(v =>
      v.toLowerCase().includes('family') || v.toLowerCase().includes('community')
    );
    if (familyValue) {
      score -= 0.2;
    }

    const workLifeBalancePriority = this.profile.careerPreferences.workLifeBalance.toLowerCase().includes('high priority');
    if (workLifeBalancePriority) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateLocationFlexibility(): number {
    let score = 0.5;

    const preferredLocationCount = this.profile.preferredLocations.length;
    score += Math.min(preferredLocationCount * 0.15, 0.45);

    const hasRemoteOption = this.profile.preferredLocations.some(loc =>
      loc.toLowerCase().includes('remote')
    );
    if (hasRemoteOption) {
      score += 0.3;
    }

    const hasRegionPreference = this.profile.preferredLocations.some(loc =>
      loc.toLowerCase().includes('pacific northwest')
    );
    if (hasRegionPreference) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  private calculateUrbanPreference(): number {
    let score = 0.5;

    const currentLocationType = this.categorizeLocation(this.profile.location);
    if (currentLocationType === 'small-city') {
      score -= 0.2;
    }

    const locationHistory = this.extractLocationHistory();
    const hasMetroExperience = locationHistory.some(loc => loc.locationType === 'major-metro');
    if (hasMetroExperience) {
      score += 0.15;
    }

    const preferredLocations = this.profile.preferredLocations.join(' ').toLowerCase();
    if (preferredLocations.includes('seattle')) {
      score += 0.2;
    }
    if (preferredLocations.includes('spokane')) {
      score -= 0.15;
    }

    const outdoorValues = this.profile.interests.some(i =>
      i.toLowerCase().includes('fitness') || i.toLowerCase().includes('movement')
    );
    if (outdoorValues) {
      score -= 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  generateGeographicQuestions(geoProfile: GeographicProfile): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push(...this.generateLocationPreferenceQuestions(geoProfile));
    questions.push(...this.generateRemoteWorkQuestions(geoProfile));
    questions.push(...this.generateUrbanVsSmallCityQuestions(geoProfile));
    questions.push(...this.generateGeographyWorkLifeQuestions(geoProfile));

    return questions;
  }

  private generateLocationPreferenceQuestions(geoProfile: GeographicProfile): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    if (geoProfile.locationHistory.length >= 2) {
      questions.push({
        id: 'geo-experience-1',
        area: 'environment' as ExplorationArea,
        type: 'multiple-choice',
        text: `You've worked in both ${geoProfile.locationHistory[0].location} and ${geoProfile.locationHistory[1]?.location}. Which aspects of each location did you appreciate most?`,
        options: [
          {
            value: 'opportunities',
            label: 'Career opportunities and professional network',
            insight: 'Career opportunity drives location choices'
          },
          {
            value: 'lifestyle',
            label: 'Lifestyle, outdoor access, and quality of life',
            insight: 'Lifestyle quality drives location choices'
          },
          {
            value: 'community',
            label: 'Community feel and personal connections',
            insight: 'Community connection drives location choices'
          },
          {
            value: 'cost',
            label: 'Cost of living and affordability',
            insight: 'Financial considerations drive location choices'
          }
        ]
      });

      questions.push({
        id: 'geo-experience-2',
        area: 'environment' as ExplorationArea,
        type: 'scenario',
        text: 'Thinking about Spokane vs Seattle: what trade-offs matter most to you when choosing where to live and work?',
        options: [
          {
            value: 'career-vs-lifestyle',
            label: 'Career opportunities (Seattle) vs lifestyle/affordability (Spokane)',
            insight: 'Weighs career access against quality of life'
          },
          {
            value: 'pace-vs-community',
            label: 'Fast pace and diversity (Seattle) vs community and slower pace (Spokane)',
            insight: 'Values community over urban energy'
          },
          {
            value: 'salary-vs-cost',
            label: 'Higher salaries (Seattle) vs lower cost of living (Spokane)',
            insight: 'Focuses on net financial position'
          },
          {
            value: 'network-vs-roots',
            label: 'Larger professional network (Seattle) vs personal roots (Spokane)',
            insight: 'Balances professional growth with personal connections'
          }
        ]
      });
    }

    questions.push({
      id: 'geo-preference-1',
      area: 'environment' as ExplorationArea,
      type: 'open-ended',
      text: 'What would make you willing to relocate for a job opportunity? What would keep you rooted where you are?',
    });

    return questions;
  }

  private generateRemoteWorkQuestions(geoProfile: GeographicProfile): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push({
      id: 'geo-remote-1',
      area: 'work-style' as ExplorationArea,
      type: 'multiple-choice',
      text: 'How do you feel about remote work for the majority of your career?',
      options: [
        {
          value: 'fully-remote-ideal',
          label: 'Ideal - I prefer working from home full-time',
          insight: 'Strong remote work preference'
        },
        {
          value: 'remote-with-community',
          label: 'Great, but I need regular team connection (virtual or occasional in-person)',
          insight: 'Remote work with social connection needs'
        },
        {
          value: 'hybrid-preferred',
          label: 'Hybrid is best - mix of home and office',
          insight: 'Hybrid work preference'
        },
        {
          value: 'office-preferred',
          label: 'I prefer being in an office with my team',
          insight: 'In-office work preference'
        },
        {
          value: 'depends-on-role',
          label: 'It depends on the role and company culture',
          insight: 'Context-dependent remote work attitude'
        }
      ]
    });

    questions.push({
      id: 'geo-remote-2',
      area: 'work-style' as ExplorationArea,
      type: 'scenario',
      text: 'A fully-remote health tech company offers you a role, but most team members are in SF/Seattle. How do you feel about this setup?',
      options: [
        {
          value: 'excited',
          label: 'Excited - best of both worlds (remote flexibility + access to opportunities)',
          insight: 'Sees remote work as enabling access to larger markets'
        },
        {
          value: 'concerned-isolation',
          label: 'Concerned about feeling isolated from the team',
          insight: 'Social connection concerns with remote work'
        },
        {
          value: 'need-occasional-travel',
          label: 'Good if I can travel to HQ occasionally (quarterly)',
          insight: 'Remote work with periodic in-person preference'
        },
        {
          value: 'prefer-local',
          label: 'Would prefer local or regional team members',
          insight: 'Values geographic proximity to team'
        }
      ]
    });

    if (geoProfile.currentLocationType === 'small-city') {
      questions.push({
        id: 'geo-remote-3',
        area: 'values' as ExplorationArea,
        type: 'open-ended',
        text: 'Living in Spokane while working remotely for a company elsewhere - what appeals to you about this, and what concerns you?',
      });
    }

    return questions;
  }

  private generateUrbanVsSmallCityQuestions(geoProfile: GeographicProfile): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push({
      id: 'geo-urban-1',
      area: 'environment' as ExplorationArea,
      type: 'scale',
      text: 'When you think about your ideal work location long-term, where do you see yourself?',
      options: [
        {
          value: '1',
          label: 'Small city (like Spokane) - community, affordability, outdoor access',
          insight: 'Strong small city preference'
        },
        {
          value: '2',
          label: 'Lean toward small city but open to mid-size',
          insight: 'Small city preference with some flexibility'
        },
        {
          value: '3',
          label: 'Balanced - could be happy in either depending on other factors',
          insight: 'Flexible on urban vs small city'
        },
        {
          value: '4',
          label: 'Lean toward major metro but value smaller city benefits',
          insight: 'Urban preference with small city appreciation'
        },
        {
          value: '5',
          label: 'Major metro (like Seattle) - career opportunities, diversity, energy',
          insight: 'Strong urban preference'
        }
      ]
    });

    questions.push({
      id: 'geo-urban-2',
      area: 'values' as ExplorationArea,
      type: 'multiple-choice',
      text: 'What do you value most about living in Spokane that you\'d miss in a bigger city?',
      options: [
        {
          value: 'affordability',
          label: 'Cost of living and ability to save money',
          insight: 'Financial advantage of smaller city matters'
        },
        {
          value: 'community',
          label: 'Tight-knit community and personal connections',
          insight: 'Community connection is priority'
        },
        {
          value: 'pace',
          label: 'Slower pace and less stress',
          insight: 'Values lower-stress environment'
        },
        {
          value: 'outdoor-access',
          label: 'Easy access to outdoors and nature',
          insight: 'Outdoor access is key quality of life factor'
        },
        {
          value: 'not-much',
          label: 'Not much - I\'m ready for more opportunities',
          insight: 'Open to urban move'
        }
      ]
    });

    questions.push({
      id: 'geo-urban-3',
      area: 'values' as ExplorationArea,
      type: 'multiple-choice',
      text: 'What do you miss about Seattle or wish Spokane had more of?',
      options: [
        {
          value: 'career-opportunities',
          label: 'More career opportunities and companies in my field',
          insight: 'Limited career access is constraint in smaller city'
        },
        {
          value: 'diversity',
          label: 'Greater diversity of people, ideas, and experiences',
          insight: 'Values urban diversity'
        },
        {
          value: 'amenities',
          label: 'More restaurants, events, and cultural activities',
          insight: 'Urban amenities matter for lifestyle'
        },
        {
          value: 'energy',
          label: 'The energy and pace of a bigger city',
          insight: 'Drawn to urban energy'
        },
        {
          value: 'satisfied',
          label: 'I\'m pretty satisfied with what Spokane offers',
          insight: 'Content with small city offerings'
        }
      ]
    });

    return questions;
  }

  private generateGeographyWorkLifeQuestions(geoProfile: GeographicProfile): AdaptiveQuestion[] {
    const questions: AdaptiveQuestion[] = [];

    questions.push({
      id: 'geo-worklife-1',
      area: 'values' as ExplorationArea,
      type: 'scenario',
      text: 'How does your location choice connect to your work-life balance priorities?',
      options: [
        {
          value: 'enables-balance',
          label: 'Smaller city enables better balance (shorter commute, lower stress)',
          insight: 'Geography directly enables work-life balance'
        },
        {
          value: 'limits-career',
          label: 'Staying here might limit career growth which affects long-term balance',
          insight: 'Sees career-geography trade-off'
        },
        {
          value: 'remote-solves',
          label: 'Remote work solves this - I can have both',
          insight: 'Remote work as solution to geography-career tension'
        },
        {
          value: 'family-matters',
          label: 'Being near family/community is part of my work-life balance',
          insight: 'Social ties influence location decisions'
        }
      ]
    });

    questions.push({
      id: 'geo-worklife-2',
      area: 'environment' as ExplorationArea,
      type: 'open-ended',
      text: 'Your athletic background shows outdoor/fitness is important. How does geography factor into maintaining that lifestyle alongside career?',
    });

    return questions;
  }

  analyzeLocationImpacts(geoProfile: GeographicProfile): LocationImpact[] {
    const impacts: LocationImpact[] = [];

    impacts.push(this.analyzeCareerOpportunityImpact(geoProfile));
    impacts.push(this.analyzeCostOfLivingImpact(geoProfile));
    impacts.push(this.analyzeLifestyleImpact(geoProfile));
    impacts.push(this.analyzeCommunityImpact(geoProfile));
    impacts.push(this.analyzeOutdoorAccessImpact(geoProfile));

    return impacts.sort((a, b) => (b.importance * (1 - b.currentSatisfaction)) - (a.importance * (1 - a.currentSatisfaction)));
  }

  private analyzeCareerOpportunityImpact(geoProfile: GeographicProfile): LocationImpact {
    let importance = 0.8;
    let currentSatisfaction = 0.4;

    const growthOriented = this.profile.careerPreferences.dealBreakers.some(db =>
      db.toLowerCase().includes('lack of growth')
    );
    if (growthOriented) {
      importance = 0.9;
    }

    if (geoProfile.currentLocationType === 'small-city') {
      currentSatisfaction = 0.3;
    } else if (geoProfile.currentLocationType === 'major-metro') {
      currentSatisfaction = 0.9;
    }

    const remoteResponse = this.responses['geo-remote-1'];
    if (remoteResponse && (String(remoteResponse.response) === 'fully-remote-ideal' || String(remoteResponse.response) === 'remote-with-community')) {
      currentSatisfaction += 0.3;
    }

    return {
      factor: 'career-opportunity',
      importance,
      currentSatisfaction: Math.min(currentSatisfaction, 1.0),
      idealState: 'Access to health tech companies via remote work or proximity to tech hubs',
      tradeoffs: [
        'Remote work expands opportunity without relocation',
        'Moving to Seattle = more opportunities but higher cost',
        'Staying Spokane = limited local roles but quality of life'
      ]
    };
  }

  private analyzeCostOfLivingImpact(geoProfile: GeographicProfile): LocationImpact {
    let importance = 0.6;
    let currentSatisfaction = 0.8;

    const compensationNote = this.profile.careerPreferences.compensationPriority;
    if (compensationNote.toLowerCase().includes('competitive')) {
      importance = 0.7;
    }

    if (geoProfile.currentLocationType === 'small-city') {
      currentSatisfaction = 0.9;
    } else if (geoProfile.currentLocationType === 'major-metro') {
      currentSatisfaction = 0.4;
    }

    return {
      factor: 'cost-of-living',
      importance,
      currentSatisfaction,
      idealState: 'Affordable cost of living that allows saving and lifestyle enjoyment',
      tradeoffs: [
        'Spokane = lower cost, easier to save, better housing affordability',
        'Seattle = higher salary but eaten by rent/expenses',
        'Remote work in Spokane = Seattle salary with Spokane expenses (best of both)'
      ]
    };
  }

  private analyzeLifestyleImpact(geoProfile: GeographicProfile): LocationImpact {
    let importance = 0.75;
    let currentSatisfaction = 0.7;

    const workLifeBalancePriority = this.profile.careerPreferences.workLifeBalance.toLowerCase().includes('high priority');
    if (workLifeBalancePriority) {
      importance = 0.85;
    }

    const urbanResponse = this.responses['geo-urban-2'];
    if (urbanResponse) {
      const response = String(urbanResponse.response);
      if (response === 'pace' || response === 'outdoor-access') {
        currentSatisfaction = 0.85;
      }
    }

    return {
      factor: 'lifestyle',
      importance,
      currentSatisfaction,
      idealState: 'Location that supports active lifestyle, outdoor access, and sustainable pace',
      tradeoffs: [
        'Smaller cities offer slower pace and outdoor access',
        'Urban areas offer more cultural activities and diversity',
        'Work-life balance easier in less intense environments'
      ]
    };
  }

  private analyzeCommunityImpact(geoProfile: GeographicProfile): LocationImpact {
    let importance = 0.5;
    let currentSatisfaction = 0.7;

    const communityValue = this.profile.values.some(v =>
      v.toLowerCase().includes('community')
    );
    if (communityValue) {
      importance = 0.7;
    }

    const experienceResponse = this.responses['geo-experience-1'];
    if (experienceResponse && String(experienceResponse.response) === 'community') {
      importance = 0.8;
      currentSatisfaction = 0.85;
    }

    return {
      factor: 'community',
      importance,
      currentSatisfaction,
      idealState: 'Strong personal connections and sense of belonging',
      tradeoffs: [
        'Established roots vs new opportunities',
        'Smaller cities often have tighter communities',
        'Remote work can maintain connections while expanding career'
      ]
    };
  }

  private analyzeOutdoorAccessImpact(geoProfile: GeographicProfile): LocationImpact {
    let importance = 0.65;
    let currentSatisfaction = 0.8;

    const fitnessInterest = this.profile.interests.some(i =>
      i.toLowerCase().includes('fitness') || i.toLowerCase().includes('movement')
    );
    const athleticBackground = this.profile.strengths.some(s =>
      s.toLowerCase().includes('athletic') || s.toLowerCase().includes('division i')
    );

    if (fitnessInterest || athleticBackground) {
      importance = 0.8;
    }

    const urbanResponse = this.responses['geo-urban-2'];
    if (urbanResponse && String(urbanResponse.response) === 'outdoor-access') {
      importance = 0.85;
      currentSatisfaction = 0.9;
    }

    return {
      factor: 'outdoor-access',
      importance,
      currentSatisfaction,
      idealState: 'Easy access to outdoor activities and nature for fitness and wellbeing',
      tradeoffs: [
        'Pacific Northwest generally offers great outdoor access',
        'Smaller cities often have better proximity to nature',
        'Urban areas require more effort to access quality outdoor spaces'
      ]
    };
  }

  generateGeographicInsights(geoProfile: GeographicProfile, impacts: LocationImpact[]): GeographicInsight[] {
    const insights: GeographicInsight[] = [];

    insights.push(...this.generateLocationPreferenceInsights(geoProfile));
    insights.push(...this.generateRemoteWorkInsights(geoProfile));
    insights.push(...this.generateUrbanTradeoffInsights(geoProfile, impacts));
    insights.push(...this.generateGeographyCareerInsights(geoProfile, impacts));

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  private generateLocationPreferenceInsights(geoProfile: GeographicProfile): GeographicInsight[] {
    const insights: GeographicInsight[] = [];

    if (geoProfile.locationFlexibility >= 0.7) {
      insights.push({
        type: 'preference',
        insight: `Your location flexibility (${(geoProfile.locationFlexibility * 100).toFixed(0)}%) gives you strong optionality. You're open to Pacific Northwest broadly + remote work.`,
        confidence: 0.85,
        locationSpecific: false,
        recommendations: [
          'Target remote-first health tech companies',
          'Consider Seattle-based companies with remote flexibility',
          'Explore Portland and Boise as alternatives to Seattle'
        ]
      });
    }

    const experienceResponse = this.responses['geo-experience-1'];
    if (experienceResponse) {
      const response = String(experienceResponse.response);

      if (response === 'opportunities') {
        insights.push({
          type: 'trade-off',
          insight: 'Career opportunity is your primary location driver, which creates tension with Spokane as home base. Remote work or relocation will be important.',
          confidence: 0.9,
          locationSpecific: true,
          recommendations: [
            'Prioritize remote-friendly companies to access opportunities from Spokane',
            'If relocating to Seattle, ensure comp offsets cost increase',
            'Consider hybrid role with Spokane base and Seattle travel'
          ]
        });
      }

      if (response === 'lifestyle') {
        insights.push({
          type: 'preference',
          insight: 'Lifestyle quality matters more than career density to you. This makes Spokane + remote work an ideal combination.',
          confidence: 0.85,
          locationSpecific: true,
          recommendations: [
            'Seek remote roles that don\'t require frequent travel',
            'Negotiate home office setup and equipment',
            'Prioritize companies with strong remote culture'
          ]
        });
      }
    }

    return insights;
  }

  private generateRemoteWorkInsights(geoProfile: GeographicProfile): GeographicInsight[] {
    const insights: GeographicInsight[] = [];

    const remoteResponse = this.responses['geo-remote-1'];
    if (remoteResponse) {
      const response = String(remoteResponse.response);

      if (response === 'fully-remote-ideal' || response === 'remote-with-community') {
        insights.push({
          type: 'remote-fit',
          insight: 'Remote work strongly aligns with your preferences. This is a major advantage - health tech is heavily remote-friendly.',
          confidence: 0.9,
          locationSpecific: false,
          recommendations: [
            'Highlight remote work success in applications',
            'Join remote-first health tech companies (Teladoc, Livongo, Omada)',
            'Build virtual collaboration and communication skills',
            'Create dedicated home office space'
          ]
        });
      }

      if (response === 'hybrid-preferred') {
        insights.push({
          type: 'constraint',
          insight: 'Hybrid preference while living in Spokane limits options. Most hybrid roles require proximity to office (Seattle area).',
          confidence: 0.8,
          locationSpecific: true,
          recommendations: [
            'Look for companies with Spokane or Tri-Cities presence',
            'Consider "remote with quarterly travel" as compromise',
            'Be open to relocating if hybrid is non-negotiable'
          ]
        });
      }
    }

    const remoteTeamResponse = this.responses['geo-remote-2'];
    if (remoteTeamResponse) {
      const response = String(remoteTeamResponse.response);

      if (response === 'excited') {
        insights.push({
          type: 'opportunity',
          insight: 'You see remote work as enabling access to larger markets. This mindset unlocks national opportunities from Spokane.',
          confidence: 0.85,
          locationSpecific: false,
          recommendations: [
            'Apply to roles outside Pacific Northwest if they\'re remote',
            'Frame as "based in Spokane, working nationally"',
            'Emphasize cross-timezone and distributed team experience'
          ]
        });
      }

      if (response === 'concerned-isolation') {
        insights.push({
          type: 'constraint',
          insight: 'Social connection concerns with remote work. Look for companies with strong virtual culture and occasional meetups.',
          confidence: 0.75,
          locationSpecific: false,
          recommendations: [
            'Ask about team offsites and connection rituals in interviews',
            'Join local coworking space for social interaction',
            'Seek roles with regional colleagues (Seattle, Portland)'
          ]
        });
      }
    }

    return insights;
  }

  private generateUrbanTradeoffInsights(geoProfile: GeographicProfile, impacts: LocationImpact[]): GeographicInsight[] {
    const insights: GeographicInsight[] = [];

    const urbanPreferenceResponse = this.responses['geo-urban-1'];
    if (urbanPreferenceResponse) {
      const scale = String(urbanPreferenceResponse.response);

      if (scale === '1' || scale === '2') {
        insights.push({
          type: 'preference',
          insight: 'You have a clear small city preference. Remote work is key to accessing career opportunities without sacrificing lifestyle.',
          confidence: 0.9,
          locationSpecific: true,
          recommendations: [
            'Make Spokane + remote work your primary strategy',
            'Only relocate if opportunity is truly exceptional',
            'Network within Spokane health/wellness community for local options'
          ]
        });
      }

      if (scale === '4' || scale === '5') {
        insights.push({
          type: 'trade-off',
          insight: 'Urban preference suggests you may outgrow Spokane. Seattle relocation is likely in next 2-5 years for career growth.',
          confidence: 0.75,
          locationSpecific: true,
          recommendations: [
            'Start building Seattle network now',
            'Research Seattle cost of living and plan financially',
            'Look for roles that can transition from remote to hybrid in Seattle'
          ]
        });
      }

      if (scale === '3') {
        insights.push({
          type: 'preference',
          insight: 'Your flexibility on urban vs small city is an asset. You can optimize for best opportunity regardless of location.',
          confidence: 0.7,
          locationSpecific: false,
          recommendations: [
            'Evaluate each opportunity on its merits vs location',
            'Remote work gives you maximum flexibility',
            'Consider short-term Seattle stint to test before committing'
          ]
        });
      }
    }

    const spokaneValueResponse = this.responses['geo-urban-2'];
    const seattleMissResponse = this.responses['geo-urban-3'];

    if (spokaneValueResponse && seattleMissResponse) {
      const spokaneValue = String(spokaneValueResponse.response);
      const seattleMiss = String(seattleMissResponse.response);

      if (spokaneValue === 'affordability' && seattleMiss === 'career-opportunities') {
        insights.push({
          type: 'trade-off',
          insight: 'Classic small city trade-off: You value Spokane affordability but miss Seattle career access. Remote work is your sweet spot.',
          confidence: 0.95,
          locationSpecific: true,
          recommendations: [
            'Target remote health tech roles with Seattle-level compensation',
            'Negotiate salary based on market rate, not Spokane cost of living',
            'Spokane COL + Seattle salary = significant savings potential'
          ]
        });
      }

      if (spokaneValue === 'community' && seattleMiss === 'diversity') {
        insights.push({
          type: 'constraint',
          insight: 'You value both community connection and diversity - harder to find in small cities. Consider vibrant remote company culture.',
          confidence: 0.75,
          locationSpecific: false,
          recommendations: [
            'Look for companies with strong DEI commitment',
            'Seek distributed teams with diverse backgrounds',
            'Travel to Seattle quarterly for cultural activities'
          ]
        });
      }
    }

    return insights;
  }

  private generateGeographyCareerInsights(geoProfile: GeographicProfile, impacts: LocationImpact[]): GeographicInsight[] {
    const insights: GeographicInsight[] = [];

    const careerImpact = impacts.find(i => i.factor === 'career-opportunity');
    if (careerImpact && careerImpact.currentSatisfaction < 0.5) {
      insights.push({
        type: 'constraint',
        insight: `Career opportunity satisfaction is low (${(careerImpact.currentSatisfaction * 100).toFixed(0)}%) in Spokane. This is your biggest geographic challenge.`,
        confidence: 0.9,
        locationSpecific: true,
        recommendations: [
          'Remote work should be top priority in job search',
          'Build strong online presence and portfolio',
          'Network virtually with Seattle health tech community',
          'Consider relocation if right opportunity emerges'
        ]
      });
    }

    const workLifeResponse = this.responses['geo-worklife-1'];
    if (workLifeResponse) {
      const response = String(workLifeResponse.response);

      if (response === 'enables-balance') {
        insights.push({
          type: 'preference',
          insight: 'Smaller city directly enables your work-life balance goals. This should be weighted heavily in location decisions.',
          confidence: 0.85,
          locationSpecific: true,
          recommendations: [
            'Factor in commute time and stress when evaluating roles',
            'Remote work preserves this balance benefit',
            'If relocating, seek walkable Seattle neighborhoods'
          ]
        });
      }

      if (response === 'remote-solves') {
        insights.push({
          type: 'opportunity',
          insight: 'You\'ve identified remote work as the solution to geography-career tension. This clarity is powerful.',
          confidence: 0.95,
          locationSpecific: false,
          recommendations: [
            'Make "remote" a non-negotiable in job search',
            'Optimize home office for productivity and boundaries',
            'Build skills for asynchronous communication and self-management'
          ]
        });
      }
    }

    const topImpact = impacts[0];
    if (topImpact.importance * (1 - topImpact.currentSatisfaction) >= 0.3) {
      insights.push({
        type: 'trade-off',
        insight: `Your biggest location tension: ${topImpact.factor} (${(topImpact.importance * 100).toFixed(0)}% importance, ${(topImpact.currentSatisfaction * 100).toFixed(0)}% satisfied).`,
        confidence: 0.85,
        locationSpecific: true,
        recommendations: topImpact.tradeoffs.map(t => `Consider: ${t}`)
      });
    }

    return insights;
  }
}