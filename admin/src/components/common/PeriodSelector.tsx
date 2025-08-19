import React from 'react';

type PeriodType = "7d" | "30d" | "90d" | "all";

interface PeriodSelectorProps<T extends PeriodType> {
  value: T;
  onChange: (period: T) => void;
  className?: string;
  includeAll?: boolean;
  label?: string;
}

export const PeriodSelector = <T extends PeriodType>({
  value,
  onChange,
  className = '',
  includeAll = false,
  label = 'Thời gian'
}: PeriodSelectorProps<T>) => {
  const periods = [
    { value: "7d" as T, label: "7 ngày" },
    { value: "30d" as T, label: "30 ngày" },
    { value: "90d" as T, label: "90 ngày" },
    ...(includeAll ? [{ value: "all" as T, label: "Tất cả" }] : [])
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}:</span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PeriodSelector;
