'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { CalendarIcon, BookOpenIcon, StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
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
      router.push('/login');
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
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/users/stats')
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

  const upcomingBookings = bookings.filter(b => 
    new Date(b.date) > new Date() && b.status === 'CONFIRMED'
  );
  
  const pastBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <BookOpenIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <CalendarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalSpent || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Upcoming Sessions</h2>
          </div>
          <div className="p-6">
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No upcoming sessions. <Link href="/tutors" className="text-indigo-600">Find a tutor</Link>
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{booking.tutor.name}</p>
                        <p className="text-sm text-gray-600">{booking.tutor.tutorProfile?.title}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-500">Duration: {booking.duration} minutes</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Confirmed
                        </span>
                        <p className="text-indigo-600 font-bold mt-2">${booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Past Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Past Sessions</h2>
          </div>
          <div className="p-6">
            {pastBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No past sessions yet.</p>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{booking.tutor.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(booking.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'COMPLETED' 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'COMPLETED' && !booking.isReviewed && !booking.review && (
                          <Link
                            href={`/bookings/${booking.id}/review`}
                            className="mt-2 block text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Leave Review
                          </Link>
                        )}
                        {booking.status === 'COMPLETED' && (booking.isReviewed || booking.review) && (
                          <span className="mt-2 block text-sm text-green-600">
                            ✓ Reviewed
                          </span>
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
    </div>
  );
}