'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilityWithUser, User, DayAssignment, ScheduleWithUsers, DayAssignmentWithUsers } from '@/types';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import ScheduleBuilder from '@/components/ScheduleBuilder';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleBuilder, setShowScheduleBuilder] = useState(false);
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
      if (response.ok) {
        setSchedule(data.schedule);
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

  const handleSaveSchedule = async (assignments: DayAssignment[]) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ year, month, assignments }),
      });

      if (response.ok) {
        loadSchedule(token);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
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
              onClick={() => setShowScheduleBuilder(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              disabled={availability.length === 0}
            >
              Buduj Grafik
            </button>
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
          <h3 className="text-xl font-bold mb-4">Podsumowanie dostępności</h3>
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

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded flex items-center justify-center text-sm ${
                    availableCount > 0
                      ? 'bg-green-100 border-green-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={{ gridColumn: day === 1 ? adjustedDay + 1 : undefined }}
                >
                  <div className="text-center">
                    <div className="font-semibold">{day}</div>
                    <div className="text-xs text-gray-600">{availableCount}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Liczby pokazują ile pracowników jest dostępnych w danym dniu
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

        {schedule && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Grafik Pracy - {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">Dzień</th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">🥖 Bagiety</th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">🌅 Widok</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.assignments.map((assignment: DayAssignmentWithUsers) => {
                    const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), assignment.day).getDay();
                    const isTuesday = dayOfWeek === 2;
                    const dayNames = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];

                    return (
                      <tr key={assignment.day} className={`hover:bg-gray-50 ${isTuesday ? 'bg-blue-50' : ''}`}>
                        <td className="border p-3 text-center font-medium">
                          {assignment.day} ({dayNames[dayOfWeek]})
                        </td>
                        <td className="border p-3 text-center">
                          {isTuesday ? (
                            <span className="text-gray-500 italic">Dzień wolny</span>
                          ) : assignment.bagiety ? (
                            <div className="text-green-700 font-medium">
                              {assignment.bagiety.name}
                            </div>
                          ) : (
                            <span className="text-red-500">Nie przydzielono</span>
                          )}
                        </td>
                        <td className="border p-3 text-center">
                          {assignment.widok ? (
                            <div className="text-blue-700 font-medium">
                              {assignment.widok.name}
                            </div>
                          ) : (
                            <span className="text-red-500">Nie przydzielono</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddEmployeeSuccess}
        />

        {showScheduleBuilder && (
          <ScheduleBuilder
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
            availability={availability}
            initialSchedule={schedule?.assignments.map(assignment => ({
              day: assignment.day,
              bagiety: assignment.bagiety?.userId,
              widok: assignment.widok?.userId
            })) || []}
            onSave={handleSaveSchedule}
            onClose={() => setShowScheduleBuilder(false)}
          />
        )}
      </div>
    </div>
  );
}