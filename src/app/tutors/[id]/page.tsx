'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../lib/axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, ClockIcon, CurrencyDollarIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface Tutor {
  id: string;
  title: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  experience: number;
  education: string;
  availability: any;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    student: {
      name: string;
      avatar: string | null;
    };
  }>;
}

export default function TutorDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tutorId = params.id as string;

  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTutorDetails();
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    try {
      const response = await api.get(`/tutors/${tutorId}`);
      setTutor(response.data.data);
    } catch (error) {
      console.error('Error fetching tutor:', error);
      toast.error('Failed to load tutor details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to book a session');
      router.push('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      toast.error('Only students can book sessions');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/bookings', {
        tutorId: tutor?.user.id,
        date: new Date(bookingDate).toISOString(),
        duration: bookingDuration,
        notes: bookingNotes,
      });
      toast.success('Booking created successfully!');
      setShowBookingModal(false);
      router.push('/student/bookings');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tutor not found</h1>
        <Link href="/tutors" className="mt-4 inline-block text-indigo-600">
          ← Back to Tutors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/tutors" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6">
        ← Back to Tutors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {tutor.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tutor.user.name}</h1>
                <p className="text-gray-600">{tutor.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold">{tutor.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({tutor.totalReviews} reviews)</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{tutor.experience}+ years experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{tutor.bio}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5" />
              Education
            </h2>
            <p className="text-gray-600">{tutor.education}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subjects I Teach</h2>
            <div className="flex flex-wrap gap-2">
              {tutor.subjects.map((subject, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Reviews</h2>
            {tutor.reviews && tutor.reviews.length > 0 ? (
              <div className="space-y-4">
                {tutor.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {review.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{review.student.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-indigo-600">${tutor.hourlyRate}</p>
              <p className="text-gray-500">per hour</p>
            </div>
            
            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Book a Session
            </button>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <ClockIcon className="h-4 w-4" />
                <span>Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4" />
                <span>Online sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Book a Session</h2>
              <p className="text-gray-600">with {tutor.user.name}</p>
            </div>
            <form onSubmit={handleBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
                <select
                  value={bookingDuration}
                  onChange={(e) => setBookingDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={30}>30 minutes (${tutor.hourlyRate / 2})</option>
                  <option value={60}>60 minutes (${tutor.hourlyRate})</option>
                  <option value={90}>90 minutes (${tutor.hourlyRate * 1.5})</option>
                  <option value={120}>120 minutes (${tutor.hourlyRate * 2})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any specific topics or requirements?"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : `Book - $${tutor.hourlyRate * (bookingDuration / 60)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}