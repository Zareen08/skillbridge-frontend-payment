'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../lib/axios';
import CheckoutForm from '../../components/payment/CheckoutForm';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Loading fallback component
function PaymentPageSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Main content component that uses useSearchParams
function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (bookingId) {
      fetchPaymentIntent();
      fetchBookingDetails();
    } else {
      router.push('/student/bookings');
    }
  }, [bookingId]);

  const fetchPaymentIntent = async () => {
    try {
      const response = await api.post('/payments/create-payment-intent', { bookingId });
      setClientSecret(response.data.data.clientSecret);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      router.push('/student/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    }
  };

  const handleSuccess = () => {
    router.push(`/payment/success?bookingId=${bookingId}`);
  };

  const handleCancel = () => {
    router.push('/student/bookings');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 mb-6">Unable to initialize payment. Please try again.</p>
            <button
              onClick={() => router.push('/student/bookings')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Complete Payment
          </h1>
          
          {booking && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">Booking Summary</p>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Tutor:</span> {booking.tutor?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Time:</span> {new Date(booking.date).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Duration:</span> {booking.duration} minutes
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  Amount: ${booking.totalAmount}
                </p>
              </div>
            </div>
          )}

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              bookingId={bookingId!}
              amount={booking?.totalAmount || 0}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
}

// Main exported component with Suspense boundary
export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentContent />
    </Suspense>
  );
}