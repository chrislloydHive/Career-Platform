import { NextRequest, NextResponse } from 'next/server';
import { JobSearchEngine } from '@/lib/job-search-engine';
import { JobScorer } from '@/lib/scoring';
import { createScoringCriteriaFromSearch, createErrorResponse, createSuccessResponse } from '@/types';
import { validateSearchCriteria } from '@/lib/api/validation';
import { searchCache } from '@/lib/cache';
import { searchAnalytics } from '@/lib/analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_TIMEOUT_MS = 90000;
const MAX_TIMEOUT_MS = 180000;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const searchId = `search_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse({
          name: 'ValidationError',
          message: 'Invalid JSON in request body',
        }),
        { status: 400 }
      );
    }

    const validation = validateSearchCriteria(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        createErrorResponse({
          name: 'ValidationError',
          message: 'Invalid request data',
          context: { errors: validation.errors },
        }),
        { status: 400 }
      );
    }

    const searchCriteria = validation.data;

    const cacheKey = searchCache.generateKey(searchCriteria);
    const cachedResult = searchCache.get(cacheKey);

    if (cachedResult) {
      console.log('Cache hit for search:', cacheKey.slice(0, 50));

      searchAnalytics.addMetric({
        searchId,
        timestamp: new Date(),
        query: searchCriteria.query,
        location: searchCriteria.location,
        sources: searchCriteria.sources || ['google_jobs'],
        durationMs: Date.now() - startTime,
        jobsFound: cachedResult.jobs.length,
        successfulSources: cachedResult.metadata.successfulSources,
        failedSources: cachedResult.metadata.failedSources,
        errors: 0,
        cached: true,
      });

      return NextResponse.json(
        createSuccessResponse({
          jobs: cachedResult.jobs,
          metadata: {
            ...cachedResult.metadata,
            totalDurationMs: Date.now() - startTime,
            cached: true,
          },
          warnings: [],
        }),
        { status: 200 }
      );
    }

    const timeoutMs = Math.min(
      (body as Record<string, unknown>).timeoutMs as number || DEFAULT_TIMEOUT_MS,
      MAX_TIMEOUT_MS
    );

    const engine = new JobSearchEngine(timeoutMs);

    let searchResult;
    try {
      console.log('Starting search with criteria:', searchCriteria);
      searchResult = await engine.search({
        searchQuery: searchCriteria.query,
        location: searchCriteria.location || '',
        sources: searchCriteria.sources,
        jobType: searchCriteria.jobTypes?.[0],
        maxResults: searchCriteria.maxResults,
        postedWithinDays: searchCriteria.postedWithinDays,
        timeoutMs,
      });
      console.log('Search completed:', {
        jobCount: searchResult.jobs.length,
        errorCount: searchResult.errors.length,
        errors: searchResult.errors.map(e => ({ source: e.source, message: e.message, code: e.code }))
      });
    } catch (error) {
      console.error('Search engine error:', error, error instanceof Error ? error.stack : '');

      if (error instanceof Error && error.message.includes('timeout')) {
        return NextResponse.json(
          createErrorResponse({
            name: 'TimeoutError',
            message: `Search timed out after ${timeoutMs}ms. Try reducing the number of sources or results.`,
            context: { timeoutMs },
          }),
          { status: 504 }
        );
      }

      throw error;
    } finally {
      await engine.close();
    }

    if (searchResult.jobs.length === 0 && searchResult.errors.length > 0) {
      const isRateLimited = searchResult.errors.some(
        err => err.message?.toLowerCase().includes('blocked') ||
               err.message?.toLowerCase().includes('captcha') ||
               err.message?.toLowerCase().includes('rate limit')
      );

      if (isRateLimited) {
        return NextResponse.json(
          createErrorResponse({
            name: 'RateLimitError',
            message: 'Job sites are blocking requests. Please try again later.',
            context: {
              errors: searchResult.errors,
              failedSources: searchResult.failedSources,
            },
          }),
          { status: 429 }
        );
      }

      return NextResponse.json(
        createErrorResponse({
          name: 'ScraperError',
          message: 'Failed to retrieve jobs from all sources',
          context: {
            errors: searchResult.errors,
            failedSources: searchResult.failedSources,
          },
        }),
        { status: 503 }
      );
    }

    let filteredJobs = searchResult.jobs;

    if (searchCriteria.salary) {
      const { min, max } = searchCriteria.salary;
      filteredJobs = filteredJobs.filter(job => {
        if (!job.salary) return true;

        const jobSalary = job.salary;
        const jobMin = jobSalary.min || 0;
        const jobMax = jobSalary.max || jobMin;

        let annualMin = jobMin;
        let annualMax = jobMax;

        if (jobSalary.period === 'hourly') {
          annualMin = jobMin * 2080;
          annualMax = jobMax * 2080;
        } else if (jobSalary.period === 'monthly') {
          annualMin = jobMin * 12;
          annualMax = jobMax * 12;
        }

        if (max !== undefined && annualMin > max) return false;
        if (min !== undefined && annualMax < min) return false;

        return true;
      });
    }

    const scoringCriteria = createScoringCriteriaFromSearch(searchCriteria);
    const scorer = new JobScorer(undefined, scoringCriteria);
    const scoredJobs = scorer.scoreJobs(filteredJobs);

    const responseData = {
      jobs: scoredJobs,
      metadata: {
        totalJobsFound: searchResult.totalJobs,
        uniqueJobs: searchResult.uniqueJobs,
        duplicatesRemoved: searchResult.duplicatesRemoved,
        successfulSources: searchResult.successfulSources,
        failedSources: searchResult.failedSources,
        partialResults: searchResult.partialResults,
        searchDurationMs: searchResult.totalDurationMs,
        totalDurationMs: Date.now() - startTime,
        cached: false,
        averageScore: scoredJobs.length > 0
          ? scoredJobs.reduce((sum, job) => sum + job.score, 0) / scoredJobs.length
          : 0,
        scoreDistribution: {
          high: scoredJobs.filter(j => j.score >= 80).length,
          medium: scoredJobs.filter(j => j.score >= 50 && j.score < 80).length,
          low: scoredJobs.filter(j => j.score < 50).length,
        },
      },
      warnings: searchResult.partialResults ? [
        `Some sources failed: ${searchResult.failedSources.join(', ')}. Results may be incomplete.`,
      ] : [],
      errors: searchResult.errors.length > 0 ? searchResult.errors : undefined,
    };

    searchCache.set(cacheKey, {
      jobs: scoredJobs,
      metadata: {
        totalJobsFound: searchResult.totalJobs,
        uniqueJobs: searchResult.uniqueJobs,
        duplicatesRemoved: searchResult.duplicatesRemoved,
        successfulSources: searchResult.successfulSources,
        failedSources: searchResult.failedSources,
        partialResults: searchResult.partialResults,
        searchDurationMs: searchResult.totalDurationMs,
      },
    });

    searchAnalytics.addMetric({
      searchId,
      timestamp: new Date(),
      query: searchCriteria.query,
      location: searchCriteria.location,
      sources: searchCriteria.sources || ['google_jobs'],
      durationMs: Date.now() - startTime,
      jobsFound: scoredJobs.length,
      successfulSources: searchResult.successfulSources,
      failedSources: searchResult.failedSources,
      errors: searchResult.errors.length,
      cached: false,
    });

    const statusCode = searchResult.partialResults ? 206 : 200;

    return NextResponse.json(
      createSuccessResponse(responseData),
      { status: statusCode }
    );

  } catch (error) {
    console.error('Unhandled error in search-jobs API:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        createErrorResponse({
          name: error.name,
          message: error.message,
          context: { stack: process.env.NODE_ENV === 'development' ? error.stack : undefined },
        }),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createErrorResponse({
        name: 'InternalServerError',
        message: 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'POST /api/search-jobs - Search for jobs across multiple sources',
      requiredFields: ['query'],
      optionalFields: [
        'location',
        'preferredLocations',
        'sources',
        'jobTypes',
        'salary',
        'keywords',
        'excludeKeywords',
        'postedWithinDays',
        'maxResults',
        'timeoutMs',
      ],
      defaults: {
        sources: ['google_jobs'],
        maxResults: 25,
        timeoutMs: 90000,
      },
      example: {
        query: 'Software Engineer',
        location: 'San Francisco',
        preferredLocations: ['San Francisco', 'Remote'],
        sources: ['linkedin', 'indeed'],
        jobTypes: ['full-time'],
        salary: {
          min: 80000,
          max: 150000,
          currency: 'USD',
        },
        keywords: ['typescript', 'react', 'node'],
        maxResults: 25,
      },
    },
    { status: 200 }
  );
}