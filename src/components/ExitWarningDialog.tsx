'use client';

interface ExitWarningDialogProps {
  isOpen: boolean;
  onSave: () => void;
  onLeave: () => void;
  onCancel: () => void;
}

export function ExitWarningDialog({
  isOpen,
  onSave,
  onLeave,
  onCancel
}: ExitWarningDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Unsaved Assessment Results</h2>
            <p className="text-sm text-gray-400">You're about to leave without saving</p>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          You have completed an assessment but haven't saved the results yet. Your valuable insights and career recommendations will be lost if you leave now.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSave}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
          >
            Save Assessment First
          </button>
          <button
            onClick={onLeave}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
          >
            Leave Without Saving
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            Stay on Page
          </button>
        </div>
      </div>
    </div>
  );
}