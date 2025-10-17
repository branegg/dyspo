'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Calendar from '@/components/Calendar';
import ScheduleDisplay from '@/components/ScheduleDisplay';

type TabType = 'availability' | 'schedule' | 'mySchedule';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('availability');
  const [showReminder, setShowReminder] = useState(false);
  const [hasNextMonthAvailability, setHasNextMonthAvailability] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    // Allow both employees and admins to access this dashboard
    if (parsedUser.role !== 'employee' && parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadAvailability(token);

    // Only check for next month availability reminder for employees (not admins)
    if (parsedUser.role === 'employee') {
      checkNextMonthAvailability(token);
    }
  }, [currentDate]);

  const loadAvailability = async (token: string) => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`/api/availability?year=${year}&month=${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.availability) {
        setSelectedDays(data.availability.availableDays || []);
      } else {
        setSelectedDays([]);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNextMonthAvailability = async (token: string) => {
    try {
      // Check if today is after the 15th
      const today = new Date();
      const dayOfMonth = today.getDate();

      if (dayOfMonth > 15) {
        // Calculate next month
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        const year = nextMonth.getFullYear();
        const month = nextMonth.getMonth() + 1;

        const response = await fetch(`/api/availability?year=${year}&month=${month}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Show reminder if no availability for next month
        if (!data.availability || !data.availability.availableDays || data.availability.availableDays.length === 0) {
          setHasNextMonthAvailability(false);
          setShowReminder(true);
        } else {
          setHasNextMonthAvailability(true);
          setShowReminder(false);
        }
      } else {
        setShowReminder(false);
      }
    } catch (error) {
      console.error('Error checking next month availability:', error);
    }
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort((a, b) => a - b);
      }
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    setMessage('');

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          year,
          month,
          availableDays: selectedDays,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(t.availabilitySaved);
      } else {
        setMessage(data.error || t.saveError);
      }
    } catch (error) {
      setMessage(t.connectionError);
    } finally {
      setSaving(false);
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

  const handleSetAvailabilityForNextMonth = () => {
    // Navigate to next month and switch to availability tab
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
    setActiveTab('availability');
    setShowReminder(false);
    setLoading(true);
  };

  if (loading || !t) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">{t?.loading || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t.employeePanel}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{t.welcome}, {user?.name}!</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <LanguageSwitcher />
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 text-sm sm:text-base whitespace-nowrap"
              >
                {t.switchToAdminPanel}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 text-sm sm:text-base"
            >
              {t.logout}
            </button>
          </div>
        </div>

        {/* Availability Reminder Banner */}
        {showReminder && user?.role === 'employee' && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 sm:p-6 mb-4 sm:mb-6 rounded-lg shadow-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-yellow-900">
                  {t.availabilityReminderTitle}
                </h3>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-yellow-800">
                  {t.availabilityReminderMessage}
                </p>
                <button
                  onClick={handleSetAvailabilityForNextMonth}
                  className="mt-3 sm:mt-4 bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-yellow-700 font-semibold text-sm sm:text-base w-full sm:w-auto"
                >
                  {t.setAvailabilityNow}
                </button>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowReminder(false)}
                  className="text-yellow-600 hover:text-yellow-800 p-1"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold transition-colors text-xs sm:text-base ${
                activeTab === 'availability'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.myAvailability}
            </button>
            <button
              onClick={() => setActiveTab('mySchedule')}
              className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold transition-colors text-xs sm:text-base ${
                activeTab === 'mySchedule'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.mySchedule}
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 px-2 sm:px-6 py-3 sm:py-4 text-center font-semibold transition-colors text-xs sm:text-base ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.workSchedule}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'availability' ? (
          <div className="bg-white rounded-b-lg shadow-lg p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <button
                onClick={() => handleMonthChange('prev')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.previousMonth}
              </button>
              <button
                onClick={() => handleMonthChange('next')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.nextMonth}
              </button>
            </div>

            <Calendar
              year={currentDate.getFullYear()}
              month={currentDate.getMonth() + 1}
              selectedDays={selectedDays}
              onDayToggle={handleDayToggle}
            />

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                {t.selectedDays}: {selectedDays.length > 0 ? selectedDays.join(', ') : t.noSelectedDays}
              </p>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto"
              >
                {saving ? t.saving : t.saveAvailability}
              </button>

              {message && (
                <div className={`mt-4 p-3 rounded text-sm sm:text-base ${
                  message.includes(t.availabilitySaved) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {message}
              </div>
            )}
          </div>
        </div>
        ) : activeTab === 'mySchedule' ? (
          <div className="bg-white rounded-b-lg shadow-lg p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <button
                onClick={() => handleMonthChange('prev')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.previousMonth}
              </button>
              <button
                onClick={() => handleMonthChange('next')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.nextMonth}
              </button>
            </div>

            <ScheduleDisplay
              year={currentDate.getFullYear()}
              month={currentDate.getMonth() + 1}
              userRole="employee"
              userId={user?._id}
              myScheduleOnly={true}
            />
          </div>
        ) : (
          <div className="bg-white rounded-b-lg shadow-lg p-3 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
              <button
                onClick={() => handleMonthChange('prev')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.previousMonth}
              </button>
              <button
                onClick={() => handleMonthChange('next')}
                className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 text-xs sm:text-base whitespace-nowrap"
              >
                {t.nextMonth}
              </button>
            </div>

            <ScheduleDisplay
              year={currentDate.getFullYear()}
              month={currentDate.getMonth() + 1}
              userRole="employee"
              userId={user?._id}
              myScheduleOnly={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}