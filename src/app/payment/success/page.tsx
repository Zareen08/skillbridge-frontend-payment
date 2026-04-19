'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Loading fallback component
function SuccessPageSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// Main content component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-12 w-12 text-green-500 dark:text-green-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Your booking has been confirmed. You will receive a confirmation email shortly.
          </p>
          
          <div className="space-y-3">
            {bookingId && (
              <Link
                href={`/student/bookings/${bookingId}`}
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-3 rounded-lg font-medium transition duration-200"
              >
                View My Booking
              </Link>
            )}
            
            <Link
              href="/student/bookings"
              className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-center px-4 py-3 rounded-lg font-medium transition duration-200"
            >
              View All Bookings
            </Link>
            
            <Link
              href="/"
              className="block w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-center px-4 py-3 rounded-lg font-medium transition duration-200"
            >
              Return to Home
            </Link>
          </div>
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