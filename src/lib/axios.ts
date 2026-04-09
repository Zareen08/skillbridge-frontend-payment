import axios from 'axios';
import toast from 'react-hot-toast';

// Dynamically set API URL based on environment
const getBaseURL = () => {
  // Production (Vercel)
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://skillbridge-backend-kappa.vercel.app/api';
  }
  // Development (local)
  return 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check if backend is running.');
    }
    return Promise.reject(error);
  }
);

export default api;