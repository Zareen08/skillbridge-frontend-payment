'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { 
  CalendarIcon, 
  BookOpenIcon, 
  StarIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  date: string;
  duration: number;
  totalAmount: number;
  status: string;
  isReviewed?: boolean;
  review?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
  tutor: {
    id: string;
    name: string;
    avatar: string | null;
    tutorProfile: {
      title: string;
    };
  };
}

interface Stats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageRating: number;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user && user.role !== 'STUDENT') {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      const dashboardRes = await api.get('/users/dashboard');
      const dashboardData = dashboardRes.data.data;
      
      setStats(dashboardData.stats);
      setBookings(dashboardData.bookings?.all || []);
      
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    new Date(b.date) > new Date() && b.status === 'CONFIRMED'
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Sessions</p>
              <p className="text-3xl font-bold">{stats?.totalBookings || 0}</p>
            </div>
            <BookOpenIcon className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-3xl font-bold">{stats?.completedBookings || 0}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Spent</p>
              <p className="text-3xl font-bold">${stats?.totalSpent || 0}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold">{stats?.averageRating?.toFixed(1) || 0}</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h2>
              <Link href="/student/bookings" className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-800 dark:hover:text-indigo-300">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No upcoming sessions</p>
                <Link href="/tutors" className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                  Find a tutor →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                              {booking.tutor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{booking.tutor.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{booking.tutor.tutorProfile?.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(booking.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {new Date(booking.date).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Duration: {booking.duration} minutes</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                          Confirmed
                        </span>
                        <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-2">${booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Past Sessions</h2>
              <Link href="/student/bookings" className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-800 dark:hover:text-indigo-300">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {pastBookings.length === 0 ? (
              <div className="text-center py-8">
                <BookOpenIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No past sessions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                              {booking.tutor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">{booking.tutor.name}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'COMPLETED' 
                            ? 'text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30' 
                            : 'text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                        }`}>
                          {booking.status === 'COMPLETED' ? (
                            <span className="flex items-center gap-1">
                              <CheckCircleIcon className="h-3 w-3" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircleIcon className="h-3 w-3" />
                              Cancelled
                            </span>
                          )}
                        </span>
                        {booking.status === 'COMPLETED' && !booking.isReviewed && !booking.review && (
                          <Link
                            href={`/student/review/${booking.id}`}
                            className="mt-2 block text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/tutors"
          className="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg p-4 text-center transition"
        >
          <BookOpenIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <p className="font-medium text-indigo-600 dark:text-indigo-400">Find a Tutor</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Book a new session</p>
        </Link>
        <Link
          href="/student/profile"
          className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg p-4 text-center transition"
        >
          <StarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="font-medium text-purple-600 dark:text-purple-400">My Profile</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Update your information</p>
        </Link>
        <Link
          href="/student/bookings"
          className="bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg p-4 text-center transition"
        >
          <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <p className="font-medium text-green-600 dark:text-green-400">All Bookings</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">View session history</p>
        </Link>
      </div>
    </div>
  );
}