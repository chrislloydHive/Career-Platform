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

    // Apply advanced filters
    if (searchCriteria.experienceLevel && searchCriteria.experienceLevel !== 'all') {
      filteredJobs = filteredJobs.filter(job => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        switch (searchCriteria.experienceLevel) {
          case 'entry':
            return text.includes('entry') || text.includes('junior') || text.includes('graduate') ||
                   text.includes('associate') || text.includes('trainee') || text.includes('intern');
          case 'mid':
            return (text.includes('mid') || text.includes('intermediate') || text.includes('regular') ||
                    text.includes('analyst') || text.includes('specialist')) &&
                   !text.includes('senior') && !text.includes('lead') && !text.includes('principal');
          case 'senior':
            return text.includes('senior') || text.includes('lead') || text.includes('principal') ||
                   text.includes('staff') || text.includes('architect');
          case 'executive':
            return text.includes('director') || text.includes('vp') || text.includes('vice president') ||
                   text.includes('cto') || text.includes('ceo') || text.includes('head of');
          default:
            return true;
        }
      });
    }

    if (searchCriteria.industry && searchCriteria.industry !== 'all') {
      filteredJobs = filteredJobs.filter(job => {
        const text = `${job.company} ${job.title} ${job.description}`.toLowerCase();
        switch (searchCriteria.industry) {
          case 'Technology':
            return text.includes('tech') || text.includes('software') || text.includes('engineer') ||
                   text.includes('developer') || text.includes('programming') || text.includes('saas');
          case 'Finance':
            return text.includes('finance') || text.includes('banking') || text.includes('investment') ||
                   text.includes('fintech') || text.includes('financial') || text.includes('trading');
          case 'Healthcare':
            return text.includes('health') || text.includes('medical') || text.includes('hospital') ||
                   text.includes('pharma') || text.includes('biotech') || text.includes('clinic');
          case 'Education':
            return text.includes('education') || text.includes('school') || text.includes('university') ||
                   text.includes('learning') || text.includes('training') || text.includes('academic');
          case 'Retail':
            return text.includes('retail') || text.includes('ecommerce') || text.includes('shopping') ||
                   text.includes('store') || text.includes('consumer') || text.includes('merchandise');
          case 'Manufacturing':
            return text.includes('manufacturing') || text.includes('industrial') || text.includes('factory') ||
                   text.includes('production') || text.includes('automotive') || text.includes('supply');
          case 'Consulting':
            return text.includes('consulting') || text.includes('advisory') || text.includes('strategy') ||
                   text.includes('management') || text.includes('business');
          case 'Media':
            return text.includes('media') || text.includes('entertainment') || text.includes('content') ||
                   text.includes('marketing') || text.includes('advertising') || text.includes('creative');
          case 'Real Estate':
            return text.includes('real estate') || text.includes('property') || text.includes('construction') ||
                   text.includes('development') || text.includes('housing');
          case 'Non-profit':
            return text.includes('non-profit') || text.includes('nonprofit') || text.includes('foundation') ||
                   text.includes('charity') || text.includes('social') || text.includes('ngo');
          case 'Energy':
            return text.includes('energy') || text.includes('utilities') || text.includes('power') ||
                   text.includes('renewable') || text.includes('solar') || text.includes('wind');
          case 'Transportation':
            return text.includes('transportation') || text.includes('logistics') || text.includes('shipping') ||
                   text.includes('supply chain') || text.includes('trucking') || text.includes('freight');
          case 'Telecommunications':
            return text.includes('telecommunications') || text.includes('telecom') || text.includes('wireless') ||
                   text.includes('network') || text.includes('communications') || text.includes('internet');
          case 'Insurance':
            return text.includes('insurance') || text.includes('underwriting') || text.includes('claims') ||
                   text.includes('actuarial') || text.includes('risk') || text.includes('coverage');
          case 'Automotive':
            return text.includes('automotive') || text.includes('automobile') || text.includes('vehicle') ||
                   text.includes('car') || text.includes('truck') || text.includes('motor');
          case 'Aerospace':
            return text.includes('aerospace') || text.includes('defense') || text.includes('aviation') ||
                   text.includes('aircraft') || text.includes('military') || text.includes('space');
          case 'Legal':
            return text.includes('legal') || text.includes('law') || text.includes('attorney') ||
                   text.includes('lawyer') || text.includes('paralegal') || text.includes('court');
          case 'Marketing':
            return text.includes('marketing') || text.includes('advertising') || text.includes('brand') ||
                   text.includes('campaign') || text.includes('digital marketing') || text.includes('seo');
          case 'Food':
            return text.includes('food') || text.includes('beverage') || text.includes('restaurant') ||
                   text.includes('culinary') || text.includes('nutrition') || text.includes('catering');
          case 'Travel':
            return text.includes('travel') || text.includes('hospitality') || text.includes('hotel') ||
                   text.includes('tourism') || text.includes('airline') || text.includes('vacation');
          case 'Sports':
            return text.includes('sports') || text.includes('recreation') || text.includes('fitness') ||
                   text.includes('athletic') || text.includes('gym') || text.includes('coaching');
          case 'Agriculture':
            return text.includes('agriculture') || text.includes('farming') || text.includes('crop') ||
                   text.includes('livestock') || text.includes('agricultural') || text.includes('farm');
          case 'Mining':
            return text.includes('mining') || text.includes('natural resources') || text.includes('extraction') ||
                   text.includes('mineral') || text.includes('oil') || text.includes('gas');
          case 'Pharmaceuticals':
            return text.includes('pharmaceutical') || text.includes('biotech') || text.includes('drug') ||
                   text.includes('clinical') || text.includes('research') || text.includes('life sciences');
          case 'Fashion':
            return text.includes('fashion') || text.includes('apparel') || text.includes('clothing') ||
                   text.includes('design') || text.includes('textile') || text.includes('style');
          case 'Gaming':
            return text.includes('gaming') || text.includes('game') || text.includes('video game') ||
                   text.includes('entertainment tech') || text.includes('mobile games') || text.includes('esports');
          case 'Cybersecurity':
            return text.includes('cybersecurity') || text.includes('security') || text.includes('cyber') ||
                   text.includes('information security') || text.includes('infosec') || text.includes('threat');
          case 'Environmental':
            return text.includes('environmental') || text.includes('sustainability') || text.includes('green') ||
                   text.includes('renewable') || text.includes('climate') || text.includes('conservation');
          case 'Research':
            return text.includes('research') || text.includes('development') || text.includes('r&d') ||
                   text.includes('innovation') || text.includes('scientist') || text.includes('laboratory');
          default:
            return true;
        }
      });
    }

    if (searchCriteria.employmentType && searchCriteria.employmentType !== 'all') {
      filteredJobs = filteredJobs.filter(job => {
        const text = `${job.title} ${job.description}`.toLowerCase();
        switch (searchCriteria.employmentType) {
          case 'full-time':
            return text.includes('full-time') || text.includes('full time') || text.includes('fulltime') ||
                   (!text.includes('part-time') && !text.includes('contract') && !text.includes('temporary'));
          case 'part-time':
            return text.includes('part-time') || text.includes('part time') || text.includes('parttime');
          case 'contract':
            return text.includes('contract') || text.includes('contractor') || text.includes('consulting') ||
                   text.includes('freelance') || text.includes('project');
          case 'temporary':
            return text.includes('temporary') || text.includes('temp') || text.includes('seasonal');
          case 'internship':
            return text.includes('intern') || text.includes('trainee') || text.includes('graduate program');
          default:
            return true;
        }
      });
    }

    if (searchCriteria.freshnessFilter && searchCriteria.freshnessFilter !== 'all') {
      const now = new Date();
      filteredJobs = filteredJobs.filter(job => {
        const jobDate = new Date(job.postedDate);
        const diffMs = now.getTime() - jobDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        switch (searchCriteria.freshnessFilter) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'quarter':
            return diffDays <= 90;
          default:
            return true;
        }
      });
    }

    if (searchCriteria.additionalKeywords) {
      const additionalKeywords = searchCriteria.additionalKeywords.toLowerCase().split(',').map(k => k.trim()).filter(Boolean);
      if (additionalKeywords.length > 0) {
        filteredJobs = filteredJobs.filter(job => {
          const text = `${job.title} ${job.description} ${job.company}`.toLowerCase();
          return additionalKeywords.some(keyword => text.includes(keyword));
        });
      }
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
        'experienceLevel',
        'industry',
        'employmentType',
        'freshnessFilter',
        'additionalKeywords',
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