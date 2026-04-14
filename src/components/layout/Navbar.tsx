'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'TUTOR': return '/tutor/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/auth/login';
    }
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/auth/login');  
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Find Tutors', href: '/tutors' },
  ];

  if (!mounted) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <span className="text-2xl font-bold text-indigo-600">SkillBridge</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">SkillBridge</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 z-50 border">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        router.push(getDashboardLink());
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={handleLogout}  // FIX: Use handleLogout instead of direct logout
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}