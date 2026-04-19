'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { UsersIcon, BookOpenIcon, CurrencyDollarIcon, ChartBarIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface DashboardStats {
  users: {
    total: number;
    tutors: number;
    students: number;
    active: number;
    banned: number;
  };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    pending: number;
    completionRate: string;
    totalRevenue: number;
  };
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      
      // Fetch users data
      const usersRes = await api.get('/admin/users?limit=100');
      const allUsers = usersRes.data.data.users || [];
      
      // Calculate user stats
      const totalUsers = allUsers.length;
      const tutors = allUsers.filter((u: any) => u.role === 'TUTOR').length;
      const students = allUsers.filter((u: any) => u.role === 'STUDENT').length;
      const activeUsers = allUsers.filter((u: any) => u.isActive === true).length;
      const bannedUsers = allUsers.filter((u: any) => u.isActive === false).length;
      
      // Fetch bookings data
      const bookingsRes = await api.get('/admin/bookings?limit=100');
      const allBookings = bookingsRes.data.data.bookings || [];
      
      // Calculate booking stats
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter((b: any) => b.status === 'COMPLETED').length;
      const cancelledBookings = allBookings.filter((b: any) => b.status === 'CANCELLED').length;
      const pendingBookings = allBookings.filter((b: any) => b.status === 'CONFIRMED').length;
      
      // Calculate total revenue from completed bookings
      const totalRevenue = allBookings
        .filter((b: any) => b.status === 'COMPLETED')
        .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
      
      // Calculate completion rate
      const completionRate = totalBookings > 0 
        ? ((completedBookings / totalBookings) * 100).toFixed(2) 
        : '0';
      
      setStats({
        users: {
          total: totalUsers,
          tutors: tutors,
          students: students,
          active: activeUsers,
          banned: bannedUsers,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          pending: pendingBookings,
          completionRate: completionRate,
          totalRevenue: totalRevenue,
        },
      });
      
      
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const userStatCards = [
    { name: 'Total Users', value: stats?.users?.total || 0, icon: UsersIcon, color: 'bg-blue-500', link: '/admin/users' },
    { name: 'Total Tutors', value: stats?.users?.tutors || 0, icon: AcademicCapIcon, color: 'bg-green-500', link: '/admin/users?role=TUTOR' },
    { name: 'Total Students', value: stats?.users?.students || 0, icon: UserGroupIcon, color: 'bg-purple-500', link: '/admin/users?role=STUDENT' },
    { name: 'Active Users', value: stats?.users?.active || 0, icon: UsersIcon, color: 'bg-emerald-500', link: '/admin/users?status=active' },
    { name: 'Banned Users', value: stats?.users?.banned || 0, icon: UsersIcon, color: 'bg-red-500', link: '/admin/users?status=banned' },
  ];

  const bookingStatCards = [
    { name: 'Total Bookings', value: stats?.bookings?.total || 0, icon: BookOpenIcon, color: 'bg-yellow-500', link: '/admin/bookings' },
    { name: 'Completed', value: stats?.bookings?.completed || 0, icon: BookOpenIcon, color: 'bg-green-500', link: '/admin/bookings?status=COMPLETED' },
    { name: 'Cancelled', value: stats?.bookings?.cancelled || 0, icon: BookOpenIcon, color: 'bg-red-500', link: '/admin/bookings?status=CANCELLED' },
    { name: 'Pending', value: stats?.bookings?.pending || 0, icon: BookOpenIcon, color: 'bg-yellow-500', link: '/admin/bookings?status=CONFIRMED' },
    { name: 'Total Revenue', value: `$${stats?.bookings?.totalRevenue?.toFixed(2) || 0}`, icon: CurrencyDollarIcon, color: 'bg-indigo-500', link: '/admin/bookings' },
    { name: 'Completion Rate', value: `${stats?.bookings?.completionRate || 0}%`, icon: ChartBarIcon, color: 'bg-cyan-500', link: '/admin/bookings' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back, {user?.name}!</p>
      </div>

      {/* Revenue Card */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Platform Revenue</p>
              <p className="text-3xl font-bold mt-2">${stats?.bookings?.totalRevenue?.toFixed(2) || 0}</p>
              <p className="text-indigo-100 text-sm mt-2">Lifetime earnings</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <CurrencyDollarIcon className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {userStatCards.map((stat) => (
            <Link key={stat.name} href={stat.link}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-full p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Booking Statistics Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Booking Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {bookingStatCards.map((stat) => (
            <Link key={stat.name} href={stat.link}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-full p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Booking Stats Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Bookings</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.bookings?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats?.bookings?.completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats?.bookings?.cancelled || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pending</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats?.bookings?.pending || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{stats?.bookings?.completionRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Details</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{stats?.users?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Banned Users</span>
                <span className="font-semibold text-red-600 dark:text-red-400">{stats?.users?.banned || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tutors</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.users?.tutors || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Students</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats?.users?.students || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="text-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-3 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/bookings"
            className="text-center bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition"
          >
            View All Bookings
          </Link>
          <Link
            href="/admin/categories"
            className="text-center bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-3 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition"
          >
            Manage Categories
          </Link>
          <Link
            href="/admin/analytics/platform"
            className="text-center bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-4 py-3 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition"
          >
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}