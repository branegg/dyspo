'use client';

import { useState, useEffect } from 'react';
import { AvailabilityWithUser, DayAssignment } from '@/types';

interface ScheduleBuilderProps {
  year: number;
  month: number;
  availability: AvailabilityWithUser[];
  onSave: (assignments: DayAssignment[]) => void;
  onClose: () => void;
  initialSchedule?: DayAssignment[];
}

export default function ScheduleBuilder({
  year,
  month,
  availability,
  onSave,
  onClose,
  initialSchedule = []
}: ScheduleBuilderProps) {
  const [assignments, setAssignments] = useState<DayAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    // Initialize assignments for all days
    const initialAssignments: DayAssignment[] = allDays.map(day => {
      const existing = initialSchedule.find(a => a.day === day);
      return existing || { day };
    });
    setAssignments(initialAssignments);
  }, [initialSchedule, year, month]);

  const getAvailableEmployeesForDay = (day: number): AvailabilityWithUser[] => {
    return availability.filter(item => item.availableDays.includes(day));
  };

  const getDayOfWeek = (day: number): number => {
    return new Date(year, month - 1, day).getDay();
  };

  const isTuesday = (day: number): boolean => {
    return getDayOfWeek(day) === 2; // Tuesday
  };

  const updateAssignment = (day: number, location: 'bagiety' | 'widok', userId: string | null) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.day === day
          ? { ...assignment, [location]: userId || undefined }
          : assignment
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(assignments);
      onClose();
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayNameShort = (day: number): string => {
    const dayNames = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
    return dayNames[getDayOfWeek(day)];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Budowanie Grafiku - {monthNames[month - 1]} {year}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <div className="mb-4 text-sm text-gray-600">
              <p><strong>Instrukcja:</strong> Wybierz pracowników na każdy dzień dla lokali Bagiety i Widok.</p>
              <p><strong>Uwaga:</strong> We wtorki nie wybieramy nikogo na Bagiety.</p>
            </div>

            <div className="grid gap-4">
              {allDays.map(day => {
                const availableEmployees = getAvailableEmployeesForDay(day);
                const assignment = assignments.find(a => a.day === day);
                const dayName = getDayNameShort(day);
                const isWorkingTuesday = isTuesday(day);

                return (
                  <div
                    key={day}
                    className={`border rounded-lg p-4 ${
                      isWorkingTuesday ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="font-semibold text-lg">
                        {day} {monthNames[month - 1]} ({dayName})
                      </div>
                      {isWorkingTuesday && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Wtorek - bez Bagiet
                        </span>
                      )}
                      <div className="text-sm text-gray-600">
                        Dostępnych pracowników: {availableEmployees.length}
                      </div>
                    </div>

                    {availableEmployees.length === 0 ? (
                      <div className="text-gray-500 italic">
                        Brak dostępnych pracowników na ten dzień
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {!isWorkingTuesday && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              🥖 Bagiety
                            </label>
                            <select
                              value={assignment?.bagiety || ''}
                              onChange={(e) => updateAssignment(day, 'bagiety', e.target.value || null)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <option value="">Nie przydzielony</option>
                              {availableEmployees.map(emp => (
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
                            value={assignment?.widok || ''}
                            onChange={(e) => updateAssignment(day, 'widok', e.target.value || null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Nie przydzielony</option>
                            {availableEmployees.map(emp => (
                              <option key={emp.userId} value={emp.userId}>
                                {emp.user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Zapisywanie...' : 'Zapisz Grafik'}
          </button>
        </div>
      </div>
    </div>
  );
}