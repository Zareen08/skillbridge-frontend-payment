'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, AcademicCapIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';
import TutorCard from '../components/tutors/TutorCard';
import HeroSlider from '../components/home/HeroSlider';
import toast from 'react-hot-toast';

interface FeaturedTutor {
  id: string;
  title: string;
  bio: string;
  hourlyRate: number;
  rating: number | null;
  totalReviews: number;
  subjects: string[] | null;
  user: {
    name: string;
    avatar: string | null;
  };
}

export default function Home() {
  const router = useRouter();
  const [featuredTutors, setFeaturedTutors] = useState<FeaturedTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    fetchFeaturedTutors();
  }, []);

  const fetchFeaturedTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tutors/featured?limit=3');
      setFeaturedTutors(response.data.data ?? []);
    } catch (err: any) {
      console.error('Error fetching tutors:', err);
      setError('Failed to load featured tutors');
      toast.error('Could not load featured tutors. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (subject) params.set('subject', subject);
    router.push(`/tutors?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Slider Component */}
      <HeroSlider />

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by subject, tutor name, or topic..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Programming">Programming</option>
              <option value="Languages">Languages</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why Choose SkillBridge?</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Learn from the best tutors worldwide</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: AcademicCapIcon, title: 'Expert Tutors', desc: 'Learn from experienced professionals and subject matter experts.' },
              { icon: UserGroupIcon, title: 'Personalized Learning', desc: 'Get one-on-one attention and customized lesson plans.' },
              { icon: ClockIcon, title: 'Flexible Scheduling', desc: 'Book sessions at times that work best for you.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 hover:shadow-lg transition-shadow duration-300 rounded-lg bg-white dark:bg-gray-800">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Tutors Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Tutors</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Meet our top-rated instructors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              </div>
            ) : error ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={fetchFeaturedTutors}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            ) : featuredTutors.length > 0 ? (
              featuredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                No tutors found. Please check back later.
              </div>
            )}
          </div>
          <div className="text-center mt-8">
            <Link href="/tutors" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition inline-block">
              View All Tutors
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-indigo-100 mb-8">Join thousands of students achieving their goals with SkillBridge.</p>
          <Link href="/auth/register" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block transform hover:scale-105 duration-200">
            Get Started Today
          </Link>
        </div>
      </div>
    </>
  );
}