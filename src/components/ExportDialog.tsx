'use client';

import { useState } from 'react';
import { ScoredJob } from '@/types';
import { exportToExcel } from '@/lib/export/excel-exporter';
import { exportToCSV, exportToJSON } from '@/lib/export/csv-exporter';
import {
  ExportFormat,
  ExportField,
  ExportOptions,
  DEFAULT_EXPORT_FIELDS,
  FIELD_LABELS,
} from '@/lib/export/types';

interface ExportDialogProps {
  jobs: ScoredJob[];
  isOpen: boolean;
  onClose: () => void;
  searchCriteria?: string;
}

const ALL_FIELDS: ExportField[] = [
  'rank',
  'title',
  'company',
  'location',
  'salary',
  'score',
  'scoreBreakdown',
  'source',
  'postedDate',
  'scrapedAt',
  'url',
  'description',
  'jobType',
  'matchReasons',
  'applicationStatus',
  'applicationDate',
  'notes',
];

export function ExportDialog({ jobs, isOpen, onClose, searchCriteria }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [selectedFields, setSelectedFields] = useState<ExportField[]>(DEFAULT_EXPORT_FIELDS);
  const [dateFormat, setDateFormat] = useState<'short' | 'long' | 'iso'>('short');
  const [includeScoreBreakdown, setIncludeScoreBreakdown] = useState(true);
  const [includeMatchReasons, setIncludeMatchReasons] = useState(true);
  const [includeApplicationTracking, setIncludeApplicationTracking] = useState(true);
  const [customFilename, setCustomFilename] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const toggleField = (field: ExportField) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const selectAllFields = () => {
    setSelectedFields(ALL_FIELDS);
  };

  const selectDefaultFields = () => {
    setSelectedFields(DEFAULT_EXPORT_FIELDS);
  };

  const handleExport = () => {
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        format,
        fields: selectedFields,
        dateFormat,
        includeScoreBreakdown: format === 'excel' && includeScoreBreakdown,
        includeMatchReasons: format === 'excel' && includeMatchReasons,
        includeApplicationTracking: format === 'excel' && includeApplicationTracking,
        filename: customFilename || undefined,
      };

      const exportData = {
        jobs,
        exportDate: new Date(),
        searchCriteria,
        totalJobs: jobs.length,
      };

      switch (format) {
        case 'excel':
          exportToExcel(exportData, options);
          break;
        case 'csv':
          exportToCSV(exportData, options);
          break;
        case 'json':
          exportToJSON(exportData, options);
          break;
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      alert('Export failed. Please try again.');
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Job Search Results - ${jobs.length} jobs`);
    const body = encodeURIComponent(
      `${emailMessage}\n\nJob Search Results Summary:\n\n` +
      `Total Jobs: ${jobs.length}\n` +
      `Average Score: ${(jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length).toFixed(1)}\n\n` +
      `Top 5 Jobs:\n` +
      jobs.slice(0, 5).map((job, i) =>
        `${i + 1}. ${job.title} at ${job.company} (Score: ${job.score.toFixed(1)})\n   ${job.url}`
      ).join('\n\n')
    );

    const mailtoLink = `mailto:${emailRecipient}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    setShowEmailForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-100">Export Jobs</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!showEmailForm ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'excel' as ExportFormat, label: 'Excel (.xlsx)', icon: 'XLS' },
                    { value: 'csv' as ExportFormat, label: 'CSV', icon: 'CSV' },
                    { value: 'json' as ExportFormat, label: 'JSON', icon: '{ }' },
                  ].map(({ value, label, icon }) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        format === value
                          ? 'border-blue-600 bg-blue-900/50'
                          : 'border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Fields to Export
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllFields}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                    <button
                      onClick={selectDefaultFields}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Default
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-gray-700 rounded-lg p-3">
                  {ALL_FIELDS.map(field => (
                    <label
                      key={field}
                      className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field)}
                        onChange={() => toggleField(field)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{FIELD_LABELS[field]}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Date Format
                </label>
                <div className="flex gap-3">
                  {[
                    { value: 'short' as const, label: 'Short (1/1/2024)' },
                    { value: 'long' as const, label: 'Long (January 1, 2024)' },
                    { value: 'iso' as const, label: 'ISO (2024-01-01)' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setDateFormat(value)}
                      className={`flex-1 px-4 py-2 text-sm border rounded-lg transition-all ${
                        dateFormat === value
                          ? 'border-blue-600 bg-blue-900/50 text-blue-400'
                          : 'border-gray-600 hover:border-blue-400 text-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {format === 'excel' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Additional Excel Sheets
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeScoreBreakdown}
                        onChange={(e) => setIncludeScoreBreakdown(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Score Breakdown Sheet</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMatchReasons}
                        onChange={(e) => setIncludeMatchReasons(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Match Reasons Sheet</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeApplicationTracking}
                        onChange={(e) => setIncludeApplicationTracking(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Application Tracking Sheet</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="filename" className="block text-sm font-semibold text-gray-300 mb-2">
                  Custom Filename (optional)
                </label>
                <input
                  id="filename"
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="job-search-results"
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave blank for default name with timestamp
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Recipient
                </label>
                <input
                  id="email"
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-400">
                  This will open your default email client with a summary of the top 5 jobs.
                  You can attach the exported file manually after sending.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-between gap-3">
          {!showEmailForm ? (
            <>
              <button
                onClick={() => setShowEmailForm(true)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Share via Email
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || selectedFields.length === 0}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Export
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowEmailForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-gray-300 bg-gray-900 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailShare}
                  disabled={!emailRecipient}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}