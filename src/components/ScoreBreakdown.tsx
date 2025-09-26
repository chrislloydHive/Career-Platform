import { ScoreBreakdown as ScoreBreakdownType } from '@/types';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
  showDetails?: boolean;
}

export function ScoreBreakdown({ breakdown, showDetails = true }: ScoreBreakdownProps) {
  const components = [
    {
      label: 'Location Match',
      key: 'location',
      data: breakdown.location,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
    },
    {
      label: 'Title Relevance',
      key: 'titleRelevance',
      data: breakdown.titleRelevance,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
    },
    {
      label: 'Salary Score',
      key: 'salary',
      data: breakdown.salary,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
    },
    {
      label: 'Source Quality',
      key: 'sourceQuality',
      data: breakdown.sourceQuality,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-3">
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Score Breakdown
          </span>
          <span className="text-lg font-bold text-gray-900">
            {breakdown.total.toFixed(1)}
          </span>
        </div>
      )}

      {components.map(({ label, data, color, lightColor }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {data.score.toFixed(0)}/100 × {(data.weight * 100).toFixed(0)}%
              </span>
              <span className="text-xs font-semibold text-gray-700">
                = {data.weighted.toFixed(1)}
              </span>
            </div>
          </div>
          <div className={`w-full ${lightColor} rounded-full h-2 overflow-hidden`}>
            <div
              className={`${color} h-full rounded-full transition-all duration-300 ease-out`}
              style={{ width: `${data.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}