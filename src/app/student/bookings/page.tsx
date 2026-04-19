'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../../../components/payment/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Booking {
  id: string;
  date: string;
  duration: number;
  totalAmount: number;
  status: string;
  tutor: {
    name: string;
  };
}

export default function StudentBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  //  INIT PAYMENT
  const initPayment = async (bookingId: string) => {
    try {
      const res = await api.post('/payments/create-payment-intent', { bookingId });
      setClientSecret(res.data.data.clientSecret);
    } catch (err: any) {
      toast.error('Payment init failed');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 border rounded-lg flex justify-between">
            <div>
              <p><strong>{booking.tutor.name}</strong></p>
              <p>{new Date(booking.date).toLocaleString()}</p>
              <p>${booking.totalAmount}</p>
            </div>

            {booking.status === 'PENDING_PAYMENT' && (
              <button
                onClick={() => {
                  setSelectedBooking(booking);
                  setStep(1);
                  setShowModal(true);
                  initPayment(booking.id);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Continue
              </button>
            )}
          </div>
        ))}
      </div>

      {/*  MULTI STEP MODAL */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg">

            {/* Step Indicator */}
            <div className="flex justify-between mb-6 text-sm">
              {['Schedule', 'Confirm', 'Payment', 'Success'].map((label, i) => (
                <div key={i} className={step === i + 1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}>
                  {label}
                </div>
              ))}
            </div>

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Select Schedule</h2>

                <input
                  type="datetime-local"
                  className="w-full border p-2 rounded"
                  defaultValue={new Date(selectedBooking.date).toISOString().slice(0, 16)}
                />

                <button
                  onClick={() => setStep(2)}
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
                >
                  Next
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Confirm Booking</h2>

                <p><strong>Tutor:</strong> {selectedBooking.tutor.name}</p>
                <p><strong>Amount:</strong> ${selectedBooking.totalAmount}</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border py-2 rounded"
                  >
                    Back
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded"
                  >
                    Pay
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && clientSecret && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment</h2>

                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    bookingId={selectedBooking.id}
                    amount={selectedBooking.totalAmount}
                    onSuccess={() => setStep(4)}
                    onCancel={() => setStep(2)}
                  />
                </Elements>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="text-center">
                <h2 className="text-xl font-bold text-green-600 mb-4">
                  Payment Successful 🎉
                </h2>

                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBooking(null);
                    setStep(1);
                    fetchBookings();
                  }}
                  className="w-full bg-indigo-600 text-white py-2 rounded"
                >
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}