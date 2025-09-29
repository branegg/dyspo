'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import UnifiedCalendar from './UnifiedCalendar';

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

  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push({ day: null });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isSelected: selectedDays.includes(day),
      onClick: () => onDayToggle(day)
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t.months[month - 1]} {year}
      </h2>

      <UnifiedCalendar
        year={year}
        month={month}
        days={calendarDays}
        showDayNames={true}
        showMonthTitle={false}
      />

      <div className="mt-6 text-center text-sm text-gray-600">
        {t.clickAvailableDays}
      </div>
    </div>
  );
}