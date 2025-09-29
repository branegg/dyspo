'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface CalendarProps {
  year: number;
  month: number;
  selectedDays: number[];
  onDayToggle: (day: number) => void;
}

export default function Calendar({ year, month, selectedDays, onDayToggle }: CalendarProps) {
  const { t } = useLanguage();

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const days = [];

  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t.months[month - 1]} {year}
      </h2>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {t.dayNames.map((dayName) => (
          <div key={dayName} className="text-center font-semibold text-gray-600 py-2">
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onClick={() => onDayToggle(day)}
                className={`w-full h-full rounded-lg border-2 font-medium transition-all ${
                  selectedDays.includes(day)
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                {day}
              </button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        {t.clickAvailableDays}
      </div>
    </div>
  );
}