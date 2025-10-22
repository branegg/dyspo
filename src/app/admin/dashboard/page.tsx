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
  // Set default date: if after 20th of month, show next month
  const getDefaultDate = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    if (dayOfMonth > 20) {
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      return nextMonth;
    }
    return today;
  };
  const [currentDate, setCurrentDate] = useState(getDefaultDate());
  const [availability, setAvailability] = useState<AvailabilityWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<ScheduleWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<{[key: number]: DayAssignment}>({});
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [scheduleLocation, setScheduleLocation] = useState<'bagiety' | 'widok' | 'both'>('both');
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

  const getEmployeeAssignmentStats = (employeeId: string) => {
    if (!schedule || !schedule.assignments) {
      return { days: 0, hours: 0 };
    }

    let days = 0;
    schedule.assignments.forEach((assignment: any) => {
      if (assignment.bagiety?.userId === employeeId) {
        days++;
      }
      if (assignment.widok?.userId === employeeId) {
        days++;
      }
    });

    return {
      days,
      hours: days * 10
    };
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

  const handleUnlockAvailability = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch('/api/admin/availability/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, year, month }),
      });

      if (response.ok) {
        alert(t.unlockSuccess);
        // Reload availability data
        if (token) {
          loadAvailability(token);
        }
      } else {
        alert(t.unlockError);
      }
    } catch (error) {
      alert(t.unlockError);
    }
  };

  const handleLockAvailability = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch('/api/admin/availability/lock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, year, month }),
      });

      if (response.ok) {
        alert(t.lockSuccess);
        // Reload availability data
        if (token) {
          loadAvailability(token);
        }
      } else {
        alert(t.lockError);
      }
    } catch (error) {
      alert(t.lockError);
    }
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
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {availability.map((item, index) => {
                  const isLocked = item.isLocked !== undefined ? item.isLocked : true;
                  return (
                    <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{item.user.name}</h4>
                          <p className="text-sm text-gray-600">{item.user.email}</p>
                        </div>
                        <div>
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              {t.locked}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                              </svg>
                              {t.unlocked}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Dostępne dni ({item.availableDays.length}):</p>
                        <div className="flex flex-wrap gap-1">
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
                            <span className="text-gray-500 text-sm">Brak</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        {isLocked ? (
                          <button
                            onClick={() => handleUnlockAvailability(item.userId)}
                            className="w-full bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm"
                          >
                            🔓 {t.unlockAvailability}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockAvailability(item.userId)}
                            className="w-full bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                          >
                            🔒 {t.lockAvailability}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
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
                        Status
                      </th>
                      <th className="border p-3 bg-gray-50 text-center font-semibold">
                        Dostępne dni
                      </th>
                      <th className="border p-3 bg-gray-50 text-center font-semibold">
                        Liczba dni
                      </th>
                      <th className="border p-3 bg-gray-50 text-center font-semibold">
                        Akcja
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.map((item, index) => {
                      // Default to locked if field doesn't exist (for existing records)
                      const isLocked = item.isLocked !== undefined ? item.isLocked : true;
                      return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          {item.user.name}
                        </td>
                        <td className="border p-3 text-gray-600">
                          {item.user.email}
                        </td>
                        <td className="border p-3 text-center">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              {t.locked}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                              </svg>
                              {t.unlocked}
                            </span>
                          )}
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
                        <td className="border p-3 text-center">
                          {isLocked ? (
                            <button
                              onClick={() => handleUnlockAvailability(item.userId)}
                              className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm"
                            >
                              🔓 {t.unlockAvailability}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLockAvailability(item.userId)}
                              className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm"
                            >
                              🔒 {t.lockAvailability}
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
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

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg sm:text-xl font-bold">Budowanie Grafiku</h3>
            <button
              onClick={saveSchedule}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              Zapisz Grafik
            </button>
          </div>

          <div className="flex justify-center gap-1 sm:gap-2 mb-4">
            <button
              onClick={() => setScheduleLocation('bagiety')}
              className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                scheduleLocation === 'bagiety'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🥖 {t.bagiety}
            </button>
            <button
              onClick={() => setScheduleLocation('widok')}
              className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                scheduleLocation === 'widok'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🌅 {t.widok}
            </button>
            <button
              onClick={() => setScheduleLocation('both')}
              className={`px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                scheduleLocation === 'both'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t.bothLocations}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
            {t.dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-1 sm:py-2 text-xs sm:text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
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

              const dayColor = getDayBackgroundColor(assignment, isTuesday, scheduleLocation);

              return (
                <div
                  key={day}
                  className={`border rounded p-1 sm:p-2 text-xs ${dayColor}`}
                  style={{ gridColumn: day === 1 ? adjustedDay + 1 : undefined }}
                  title={tooltipText}
                >
                  <div className="space-y-1 sm:space-y-2">
                    <div className="font-semibold text-gray-700 text-center text-xs sm:text-sm">{day}</div>

                    {availableCount > 0 ? (
                      <>
                        {!isTuesday && (scheduleLocation === 'bagiety' || scheduleLocation === 'both') && (
                          <div>
                            <label className="hidden sm:block text-xs font-medium text-blue-600 mb-1">🥖 Bagiety</label>
                            <label className="block sm:hidden text-[10px] font-medium text-blue-600 mb-0.5">🥖</label>
                            <select
                              value={assignment?.bagiety || ''}
                              onChange={(e) => updateDayAssignment(day, e.target.value || null, assignment?.widok || null)}
                              className="w-full px-0.5 sm:px-1 py-0.5 sm:py-1 text-[10px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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

                        {(scheduleLocation === 'widok' || scheduleLocation === 'both') && (
                          <div>
                            <label className="hidden sm:block text-xs font-medium text-green-600 mb-1">🌅 Widok</label>
                            <label className="block sm:hidden text-[10px] font-medium text-green-600 mb-0.5">🌅</label>
                            <select
                              value={assignment?.widok || ''}
                              onChange={(e) => updateDayAssignment(day, assignment?.bagiety || null, e.target.value || null)}
                              className="w-full px-0.5 sm:px-1 py-0.5 sm:py-1 text-[10px] sm:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
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

                        {isTuesday && scheduleLocation === 'bagiety' && (
                          <div className="text-center text-gray-500 text-[10px] sm:text-xs py-1 sm:py-2">
                            Wtorek - brak Bagiety
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-400 text-[10px] sm:text-xs py-1 sm:py-2">
                        Brak dostępnych
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {scheduleLocation === 'both' && (
            <div className="mt-4 text-xs text-gray-600">
              <div className="flex flex-wrap justify-center gap-4">
                <span><strong>🥖 Bagiety</strong></span>
                <span><strong>🌅 Widok</strong></span>
                <span className="text-orange-600">{t.tuesdaysOnlyWidok}</span>
              </div>
            </div>
          )}
          {scheduleLocation === 'bagiety' && (
            <div className="mt-4 text-xs text-gray-600 text-center">
              <span className="text-orange-600">{t.tuesdaysOnlyWidok}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mt-6">
          <div className="mb-4">
            <h3 className="text-lg sm:text-xl font-bold">{t.employeeList} ({employees.length})</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {t.assignedDays} / {t.assignedHours} {t.scheduleForMonth} {t.months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noRegisteredEmployees}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-6">
                {/* Administrators Section */}
                {employees.filter(e => e.role === 'admin').length > 0 && (
                  <div>
                    <h4 className="text-md font-bold text-gray-800 mb-3 pb-2 border-b-2 border-purple-300">
                      {t.administrators} ({employees.filter(e => e.role === 'admin').length})
                    </h4>
                    <div className="space-y-4">
                      {employees.filter(e => e.role === 'admin').map((employee) => {
                        const stats = getEmployeeAssignmentStats(employee._id || '');
                        const employeeAvailability = availability.find(a => a.userId === employee._id);
                        const hasAvailability = !!employeeAvailability;
                        const isLocked = employeeAvailability?.isLocked !== undefined ? employeeAvailability.isLocked : true;

                        return (
                          <div key={employee._id} className="border rounded-lg p-4 bg-purple-50 shadow-sm">
                            <div className="mb-3">
                              <h5 className="font-bold text-gray-900">{employee.name}</h5>
                              <p className="text-sm text-gray-600">{employee.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {t.registrationDate}: {new Date(employee.createdAt).toLocaleDateString('pl-PL')}
                              </p>
                            </div>

                            <div className="flex gap-3 mb-3">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 mb-1">{t.assignedDays}</p>
                                <span className={`inline-block w-full text-center px-3 py-2 rounded font-semibold ${
                                  stats.days > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.days}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 mb-1">{t.assignedHours}</p>
                                <span className={`inline-block w-full text-center px-3 py-2 rounded font-semibold ${
                                  stats.hours > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.hours} {t.hoursUnit}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t space-y-2">
                              {hasAvailability && (
                                isLocked ? (
                                  <button
                                    onClick={() => handleUnlockAvailability(employee._id || '')}
                                    className="w-full bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm"
                                    title={t.unlockAvailability}
                                  >
                                    🔓 Odblokuj
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLockAvailability(employee._id || '')}
                                    className="w-full bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                                    title={t.lockAvailability}
                                  >
                                    🔒 Zablokuj
                                  </button>
                                )
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                                >
                                  {t.edit}
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee)}
                                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                                >
                                  {t.delete}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Employees Section */}
                {employees.filter(e => e.role === 'employee').length > 0 && (
                  <div>
                    <h4 className="text-md font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-300">
                      {t.employees} ({employees.filter(e => e.role === 'employee').length})
                    </h4>
                    <div className="space-y-4">
                      {employees.filter(e => e.role === 'employee').map((employee) => {
                        const stats = getEmployeeAssignmentStats(employee._id || '');
                        const employeeAvailability = availability.find(a => a.userId === employee._id);
                        const hasAvailability = !!employeeAvailability;
                        const isLocked = employeeAvailability?.isLocked !== undefined ? employeeAvailability.isLocked : true;

                        return (
                          <div key={employee._id} className="border rounded-lg p-4 bg-white shadow-sm">
                            <div className="mb-3">
                              <h5 className="font-bold text-gray-900">{employee.name}</h5>
                              <p className="text-sm text-gray-600">{employee.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {t.registrationDate}: {new Date(employee.createdAt).toLocaleDateString('pl-PL')}
                              </p>
                            </div>

                            <div className="flex gap-3 mb-3">
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 mb-1">{t.assignedDays}</p>
                                <span className={`inline-block w-full text-center px-3 py-2 rounded font-semibold ${
                                  stats.days > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.days}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-gray-600 mb-1">{t.assignedHours}</p>
                                <span className={`inline-block w-full text-center px-3 py-2 rounded font-semibold ${
                                  stats.hours > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.hours} {t.hoursUnit}
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t space-y-2">
                              {hasAvailability && (
                                isLocked ? (
                                  <button
                                    onClick={() => handleUnlockAvailability(employee._id || '')}
                                    className="w-full bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 text-sm"
                                    title={t.unlockAvailability}
                                  >
                                    🔓 Odblokuj
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleLockAvailability(employee._id || '')}
                                    className="w-full bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                                    title={t.lockAvailability}
                                  >
                                    🔒 Zablokuj
                                  </button>
                                )
                              )}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditEmployee(employee)}
                                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                                >
                                  {t.edit}
                                </button>
                                <button
                                  onClick={() => handleDeleteEmployee(employee)}
                                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                                >
                                  {t.delete}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto space-y-6">
                {/* Administrators Table */}
                {employees.filter(e => e.role === 'admin').length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-purple-300">
                      {t.administrators} ({employees.filter(e => e.role === 'admin').length})
                    </h4>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border p-3 bg-purple-50 text-left font-semibold">
                            {t.name}
                          </th>
                          <th className="border p-3 bg-purple-50 text-left font-semibold">
                            {t.email}
                          </th>
                          <th className="border p-3 bg-purple-50 text-center font-semibold">
                            {t.registrationDate}
                          </th>
                          <th className="border p-3 bg-purple-50 text-center font-semibold">
                            {t.assignedDays}
                          </th>
                          <th className="border p-3 bg-purple-50 text-center font-semibold">
                            {t.assignedHours}
                          </th>
                          <th className="border p-3 bg-purple-50 text-center font-semibold">
                            {t.actions}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.filter(e => e.role === 'admin').map((employee) => {
                          const stats = getEmployeeAssignmentStats(employee._id || '');
                          const employeeAvailability = availability.find(a => a.userId === employee._id);
                          const hasAvailability = !!employeeAvailability;
                          const isLocked = employeeAvailability?.isLocked !== undefined ? employeeAvailability.isLocked : true;

                          return (
                            <tr key={employee._id} className="hover:bg-purple-50">
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
                                <span className={`inline-block px-3 py-1 rounded font-semibold ${
                                  stats.days > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.days}
                                </span>
                              </td>
                              <td className="border p-3 text-center">
                                <span className={`inline-block px-3 py-1 rounded font-semibold ${
                                  stats.hours > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.hours} {t.hoursUnit}
                                </span>
                              </td>
                              <td className="border p-3 text-center">
                                <div className="flex gap-2 justify-center flex-wrap">
                                  {hasAvailability && (
                                    isLocked ? (
                                      <button
                                        onClick={() => handleUnlockAvailability(employee._id || '')}
                                        className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm whitespace-nowrap"
                                        title={t.unlockAvailability}
                                      >
                                        🔓 Odblokuj
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleLockAvailability(employee._id || '')}
                                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm whitespace-nowrap"
                                        title={t.lockAvailability}
                                      >
                                        🔒 Zablokuj
                                      </button>
                                    )
                                  )}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Employees Table */}
                {employees.filter(e => e.role === 'employee').length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-blue-300">
                      {t.employees} ({employees.filter(e => e.role === 'employee').length})
                    </h4>
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
                            {t.assignedDays}
                          </th>
                          <th className="border p-3 bg-gray-50 text-center font-semibold">
                            {t.assignedHours}
                          </th>
                          <th className="border p-3 bg-gray-50 text-center font-semibold">
                            {t.actions}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.filter(e => e.role === 'employee').map((employee) => {
                          const stats = getEmployeeAssignmentStats(employee._id || '');
                          const employeeAvailability = availability.find(a => a.userId === employee._id);
                          const hasAvailability = !!employeeAvailability;
                          const isLocked = employeeAvailability?.isLocked !== undefined ? employeeAvailability.isLocked : true;

                          return (
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
                                <span className={`inline-block px-3 py-1 rounded font-semibold ${
                                  stats.days > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.days}
                                </span>
                              </td>
                              <td className="border p-3 text-center">
                                <span className={`inline-block px-3 py-1 rounded font-semibold ${
                                  stats.hours > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {stats.hours} {t.hoursUnit}
                                </span>
                              </td>
                              <td className="border p-3 text-center">
                                <div className="flex gap-2 justify-center flex-wrap">
                                  {hasAvailability && (
                                    isLocked ? (
                                      <button
                                        onClick={() => handleUnlockAvailability(employee._id || '')}
                                        className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm whitespace-nowrap"
                                        title={t.unlockAvailability}
                                      >
                                        🔓 Odblokuj
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleLockAvailability(employee._id || '')}
                                        className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 text-sm whitespace-nowrap"
                                        title={t.lockAvailability}
                                      >
                                        🔒 Zablokuj
                                      </button>
                                    )
                                  )}
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
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
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