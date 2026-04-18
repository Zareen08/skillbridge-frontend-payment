'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowPathIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  userGrowth: Array<{
    date: string;
    newusers: number;
    newstudents: number;
    newtutors: number;
  }>;
  bookingTrends: Array<{
    date: string;
    totalbookings: number;
    completedbookings: number;
    revenue: number;
  }>;
  popularSubjects: Array<{
    subject: string;
    tutorcount: number;
    averagerating: number;
  }>;
  topTutors: Array<{
    id: string;
    title: string;
    rating: number;
    totalreviews: number;
    hourlyrate: number;
    totalstudents: number;
    user: {
      name: string;
      email: string;
      avatar: string | null;
    };
    subjects: string[];
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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
      fetchAnalytics();
    }
  }, [user, authLoading, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/analytics/platform?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setAnalytics(response.data.data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const setDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  // Helper functions 
  const getTotalRevenue = () => {
    if (!analytics?.bookingTrends) return 0;
    return analytics.bookingTrends.reduce((sum, trend) => sum + (trend.revenue || 0), 0);
  };

  const getTotalBookings = () => {
    if (!analytics?.bookingTrends) return 0;
    return analytics.bookingTrends.reduce((sum, trend) => sum + (trend.totalbookings || 0), 0);
  };

  const getTotalCompletedBookings = () => {
    if (!analytics?.bookingTrends) return 0;
    return analytics.bookingTrends.reduce((sum, trend) => sum + (trend.completedbookings || 0), 0);
  };

  const getNewUsers = () => {
    if (!analytics?.userGrowth) return 0;
    return analytics.userGrowth.reduce((sum, growth) => sum + (growth.newusers || 0), 0);
  };

  const getCompletionRate = () => {
    const total = getTotalBookings();
    const completed = getTotalCompletedBookings();
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Prepare data for charts
  const getSubjectPieData = () => {
    if (!analytics?.popularSubjects) return [];
    return analytics.popularSubjects.slice(0, 6).map(subject => ({
      name: subject.subject,
      value: subject.tutorcount || 0
    }));
  };

  // Custom label renderer for PieChart 
  const renderCustomLabel = (entry: any) => {
    const percentage = entry.percent ? (entry.percent * 100).toFixed(0) : 0;
    return `${entry.name}: ${percentage}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View platform performance metrics and insights</p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="self-center text-gray-500 dark:text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDatePreset(7)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Last 7 days
            </button>
            <button
              onClick={() => setDatePreset(30)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Last 30 days
            </button>
            <button
              onClick={() => setDatePreset(90)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Last 90 days
            </button>
            <button
              onClick={() => setDatePreset(365)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Last year
            </button>
          </div>

          <button
            onClick={fetchAnalytics}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Apply
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${getTotalRevenue().toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getTotalBookings()}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
              <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{getTotalCompletedBookings()}</p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900 rounded-full p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">New Users</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getNewUsers()}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
              <UserGroupIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{getCompletionRate()}%</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900 rounded-full p-3">
              <ChartBarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.bookingTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                formatter={(value) => `$${value}`}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.bookingTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Line type="monotone" dataKey="totalbookings" stroke="#6366f1" name="Total Bookings" />
              <Line type="monotone" dataKey="completedbookings" stroke="#10b981" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Bar dataKey="newstudents" fill="#6366f1" name="Students" />
              <Bar dataKey="newtutors" fill="#10b981" name="Tutors" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Subjects</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getSubjectPieData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getSubjectPieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
          {getSubjectPieData().length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">No subject data available</div>
          )}
        </div>
      </div>

      {/* Top Tutors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performing Tutors</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Highest rated tutors on the platform</p>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-indigo-400 dark:text-indigo-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hourly Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics?.topTutors && analytics.topTutors.length > 0 ? (
                analytics.topTutors.map((tutor, index) => (
                  <tr key={tutor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-500' : 
                        index === 1 ? 'text-gray-400' : 
                        index === 2 ? 'text-amber-600 dark:text-amber-500' : 
                        'text-gray-400 dark:text-gray-600'
                      }`}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            {tutor.user?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tutor.user?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tutor.title || 'No title'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects?.slice(0, 2).map((subject, i) => (
                          <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                            {subject}
                          </span>
                        ))}
                        {tutor.subjects?.length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">+{tutor.subjects.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{tutor.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({tutor.totalreviews || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600 dark:text-green-400">${tutor.hourlyrate || 0}/hr</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {tutor.totalstudents || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No tutor data available for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* No Data Message */}
      {(!analytics?.bookingTrends || analytics.bookingTrends.length === 0) && (
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-300">No data available for the selected date range. Try a different range or check your database.</p>
        </div>
      )}
    </div>
  );
}