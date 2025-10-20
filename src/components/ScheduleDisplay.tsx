'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import UnifiedCalendar from './UnifiedCalendar';
import BagietyLoader from './BagietyLoader';

interface DayAssignmentWithUsers {
  day: number;
  bagiety?: {
    userId: string;
    name: string;
    email: string;
  } | null;
  widok?: {
    userId: string;
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
  myScheduleOnly?: boolean;
}

export default function ScheduleDisplay({ year, month, userRole, userId, myScheduleOnly = false }: ScheduleDisplayProps) {
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'bagiety' | 'widok' | 'both'>('both');
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

    return (assignment.bagiety?.userId === userId) || (assignment.widok?.userId === userId);
  };

  const getUserAssignmentForDay = (day: number) => {
    if (userRole === 'admin' || !userId) return null;
    const assignment = getAssignmentForDay(day);
    if (!assignment) return null;

    const locations = [];
    if (assignment.bagiety?.userId === userId) locations.push(t.bagiety);
    if (assignment.widok?.userId === userId) locations.push(t.widok);

    return locations;
  };

  const getDayBackgroundColor = (assignment: any, isTuesday: boolean, location: 'bagiety' | 'widok' | 'both') => {
    const hasBagiety = assignment?.bagiety;
    const hasWidok = assignment?.widok;

    if (location === 'both') {
      // For "both" view, check both locations (Tuesday has no bagiety)
      const expectedAssignments = isTuesday ? 1 : 2; // Tuesday only expects Widok
      const actualAssignments = (hasBagiety ? 1 : 0) + (hasWidok ? 1 : 0);

      if (actualAssignments === 0) {
        return 'bg-red-100 border-red-300'; // No assignments - RED
      } else if (actualAssignments < expectedAssignments) {
        return 'bg-yellow-100 border-yellow-300'; // Partial assignment - YELLOW
      } else {
        return 'bg-green-100 border-green-300'; // Full assignment - GREEN
      }
    } else if (location === 'bagiety') {
      // For bagiety-only view
      if (isTuesday) {
        return 'bg-gray-100 border-gray-300'; // Tuesday - N/A
      }
      return hasBagiety ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
    } else {
      // For widok-only view
      return hasWidok ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[300px]">
        <BagietyLoader size="medium" />
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

  // Calendar view is used for all modes now

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
    const dayColor = getDayBackgroundColor(assignment, isTuesday, selectedLocation);
    let dayClassName = `border rounded ${dayColor}`;

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
    } else {
      // Employee view with location boxes
      // In myScheduleOnly mode, only show assignments for this user
      const shouldShowBagiety = !isTuesday && (selectedLocation === 'bagiety' || selectedLocation === 'both') &&
        (!myScheduleOnly || assignment?.bagiety?.userId === userId);
      const shouldShowWidok = (selectedLocation === 'widok' || selectedLocation === 'both') &&
        (!myScheduleOnly || assignment?.widok?.userId === userId);

      // If myScheduleOnly and no assignment for this user, show empty
      const hasUserAssignment = assignment?.bagiety?.userId === userId || assignment?.widok?.userId === userId;

      content = (
        <div className="space-y-1.5 w-full">
          {shouldShowBagiety && (
            <div className={`rounded px-1.5 py-1 text-center ${
              isUserAssigned && assignment?.bagiety?.userId === userId
                ? 'bg-green-500 text-white font-semibold'
                : myScheduleOnly
                ? 'bg-gray-100 text-gray-400 border border-gray-200'
                : 'bg-blue-100 border border-blue-300'
            }`}>
              <div className="text-[10px] font-bold mb-0.5">{t.bagiety}</div>
              <div className="text-xs truncate" title={assignment?.bagiety?.name}>
                {myScheduleOnly && !hasUserAssignment ? '' : (assignment?.bagiety?.name || '-')}
              </div>
            </div>
          )}
          {shouldShowWidok && (
            <div className={`rounded px-1.5 py-1 text-center ${
              isUserAssigned && assignment?.widok?.userId === userId
                ? 'bg-green-500 text-white font-semibold'
                : myScheduleOnly
                ? 'bg-gray-100 text-gray-400 border border-gray-200'
                : 'bg-purple-100 border border-purple-300'
            }`}>
              <div className="text-[10px] font-bold mb-0.5">{t.widok}</div>
              <div className="text-xs truncate" title={assignment?.widok?.name}>
                {myScheduleOnly && !hasUserAssignment ? '' : (assignment?.widok?.name || '-')}
              </div>
            </div>
          )}
          {isTuesday && selectedLocation === 'bagiety' && (
            <div className="text-center text-gray-500 text-xs py-2">
              {t.tuesdaysOnlyWidok}
            </div>
          )}
        </div>
      );
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
        {myScheduleOnly ? t.mySchedule : t.schedule} - {t.months[month - 1]} {year}
      </h3>

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setSelectedLocation('bagiety')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            selectedLocation === 'bagiety'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🥖 {t.bagiety}
        </button>
        <button
          onClick={() => setSelectedLocation('widok')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            selectedLocation === 'widok'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🌅 {t.widok}
        </button>
        <button
          onClick={() => setSelectedLocation('both')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            selectedLocation === 'both'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {t.bothLocations}
        </button>
      </div>

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
        <div className="mt-4 text-xs">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-500 text-white px-2 py-1 rounded font-semibold">
                {t.yourShifts}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 border border-blue-300 px-2 py-1 rounded">
                {t.bagiety}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 border border-purple-300 px-2 py-1 rounded">
                {t.widok}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}