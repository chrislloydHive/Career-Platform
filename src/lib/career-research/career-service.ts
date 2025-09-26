import { JobCategory, CareerResearchQuery, CareerMatch, CareerCategory as CareerCategoryType } from '@/types/career';
import { allJobCategories } from './index';

export class CareerResearchService {
  private categories: JobCategory[];

  constructor() {
    this.categories = allJobCategories;
  }

  findByCategory(category: CareerCategoryType): JobCategory[] {
    return this.categories.filter(job => job.category === category);
  }

  findById(id: string): JobCategory | undefined {
    return this.categories.find(job => job.id === id);
  }

  findByTitle(title: string): JobCategory | undefined {
    const normalizedTitle = title.toLowerCase().trim();
    return this.categories.find(job =>
      job.title.toLowerCase() === normalizedTitle ||
      job.alternativeTitles.some(alt => alt.toLowerCase() === normalizedTitle)
    );
  }

  searchByKeywords(keywords: string[]): JobCategory[] {
    const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());

    return this.categories.filter(job => {
      const jobKeywords = job.keywords.map(k => k.toLowerCase());
      const titleWords = job.title.toLowerCase().split(' ');
      const altTitleWords = job.alternativeTitles.flatMap(t => t.toLowerCase().split(' '));

      return normalizedKeywords.some(keyword =>
        jobKeywords.includes(keyword) ||
        titleWords.some(word => word.includes(keyword)) ||
        altTitleWords.some(word => word.includes(keyword))
      );
    });
  }

  findMatchingCareers(query: CareerResearchQuery): CareerMatch[] {
    let results = this.categories;

    if (query.category) {
      results = results.filter(job => job.category === query.category);
    }

    if (query.keywords && query.keywords.length > 0) {
      const keywordMatches = this.searchByKeywords(query.keywords);
      results = results.filter(job => keywordMatches.includes(job));
    }

    const matches: CareerMatch[] = results.map(job => {
      const match = this.calculateMatch(job, query);
      return match;
    });

    return matches
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatch(job: JobCategory, query: CareerResearchQuery): CareerMatch {
    let score = 100;
    const reasons: string[] = [];
    const missingSkills: string[] = [];
    let salaryAlignment: 'below' | 'within' | 'above' = 'within';

    if (query.experienceLevel) {
      const levelSalary = job.salaryRanges.find(s => s.experienceLevel === query.experienceLevel);
      if (levelSalary) {
        reasons.push(`Salary data available for ${query.experienceLevel} level`);
      }
    }

    if (query.salaryMin !== undefined || query.salaryMax !== undefined) {
      const matchingSalaryRanges = job.salaryRanges.filter(range => {
        if (query.salaryMin && range.max < query.salaryMin) return false;
        if (query.salaryMax && range.min > query.salaryMax) return false;
        return true;
      });

      if (matchingSalaryRanges.length === 0) {
        score -= 50;
        const avgSalary = job.salaryRanges[0]?.median || 0;
        if (query.salaryMin && avgSalary < query.salaryMin) {
          salaryAlignment = 'below';
          reasons.push(`Typical salary below your minimum (avg: $${avgSalary.toLocaleString()})`);
        } else if (query.salaryMax && avgSalary > query.salaryMax) {
          salaryAlignment = 'above';
          reasons.push(`Typical salary above your maximum (avg: $${avgSalary.toLocaleString()})`);
        }
      } else {
        reasons.push(`Salary range matches your criteria`);
      }
    }

    if (query.skills && query.skills.length > 0) {
      const requiredSkills = job.requiredSkills
        .filter(s => s.importance === 'required')
        .map(s => s.skill.toLowerCase());

      const preferredSkills = job.requiredSkills
        .filter(s => s.importance === 'preferred')
        .map(s => s.skill.toLowerCase());

      const userSkills = query.skills.map(s => s.toLowerCase());

      const matchedRequired = requiredSkills.filter(skill =>
        userSkills.some(userSkill => skill.includes(userSkill) || userSkill.includes(skill))
      );

      const matchedPreferred = preferredSkills.filter(skill =>
        userSkills.some(userSkill => skill.includes(userSkill) || userSkill.includes(skill))
      );

      const requiredMissing = requiredSkills.filter(skill =>
        !userSkills.some(userSkill => skill.includes(userSkill) || userSkill.includes(skill))
      );

      if (requiredSkills.length > 0) {
        const skillMatchPercentage = (matchedRequired.length / requiredSkills.length) * 100;
        score = score * (skillMatchPercentage / 100);

        if (skillMatchPercentage >= 80) {
          reasons.push(`Strong skill match (${matchedRequired.length}/${requiredSkills.length} required skills)`);
        } else if (skillMatchPercentage >= 50) {
          reasons.push(`Moderate skill match (${matchedRequired.length}/${requiredSkills.length} required skills)`);
        } else {
          reasons.push(`Limited skill match (${matchedRequired.length}/${requiredSkills.length} required skills)`);
        }
      }

      if (matchedPreferred.length > 0) {
        score += 10;
        reasons.push(`${matchedPreferred.length} preferred skills matched`);
      }

      missingSkills.push(...requiredMissing);
    }

    if (query.keywords && query.keywords.length > 0) {
      const keywordMatches = query.keywords.filter(keyword =>
        job.keywords.some(jobKeyword =>
          jobKeyword.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (keywordMatches.length > 0) {
        reasons.push(`${keywordMatches.length} keyword matches`);
      }
    }

    if (job.jobOutlook.growthRate) {
      const growthMatch = job.jobOutlook.growthRate.match(/(\d+)%/);
      if (growthMatch) {
        const growthRate = parseInt(growthMatch[1]);
        if (growthRate >= 10) {
          reasons.push('High job growth outlook');
        }
      }
    }

    if (job.workEnvironment.remote) {
      reasons.push('Remote work available');
    }

    return {
      jobCategory: job,
      matchScore: Math.max(0, Math.min(100, Math.round(score))),
      matchReasons: reasons,
      missingSkills,
      salaryAlignment,
    };
  }

  getAllCategories(): CareerCategoryType[] {
    return ['healthcare', 'tech', 'marketing', 'finance', 'wellness', 'design', 'education', 'business'];
  }

  getCategoryStats(category: CareerCategoryType) {
    const jobs = this.findByCategory(category);

    if (jobs.length === 0) {
      return null;
    }

    const allSalaries = jobs.flatMap(job => job.salaryRanges.map(s => s.median));
    const avgSalary = allSalaries.reduce((sum, sal) => sum + sal, 0) / allSalaries.length;

    const growthRates = jobs
      .map(job => {
        const match = job.jobOutlook.growthRate.match(/(\d+)%/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(rate => rate > 0);

    const avgGrowth = growthRates.length > 0
      ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
      : 0;

    return {
      category,
      totalRoles: jobs.length,
      averageSalary: Math.round(avgSalary),
      averageGrowthRate: Math.round(avgGrowth),
      remoteOpportunities: jobs.filter(j => j.workEnvironment.remote).length,
      competitionLevel: this.getMostCommonCompetition(jobs),
    };
  }

  private getMostCommonCompetition(jobs: JobCategory[]): 'low' | 'medium' | 'high' {
    const counts = { low: 0, medium: 0, high: 0 };
    jobs.forEach(job => counts[job.jobOutlook.competitionLevel]++);

    if (counts.low >= counts.medium && counts.low >= counts.high) return 'low';
    if (counts.high >= counts.medium) return 'high';
    return 'medium';
  }
}

export const careerResearchService = new CareerResearchService();