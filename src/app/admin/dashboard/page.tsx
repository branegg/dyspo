'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilityWithUser, User, DayAssignment, ScheduleWithUsers, DayAssignmentWithUsers } from '@/types';
import AddEmployeeModal from '@/components/AddEmployeeModal';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState<{[key: number]: DayAssignment}>({});
  const [modal, setModal] = useState<{day: number; isOpen: boolean}>({ day: 0, isOpen: false });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadAvailability(token);
    loadEmployees(token);
    loadSchedule(token);
  }, [currentDate]);

  const loadAvailability = async (token: string) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`/api/admin/availability?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async (token: string) => {
    try {
      const response = await fetch('/api/admin/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadSchedule = async (token: string) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`/api/admin/schedule?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.schedule) {
        setSchedule(data.schedule);
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
        setSchedule(null);
        setSelectedAssignments({});
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleAddEmployeeSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      loadEmployees(token);
    }
  };

  const getAvailableEmployeesForDay = (day: number) => {
    return availability.filter(item => item.availableDays.includes(day));
  };

  const getUserName = (userId: string | undefined) => {
    if (!userId) return null;
    const user = availability.find(item => item.userId === userId);
    return user?.user?.name || null;
  };

  const openDayModal = (day: number) => {
    const availableCount = availability.reduce((count, item) => {
      return count + (item.availableDays.includes(day) ? 1 : 0);
    }, 0);

    if (availableCount > 0) {
      setModal({ day, isOpen: true });
    }
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
        body: JSON.stringify({
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          assignments: assignmentsArray
        }),
      });

      if (response.ok) {
        const token = localStorage.getItem('token');
        if (token) {
          loadSchedule(token); // Reload to get updated data
        }
        alert('Grafik został zapisany!');
      } else {
        alert('Błąd podczas zapisywania grafiku');
      }
    } catch (error) {
      alert('Błąd połączenia z serwerem');
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setLoading(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel Administratora
            </h1>
            <p className="text-gray-600">Zarządzanie dyspozycyjnością pracowników</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Dodaj Pracownika
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Wyloguj się
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => handleMonthChange('prev')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Poprzedni miesiąc
            </button>
            <h2 className="text-2xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => handleMonthChange('next')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Następny miesiąc →
            </button>
          </div>

          {availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak danych o dyspozycyjności w tym miesiącu
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-left font-semibold">
                      Pracownik
                    </th>
                    <th className="border p-3 bg-gray-50 text-left font-semibold">
                      Email
                    </th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">
                      Dostępne dni
                    </th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">
                      Liczba dni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {availability.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">
                        {item.user.name}
                      </td>
                      <td className="border p-3 text-gray-600">
                        {item.user.email}
                      </td>
                      <td className="border p-3 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {item.availableDays.length > 0 ? (
                            item.availableDays.map(day => (
                              <span
                                key={day}
                                className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm"
                              >
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">Brak</span>
                          )}
                        </div>
                      </td>
                      <td className="border p-3 text-center font-semibold">
                        {item.availableDays.length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Budowanie Grafiku</h3>
            <button
              onClick={saveSchedule}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Zapisz Grafik
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {allDays.map(day => {
              const availableCount = availability.reduce((count, item) => {
                return count + (item.availableDays.includes(day) ? 1 : 0);
              }, 0);

              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const isTuesday = dayOfWeek === 2;
              const assignment = selectedAssignments[day];

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded p-1 text-xs cursor-pointer transition-colors ${
                    availableCount > 0
                      ? 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200'
                  } ${assignment ? 'ring-2 ring-green-300' : ''}`}
                  style={{ gridColumn: day === 1 ? adjustedDay + 1 : undefined }}
                  onClick={() => openDayModal(day)}
                >
                  <div className="text-center h-full flex flex-col justify-between">
                    <div className="font-semibold text-gray-700">{day}</div>

                    <div className="space-y-1 flex-1 flex flex-col justify-center">
                      {!isTuesday && (
                        <div className="text-blue-600">
                          <div className="font-medium text-xs">B:</div>
                          <div className="truncate text-xs" title={getUserName(assignment?.bagiety) || ''}>
                            {getUserName(assignment?.bagiety) || '-'}
                          </div>
                        </div>
                      )}
                      <div className="text-green-600">
                        <div className="font-medium text-xs">W:</div>
                        <div className="truncate text-xs" title={getUserName(assignment?.widok) || ''}>
                          {getUserName(assignment?.widok) || '-'}
                        </div>
                      </div>
                    </div>

                    {availableCount > 0 && (
                      <div className="text-xs text-gray-500">
                        {availableCount} dost.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <div className="flex flex-wrap justify-center gap-4">
              <span><strong>B:</strong> Bagiety</span>
              <span><strong>W:</strong> Widok</span>
              <span className="text-orange-600">Wtorki: tylko Widok</span>
              <span className="text-blue-600">Kliknij dzień aby przydzielić pracowników</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">Lista Pracowników ({employees.length})</h3>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Brak zarejestrowanych pracowników
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-left font-semibold">
                      Imię i Nazwisko
                    </th>
                    <th className="border p-3 bg-gray-50 text-left font-semibold">
                      Email
                    </th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">
                      Data Rejestracji
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">
                        {employee.name}
                      </td>
                      <td className="border p-3 text-gray-600">
                        {employee.email}
                      </td>
                      <td className="border p-3 text-center text-gray-600">
                        {new Date(employee.createdAt).toLocaleDateString('pl-PL')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddEmployeeSuccess}
        />

        {/* Day Assignment Modal */}
        {modal.isOpen && (
          <DayAssignmentModal
            day={modal.day}
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
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