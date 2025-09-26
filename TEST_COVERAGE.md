# Test Coverage Summary

## Overview
Comprehensive test suite for the job search platform covering unit tests, integration tests, component tests, performance benchmarks, and error scenario testing.

## Test Categories

### 1. Unit Tests

#### Scraper Tests (`src/__tests__/lib/scrapers/`)
- **LinkedIn Scraper** (`linkedin-scraper.test.ts`)
  - Source name validation
  - Successful scraping handling
  - Error handling and graceful degradation
  - MaxResults parameter respect
  - Empty search results handling
  - Retry mechanism on transient failures
  - Data normalization validation

- **Indeed Scraper** (`indeed-scraper.test.ts`)
  - Source name validation
  - Successful scraping
  - CAPTCHA detection
  - MaxResults parameter
  - Popup handling
  - Fallback extraction strategies

#### Scoring Algorithm Tests (`src/__tests__/lib/scoring/`)
- **Location Strategy** (`location-strategy.test.ts`)
  - Exact location matching (100 score)
  - Remote job detection (various formats)
  - Same city matching (85+ score)
  - Same state matching (60-85 score)
  - Different location handling (<50 score)
  - No location preference (50 score)
  - Fuzzy matching for typos

- **Title Relevance Strategy** (`title-strategy.test.ts`)
  - Exact keyword matching
  - Case insensitivity
  - Role synonyms (engineer ↔ developer)
  - Seniority level matching (7 levels)
  - Keyword extraction and matching
  - Partial keyword matches
  - Edge cases (empty query, special characters, long titles)

- **Salary Strategy** (`salary-strategy.test.ts`)
  - Perfect alignment (within range)
  - Above expected salary (85+ score)
  - Below expected salary (<70 score)
  - Partial overlap (60-100 score)
  - Missing salary data (50 score, 0.3 confidence)
  - Period normalization (hourly/monthly → yearly)
  - Confidence scoring based on range specificity

- **Source Quality Strategy** (`source-strategy.test.ts`)
  - Base scores (LinkedIn: 90, Indeed: 85)
  - Salary information bonus (+5)
  - Detailed description bonus (+3)
  - Recency bonus (recent: +5, old: -5)
  - Combined bonus accumulation
  - Confidence levels
  - Score bounds (40-100)

- **Job Scorer** (`job-scorer.test.ts`)
  - Complete score breakdown generation
  - Weighted score calculation accuracy
  - Custom scoring weights respect
  - Batch scoring and ranking
  - Enhanced metadata with top 5 reasons
  - Score bounds (0-100)
  - Edge cases (missing data, zero weights)
  - Consistency across multiple runs

### 2. API Endpoint Tests (`src/__tests__/api/`)
- **POST /api/search-jobs** (`search-jobs.test.ts`)
  - Invalid JSON rejection (400)
  - Missing query rejection (400)
  - Empty query rejection (400)
  - Invalid salary range rejection (400)
  - Invalid sources rejection (400)
  - Valid request acceptance
  - Default maxResults application
  - Query trimming
  - Response structure validation
  - Metadata inclusion
  - Error handling (503, 504)
  - Timeout handling
  - Partial results (206)

### 3. Component Tests (`src/__tests__/components/`)
- **JobCard** (`JobCard.test.tsx`)
  - Job title, company, location rendering
  - Overall score display
  - Score breakdown visualization
  - Description truncation
  - Source badge display
  - Salary range formatting
  - Save/unsave functionality
  - External link handling
  - Score badge color coding (green/blue/yellow)
  - Accessibility (ARIA labels, keyboard navigation)
  - Edge cases (long titles, minimal data)

- **EnhancedSearchForm** (`EnhancedSearchForm.test.tsx`)
  - Form field rendering
  - Form submission with validation
  - Empty form rejection
  - Validation error display
  - Loading state (disabled inputs)
  - Job title autocomplete (20 suggestions)
  - Location autocomplete (10 locations)
  - Suggestion selection
  - Salary filter toggle
  - Error clearing on input
  - Accessibility (labels, keyboard navigation)

### 4. Performance Benchmarks (`src/__tests__/performance/`)
- **Scoring Benchmarks** (`scoring-benchmarks.test.ts`)
  - Single job scoring: <10ms
  - 10 jobs: <50ms
  - 50 jobs: <250ms
  - 100 jobs: <500ms
  - Memory usage: <50MB increase
  - Linear time complexity verification
  - Long description handling: <15ms
  - Long title handling: <15ms
  - Complex criteria handling: <15ms
  - Caching benefit verification

### 5. Integration & Error Scenario Tests (`src/__tests__/integration/`)
- **Error Scenarios** (`error-scenarios.test.ts`)
  - Network error handling
  - Timeout error handling
  - Rate limit error handling
  - Validation error handling
  - No results error handling
  - Unknown error graceful handling
  - Non-Error object handling
  - Null/undefined error handling
  - Retry with exponential backoff
  - Max retry attempts
  - Retry callback invocation
  - Delay capping
  - Validation edge cases:
    - Negative salaries
    - MaxResults > 100
    - PostedWithinDays > 365
    - Special characters
    - Very long strings
    - Empty arrays
  - Boundary conditions
  - Type coercion validation

## Test Fixtures
- **Mock Jobs** (`fixtures/jobs.ts`)
  - RawJob (LinkedIn, Indeed variants)
  - ScoredJob with complete breakdown
  - Job lists (3 jobs)
  - Search criteria

- **Scraper Responses** (`fixtures/scraper-responses.ts`)
  - LinkedIn success (2 jobs)
  - Indeed success (2 jobs)
  - LinkedIn error (CAPTCHA)
  - Indeed partial (1 job + 1 error)

## Coverage Goals
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Configuration
- **Framework**: Jest 30.1.3
- **React Testing**: @testing-library/react 16.3.0
- **Environment**: jsdom
- **Setup**: jest.setup.js (imports @testing-library/jest-dom)
- **Module mapping**: @/* → src/*
- **Test patterns**: **/__tests__/**/*.test.{ts,tsx}

## Mocking Strategy
- **Puppeteer**: Fully mocked with jest.mock()
- **API Routes**: Mocked with node-mocks-http
- **Browser APIs**: Mocked for component tests
- **Network**: Mocked fetch for integration tests

## Key Testing Principles
1. **Isolation**: Each test is independent
2. **Repeatability**: Tests produce consistent results
3. **Fast**: All tests complete in <30 seconds
4. **Comprehensive**: Cover happy paths, edge cases, and error scenarios
5. **Maintainable**: Clear test names and organized structure
6. **Performance**: Benchmark tests ensure scalability