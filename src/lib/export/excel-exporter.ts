import * as XLSX from 'xlsx';
import { ScoredJob } from '@/types';
import { ExportData, ExportOptions, FIELD_LABELS } from './types';
import { formatFieldValue, generateFilename } from './formatters';

export function exportToExcel(data: ExportData, options: ExportOptions): void {
  const workbook = XLSX.utils.book_new();

  createJobsSheet(workbook, data, options);

  if (options.includeScoreBreakdown) {
    createScoreBreakdownSheet(workbook, data, options);
  }

  if (options.includeMatchReasons) {
    createMatchReasonsSheet(workbook, data);
  }

  if (options.includeApplicationTracking) {
    createApplicationTrackingSheet(workbook, data, options);
  }

  createSummarySheet(workbook, data);

  const filename = generateFilename('excel', options.filename);
  XLSX.writeFile(workbook, filename);
}

function createJobsSheet(
  workbook: XLSX.WorkBook,
  data: ExportData,
  options: ExportOptions
): void {
  const headers = options.fields.map(field => FIELD_LABELS[field]);

  const rows = data.jobs.map((job, index) => {
    return options.fields.map(field =>
      formatFieldValue(job, field, options, index + 1)
    );
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  const colWidths = options.fields.map(field => {
    switch (field) {
      case 'title':
      case 'company':
        return { wch: 30 };
      case 'location':
        return { wch: 25 };
      case 'description':
        return { wch: 50 };
      case 'matchReasons':
        return { wch: 60 };
      case 'url':
        return { wch: 40 };
      case 'notes':
        return { wch: 40 };
      default:
        return { wch: 15 };
    }
  });
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jobs');
}

function createScoreBreakdownSheet(
  workbook: XLSX.WorkBook,
  data: ExportData,
  options: ExportOptions
): void {
  const headers = [
    'Rank',
    'Job Title',
    'Company',
    'Total Score',
    'Location Score',
    'Location Weight',
    'Title Score',
    'Title Weight',
    'Salary Score',
    'Salary Weight',
    'Source Score',
    'Source Weight',
  ];

  const rows = data.jobs.map((job, index) => {
    const { scoreBreakdown } = job;
    return [
      index + 1,
      job.title,
      job.company,
      job.score.toFixed(1),
      scoreBreakdown.location.score.toFixed(1),
      scoreBreakdown.location.weighted.toFixed(1),
      scoreBreakdown.titleRelevance.score.toFixed(1),
      scoreBreakdown.titleRelevance.weighted.toFixed(1),
      scoreBreakdown.salary.score.toFixed(1),
      scoreBreakdown.salary.weighted.toFixed(1),
      scoreBreakdown.sourceQuality.score.toFixed(1),
      scoreBreakdown.sourceQuality.weighted.toFixed(1),
    ];
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 25 },
    ...Array(9).fill({ wch: 12 }),
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Score Breakdown');
}

function createMatchReasonsSheet(
  workbook: XLSX.WorkBook,
  data: ExportData
): void {
  const headers = ['Rank', 'Job Title', 'Company', 'Match Reasons'];

  const rows = data.jobs.map((job, index) => {
    const enhanced = job.metadata?.enhancedScoreBreakdown as { topReasons?: string[] } | undefined;
    const reasons = enhanced?.topReasons?.join('\n') || 'N/A';

    return [index + 1, job.title, job.company, reasons];
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 25 },
    { wch: 80 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Match Reasons');
}

function createApplicationTrackingSheet(
  workbook: XLSX.WorkBook,
  data: ExportData,
  options: ExportOptions
): void {
  const headers = [
    'Rank',
    'Job Title',
    'Company',
    'Location',
    'Score',
    'Application Status',
    'Application Date',
    'Interview Date',
    'Follow-up Date',
    'Response Received',
    'Offer Status',
    'Notes',
  ];

  const rows = data.jobs.map((job, index) => [
    index + 1,
    job.title,
    job.company,
    job.location,
    job.score.toFixed(1),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 25 },
    { wch: 25 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Application Tracking');
}

function createSummarySheet(workbook: XLSX.WorkBook, data: ExportData): void {
  const stats = calculateStats(data.jobs);

  const summaryData = [
    ['Job Search Results Summary'],
    [''],
    ['Export Date', data.exportDate.toLocaleString()],
    ['Total Jobs', data.totalJobs],
    [''],
    ['Score Statistics'],
    ['Average Score', stats.avgScore.toFixed(1)],
    ['Highest Score', stats.maxScore.toFixed(1)],
    ['Lowest Score', stats.minScore.toFixed(1)],
    [''],
    ['Score Distribution'],
    ['High (80+)', stats.highCount],
    ['Medium (50-79)', stats.mediumCount],
    ['Low (<50)', stats.lowCount],
    [''],
    ['Sources'],
    ...Object.entries(stats.sourceCount).map(([source, count]) => [
      source.charAt(0).toUpperCase() + source.slice(1),
      count,
    ]),
    [''],
    ['Top Locations'],
    ...stats.topLocations.map(([location, count]) => [location, count]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData);

  worksheet['!cols'] = [{ wch: 25 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
}

function calculateStats(jobs: ScoredJob[]) {
  const scores = jobs.map(j => j.score);
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length || 0;
  const maxScore = Math.max(...scores, 0);
  const minScore = Math.min(...scores, 100);

  const highCount = jobs.filter(j => j.score >= 80).length;
  const mediumCount = jobs.filter(j => j.score >= 50 && j.score < 80).length;
  const lowCount = jobs.filter(j => j.score < 50).length;

  const sourceCount = jobs.reduce((acc, job) => {
    acc[job.source] = (acc[job.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationCount = jobs.reduce((acc, job) => {
    acc[job.location] = (acc[job.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLocations = Object.entries(locationCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    avgScore,
    maxScore,
    minScore,
    highCount,
    mediumCount,
    lowCount,
    sourceCount,
    topLocations,
  };
}