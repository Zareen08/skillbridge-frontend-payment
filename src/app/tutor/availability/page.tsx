'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Availability {
  [key: string]: string[];
}

export default function TutorAvailabilityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<Availability>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user && user.role !== 'TUTOR') {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchAvailability();
    }
  }, [user, authLoading]);

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/tutors/my-availability');
      setAvailability(response.data.data.availability || {});
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = (day: string) => {
    const currentSlots = availability[day] || [];
    setAvailability({
      ...availability,
      [day]: [...currentSlots, '09:00-12:00']
    });
  };

  const updateTimeSlot = (day: string, index: number, value: string) => {
    const newSlots = [...(availability[day] || [])];
    newSlots[index] = value;
    setAvailability({ ...availability, [day]: newSlots });
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newSlots = [...(availability[day] || [])];
    newSlots.splice(index, 1);
    if (newSlots.length === 0) {
      const { [day]: _, ...rest } = availability;
      setAvailability(rest);
    } else {
      setAvailability({ ...availability, [day]: newSlots });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.put('/tutors/availability', { availability });
      toast.success('Availability updated successfully!');
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set Your Availability</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Define when you're available for tutoring sessions</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="space-y-6">
          {days.map((day) => (
            <div key={day} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{day}</h3>
                <button
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition"
                >
                  + Add Time Slot
                </button>
              </div>
              
              <div className="space-y-2">
                {(availability[day] || []).map((slot, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={slot}
                      onChange={(e) => updateTimeSlot(day, index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="e.g., 09:00-12:00"
                    />
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(day, index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {(!availability[day] || availability[day].length === 0) && (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">No time slots added</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </form>
    </div>
  );
}