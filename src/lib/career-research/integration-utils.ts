import { SearchCriteria, RawJob, ScoredJob } from '@/types';
import { JobCategory, CareerResearchQuery } from '@/types/career';
import { careerResearchService } from './career-service';

export function searchCriteriaToCareerQuery(criteria: SearchCriteria): CareerResearchQuery {
  const keywords = criteria.query.toLowerCase().split(/\s+/);

  return {
    keywords,
    salaryMin: criteria.salary?.min,
    salaryMax: criteria.salary?.max,
  };
}

export function suggestCareerPathsFromSearch(criteria: SearchCriteria): JobCategory[] {
  const query = searchCriteriaToCareerQuery(criteria);
  const matches = careerResearchService.findMatchingCareers(query);

  return matches
    .filter(m => m.matchScore >= 50)
    .slice(0, 5)
    .map(m => m.jobCategory);
}

export function enrichJobWithCareerData(job: RawJob | ScoredJob): (RawJob | ScoredJob) & { careerPath?: JobCategory } {
  const careerPath = careerResearchService.findByTitle(job.title);

  return {
    ...job,
    careerPath,
  };
}

export function getRelatedCareerPaths(jobTitle: string): JobCategory[] {
  const mainCareer = careerResearchService.findByTitle(jobTitle);

  if (!mainCareer) {
    return [];
  }

  const relatedIds = mainCareer.relatedRoles
    .map(title => careerResearchService.findByTitle(title))
    .filter((career): career is JobCategory => career !== undefined);

  const sameCategory = careerResearchService
    .findByCategory(mainCareer.category)
    .filter(career => career.id !== mainCareer.id)
    .slice(0, 3);

  return [...relatedIds, ...sameCategory].slice(0, 5);
}

export function getCareerInsightsForJob(job: RawJob | ScoredJob): {
  careerPath?: JobCategory;
  growthOutlook?: string;
  typicalSalary?: { min: number; max: number; median: number };
  requiredSkills?: string[];
  competitionLevel?: 'low' | 'medium' | 'high';
} {
  const careerPath = careerResearchService.findByTitle(job.title);

  if (!careerPath) {
    return {};
  }

  const medianSalaryRange = careerPath.salaryRanges.find(s => s.experienceLevel === 'mid') ||
    careerPath.salaryRanges[0];

  return {
    careerPath,
    growthOutlook: careerPath.jobOutlook.growthRate,
    typicalSalary: medianSalaryRange ? {
      min: medianSalaryRange.min,
      max: medianSalaryRange.max,
      median: medianSalaryRange.median,
    } : undefined,
    requiredSkills: careerPath.requiredSkills
      .filter(s => s.importance === 'required')
      .map(s => s.skill)
      .slice(0, 5),
    competitionLevel: careerPath.jobOutlook.competitionLevel,
  };
}