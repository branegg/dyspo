'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { ReactNode } from 'react';

interface CalendarDay {
  day: number | null;
  isSelected?: boolean;
  onClick?: () => void;
  content?: ReactNode;
  className?: string;
  disabled?: boolean;
}

interface UnifiedCalendarProps {
  year: number;
  month: number;
  days: CalendarDay[];
  showDayNames?: boolean;
  showMonthTitle?: boolean;
}

export default function UnifiedCalendar({
  year,
  month,
  days,
  showDayNames = true,
  showMonthTitle = false
}: UnifiedCalendarProps) {
  const { t } = useLanguage();

  return (
    <div>
      {showMonthTitle && (
        <h2 className="text-2xl font-bold text-center mb-6">
          {t.months[month - 1]} {year}
        </h2>
      )}

      {showDayNames && (
        <div className="grid grid-cols-7 gap-2 mb-2">
          {t.dayNames.map((dayName) => (
            <div key={dayName} className="text-center font-semibold text-gray-600 py-2 text-sm">
              {dayName}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {days.map((dayData, index) => {
          if (!dayData.day) {
            return <div key={index} className="aspect-square"></div>;
          }

          const baseClassName = "w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-1 transition-all";
          const finalClassName = dayData.className
            ? `${baseClassName} ${dayData.className}`
            : `${baseClassName} ${
                dayData.isSelected
                  ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`;

          return (
            <div key={index} className="aspect-square">
              <button
                onClick={dayData.onClick}
                disabled={dayData.disabled}
                className={finalClassName}
              >
                <div className="font-medium text-sm">{dayData.day}</div>
                {dayData.content && (
                  <div className="flex-1 w-full overflow-hidden text-xs mt-1">
                    {dayData.content}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}