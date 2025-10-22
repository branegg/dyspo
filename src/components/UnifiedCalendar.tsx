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
        <div className="grid grid-cols-7 gap-2 mb-3">
          {t.dayNames.map((dayName) => (
            <div key={dayName} className="text-center font-semibold text-muted-foreground py-2 text-xs sm:text-sm">
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

          const baseClassName = "w-full h-full rounded-md border flex flex-col items-center justify-start p-1 sm:p-2 transition-all duration-150 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";
          const finalClassName = dayData.className
            ? `${baseClassName} ${dayData.className}`
            : `${baseClassName} ${
                dayData.isSelected
                  ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-sm'
                  : 'bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground/20 hover:shadow-sm'
              }`;

          return (
            <div key={index} className="aspect-square">
              <button
                onClick={dayData.onClick}
                disabled={dayData.disabled}
                className={finalClassName}
              >
                <div className="font-semibold text-sm sm:text-base md:text-lg mb-0.5">{dayData.day}</div>
                {dayData.content && (
                  <div className="flex-1 w-full overflow-hidden text-[10px] sm:text-xs leading-tight">
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