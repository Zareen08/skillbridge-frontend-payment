'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockIconOutline,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

interface Booking {
  id: string;
  date: string;
  duration: number;
  totalAmount: number;
  status: string;
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
  isReviewed: boolean;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  tutor: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    tutorProfile: {
      title: string;
      bio: string;
      subjects: string[];
      hourlyRate: number;
      experience: number;
      education: string;
      rating: number;
      totalReviews: number;
    };
  };
  review?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export default function BookingDetailsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (bookingId && user) {
      fetchBookingDetails();
    }
  }, [user, authLoading, bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
      router.push('/student/bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setCancelling(true);
    try {
      await api.post(`/bookings/${bookingId}/cancel`, { reason: cancelReason });
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      fetchBookingDetails();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = () => {
    if (!booking) return null;
    
    switch(booking.status) {
      case 'PENDING_PAYMENT':
        return {
          color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
          icon: CurrencyDollarIcon,
          text: 'Payment Required'
        };
      case 'CONFIRMED':
        return {
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
          icon: ClockIconOutline,
          text: 'Confirmed'
        };
      case 'COMPLETED':
        return {
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
          icon: CheckCircleIcon,
          text: 'Completed'
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
          icon: XCircleIcon,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          icon: ClockIconOutline,
          text: booking.status
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking not found</h1>
        <Link href="/student/bookings" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge?.icon;
  const isUpcoming = booking.status === 'CONFIRMED' && new Date(booking.date) > new Date();
  const canCancel = isUpcoming;
  const needsPayment = booking.status === 'PENDING_PAYMENT';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/student/bookings" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 mb-4">
          ← Back to Bookings
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Details</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Booking ID: {booking.id.slice(0, 8)}...</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusBadge?.color}`}>
            {StatusIcon && <StatusIcon className="h-4 w-4" />}
            <span className="text-sm font-medium">{statusBadge?.text}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-5 w-5" />
                <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <ClockIcon className="h-5 w-5" />
                <span>{new Date(booking.date).toLocaleTimeString()} ({booking.duration} minutes)</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span className="font-semibold text-green-600 dark:text-green-400">${booking.totalAmount}</span>
              </div>
              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Additional Notes:</p>
                  <p className="text-gray-700 dark:text-gray-300">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tutor Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tutor Information</h2>
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {booking.tutor.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{booking.tutor.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{booking.tutor.tutorProfile?.title}</p>
                <Link
                  href={`/tutors/${booking.tutor.id}`}
                  className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                >
                  View Tutor Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-3">
              {/* Payment Button - Show for pending payment bookings */}
              {needsPayment && (
                <Link
                  href={`/payment?bookingId=${booking.id}`}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Pay Now - ${booking.totalAmount}
                </Link>
              )}
              
              {/* Payment Status - Show if paid */}
              {booking.paymentStatus === 'paid' && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                  <p className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Payment Completed
                  </p>
                </div>
              )}

              {/* Cancel Button - Only for confirmed upcoming bookings */}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Cancel Booking
                </button>
              )}
        
              <Link
                href="/tutors"
                className="block w-full text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Find Another Tutor
              </Link>
            </div>
          </div>

          {/* Payment Required Card */}
          {needsPayment && (
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 dark:text-orange-400 mb-2">Payment Required</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Complete your payment to confirm this booking. Your session is reserved but not confirmed until payment is received.
              </p>
            </div>
          )}

          {/* Booking Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Timeline</h2>
            <div className="space-y-4">
              {/* Booking Created */}
              <div className="flex gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  {(booking.status !== 'CANCELLED' && booking.status !== 'PENDING_PAYMENT') && (
                    <div className="absolute top-8 left-4 h-full w-px bg-gray-200 dark:bg-gray-700"></div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Booking Created</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Payment Step */}
              {(booking.status === 'PENDING_PAYMENT' || booking.paymentStatus === 'paid') && (
                <div className="flex gap-3">
                  <div className={`h-8 w-8 rounded-full ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  } flex items-center justify-center`}>
                    <CurrencyDollarIcon className={`h-4 w-4 ${
                      booking.paymentStatus === 'paid' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.paymentStatus === 'paid' ? 'Payment Completed' : 'Payment Required'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.paymentStatus === 'paid' 
                        ? `Payment received: $${booking.totalAmount}`
                        : 'Complete payment to confirm your booking'}
                    </p>
                  </div>
                </div>
              )}

              {/* Session Scheduled */}
              {booking.status === 'CONFIRMED' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <ClockIconOutline className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Session Scheduled</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Session Completed */}
              {booking.status === 'COMPLETED' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Session Completed</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Completed on {new Date(booking.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Cancelled */}
              {booking.status === 'CANCELLED' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Booking Cancelled</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Cancelled by {user?.role === 'STUDENT' ? 'You' : 'Tutor'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Booking</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to cancel your session with <strong className="text-gray-900 dark:text-white">{booking.tutor.name}</strong>?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Please tell us why you're cancelling..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Keep Booking
                </button>
                <button
                  onClick={cancelBooking}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}