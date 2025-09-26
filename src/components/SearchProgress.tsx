'use client';

interface SearchProgressProps {
  isSearching: boolean;
  progress?: number;
  currentSource?: string;
  jobsFound?: number;
  message?: string;
}

export function SearchProgress({
  isSearching,
  progress = 0,
  currentSource,
  jobsFound = 0,
  message,
}: SearchProgressProps) {
  if (!isSearching) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="animate-spin h-12 w-12 text-blue-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Searching for Jobs...
          </h3>

          {message && (
            <p className="text-sm text-gray-400 mb-4">{message}</p>
          )}

          {currentSource && (
            <p className="text-sm text-gray-400 mb-4">
              Scanning <span className="font-medium capitalize">{currentSource}</span>
            </p>
          )}

          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{jobsFound}</div>
              <div className="text-gray-400">Jobs Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress}%</div>
              <div className="text-gray-400">Complete</div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            This may take 30-60 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}