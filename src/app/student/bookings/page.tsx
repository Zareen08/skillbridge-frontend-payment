'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import CheckoutForm from '../../../components/payment/CheckoutForm';
import { CalendarIcon, ClockIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Tutor {
  id: string;
  name: string;
  title: string;
  hourlyRate: number;
  user: {
    id: string;
    name: string;
  };
}

export default function BookSessionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      router.push('/');
      return;
    }
    fetchTutors();
  }, [user]);

  const fetchTutors = async () => {
    try {
      const response = await api.get('/tutors?limit=20');
      setTutors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast.error('Failed to load tutors');
    } finally {
      setLoadingTutors(false);
    }
  };

  const handleTutorSelect = (tutorId: string) => {
    setSelectedTutorId(tutorId);
    const tutor = tutors.find(t => t.id === tutorId);
    setSelectedTutor(tutor || null);
  };

  const handleContinueToPayment = async () => {
    try {
      setLoading(true);

      if (!selectedTutorId) {
        toast.error('Please select a tutor');
        return;
      }

      if (!date) {
        toast.error('Please select date and time');
        return;
      }

      const selectedDate = new Date(date);
      if (selectedDate < new Date()) {
        toast.error('Please select a future date and time');
        return;
      }

      // 1. Create booking
      const bookingRes = await api.post('/bookings', {
        tutorId: selectedTutorId,
        date: new Date(date).toISOString(),
        duration,
        notes,
      });

      const booking = bookingRes.data.data;
      setBookingId(booking.id);
      setAmount(booking.totalAmount);

      // 2. Create payment intent
      const paymentRes = await api.post('/payments/create-payment-intent', {
        bookingId: booking.id,
      });

      const secret = paymentRes.data.data.clientSecret;

      if (!secret) {
        toast.error('Payment initialization failed');
        return;
      }

      setClientSecret(secret);
      setStep(2);

    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setStep(3);
  };

  const handleCancel = () => {
    setStep(1);
    setBookingId('');
    setClientSecret('');
  };

  if (!user || user.role !== 'STUDENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book a Session</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Schedule a tutoring session with an expert tutor</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Tutor</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Payment</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Confirm</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Tutor and Schedule */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Session Details</h2>

            {/* Tutor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Tutor *
              </label>
              {loadingTutors ? (
                <div className="text-center py-4">Loading tutors...</div>
              ) : (
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedTutorId}
                  onChange={(e) => handleTutorSelect(e.target.value)}
                >
                  <option value="">-- Select a tutor --</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.user.name} - ${tutor.hourlyRate}/hour
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Tutor Info */}
            {selectedTutor && (
              <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">{selectedTutor.user.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedTutor.title}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">${selectedTutor.hourlyRate}/hour</p>
              </div>
            )}

            {/* Date & Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration *
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific topics or requirements?"
              />
            </div>

            {/* Price Summary */}
            {selectedTutor && date && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">Price Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Session fee ({duration} min)</span>
                  <span className="text-gray-900 dark:text-white">${(selectedTutor.hourlyRate * duration / 60).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${(selectedTutor.hourlyRate * duration / 60).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinueToPayment}
              disabled={loading || !selectedTutorId || !date}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  Continue to Payment
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Complete Payment</h2>
            
            {/* Booking Summary */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Booking Summary</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Tutor:</span> {selectedTutor?.user.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Date:</span> {new Date(date).toLocaleDateString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time:</span> {new Date(date).toLocaleTimeString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Duration:</span> {duration} minutes
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  Amount: ${amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Payment Form */}
            {!clientSecret ? (
              <p className="text-center py-4">Loading payment...</p>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  bookingId={bookingId}
                  amount={amount}
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              </Elements>
            )}
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-500 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed! 🎉
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your session has been successfully booked. You will receive a confirmation email shortly.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/student/booking/${bookingId}`)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                View Booking Details
              </button>
              
              <button
                onClick={() => router.push('/student/bookings')}
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                View All Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}