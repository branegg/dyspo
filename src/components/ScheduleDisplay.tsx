'use client';

import { useState, useEffect } from 'react';

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

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];

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
        setSchedule(data);
      } else if (response.status === 404) {
        setSchedule(null);
      } else {
        setError('Błąd podczas pobierania grafiku');
      }
    } catch (error) {
      setError('Błąd połączenia z serwerem');
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
    if (!schedule) return null;
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
    if (assignment.bagiety?._id === userId) locations.push('Bagiety');
    if (assignment.widok?._id === userId) locations.push('Widok');

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
          Grafik - {monthNames[month - 1]} {year}
        </h3>
        <div className="text-center text-gray-500 py-8">
          Brak grafiku na ten miesiąc
        </div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Grafik - {monthNames[month - 1]} {year}
      </h3>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-20"></div>;
          }

          const assignment = getAssignmentForDay(day);
          const dayOfWeek = getDayOfWeek(year, month, day);
          const isTuesday = dayOfWeek === 1;
          const isUserAssigned = isUserAssignedToDay(day);
          const userLocations = getUserAssignmentForDay(day);

          return (
            <div
              key={day}
              className={`
                border rounded p-1 h-20 text-xs
                ${isUserAssigned ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}
              `}
            >
              <div className="font-medium text-gray-700 mb-1">{day}</div>

              {userRole === 'admin' ? (
                <div className="space-y-1">
                  {!isTuesday && (
                    <div className="text-blue-600">
                      <div className="font-medium">B:</div>
                      <div className="truncate" title={assignment?.bagiety?.name}>
                        {assignment?.bagiety?.name || '-'}
                      </div>
                    </div>
                  )}
                  <div className="text-green-600">
                    <div className="font-medium">W:</div>
                    <div className="truncate" title={assignment?.widok?.name}>
                      {assignment?.widok?.name || '-'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {isUserAssigned && userLocations && (
                    <div className="text-green-600 font-medium">
                      {userLocations.map(location => (
                        <div key={location} className="text-xs">
                          {location === 'Bagiety' ? 'B' : 'W'}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isUserAssigned && assignment && (
                    <div className="text-gray-400 text-xs">
                      Pracują inni
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {userRole === 'admin' && (
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex space-x-4">
            <span><strong>B:</strong> Bagiety</span>
            <span><strong>W:</strong> Widok</span>
            <span className="text-orange-600">Wtorki: tylko Widok</span>
          </div>
        </div>
      )}

      {userRole === 'employee' && (
        <div className="mt-4 text-xs text-gray-600">
          <div className="flex space-x-4">
            <span className="text-green-600">■ Twoje dyżury</span>
            <span className="text-gray-400">■ Dyżury innych</span>
          </div>
        </div>
      )}
    </div>
  );
}