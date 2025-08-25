import React from 'react';

interface ErrorBoundaryProps {
  error: string | null;
  onRetry: () => void;
  className?: string;
  title?: string;
  retryText?: string;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  className = '',
  title = 'Đã xảy ra lỗi',
  retryText = 'Thử lại'
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="text-red-500 text-xl mr-3">❌</div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">{title}</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <span className="mr-2">🔄</span>
            {retryText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
