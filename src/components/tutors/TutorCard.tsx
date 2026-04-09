'use client';

import Link from 'next/link';
import { StarIcon, CurrencyDollarIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

interface TutorCardProps {
  tutor: {
    id: string;
    title: string;
    bio: string;
    hourlyRate: number;
    rating: number;
    totalReviews: number;
    subjects: string[];
    user: {
      name: string;
      avatar: string | null;
    };
  };
}

export default function TutorCard({ tutor }: TutorCardProps) {
  return (
    <Link href={`/tutors/${tutor.id}`}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
              {tutor.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{tutor.user.name}</h3>
              <p className="text-sm text-gray-600">{tutor.title}</p>
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
            <div className="flex items-center gap-1">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold text-gray-900">{tutor.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({tutor.totalReviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-900">{tutor.hourlyRate}</span>
              <span className="text-sm text-gray-500">/hr</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}