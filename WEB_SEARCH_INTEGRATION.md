# Web Search Integration for Career Exploration

## Overview

This document describes the web search capabilities integrated into the career exploration tool. The system provides a hybrid approach that combines internal database information with live web search data to deliver comprehensive, up-to-date career insights.

## Features

### 1. **Live Market Data Integration**
- Real-time salary information from web sources
- Current job market trends and demand statistics
- Industry-specific insights and outlook data
- Skills and requirements based on current job postings

### 2. **Hybrid Search System**
- Combines internal career database with web search results
- Enriches database entries with live market data
- Provides confidence scores for data freshness and accuracy
- Automatic fallback to web search for roles not in database

### 3. **Emerging Roles Discovery**
- Discovers newly created job titles and specializations
- Identifies trending career opportunities
- Tracks evolving roles that may not be in traditional databases
- Provides relevance scoring for emerging opportunities

### 4. **Day-in-Life Information**
- Gathers real-world experiences from web sources
- Compiles typical daily responsibilities
- Collects work-life balance insights
- Aggregates professional testimonials and reviews

### 5. **Dynamic Insights Components**
- Live updates on career market conditions
- Categorized insights (salary, trends, skills, lifestyle)
- Source attribution and confidence indicators
- Automatic refresh capabilities

## Architecture

### Services

#### `CareerWebSearchService`
**Location:** `/src/lib/web-search/career-search-service.ts`

Core service for performing web searches and parsing results:
- `searchCareerData()` - Main search interface for career information
- `getMarketTrends()` - Fetch current market trends
- `getCurrentSalaryData()` - Get live salary information
- `getDayInLifeInfo()` - Retrieve daily work experience data
- `getSkillsAndRequirements()` - Discover required skills and qualifications
- `discoverEmergingRoles()` - Find newly emerging career opportunities

#### `HybridCareerService`
**Location:** `/src/lib/web-search/hybrid-career-service.ts`

Combines database and web search results:
- `getEnhancedCareerData()` - Enriches database careers with live data
- `searchCareers()` - Hybrid search across both sources
- `compareCareerWithMarketData()` - Compare database vs. market data
- `getCareerByNameWithWebData()` - Fetch comprehensive career info

### API Endpoints

#### `/api/web-search` (POST)
Performs general web searches for career information.

**Request:**
```json
{
  "query": "software engineer salary 2025",
  "maxResults": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "...",
      "snippet": "...",
      "url": "...",
      "source": "...",
      "relevanceScore": 0.95
    }
  ],
  "query": "software engineer salary 2025",
  "timestamp": "2025-09-26T..."
}
```

#### `/api/career-web-search` (POST)
Performs comprehensive career searches combining database and web data.

**Request:**
```json
{
  "roleName": "Data Scientist",
  "location": "Seattle, WA",
  "focusAreas": ["salary", "requirements", "daytoday", "trends", "skills"],
  "includeEmerging": true
}
```

**Response:**
```json
{
  "databaseCareer": { /* JobCategory object */ },
  "webInsights": [
    {
      "category": "salary",
      "title": "...",
      "content": "...",
      "source": "...",
      "confidence": "high",
      "lastUpdated": "2025-09-26T..."
    }
  ],
  "searchResults": [ /* emerging roles */ ],
  "isEmerging": false,
  "lastSearched": "2025-09-26T..."
}
```

## Components

### `LiveCareerInsights`
**Location:** `/src/components/LiveCareerInsights.tsx`

Displays real-time career market data with:
- Category filtering (salary, trends, skills, lifestyle, etc.)
- Confidence indicators
- Source attribution
- Refresh capabilities
- Color-coded insight types

**Usage:**
```tsx
<LiveCareerInsights
  roleName="Software Engineer"
  location="San Francisco, CA"
  onInsightsLoaded={(insights) => console.log(insights)}
/>
```

### `EmergingRolesDiscovery`
**Location:** `/src/components/EmergingRolesDiscovery.tsx`

Discovers and displays emerging career opportunities:
- Search interface for category-based discovery
- Quick suggestions for popular categories
- Relevance scoring
- Direct links to learn more

**Usage:**
```tsx
<EmergingRolesDiscovery category="AI & Automation" />
```

## Integration Points

### Career Detail Modal
The `CareerDetailModal` component now includes a "Live Market Data" tab that displays:
- Real-time salary information
- Current market trends
- Skills demand
- Lifestyle insights
- Day-in-life information

Access via: Career Explorer → Select Career → "🌐 Live Market Data" tab

### Emerging Roles Page
Dedicated page for discovering new career opportunities:
- **URL:** `/careers/emerging`
- Search by category or keyword
- View relevance scores and descriptions
- Direct links to external sources

### Career Matching System
The matching system can optionally incorporate web search data:
- Compare user profile against live market requirements
- Identify skill gaps based on current job postings
- Provide recommendations using latest industry data

## Data Quality & Confidence

### Confidence Scoring
Each insight includes a confidence level:
- **High:** From trusted sources (LinkedIn, Glassdoor, BLS.gov) with strong keyword matches
- **Medium:** Either trusted source OR strong keyword matches
- **Low:** Limited source credibility and keyword relevance

### Data Freshness
Tracked for each insight:
- **Current:** Updated within 6 months
- **Recent:** Updated within 6-12 months
- **Outdated:** Over 12 months old

### Source Attribution
Every insight includes:
- Source name
- Publication date (when available)
- Direct link to original content
- Relevance score (0-1)

## Usage Examples

### Enhance Database Career with Web Data
```typescript
import { hybridCareerService } from '@/lib/web-search/hybrid-career-service';

const enhanced = await hybridCareerService.getEnhancedCareerData('career-id');
console.log(enhanced.enrichmentScore); // 0-100
console.log(enhanced.dataFreshness); // 'current' | 'recent' | 'outdated'
console.log(enhanced.liveInsights); // Market insights array
```

### Search with Hybrid Data
```typescript
const results = await hybridCareerService.searchCareers(
  'machine learning',
  true // include web data
);

console.log(results.existingCareers); // Database + enriched
console.log(results.emergingRoles); // Web-only discoveries
```

### Get Comprehensive Insights
```typescript
import { careerWebSearchService } from '@/lib/web-search/career-search-service';

const insights = await careerWebSearchService.getComprehensiveCareerInsights(
  'Product Manager',
  'New York, NY'
);

console.log(insights.trends); // Market trends
console.log(insights.salary); // Salary data
console.log(insights.lifestyle); // Day-in-life info
console.log(insights.skills); // Skills requirements
```

## Future Enhancements

### Planned Features
1. **Real-time Web Search Integration:** Replace mock data with actual web search API
2. **Caching Layer:** Implement Redis/memory cache for frequently searched roles
3. **Machine Learning:** Use ML to improve relevance scoring and insight extraction
4. **User Feedback:** Allow users to rate insight quality
5. **Personalized Insights:** Tailor insights based on user profile and preferences

### Integration Opportunities
1. **Natural Language Queries:** "Show me high-paying remote jobs in tech"
2. **Trend Alerts:** Notify users when their careers of interest show market changes
3. **Comparison Tool:** Side-by-side comparison of database vs. live market data
4. **Export Enhancement:** Include web insights in exported career research

## Technical Notes

### Current Limitations
- Web search currently uses mock data for demonstration
- No rate limiting implemented for API endpoints
- Results not cached (every request is fresh)
- Limited to text-based insights (no images/videos)

### Performance Considerations
- Web searches can take 2-5 seconds per query
- Multiple parallel searches used for comprehensive insights
- Consider implementing pagination for large result sets
- Background jobs could pre-populate insights for popular careers

### Security Considerations
- All external URLs open in new tabs with `rel="noopener noreferrer"`
- No sensitive user data sent to web search endpoints
- Input sanitization on all search queries
- CORS policies enforced on API routes

## Testing

### Manual Testing Checklist
- [ ] Visit `/careers/emerging` and search for "AI careers"
- [ ] Open any career in explorer and check "Live Market Data" tab
- [ ] Verify insights load and display properly
- [ ] Test refresh functionality
- [ ] Check confidence indicators and source links
- [ ] Verify emerging roles discovery works
- [ ] Test category filters in live insights
- [ ] Confirm error handling for failed searches

### API Testing
```bash
# Test web search
curl -X POST http://localhost:3000/api/web-search \
  -H "Content-Type: application/json" \
  -d '{"query": "data scientist salary", "maxResults": 3}'

# Test career web search
curl -X POST http://localhost:3000/api/career-web-search \
  -H "Content-Type: application/json" \
  -d '{"roleName": "Software Engineer", "focusAreas": ["salary", "trends"]}'
```

## Troubleshooting

### Common Issues

**Insights not loading:**
- Check browser console for errors
- Verify API endpoints are accessible
- Confirm network requests complete successfully

**Empty search results:**
- Try broader search terms
- Check API response for error messages
- Verify database has seeded career data

**Slow performance:**
- Reduce number of focus areas in requests
- Implement caching for frequently searched roles
- Consider background job for pre-fetching popular careers

## Support & Contribution

For questions or contributions related to web search integration:
1. Review this documentation
2. Check existing GitHub issues
3. Test locally before reporting bugs
4. Include API logs when reporting search issues