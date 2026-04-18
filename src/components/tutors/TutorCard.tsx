'use client';

import Link from 'next/link';
import { StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

interface TutorCardProps {
  tutor: {
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
  };
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const subjects = tutor.subjects ?? [];
  const rating = tutor.rating ?? 0;

  // Guard: don't render broken cards
  if (!tutor.user?.name) return null;

  return (
    <Link href={`/tutors/${tutor.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
        <div className="p-6">
          {/* Tutor Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {tutor.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {tutor.user.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {tutor.title || 'Tutor'}
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {tutor.bio || 'No bio available.'}
          </p>

          {/* Subjects */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
            {subjects.slice(0, 3).map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs rounded-full"
              >
                {subject}
              </span>
            ))}
            {subjects.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{subjects.length - 3} more
              </span>
            )}
            {subjects.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">No subjects listed</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {rating.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({tutor.totalReviews ?? 0})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {tutor.hourlyRate ?? 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/hr</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}