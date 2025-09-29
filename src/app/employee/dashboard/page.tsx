'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import ScheduleDisplay from '@/components/ScheduleDisplay';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/employee/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'employee') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    loadAvailability(token);
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
        setMessage('Dyspozycyjność została zapisana!');
      } else {
        setMessage(data.error || 'Błąd podczas zapisywania');
      }
    } catch (error) {
      setMessage('Błąd połączenia z serwerem');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel Pracownika
            </h1>
            <p className="text-gray-600">Witaj, {user?.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Wyloguj się
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => handleMonthChange('prev')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Poprzedni miesiąc
            </button>
            <button
              onClick={() => handleMonthChange('next')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Następny miesiąc →
            </button>
          </div>

          <Calendar
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
            selectedDays={selectedDays}
            onDayToggle={handleDayToggle}
          />

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Wybrane dni: {selectedDays.length > 0 ? selectedDays.join(', ') : 'Brak wybranych dni'}
            </p>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Zapisywanie...' : 'Zapisz dyspozycyjność'}
            </button>

            {message && (
              <div className={`mt-4 p-3 rounded ${
                message.includes('zapisana') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <ScheduleDisplay
            year={currentDate.getFullYear()}
            month={currentDate.getMonth() + 1}
            userRole="employee"
            userId={user?._id}
          />
        </div>
      </div>
    </div>
  );
}