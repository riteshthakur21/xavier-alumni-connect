'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5000';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// 🌟 THE MAGIC INTERCEPTOR 🌟
axios.interceptors.request.use((config) => {
  const liveApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (liveApiUrl) {
    // Agar link direct url mein hai (e.g. axios.post('http://localhost...'))
    if (config.url?.includes('http://localhost:5000')) {
      config.url = config.url.replace('http://localhost:5000', liveApiUrl);
    }
    // Agar link baseURL mein hai (jo tune Line 4 pe set kiya hai)
    if (config.baseURL === 'http://localhost:5000') {
      config.baseURL = liveApiUrl;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ALUMNI' | 'STUDENT';
  isVerified: boolean;
  alumniProfile?: AlumniProfile;
}

interface AlumniProfile {
  id: string;
  batchYear: number;
  department: string;
  rollNo?: string;
  company?: string;
  jobTitle?: string;
  linkedinUrl?: string;
  photoUrl?: string;
  bio?: string;
  location?: string;
  skills: string[];
  contactPublic: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login successful!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });

      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const { token, user } = response.data;
      
      Cookies.set('token', token, { expires: 7 });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Registration successful! Please wait for admin verification.');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};