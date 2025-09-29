'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import UnifiedCalendar from './UnifiedCalendar';

interface DayAssignmentWithUsers {
  day: number;
  bagiety?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  widok?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface ScheduleWithUsers {
  _id: string;
  year: number;
  month: number;
  assignments: DayAssignmentWithUsers[];
  createdAt: string;
  updatedAt: string;
}

interface ScheduleDisplayProps {
  year: number;
  month: number;
  userRole: 'admin' | 'employee';
  userId?: string;
}

export default function ScheduleDisplay({ year, month, userRole, userId }: ScheduleDisplayProps) {
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    fetchSchedule();
  }, [year, month]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let endpoint = `/api/admin/schedule?year=${year}&month=${month}`;
      if (userRole === 'employee') {
        endpoint = `/api/schedule?year=${year}&month=${month}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Handle different response formats from admin vs employee endpoints
        if (userRole === 'admin' && data.schedule) {
          setSchedule(data.schedule);
        } else if (userRole === 'employee') {
          setSchedule(data);
        } else {
          setSchedule(null);
        }
      } else if (response.status === 404) {
        setSchedule(null);
      } else {
        const errorData = await response.json().catch(() => ({ error: t.connectionError }));
        setError(`${t.saveError}: ${errorData.error || 'Status ' + response.status}`);
      }
    } catch (error) {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const getDayOfWeek = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  const getAssignmentForDay = (day: number) => {
    if (!schedule || !schedule.assignments) return null;
    return schedule.assignments.find(assignment => assignment.day === day);
  };

  const isUserAssignedToDay = (day: number) => {
    if (userRole === 'admin' || !userId) return false;
    const assignment = getAssignmentForDay(day);
    if (!assignment) return false;

    return (assignment.bagiety?._id === userId) || (assignment.widok?._id === userId);
  };

  const getUserAssignmentForDay = (day: number) => {
    if (userRole === 'admin' || !userId) return null;
    const assignment = getAssignmentForDay(day);
    if (!assignment) return null;

    const locations = [];
    if (assignment.bagiety?._id === userId) locations.push(t.bagiety);
    if (assignment.widok?._id === userId) locations.push(t.widok);

    return locations;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {t.schedule} - {t.months[month - 1]} {year}
        </h3>
        <div className="text-center text-gray-500 py-8">
          {t.noScheduleYet}
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Build calendar days data
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ day: null });
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const assignment = getAssignmentForDay(day);
    const dayOfWeek = getDayOfWeek(year, month, day);
    const isTuesday = dayOfWeek === 1;
    const isUserAssigned = isUserAssignedToDay(day);

    let content;
    let dayClassName = 'border rounded';

    if (userRole === 'admin') {
      // Admin view
      content = (
        <div className="space-y-1 w-full text-left">
          {!isTuesday && (
            <div className="text-blue-600">
              <div className="font-medium">B:</div>
              <div className="truncate text-xs" title={assignment?.bagiety?.name}>
                {assignment?.bagiety?.name || '-'}
              </div>
            </div>
          )}
          <div className="text-green-600">
            <div className="font-medium">W:</div>
            <div className="truncate text-xs" title={assignment?.widok?.name}>
              {assignment?.widok?.name || '-'}
            </div>
          </div>
        </div>
      );
      dayClassName = assignment ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200';
    } else {
      // Employee view
      content = (
        <div className="space-y-1 w-full text-left">
          {!isTuesday && (
            <div className={isUserAssigned && assignment?.bagiety?._id === userId ? 'text-green-600 font-bold' : 'text-blue-600'}>
              <div className="font-medium text-xs">🥖</div>
              <div className="truncate text-xs" title={assignment?.bagiety?.name}>
                {assignment?.bagiety?.name || '-'}
              </div>
            </div>
          )}
          <div className={isUserAssigned && assignment?.widok?._id === userId ? 'text-green-600 font-bold' : 'text-purple-600'}>
            <div className="font-medium text-xs">🌅</div>
            <div className="truncate text-xs" title={assignment?.widok?.name}>
              {assignment?.widok?.name || '-'}
            </div>
          </div>
        </div>
      );
      dayClassName = isUserAssigned ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200';
    }

    calendarDays.push({
      day,
      content,
      className: dayClassName,
      onClick: () => {}
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t.schedule} - {t.months[month - 1]} {year}
      </h3>

      <UnifiedCalendar
        year={year}
        month={month}
        days={calendarDays}
        showDayNames={true}
        showMonthTitle={false}
      />

      {userRole === 'admin' && (
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex space-x-4">
            <span><strong>B:</strong> {t.bagiety}</span>
            <span><strong>W:</strong> {t.widok}</span>
            <span className="text-orange-600">{t.tuesdaysOnlyWidok}</span>
          </div>
        </div>
      )}

      {userRole === 'employee' && (
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex flex-wrap gap-4">
            <span className="text-green-600 font-bold">■ {t.yourShifts}</span>
            <span><strong>🥖</strong> {t.bagiety}</span>
            <span><strong>🌅</strong> {t.widok}</span>
          </div>
        </div>
      )}
    </div>
  );
}