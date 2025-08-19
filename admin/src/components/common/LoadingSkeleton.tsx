import React from 'react';

interface LoadingSkeletonProps {
  type?: 'dashboard' | 'chart' | 'table' | 'cards';
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'dashboard', 
  className = '' 
}) => {
  const renderDashboardSkeleton = () => (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderChartSkeleton = () => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCardsSkeleton = () => (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );

  switch (type) {
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'table':
      return renderTableSkeleton();
    case 'cards':
      return renderCardsSkeleton();
    default:
      return renderDashboardSkeleton();
  }
};

export default LoadingSkeleton;
