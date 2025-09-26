# Testing Guide

## Overview
This project includes a comprehensive test suite covering unit tests, integration tests, component tests, performance benchmarks, and error scenarios.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/__tests__/
├── fixtures/              # Mock data and test fixtures
│   ├── jobs.ts           # Mock job data
│   └── scraper-responses.ts  # Mock scraper responses
├── lib/
│   ├── scrapers/         # Scraper unit tests
│   │   ├── linkedin-scraper.test.ts
│   │   └── indeed-scraper.test.ts
│   └── scoring/          # Scoring algorithm tests
│       ├── location-strategy.test.ts
│       ├── title-strategy.test.ts
│       ├── salary-strategy.test.ts
│       ├── source-strategy.test.ts
│       └── job-scorer.test.ts
├── api/                  # API endpoint tests
│   └── search-jobs.test.ts
├── components/           # React component tests
│   ├── JobCard.test.tsx
│   └── EnhancedSearchForm.test.tsx
├── performance/          # Performance benchmarks
│   └── scoring-benchmarks.test.ts
└── integration/          # Integration & error tests
    └── error-scenarios.test.ts
```

## Test Categories

### 1. Unit Tests
Tests individual functions and classes in isolation.

**Scrapers** (`lib/scrapers/`)
- Mocked Puppeteer for browser automation
- Tests scraping logic, error handling, retry mechanisms
- Validates data normalization

**Scoring Algorithms** (`lib/scoring/`)
- Tests each scoring strategy independently
- Validates score calculations and confidence levels
- Tests edge cases and boundary conditions

### 2. API Tests
Tests Next.js API routes with mocked dependencies.

**Endpoints** (`api/`)
- Request validation
- Response structure
- Error handling (400, 503, 504)
- Timeout handling
- Partial results (206)

### 3. Component Tests
Tests React components using React Testing Library.

**UI Components** (`components/`)
- Rendering validation
- User interactions
- Accessibility (ARIA labels, keyboard navigation)
- Edge cases (long text, minimal data)

### 4. Performance Tests
Benchmarks to ensure scalability.

**Performance** (`performance/`)
- Single job scoring: <10ms
- Batch scoring: Linear time complexity
- Memory usage validation
- Worst-case scenario handling

### 5. Integration Tests
End-to-end scenarios and error handling.

**Integration** (`integration/`)
- Error categorization and user-friendly messages
- Retry with exponential backoff
- Validation edge cases
- Boundary conditions

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts`
- Component tests: `*.test.tsx`
- Place tests in `__tests__` directory mirroring source structure

### Example Unit Test

```typescript
import { LocationScoringStrategy } from '@/lib/scoring/location-strategy';

describe('LocationScoringStrategy', () => {
  let strategy: LocationScoringStrategy;

  beforeEach(() => {
    strategy = new LocationScoringStrategy();
  });

  it('should return perfect score for exact location match', () => {
    const result = strategy.score(job, criteria);
    expect(result.score).toBe(100);
  });
});
```

### Example Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { JobCard } from '@/components/JobCard';

describe('JobCard', () => {
  it('should render job title', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(mockJob.title)).toBeInTheDocument();
  });
});
```

## Mocking Strategy

### Puppeteer
```typescript
jest.mock('puppeteer-extra', () => {
  const mockPage = {
    goto: jest.fn().mockResolvedValue(null),
    // ... other methods
  };
  return {
    launch: jest.fn().mockResolvedValue(mockBrowser),
  };
});
```

### Next.js API Routes
```typescript
import { NextRequest } from 'next/server';

const request = new NextRequest('http://localhost/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

1. **Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should describe what they test
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Don't make real API calls or browser automation
5. **Test Edge Cases**: Include boundary conditions and error scenarios
6. **Performance**: Keep tests fast (<30s total)
7. **Maintainability**: Keep tests simple and readable

## Debugging Tests

```bash
# Run specific test file
npm test -- src/__tests__/lib/scoring/location-strategy.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="exact location match"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --coverage --maxWorkers=2

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Known Issues

1. **Puppeteer Tests**: Fully mocked, no real browser automation
2. **API Tests**: Require Next.js environment, may need additional setup
3. **Component Tests**: Some complex interactions may require `waitFor()`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)