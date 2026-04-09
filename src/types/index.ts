export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  profile?: StudentProfile | TutorProfile;
}

export interface StudentProfile {
  phone?: string;
  education?: string;
  interests: string[];
}

export interface TutorProfile {
  title: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  experience: number;
  education: string;
  rating: number;
  totalReviews: number;
  availability?: any;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  date: string;
  duration: number;
  totalAmount: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  student?: User;
  tutor?: User;
  review?: Review;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  studentId: string;
  tutorId: string;
  bookingId: string;
  createdAt: string;
  student?: User;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  tutorCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
}