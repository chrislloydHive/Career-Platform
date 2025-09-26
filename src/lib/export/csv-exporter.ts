import { ExportData, ExportOptions, FIELD_LABELS } from './types';
import { formatFieldValue, generateFilename } from './formatters';

export function exportToCSV(data: ExportData, options: ExportOptions): void {
  const headers = options.fields.map(field => FIELD_LABELS[field]);

  const rows = data.jobs.map((job, index) => {
    return options.fields.map(field =>
      formatFieldValue(job, field, options, index + 1)
    );
  });

  const csv = [headers, ...rows]
    .map(row => row.map(cell => escapeCSVCell(cell)).join(','))
    .join('\n');

  downloadCSV(csv, generateFilename('csv', options.filename));
}

function escapeCSVCell(cell: string): string {
  if (
    cell.includes(',') ||
    cell.includes('"') ||
    cell.includes('\n') ||
    cell.includes('\r')
  ) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function downloadCSV(csv: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: ExportData, options: ExportOptions): void {
  const exportData = {
    metadata: {
      exportDate: data.exportDate.toISOString(),
      totalJobs: data.totalJobs,
      searchCriteria: data.searchCriteria,
      exportOptions: {
        fields: options.fields,
        dateFormat: options.dateFormat,
      },
    },
    jobs: data.jobs.map((job, index) => {
      const jobData: Record<string, unknown> = { rank: index + 1 };

      options.fields.forEach(field => {
        if (field === 'rank') return;

        switch (field) {
          case 'title':
            jobData.title = job.title;
            break;
          case 'company':
            jobData.company = job.company;
            break;
          case 'location':
            jobData.location = job.location;
            break;
          case 'salary':
            jobData.salary = job.salary;
            break;
          case 'score':
            jobData.score = job.score;
            break;
          case 'scoreBreakdown':
            jobData.scoreBreakdown = job.scoreBreakdown;
            break;
          case 'source':
            jobData.source = job.source;
            break;
          case 'postedDate':
            jobData.postedDate = job.postedDate.toISOString();
            break;
          case 'scrapedAt':
            jobData.scrapedAt = job.scrapedAt.toISOString();
            break;
          case 'url':
            jobData.url = job.url;
            break;
          case 'description':
            jobData.description = job.description;
            break;
          case 'jobType':
            jobData.jobType = job.jobType;
            break;
          case 'matchReasons':
            jobData.matchReasons = job.metadata?.enhancedScoreBreakdown?.topReasons;
            break;
        }
      });

      return jobData;
    }),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = generateFilename('json', options.filename);
  link.click();
  URL.revokeObjectURL(url);
}