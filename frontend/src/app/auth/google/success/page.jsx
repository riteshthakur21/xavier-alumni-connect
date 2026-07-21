'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
        <p className="text-sm font-semibold text-slate-700">Signing you in...</p>
      </div>
    </div>
  );
}

function GoogleAuthSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateUser } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    const encodedUser = searchParams.get('user');

    try {
      if (!token || !encodedUser) {
        window.location.href = '/login?error=google_failed';
        return;
      }

      const decodedUser = JSON.parse(atob(decodeURIComponent(encodedUser)));

      // Store exactly like normal login in AuthContext
      Cookies.set('token', token, { expires: 7, path: '/' });
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update context — isVerified: true kyunki Google verified email hai
      updateUser({ ...decodedUser, isVerified: true });

      // router.replace = NO full reload, React state/context preserved
      // window.location.href mat use karo — wo AuthContext reset karta hai
      router.replace('/dashboard');

    } catch (error) {
      console.error('Google auth error:', error);
      window.location.href = '/login?error=google_failed';
    }
  }, []);

  return <Loader />;
}

// Suspense required for useSearchParams in Next.js 14
export default function GoogleAuthSuccess() {
  return (
    <Suspense fallback={<Loader />}>
      <GoogleAuthSuccessInner />
    </Suspense>
  );
}