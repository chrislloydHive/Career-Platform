export interface UserFriendlyError {
  title: string;
  message: string;
  actionable: boolean;
  suggestions: string[];
  canRetry: boolean;
  severity: 'error' | 'warning' | 'info';
}

export function getUserFriendlyError(error: unknown): UserFriendlyError {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    if (err.message && typeof err.message === 'string') {
      const message = err.message.toLowerCase();

      if (message.includes('timeout')) {
        return {
          title: 'Search Timeout',
          message: 'The job search took too long to complete.',
          actionable: true,
          suggestions: [
            'Try searching for fewer results',
            'Select only one job source',
            'Check your internet connection',
            'Try again in a few minutes',
          ],
          canRetry: true,
          severity: 'warning',
        };
      }

      if (message.includes('rate limit') || message.includes('blocked') || message.includes('captcha')) {
        return {
          title: 'Rate Limited',
          message: 'Job sites are temporarily blocking requests.',
          actionable: true,
          suggestions: [
            'Wait a few minutes before searching again',
            'Try reducing the number of results',
            'Consider searching at a different time',
          ],
          canRetry: true,
          severity: 'warning',
        };
      }

      if (message.includes('network') || message.includes('fetch')) {
        return {
          title: 'Network Error',
          message: 'Unable to connect to job sources.',
          actionable: true,
          suggestions: [
            'Check your internet connection',
            'Verify you can access LinkedIn and Indeed',
            'Try again in a moment',
          ],
          canRetry: true,
          severity: 'error',
        };
      }

      if (message.includes('validation')) {
        return {
          title: 'Invalid Search',
          message: err.message as string,
          actionable: true,
          suggestions: [
            'Check all required fields are filled',
            'Verify salary range is valid',
            'Ensure at least one source is selected',
          ],
          canRetry: false,
          severity: 'error',
        };
      }

      if (message.includes('no jobs') || message.includes('0 results')) {
        return {
          title: 'No Results Found',
          message: 'No jobs matched your search criteria.',
          actionable: true,
          suggestions: [
            'Try broadening your search terms',
            'Remove some filters',
            'Try different keywords',
            'Search in more locations',
          ],
          canRetry: false,
          severity: 'info',
        };
      }
    }
  }

  return {
    title: 'Search Failed',
    message: 'An unexpected error occurred while searching for jobs.',
    actionable: true,
    suggestions: [
      'Try searching again',
      'Refresh the page',
      'Contact support if the problem persists',
    ],
    canRetry: true,
    severity: 'error',
  };
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  onRetry?: (attempt: number, delay: number) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < config.maxAttempts) {
        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelayMs
        );

        onRetry?.(attempt, delay);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}