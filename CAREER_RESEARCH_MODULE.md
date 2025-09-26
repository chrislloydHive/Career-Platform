# Career Research Module Documentation

## Overview
Comprehensive career research module integrated into the job search platform, providing detailed information about healthcare, tech, marketing, and finance careers.

## Features

### 1. **Career Database**
- **19+ detailed career profiles** across 4 major categories
- Healthcare: Registered Nurse, Medical Assistant
- Tech: Software Engineers (Frontend, Backend, Full Stack), Data Scientist, DevOps Engineer, Product Manager, UX/UI Designer
- Marketing: Digital Marketing Manager, Content Specialist, Social Media Manager, SEO Specialist, Marketing Analyst
- Finance: Financial Analyst, Accountant, Financial Advisor, Investment Banker, Controller

### 2. **Career Information**
Each career includes:
- **Daily Tasks**: Time breakdowns of typical responsibilities
- **Required Skills**: Technical, soft, and certification requirements
- **Salary Ranges**: Entry, mid, senior, and executive levels (2024-2025 data)
- **Career Progression**: Detailed 4-level advancement paths
- **Industry Insights**: Current trends and market outlook
- **Work Environment**: Remote/hybrid/onsite options
- **Job Outlook**: Growth rates and competition levels
- **Education**: Degrees, certifications, and alternative pathways
- **Related Roles**: Career transition opportunities

### 3. **UI Components**

#### CareerExplorer (`/careers`)
- Browse careers by category
- Search by keywords
- Filter by salary range and experience level
- Interactive career cards with key metrics
- Category statistics

#### CareerDetailModal
- Full career profile with tabbed interface
- Daily tasks visualization
- Career progression roadmap
- Skills requirements checklist
- Industry insights and trends

#### CareerMatchResults
- AI-powered career matching
- Match score calculation (0-100)
- Missing skills analysis
- Salary alignment indicators
- Quick actions (save, share, view details)

#### CareerComparisonTool
- Side-by-side comparison of up to 3 careers
- Comprehensive comparison metrics
- Highlight key differences
- Export comparison data

## API Endpoints

### GET `/api/career-research`

**Query Parameters:**
- `action=categories` - Get all career categories
- `action=category&category=tech` - Get careers by category
- `action=job&id=software-engineer-frontend` - Get specific career
- `action=stats&category=healthcare` - Get category statistics
- `action=search&keywords=nursing,patient` - Search by keywords

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### POST `/api/career-research`

Match careers based on user criteria.

**Request Body:**
```json
{
  "category": "tech",
  "experienceLevel": "mid",
  "skills": ["javascript", "react"],
  "salaryMin": 80000,
  "salaryMax": 120000,
  "keywords": ["frontend", "web"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "jobCategory": { ... },
        "matchScore": 85,
        "matchReasons": ["Strong skill match", "Salary range matches"],
        "missingSkills": [],
        "salaryAlignment": "within"
      }
    ],
    "total": 3
  }
}
```

### GET `/api/career-research/[id]`

Get detailed information for a specific career by ID.

## Integration with Job Search

### SearchCriteria Integration
```typescript
import { suggestCareerPathsFromSearch } from '@/lib/career-research/integration-utils';

const careers = suggestCareerPathsFromSearch(searchCriteria);
```

### Job Enrichment
```typescript
import { enrichJobWithCareerData } from '@/lib/career-research/integration-utils';

const enrichedJob = enrichJobWithCareerData(job);
```

### Career Insights
```typescript
import { getCareerInsightsForJob } from '@/lib/career-research/integration-utils';

const insights = getCareerInsightsForJob(job);
// Returns: careerPath, growthOutlook, typicalSalary, requiredSkills, competitionLevel
```

## Usage Examples

### 1. Browse Careers
Navigate to `/careers` to explore all available career paths.

### 2. Search for Careers
```typescript
import { careerResearchService } from '@/lib/career-research/career-service';

const results = careerResearchService.searchByKeywords(['software', 'developer']);
```

### 3. Get Career Details
```typescript
const career = careerResearchService.findById('software-engineer-frontend');
```

### 4. Find Matching Careers
```typescript
const matches = careerResearchService.findMatchingCareers({
  category: 'tech',
  experienceLevel: 'mid',
  skills: ['javascript', 'react'],
  salaryMin: 80000,
  salaryMax: 120000,
});
```

### 5. Get Category Statistics
```typescript
const stats = careerResearchService.getCategoryStats('healthcare');
// Returns: totalRoles, averageSalary, averageGrowthRate, remoteOpportunities, competitionLevel
```

## Data Structure

### JobCategory
```typescript
{
  id: string;
  category: 'healthcare' | 'tech' | 'marketing' | 'finance';
  title: string;
  description: string;
  alternativeTitles: string[];
  dailyTasks: DailyTask[];
  requiredSkills: SkillRequirement[];
  salaryRanges: SalaryRange[];
  careerProgression: CareerProgression[];
  industryInsights: IndustryInsight[];
  workEnvironment: { ... };
  jobOutlook: { ... };
  education: { ... };
  relatedRoles: string[];
  keywords: string[];
}
```

## File Structure

```
src/
├── types/
│   └── career.ts                          # Career type definitions
├── lib/
│   └── career-research/
│       ├── healthcare-roles.ts            # Healthcare careers database
│       ├── tech-roles.ts                  # Tech careers database
│       ├── marketing-roles.ts             # Marketing careers database
│       ├── finance-roles.ts               # Finance careers database
│       ├── index.ts                       # Export all careers
│       ├── career-service.ts              # Career search & match service
│       └── integration-utils.ts           # Job search integration
├── components/
│   ├── CareerExplorer.tsx                 # Main career browser
│   ├── CareerDetailModal.tsx              # Career detail view
│   ├── CareerMatchResults.tsx             # Match results display
│   └── CareerComparisonTool.tsx           # Side-by-side comparison
└── app/
    ├── careers/
    │   └── page.tsx                       # Careers page
    └── api/
        └── career-research/
            ├── route.ts                   # Career API endpoints
            └── [id]/
                └── route.ts               # Individual career endpoint
```

## Matching Algorithm

The career matching system uses a comprehensive scoring algorithm:

1. **Base Score**: Starts at 100
2. **Salary Alignment**: -50 points if outside range
3. **Skill Matching**: Score multiplied by (matched required skills / total required skills)
4. **Preferred Skills**: +10 points for each matched preferred skill
5. **Keyword Matching**: Boosts score based on keyword matches
6. **Job Outlook**: Bonus for high growth careers

Match scores:
- 80-100: Excellent Match (green)
- 60-79: Good Match (blue)
- 40-59: Fair Match (yellow)
- 0-39: Potential Match (red)

## Navigation

A "Explore Careers" button has been added to the main job search page header, providing easy access to the career research module.

## Dark Theme

All components follow the platform's dark theme:
- Background: `bg-gray-950`, `bg-gray-900`, `bg-gray-800`
- Text: `text-gray-100`, `text-gray-200`, `text-gray-300`
- Borders: `border-gray-700`, `border-gray-600`
- Accent colors: Blue, green, purple, orange with proper contrast

## Future Enhancements

Potential additions:
- User profile to track saved careers
- Career path recommendations based on job search history
- Skill gap analysis tools
- Educational resource recommendations
- Interview preparation guides
- Networking opportunities
- Mentorship connections
- Career timeline planner