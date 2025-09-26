import { JobSource } from './job';

export enum ErrorCode {
  SCRAPER_FAILED = 'SCRAPER_FAILED',
  SCRAPER_TIMEOUT = 'SCRAPER_TIMEOUT',
  SCRAPER_RATE_LIMITED = 'SCRAPER_RATE_LIMITED',
  SCRAPER_INVALID_CONFIG = 'SCRAPER_INVALID_CONFIG',
  SCRAPER_AUTH_REQUIRED = 'SCRAPER_AUTH_REQUIRED',
  SCRAPER_NETWORK_ERROR = 'SCRAPER_NETWORK_ERROR',
  SCRAPER_PARSE_ERROR = 'SCRAPER_PARSE_ERROR',

  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',
  VALIDATION_INVALID_FORMAT = 'VALIDATION_INVALID_FORMAT',

  SCORING_FAILED = 'SCORING_FAILED',
  SCORING_INVALID_WEIGHTS = 'SCORING_INVALID_WEIGHTS',
  SCORING_INVALID_CRITERIA = 'SCORING_INVALID_CRITERIA',

  STORAGE_FAILED = 'STORAGE_FAILED',
  STORAGE_NOT_FOUND = 'STORAGE_NOT_FOUND',

  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  originalError?: Error;
}

export interface ScraperErrorDetails extends AppError {
  source: JobSource;
  url?: string;
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number;
}

export interface ValidationErrorDetails extends AppError {
  field: string;
  value?: unknown;
  constraint?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export class JobSearchError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'JobSearchError';
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    Object.setPrototypeOf(this, JobSearchError.prototype);
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

export class ScraperError extends JobSearchError {
  public readonly source: JobSource;
  public readonly retryable: boolean;

  constructor(
    source: JobSource,
    message: string,
    code: ErrorCode = ErrorCode.SCRAPER_FAILED,
    retryable: boolean = false,
    context?: Record<string, unknown>
  ) {
    super(code, message, context);
    this.name = 'ScraperError';
    this.source = source;
    this.retryable = retryable;

    Object.setPrototypeOf(this, ScraperError.prototype);
  }
}

export class ValidationError extends JobSearchError {
  public readonly field: string;
  public readonly value?: unknown;

  constructor(field: string, message: string, value?: unknown, context?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_FAILED, message, context);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export function createErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof JobSearchError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.context,
      },
      timestamp: new Date().toISOString(),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: ErrorCode.UNKNOWN_ERROR,
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: false,
    error: {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unknown error occurred',
    },
    timestamp: new Date().toISOString(),
  };
}

export function createSuccessResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}