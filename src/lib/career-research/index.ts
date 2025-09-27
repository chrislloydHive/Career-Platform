import { healthcareRoles } from './healthcare-roles';
import { techRoles } from './tech-roles';
import { marketingRoles } from './marketing-roles';
import { financeRoles } from './finance-roles';
import { wellnessRoles } from './wellness-roles';
import { designRoles } from './design-roles';

export const allJobCategories = [
  ...healthcareRoles,
  ...techRoles,
  ...marketingRoles,
  ...financeRoles,
  ...wellnessRoles,
  ...designRoles,
];

export { healthcareRoles, techRoles, marketingRoles, financeRoles, wellnessRoles, designRoles };

export { CareerResearchService, careerResearchService } from './career-service';