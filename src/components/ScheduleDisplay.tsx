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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
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
        if (userRole === 'admin') {
          // Admin endpoint returns { schedule: ... }
          setSchedule(data.schedule);
        } else if (userRole === 'employee') {
          // Employee endpoint returns schedule directly (or null)
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

  // Color palette for employees (MUST match admin dashboard exactly)
  const employeeColors = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
  ];

  // Get unique employees from schedule and create ordered list (excluding current user)
  const getUniqueEmployees = () => {
    if (!schedule) return [];
    const employeeMap = new Map<string, { userId: string; name: string; index: number }>();
    let index = 0;

    schedule.assignments.forEach((assignment: any) => {
      if (assignment.bagiety && assignment.bagiety.userId !== userId && !employeeMap.has(assignment.bagiety.userId)) {
        employeeMap.set(assignment.bagiety.userId, {
          userId: assignment.bagiety.userId,
          name: assignment.bagiety.name,
          index: index++
        });
      }
      if (assignment.widok && assignment.widok.userId !== userId && !employeeMap.has(assignment.widok.userId)) {
        employeeMap.set(assignment.widok.userId, {
          userId: assignment.widok.userId,
          name: assignment.widok.name,
          index: index++
        });
      }
    });

    return Array.from(employeeMap.values()).map(emp => ({
      ...emp,
      color: employeeColors[emp.index % employeeColors.length]
    }));
  };

  // Assign color to employee based on their position in employee list
  const getEmployeeColor = (employeeUserId: string) => {
    if (!employeeUserId) return employeeColors[0];

    const employees = getUniqueEmployees();
    const employee = employees.find(emp => emp.userId === employeeUserId);
    return employee ? employee.color : employeeColors[0];
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

      // Get employee-specific colors for full schedule view
      const bagietyColor = assignment?.bagiety ? getEmployeeColor(assignment.bagiety.userId) : null;
      const widokColor = assignment?.widok ? getEmployeeColor(assignment.widok.userId) : null;

      content = (
        <div className="space-y-1 sm:space-y-1.5 w-full">
          {shouldShowBagiety && (
            <div className={`rounded px-1 sm:px-1.5 py-0.5 sm:py-1 text-center border ${
              isUserAssigned && assignment?.bagiety?.userId === userId
                ? 'bg-green-500 text-white font-semibold border-green-600'
                : myScheduleOnly
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : bagietyColor
                ? `${bagietyColor.bg} ${bagietyColor.border} ${bagietyColor.text}`
                : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="text-[9px] sm:text-[10px] font-bold mb-0.5">{t.bagiety}</div>
              <div className="text-[11px] sm:text-xs truncate" title={assignment?.bagiety?.name}>
                {myScheduleOnly && !hasUserAssignment ? '' : (assignment?.bagiety?.name || '-')}
              </div>
            </div>
          )}
          {shouldShowWidok && (
            <div className={`rounded px-1 sm:px-1.5 py-0.5 sm:py-1 text-center border ${
              isUserAssigned && assignment?.widok?.userId === userId
                ? 'bg-green-500 text-white font-semibold border-green-600'
                : myScheduleOnly
                ? 'bg-gray-100 text-gray-400 border-gray-200'
                : widokColor
                ? `${widokColor.bg} ${widokColor.border} ${widokColor.text}`
                : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="text-[9px] sm:text-[10px] font-bold mb-0.5">{t.widok}</div>
              <div className="text-[11px] sm:text-xs truncate" title={assignment?.widok?.name}>
                {myScheduleOnly && !hasUserAssignment ? '' : (assignment?.widok?.name || '-')}
              </div>
            </div>
          )}
          {isTuesday && selectedLocation === 'bagiety' && (
            <div className="text-center text-gray-500 text-[10px] sm:text-xs py-1 sm:py-2">
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

  // Helper function to get user's shifts for list view
  const getUserShifts = () => {
    if (!schedule || !userId) return [];

    const shifts: Array<{ day: number; location: string; dayOfWeek: number }> = [];

    schedule.assignments.forEach(assignment => {
      if (assignment.bagiety?.userId === userId) {
        const dayOfWeek = getDayOfWeek(year, month, assignment.day);
        shifts.push({ day: assignment.day, location: t.bagiety, dayOfWeek });
      }
      if (assignment.widok?.userId === userId) {
        const dayOfWeek = getDayOfWeek(year, month, assignment.day);
        shifts.push({ day: assignment.day, location: t.widok, dayOfWeek });
      }
    });

    return shifts.sort((a, b) => a.day - b.day);
  };

  // Helper function to get all assignments for list view (full schedule)
  const getAllAssignments = () => {
    if (!schedule) return [];

    const assignments: Array<{
      day: number;
      dayOfWeek: number;
      bagiety: { userId: string; name: string; email: string } | null;
      widok: { userId: string; name: string; email: string } | null;
    }> = [];

    const daysInMonth = getDaysInMonth(year, month);

    for (let day = 1; day <= daysInMonth; day++) {
      const assignment = getAssignmentForDay(day);
      const dayOfWeek = getDayOfWeek(year, month, day);
      const isTuesday = dayOfWeek === 1;

      // Only include days that have at least one assignment
      if (assignment && (assignment.bagiety || assignment.widok)) {
        assignments.push({
          day,
          dayOfWeek,
          bagiety: !isTuesday && assignment.bagiety ? assignment.bagiety : null,
          widok: assignment.widok || null
        });
      }
    }

    return assignments;
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        {myScheduleOnly ? t.mySchedule : t.schedule} - {t.months[month - 1]} {year}
      </h3>

      {/* View Mode Toggle for employees */}
      {userRole === 'employee' && (
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 {t.calendarView}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 {t.listView}
          </button>
        </div>
      )}

      {/* Location Filter (only show for calendar view) */}
      {viewMode === 'calendar' && (
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
      )}

      {/* List View (mobile-friendly) */}
      {viewMode === 'list' && userRole === 'employee' ? (
        <div className="space-y-2">
          {myScheduleOnly ? (
            // My Schedule List View - only user's shifts
            getUserShifts().length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t.noShiftsAssigned}
              </div>
            ) : (
              getUserShifts().map((shift, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                        {shift.day}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-base">
                          {t.dayNames[shift.dayOfWeek]}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t.months[month - 1]} {shift.day}, {year}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border-2 border-green-500">
                      <div className="text-xs text-gray-500 font-medium">{t.location}</div>
                      <div className="font-bold text-green-700 text-base">{shift.location}</div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Full Schedule List View - all assignments
            getAllAssignments().length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {t.noScheduleYet}
              </div>
            ) : (
              getAllAssignments().map((assignment, index) => {
                const isUserAssigned = userId && (
                  assignment.bagiety?.userId === userId ||
                  assignment.widok?.userId === userId
                );

                return (
                  <div
                    key={index}
                    className={`${
                      isUserAssigned
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-300'
                    } p-4 rounded-lg shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`${
                        isUserAssigned ? 'bg-green-500' : 'bg-gray-400'
                      } text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                        {assignment.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-base mb-1">
                          {t.dayNames[assignment.dayOfWeek]}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {t.months[month - 1]} {assignment.day}, {year}
                        </div>
                        <div className="space-y-2">
                          {assignment.bagiety && (
                            <div className={`flex items-center gap-2 p-2 rounded ${
                              assignment.bagiety.userId === userId
                                ? 'bg-green-500 text-white font-semibold'
                                : 'bg-blue-100 border border-blue-300'
                            }`}>
                              <span className="text-xs font-bold">🥖 {t.bagiety}:</span>
                              <span className="text-sm truncate">{assignment.bagiety.name}</span>
                            </div>
                          )}
                          {assignment.widok && (
                            <div className={`flex items-center gap-2 p-2 rounded ${
                              assignment.widok.userId === userId
                                ? 'bg-green-500 text-white font-semibold'
                                : 'bg-purple-100 border border-purple-300'
                            }`}>
                              <span className="text-xs font-bold">🌅 {t.widok}:</span>
                              <span className="text-sm truncate">{assignment.widok.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      ) : (
        <>
          {/* Calendar View */}
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
            <div className="mt-4">
              {!myScheduleOnly && (
                <>
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    {t.colorLegend || 'Color Legend'}:
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 items-center mb-3">
                    {/* Current user */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border border-green-600 rounded"></div>
                      <span className="text-xs sm:text-sm font-semibold">{t.you || 'You'}</span>
                    </div>
                    {/* Other employees */}
                    {getUniqueEmployees().map((emp) => (
                      <div key={emp.userId} className="flex items-center gap-2">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 ${emp.color.bg} border ${emp.color.border} rounded`}></div>
                        <span className="text-xs sm:text-sm">{emp.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center text-xs sm:text-sm text-gray-600">
                <span>🥖 {t.bagiety}</span>
                <span>•</span>
                <span>🌅 {t.widok}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}