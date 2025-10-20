'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailabilityWithUser, User, DayAssignment, ScheduleWithUsers, DayAssignmentWithUsers } from '@/types';
import AddEmployeeModal from '@/components/AddEmployeeModal';
import EditEmployeeModal from '@/components/EditEmployeeModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import BagietyLoader from '@/components/BagietyLoader';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<AvailabilityWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<{[key: number]: DayAssignment}>({});
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const router = useRouter();
  const { t } = useLanguage();

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
        console.log('Loaded schedule from API:', data.schedule);
        setSchedule(data.schedule);

        // Convert to selectedAssignments format
        const assignments: {[key: number]: DayAssignment} = {};
        data.schedule.assignments.forEach((assignment: DayAssignmentWithUsers) => {
          const bagietyId = assignment.bagiety?.userId;
          const widokId = assignment.widok?.userId;

          console.log(`Day ${assignment.day}: bagiety=${bagietyId}, widok=${widokId}`);

          // Only add assignment if at least one location is assigned
          if (bagietyId || widokId) {
            assignments[assignment.day] = {
              day: assignment.day,
              bagiety: bagietyId || undefined,
              widok: widokId || undefined
            };
          }
        });
        console.log('Converted assignments:', assignments);
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

  const handleEditEmployee = (employee: User) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleEditEmployeeSuccess = () => {
    const token = localStorage.getItem('token');
    if (token) {
      loadEmployees(token);
    }
  };

  const handleDeleteEmployee = async (employee: User) => {
    if (!confirm(`${t.confirmDelete} ${employee.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/employees?userId=${employee._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(t.employeeDeleted);
        loadEmployees(token!);
        loadAvailability(token!);
        loadSchedule(token!);
      } else {
        alert(data.error || t.deleteError);
      }
    } catch (error) {
      alert(t.connectionError);
    }
  };

  const getAvailableEmployeesForDay = (day: number) => {
    return availability.filter(item => item.availableDays.includes(day));
  };

  const employeeColors = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
    { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-800' },
    { bg: 'bg-rose-100', border: 'border-rose-300', text: 'text-rose-800' },
    { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' },
    { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-800' },
  ];

  const getEmployeeColor = (userId: string) => {
    const employeeIndex = availability.findIndex(item => item.userId === userId);
    return employeeColors[employeeIndex % employeeColors.length];
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

      console.log('Saving assignments:', assignmentsArray);

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
          await loadSchedule(token); // Reload to get updated data
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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <BagietyLoader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t.adminDashboard}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{t.employeeAvailability}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <LanguageSwitcher />
            <button
              onClick={() => router.push('/employee/dashboard')}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-xs sm:text-sm whitespace-nowrap"
            >
              {t.switchToEmployeePanel}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 text-xs sm:text-sm whitespace-nowrap"
            >
              {t.addEmployee}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 text-xs sm:text-sm"
            >
              {t.logout}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <button
              onClick={() => handleMonthChange('prev')}
              className="bg-gray-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
            >
              {t.previousMonth}
            </button>
            <h2 className="text-lg sm:text-2xl font-bold text-center">
              {t.months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => handleMonthChange('next')}
              className="bg-gray-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
            >
              {t.nextMonth}
            </button>
          </div>

          <div className="flex justify-center gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t.tableView}
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t.calendarView}
            </button>
          </div>

          {availability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noAvailabilityData}
            </div>
          ) : viewMode === 'table' ? (
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
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {t.dayNames.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2 text-xs sm:text-sm">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {allDays.map(day => {
                  const availableEmployees = getAvailableEmployeesForDay(day);
                  const availableCount = availableEmployees.length;

                  const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
                  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

                  return (
                    <div
                      key={day}
                      className={`border rounded p-2 min-h-[80px] sm:min-h-[100px] ${
                        availableCount > 0
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                      style={{ gridColumn: day === 1 ? adjustedDay + 1 : undefined }}
                    >
                      <div className="font-bold text-gray-700 text-center mb-2 text-sm sm:text-base">
                        {day}
                      </div>
                      {availableCount > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-center font-semibold text-green-700 mb-1">
                            {availableCount} {availableCount === 1 ? 'osoba' : availableCount < 5 ? 'osoby' : 'osób'}
                          </div>
                          <div className="space-y-1">
                            {availableEmployees.map((emp) => {
                              const colors = getEmployeeColor(emp.userId);
                              return (
                                <div
                                  key={emp.userId}
                                  className={`${colors.bg} ${colors.border} ${colors.text} rounded px-1 py-1 text-xs text-center border truncate`}
                                  title={emp.user.name}
                                >
                                  {emp.user.name}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-xs">
                          {t.noAvailableEmployees}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
              const availableEmployees = getAvailableEmployeesForDay(day);
              const availableCount = availableEmployees.length;

              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
              const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
              const isTuesday = dayOfWeek === 2;
              const assignment = selectedAssignments[day];

              const tooltipText = availableCount > 0
                ? `Dostępni pracownicy:\n${availableEmployees.map(emp => emp.user.name).join('\n')}`
                : 'Brak dostępnych pracowników';

              return (
                <div
                  key={day}
                  className={`border rounded p-2 text-xs ${
                    availableCount > 0
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                  style={{ gridColumn: day === 1 ? adjustedDay + 1 : undefined }}
                  title={tooltipText}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 text-center">{day}</div>

                    {availableCount > 0 ? (
                      <>
                        {!isTuesday && (
                          <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">🥖 Bagiety</label>
                            <select
                              value={assignment?.bagiety || ''}
                              onChange={(e) => updateDayAssignment(day, e.target.value || null, assignment?.widok || null)}
                              className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">--</option>
                              {availableEmployees.map((emp) => (
                                <option key={emp.userId} value={emp.userId}>
                                  {emp.user.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-green-600 mb-1">🌅 Widok</label>
                          <select
                            value={assignment?.widok || ''}
                            onChange={(e) => updateDayAssignment(day, assignment?.bagiety || null, e.target.value || null)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="">--</option>
                            {availableEmployees.map((emp) => (
                              <option key={emp.userId} value={emp.userId}>
                                {emp.user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 text-xs py-2">
                        Brak dostępnych
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <div className="flex flex-wrap justify-center gap-4">
              <span><strong>🥖 Bagiety</strong></span>
              <span><strong>🌅 Widok</strong></span>
              <span className="text-orange-600">Wtorki: tylko Widok</span>
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
                      {t.name}
                    </th>
                    <th className="border p-3 bg-gray-50 text-left font-semibold">
                      {t.email}
                    </th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">
                      {t.registrationDate}
                    </th>
                    <th className="border p-3 bg-gray-50 text-center font-semibold">
                      {t.actions}
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
                      <td className="border p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            {t.delete}
                          </button>
                        </div>
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

        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditEmployeeSuccess}
          employee={selectedEmployee}
        />
      </div>
    </div>
  );
}