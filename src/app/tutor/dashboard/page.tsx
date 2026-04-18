'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  date: string;
  duration: number;
  totalAmount: number;
  status: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
  };
}

interface TutorStats {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
}

export default function TutorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<TutorStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/tutors/my-stats')
      ]);
      
      setBookings(bookingsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const upcomingBookings = bookings.filter(b => 
    new Date(b.date) > new Date() && b.status === 'CONFIRMED'
  );
  
  const recentCompleted = bookings.filter(b => b.status === 'COMPLETED').slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { 
      name: 'Total Sessions', 
      value: stats?.totalBookings || 0, 
      icon: CalendarIcon, 
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      name: 'Completed', 
      value: stats?.completedBookings || 0, 
      icon: ClockIcon, 
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400'
    },
    { 
      name: 'Total Earnings', 
      value: `$${stats?.totalEarnings || 0}`, 
      icon: CurrencyDollarIcon, 
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    { 
      name: 'Rating', 
      value: stats?.averageRating?.toFixed(1) || '0.0', 
      icon: StarIcon, 
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-600 dark:text-purple-400',
      suffix: ` (${stats?.totalReviews || 0} reviews)`
    },
    { 
      name: 'Students', 
      value: stats?.totalStudents || 0, 
      icon: UserGroupIcon, 
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tutor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.suffix && <p className="text-xs text-gray-500 dark:text-gray-400">{stat.suffix}</p>}
              </div>
              <div className={`${stat.bgColor} rounded-full p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
            <Link href="/tutor/availability" className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-800 dark:hover:text-indigo-300">
              Set Availability →
            </Link>
          </div>
          <div className="p-6">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
                <Link href="/tutor/availability" className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 inline-block">
                  Set your availability to get bookings
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                              {booking.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">{booking.student.name}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {booking.duration} minutes</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                          Confirmed
                        </span>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-2">${booking.totalAmount}</p>
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'COMPLETED')}
                          className="mt-2 text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/tutor/profile"
              className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
            >
              <div className="flex items-center gap-3">
                <AcademicCapIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Edit Profile</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Update your professional information</p>
                </div>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400">→</span>
            </Link>
            
            <Link
              href="/tutor/availability"
              className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Manage Availability</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set your teaching schedule</p>
                </div>
              </div>
              <span className="text-green-600 dark:text-green-400">→</span>
            </Link>
            
            <Link
              href="/tutor/bookings"
              className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
            >
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">View All Bookings</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">See your complete booking history</p>
                </div>
              </div>
              <span className="text-purple-600 dark:text-purple-400">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Completed Sessions */}
      {recentCompleted.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Completed Sessions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentCompleted.map((booking) => (
              <div key={booking.id} className="p-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm">
                        {booking.student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.student.name}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 dark:text-green-400 font-semibold">${booking.totalAmount}</p>
                  {booking.review ? (
                    <div className="flex items-center gap-1 mt-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{booking.review.rating}/5</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No review yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}