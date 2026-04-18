'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  tutor: {
    id: string;
    name: string;
    avatar: string | null;
    tutorProfile: {
      title: string;
    };
  };
  booking: {
    id: string;
    date: string;
    duration: number;
  };
}

export default function StudentReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (user && user.role !== 'STUDENT') {
      router.push('/');
      return;
    }
    
    if (user) {
      fetchReviews();
    }
  }, [user, authLoading]);

  const fetchReviews = async () => {
    try {
      // Get all bookings first, then filter those with reviews
      const response = await api.get('/bookings');
      const allBookings = response.data.data || [];
      
      // Extract bookings that have reviews
      const reviewsList = allBookings
        .filter((booking: any) => booking.review)
        .map((booking: any) => ({
          id: booking.review.id,
          rating: booking.review.rating,
          comment: booking.review.comment,
          createdAt: booking.review.createdAt,
          tutor: booking.tutor,
          booking: {
            id: booking.id,
            date: booking.date,
            duration: booking.duration,
          },
        }));
      
      setReviews(reviewsList);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Reviews you've written for tutors</p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <StarIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">You haven't written any reviews yet</p>
          <Link href="/student/bookings" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
            View your completed sessions →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {review.tutor.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{review.tutor.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{review.tutor.tutorProfile?.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(review.booking.date).toLocaleDateString()}
                    </span>
                    <span>{review.booking.duration} minutes</span>
                  </div>
                </div>
                
                <Link
                  href={`/tutors/${review.tutor.id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                >
                  View Tutor
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}