'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

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
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export default function TutorsPage() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchTutors();
    fetchSubjects();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      let url = '/tutors?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
      if (selectedSubject) url += `subject=${encodeURIComponent(selectedSubject)}&`;
      if (minRating) url += `minRating=${minRating}&`;
      if (maxPrice) url += `maxPrice=${maxPrice}&`;
      
      const response = await api.get(url);
      setTutors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/categories');
      const categories = response.data.data || [];
      const subjectList = categories.map((cat: any) => cat.name);
      setSubjects(subjectList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects(['Mathematics', 'Science', 'Programming', 'Languages', 'Music', 'Art']);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTutors();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setMinRating('');
    setMaxPrice('');
    fetchTutors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Tutor</h1>
        <p className="text-gray-600 mt-2">Connect with expert tutors for personalized learning</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tutor name, subject, or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FunnelIcon className="h-5 w-5" />
            Filters
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5 & Up</option>
                <option value="4.0">4.0 & Up</option>
                <option value="3.5">3.5 & Up</option>
                <option value="3.0">3.0 & Up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price / Hour</label>
              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any Price</option>
                <option value="30">$30 or less</option>
                <option value="50">$50 or less</option>
                <option value="80">$80 or less</option>
                <option value="100">$100 or less</option>
              </select>
            </div>
          </div>
        )}

        {(searchTerm || selectedSubject || minRating || maxPrice) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                Search: {searchTerm}
              </span>
            )}
            {selectedSubject && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                Subject: {selectedSubject}
              </span>
            )}
            {minRating && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                Rating: {minRating}+
              </span>
            )}
            {maxPrice && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                Max: ${maxPrice}
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Found <span className="font-semibold">{tutors.length}</span> tutors
        </p>
      </div>

      {/* Tutors Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : tutors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No tutors found matching your criteria</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <Link key={tutor.id} href={`/tutors/${tutor.id}`}>
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {tutor.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{tutor.user.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{tutor.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({tutor.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tutor.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subjects.slice(0, 3).map((subject, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{tutor.subjects.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {tutor.experience}+ years exp
                    </div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${tutor.hourlyRate}/hr
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}