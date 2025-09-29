'use client';

import { useState, useEffect } from 'react';
import { AvailabilityWithUser, DayAssignment, DayAssignmentWithUsers } from '@/types';

interface InteractiveScheduleCalendarProps {
  year: number;
  month: number;
  availability: AvailabilityWithUser[];
  onScheduleUpdate: (assignments: DayAssignment[]) => void;
}

interface DayAssignmentModal {
  day: number;
  isOpen: boolean;
}

export default function InteractiveScheduleCalendar({
  year,
  month,
  availability,
  onScheduleUpdate
}: InteractiveScheduleCalendarProps) {
  const [schedule, setSchedule] = useState<DayAssignmentWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<DayAssignmentModal>({ day: 0, isOpen: false });
  const [selectedAssignments, setSelectedAssignments] = useState<{[key: number]: DayAssignment}>({});

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

      const response = await fetch(`/api/admin/schedule?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.schedule) {
          setSchedule(data.schedule.assignments || []);
          // Convert to selectedAssignments format
          const assignments: {[key: number]: DayAssignment} = {};
          data.schedule.assignments.forEach((assignment: DayAssignmentWithUsers) => {
            assignments[assignment.day] = {
              day: assignment.day,
              bagiety: assignment.bagiety?.userId || undefined,
              widok: assignment.widok?.userId || undefined
            };
          });
          setSelectedAssignments(assignments);
        } else {
          setSchedule([]);
          setSelectedAssignments({});
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
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

  const getAvailableEmployeesForDay = (day: number) => {
    return availability.filter(item =>
      item.availableDays.includes(day)
    );
  };

  const getAssignmentForDay = (day: number) => {
    return schedule.find(assignment => assignment.day === day);
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return null;
    const user = availability.find(item => item.userId === userId);
    return user?.user?.name || null;
  };

  const openDayModal = (day: number) => {
    setModal({ day, isOpen: true });
  };

  const closeDayModal = () => {
    setModal({ day: 0, isOpen: false });
  };

  const updateDayAssignment = (day: number, bagiety: string | null, widok: string | null) => {
    // Validation: same person can't be on both locations
    if (bagiety && widok && bagiety === widok) {
      alert('Ten sam pracownik nie może być w obu lokalach w tym samym dniu!');
      return;
    }

    const newAssignments = {
      ...selectedAssignments,
      [day]: {
        day,
        bagiety: bagiety || undefined,
        widok: widok || undefined
      }
    };
    setSelectedAssignments(newAssignments);

    // Convert to array format for API
    const assignmentsArray = Object.values(newAssignments);
    onScheduleUpdate(assignmentsArray);
  };

  const saveSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const assignmentsArray = Object.values(selectedAssignments);

      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ year, month, assignments: assignmentsArray }),
      });

      if (response.ok) {
        await fetchSchedule(); // Reload to get updated data
        alert('Grafik został zapisany!');
      } else {
        alert('Błąd podczas zapisywania grafiku');
      }
    } catch (error) {
      alert('Błąd połączenia z serwerem');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Budowanie Grafiku - {monthNames[month - 1]} {year}
        </h3>
        <button
          onClick={saveSchedule}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Zapisz Grafik
        </button>
      </div>

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
            return <div key={index} className="h-24"></div>;
          }

          const dayOfWeek = getDayOfWeek(year, month, day);
          const isTuesday = dayOfWeek === 1;
          const availableEmployees = getAvailableEmployeesForDay(day);
          const assignment = selectedAssignments[day];

          return (
            <div
              key={day}
              className={`
                border rounded p-2 h-24 text-xs cursor-pointer transition-colors
                ${availableEmployees.length > 0
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  : 'bg-gray-50 border-gray-200'
                }
                ${assignment ? 'ring-2 ring-green-300' : ''}
              `}
              onClick={() => availableEmployees.length > 0 && openDayModal(day)}
            >
              <div className="font-medium text-gray-700 mb-1">{day}</div>

              <div className="space-y-1">
                {!isTuesday && (
                  <div className="text-blue-600">
                    <div className="font-medium text-xs">B:</div>
                    <div className="truncate text-xs" title={getUserName(assignment?.bagiety || null) || ''}>
                      {getUserName(assignment?.bagiety || null) || '-'}
                    </div>
                  </div>
                )}
                <div className="text-green-600">
                  <div className="font-medium text-xs">W:</div>
                  <div className="truncate text-xs" title={getUserName(assignment?.widok || null) || ''}>
                    {getUserName(assignment?.widok || null) || '-'}
                  </div>
                </div>
              </div>

              {availableEmployees.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {availableEmployees.length} dost.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        <div className="flex space-x-4">
          <span><strong>B:</strong> Bagiety</span>
          <span><strong>W:</strong> Widok</span>
          <span className="text-orange-600">Wtorki: tylko Widok</span>
          <span className="text-blue-600">Kliknij dzień aby przydzielić pracowników</span>
        </div>
      </div>

      {/* Day Assignment Modal */}
      {modal.isOpen && (
        <DayAssignmentModal
          day={modal.day}
          year={year}
          month={month}
          availableEmployees={getAvailableEmployeesForDay(modal.day)}
          currentAssignment={selectedAssignments[modal.day]}
          onSave={(bagiety, widok) => {
            updateDayAssignment(modal.day, bagiety, widok);
            closeDayModal();
          }}
          onClose={closeDayModal}
        />
      )}
    </div>
  );
}

// Day Assignment Modal Component
interface DayAssignmentModalProps {
  day: number;
  year: number;
  month: number;
  availableEmployees: AvailabilityWithUser[];
  currentAssignment?: DayAssignment;
  onSave: (bagiety: string | null, widok: string | null) => void;
  onClose: () => void;
}

function DayAssignmentModal({
  day,
  year,
  month,
  availableEmployees,
  currentAssignment,
  onSave,
  onClose
}: DayAssignmentModalProps) {
  const [bagiety, setBagiety] = useState<string>(currentAssignment?.bagiety || '');
  const [widok, setWidok] = useState<string>(currentAssignment?.widok || '');

  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const isTuesday = dayOfWeek === 2;
  const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

  const handleSave = () => {
    // Validation
    if (bagiety && widok && bagiety === widok) {
      alert('Nie można przydzielić tego samego pracownika do obu lokali!');
      return;
    }

    onSave(bagiety || null, widok || null);
  };

  const clearAssignments = () => {
    setBagiety('');
    setWidok('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Przydziel pracowników - {day} ({dayNames[dayOfWeek]})
        </h3>

        {availableEmployees.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Brak dostępnych pracowników na ten dzień
          </div>
        ) : (
          <div className="space-y-4">
            {!isTuesday && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🥖 Bagiety
                </label>
                <select
                  value={bagiety}
                  onChange={(e) => setBagiety(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Nie przydzielono --</option>
                  {availableEmployees.map((emp) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🌅 Widok
              </label>
              <select
                value={widok}
                onChange={(e) => setWidok(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Nie przydzielono --</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.userId} value={emp.userId}>
                    {emp.user.name}
                  </option>
                ))}
              </select>
            </div>

            {(bagiety && widok && bagiety === widok) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                ⚠️ Ten sam pracownik nie może być w obu lokalach!
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <div className="space-x-2">
            <button
              onClick={clearAssignments}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Wyczyść
            </button>
          </div>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              disabled={!!(bagiety && widok && bagiety === widok)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}