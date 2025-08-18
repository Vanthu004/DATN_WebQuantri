import React, { useState, useEffect } from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
  showQuickSelect?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
  className = '',
  showQuickSelect = true,
  showValidation = true,
  disabled = false
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (localStartDate && localEndDate) {
      setIsValid(localStartDate <= localEndDate);
    } else {
      setIsValid(true);
    }
  }, [localStartDate, localEndDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    
    if (newStartDate && localEndDate && newStartDate > localEndDate) {
      return;
    }
    
    onDateChange(newStartDate, localEndDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    
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

  const getQuickSelectButtonClass = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const isActive = startDate === start.toISOString().split('T')[0] && 
                     endDate === end.toISOString().split('T')[0];
    
    return `
      px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200
      ${isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }
    `;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <span className="mr-2">📅</span>
          Chọn khoảng thời gian
        </h4>
        {showQuickSelect && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Nhanh:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleQuickSelect(7)}
                className={getQuickSelectButtonClass(7)}
                disabled={disabled}
              >
                7 ngày
              </button>
              <button
                onClick={() => handleQuickSelect(30)}
                className={getQuickSelectButtonClass(30)}
                disabled={disabled}
              >
                30 ngày
              </button>
              <button
                onClick={() => handleQuickSelect(90)}
                className={getQuickSelectButtonClass(90)}
                disabled={disabled}
              >
                90 ngày
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Date Range Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Từ ngày
          </label>
          <input
            type="date"
            value={localStartDate}
            onChange={handleStartDateChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${!isValid && localStartDate && localEndDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Đến ngày
          </label>
          <input
            type="date"
            value={localEndDate}
            onChange={handleEndDateChange}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              ${!isValid && localStartDate && localEndDate ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
      </div>

      {/* Validation Message */}
      {showValidation && !isValid && localStartDate && localEndDate && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-sm text-red-700">
              Ngày bắt đầu không được lớn hơn ngày kết thúc
            </p>
          </div>
        </div>
      )}

      {/* Date Range Info */}
      {localStartDate && localEndDate && isValid && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Khoảng thời gian: <strong>{localStartDate}</strong> đến <strong>{localEndDate}</strong>
            </span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {Math.ceil((new Date(localEndDate).getTime() - new Date(localStartDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
