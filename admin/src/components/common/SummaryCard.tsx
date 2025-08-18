import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconBgColor?: string;
  iconColor?: string;
  valueColor?: string;
  className?: string;
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  valueColor = 'text-gray-900',
  className = '',
  onClick
}) => {
  const cardClasses = `
    bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center">
        {icon && (
          <div className={`p-2 ${iconBgColor} rounded-lg mr-4`}>
            <span className={`text-xl ${iconColor}`}>{icon}</span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className={`text-2xl font-bold ${valueColor}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
