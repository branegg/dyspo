'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HourLog } from '@/types';

interface HourLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  year: number;
  month: number;
  daysInMonth: number;
  editingLog?: HourLog | null;
}

export default function HourLogForm({
  isOpen,
  onClose,
  onSuccess,
  year,
  month,
  daysInMonth,
  editingLog,
}: HourLogFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    day: '',
    hours: '',
    location: '' as 'bagiety' | 'widok' | '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingLog) {
      setFormData({
        day: editingLog.day.toString(),
        hours: editingLog.hours.toString(),
        location: editingLog.location,
        notes: editingLog.notes || '',
      });
    } else {
      setFormData({
        day: '',
        hours: '',
        location: '',
        notes: '',
      });
    }
    setError('');
  }, [editingLog, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.day) {
      setError(t.dateRequired);
      setLoading(false);
      return;
    }

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      setError(t.hoursMustBePositive);
      setLoading(false);
      return;
    }

    if (!formData.location) {
      setError(t.locationRequired);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isEditing = !!editingLog;

      const response = await fetch('/api/hours', {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          isEditing
            ? {
                id: editingLog._id,
                hours: parseFloat(formData.hours),
                location: formData.location,
                notes: formData.notes,
              }
            : {
                year,
                month,
                day: parseInt(formData.day),
                hours: parseFloat(formData.hours),
                location: formData.location,
                notes: formData.notes,
              }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ day: '', hours: '', location: '', notes: '' });
        onSuccess();
        onClose();
      } else {
        setError(data.error || t.hourLogError);
      }
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {editingLog ? t.editHourLog : t.addNewHourLog}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingLog && (
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                {t.selectDate}
              </label>
              <select
                id="day"
                name="day"
                value={formData.day}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.selectDate}</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day} {t.months[month - 1]} {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              {t.selectLocation}
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectLocation}</option>
              <option value="bagiety">{t.bagiety}</option>
              <option value="widok">{t.widok}</option>
            </select>
          </div>

          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              {t.enterHours}
            </label>
            <input
              type="number"
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              min="0.5"
              max="24"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              {t.notesOptional}
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
