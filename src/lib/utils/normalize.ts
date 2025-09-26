import { Salary, JobSource } from '@/types';
import crypto from 'crypto';

export function normalizeSalary(salaryStr: string): Salary | undefined {
  if (!salaryStr) return undefined;

  const cleaned = salaryStr.replace(/,/g, '').toLowerCase();

  let currency = 'USD';
  if (cleaned.includes('$')) currency = 'USD';
  else if (cleaned.includes('€')) currency = 'EUR';
  else if (cleaned.includes('£')) currency = 'GBP';

  let period: Salary['period'] = 'yearly';
  if (cleaned.includes('/hr') || cleaned.includes('per hour') || cleaned.includes('hourly')) {
    period = 'hourly';
  } else if (cleaned.includes('/day') || cleaned.includes('per day') || cleaned.includes('daily')) {
    period = 'daily';
  } else if (cleaned.includes('/wk') || cleaned.includes('per week') || cleaned.includes('weekly')) {
    period = 'weekly';
  } else if (cleaned.includes('/mo') || cleaned.includes('per month') || cleaned.includes('monthly')) {
    period = 'monthly';
  } else if (cleaned.includes('/yr') || cleaned.includes('per year') || cleaned.includes('annually') || cleaned.includes('yearly')) {
    period = 'yearly';
  }

  const numbers = cleaned.match(/\d+\.?\d*/g);
  if (!numbers || numbers.length === 0) return undefined;

  const parsedNumbers = numbers.map(n => parseFloat(n));

  let min: number | undefined;
  let max: number | undefined;

  if (parsedNumbers.length === 1) {
    const value = parsedNumbers[0];
    if (cleaned.includes('up to')) {
      max = value;
    } else if (value < 1000 && period === 'yearly') {
      min = value * 1000;
    } else {
      min = value;
    }
  } else if (parsedNumbers.length >= 2) {
    min = Math.min(parsedNumbers[0], parsedNumbers[1]);
    max = Math.max(parsedNumbers[0], parsedNumbers[1]);

    if (max < 1000 && period === 'yearly') {
      min = min * 1000;
      max = max * 1000;
    }
  }

  if (min !== undefined && min < 1000 && period === 'yearly') {
    min = min * 1000;
  }
  if (max !== undefined && max < 1000 && period === 'yearly') {
    max = max * 1000;
  }

  if (!min && !max) return undefined;

  return { min, max, currency, period };
}

export function normalizeLocation(location: string): string {
  if (!location) return 'Unknown';

  let normalized = location.trim();

  normalized = normalized.replace(/\s+/g, ' ');

  if (normalized.toLowerCase().includes('remote')) {
    return 'Remote';
  }

  normalized = normalized.replace(/\(.*?\)/g, '').trim();

  const parts = normalized.split(',').map(p => p.trim());
  if (parts.length > 2) {
    return `${parts[0]}, ${parts[1]}`;
  }

  return normalized;
}

export function generateJobId(source: JobSource, url: string): string {
  const hash = crypto.createHash('md5').update(`${source}-${url}`).digest('hex');
  return `${source}-${hash.slice(0, 12)}`;
}

export function normalizeJobTitle(title: string): string {
  if (!title) return 'Unknown Position';

  let normalized = title.trim();

  normalized = normalized.replace(/\s+/g, ' ');

  normalized = normalized.replace(/\(.*?\)/g, '').trim();

  return normalized;
}

export function normalizeCompanyName(company: string): string {
  if (!company) return 'Unknown Company';

  let normalized = company.trim();

  normalized = normalized.replace(/\s+/g, ' ');

  const suffixes = ['Inc.', 'Inc', 'LLC', 'Ltd.', 'Ltd', 'Corp.', 'Corp', 'Co.', 'Co'];
  for (const suffix of suffixes) {
    const regex = new RegExp(`\\s+${suffix.replace('.', '\\.')}$`, 'i');
    normalized = normalized.replace(regex, '');
  }

  return normalized.trim();
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];

  const commonTechKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
    'node', 'express', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'sql', 'nosql', 'mongodb', 'postgresql',
    'graphql', 'rest', 'api', 'microservices', 'agile', 'scrum',
    'ci/cd', 'devops', 'machine learning', 'ai', 'data science',
  ];

  const lowerText = text.toLowerCase();
  const found = commonTechKeywords.filter(keyword =>
    lowerText.includes(keyword)
  );

  return [...new Set(found)];
}

export function truncateDescription(description: string, maxLength: number = 500): string {
  if (!description || description.length <= maxLength) {
    return description;
  }

  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}