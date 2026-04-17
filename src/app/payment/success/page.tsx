'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Loading fallback component
function SuccessPageSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Main content component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center">
      <div className="bg-white rounded-lg shadow p-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Your booking has been confirmed. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-3">
          {bookingId && (
            <Link
              href={`/student/booking/${bookingId}`}
              className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              View My Booking
            </Link>
          )}
          <Link
            href="/student/bookings"
            className="block w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            View All Bookings
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main exported component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<SuccessPageSkeleton />}>
      <SuccessContent />
    </Suspense>
  );
}