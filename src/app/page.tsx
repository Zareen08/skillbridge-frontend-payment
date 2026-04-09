'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, AcademicCapIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';
import TutorCard from '../components/tutors/TutorCard';
import toast from 'react-hot-toast';

export default function Home() {
  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedTutors();
  }, []);

  const fetchFeaturedTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutors/featured?limit=3');
      setFeaturedTutors(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching tutors:', error);
      setError(error.message || 'Failed to load tutors');
      toast.error('Could not load featured tutors. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
          <p className="text-gray-600 mb-4">Please make sure the backend server is running on port 5000</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect with Expert Tutors
              <br />
              Learn Anything, Anytime
            </h1>
            <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
              Find the perfect tutor for your learning journey. Book sessions instantly and start learning today.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/tutors"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Find a Tutor
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
              >
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by subject, tutor name, or topic..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>Programming</option>
              <option>Languages</option>
            </select>
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose SkillBridge?</h2>
            <p className="text-gray-600 mt-4">Learn from the best tutors worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Tutors</h3>
              <p className="text-gray-600">Learn from experienced professionals and subject matter experts.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-gray-600">Get one-on-one attention and customized lesson plans.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Book sessions at times that work best for you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tutors Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Tutors</h2>
            <p className="text-gray-600 mt-4">Meet our top-rated instructors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : featuredTutors.length > 0 ? (
              featuredTutors.map((tutor: any) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No tutors found. Please check back later.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-indigo-100 mb-8">Join thousands of students who are achieving their goals with SkillBridge.</p>
          <Link
            href="/register"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </>
  );
}