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
    <div className="flex justify-center items-center min-h-screen">
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <p className="text-red-600">Unable to initialize payment. Please try again.</p>
        <button
          onClick={() => router.push('/student/bookings')}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h1>
        
        {booking && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold">Booking Summary</p>
            <p className="text-sm text-gray-600">Tutor: {booking.tutor?.name}</p>
            <p className="text-sm text-gray-600">
              Date: {new Date(booking.date).toLocaleDateString()}
            </p>
            <p className="text-lg font-bold text-indigo-600 mt-2">
              Amount: ${booking.totalAmount}
            </p>
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