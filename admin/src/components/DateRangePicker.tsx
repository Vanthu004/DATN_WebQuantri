import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  className = ''
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    
    // Validate: start date cannot be after end date
    if (newStartDate && localEndDate && newStartDate > localEndDate) {
      return;
    }
    
    onDateChange(newStartDate, localEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    
    // Validate: end date cannot be before start date
    if (localStartDate && newEndDate && localStartDate > newEndDate) {
      return;
    }
    
    onDateChange(localStartDate, newEndDate);
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    onDateChange(formatDate(start), formatDate(end));
  };

  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border ${className}`}>
      {/* Date Range Inputs */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Từ:</label>
          <input
            type="date"
            value={localStartDate}
            onChange={handleStartDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Đến:</label>
          <input
            type="date"
            value={localEndDate}
            onChange={handleEndDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Nhanh:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            7 ngày
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            30 ngày
          </button>
          <button
            onClick={() => handleQuickSelect(90)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            90 ngày
          </button>
          <button
            onClick={() => handleQuickSelect(365)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            1 năm
          </button>
        </div>
      </div>

      {/* Validation Message */}
      {localStartDate && localEndDate && localStartDate > localEndDate && (
        <div className="text-red-500 text-sm">
          Ngày bắt đầu không được lớn hơn ngày kết thúc
        </div>
      )}
    </div>
  );
};
