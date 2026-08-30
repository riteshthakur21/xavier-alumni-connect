'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

function Loader() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410] px-4 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-sm w-full bg-white rounded-2xl border border-[#1a1410]/12 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShieldCheck className="w-6 h-6 animate-pulse" />
        </div>
        <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
          Google Authentication
        </div>
        <h1 className="text-xl font-normal font-serif text-[#1a1410] tracking-tight">
          Signing you in...
        </h1>
        <p className="mt-1.5 text-xs text-[#5c4d37] leading-relaxed">
          Verifying your credentials and establishing a secure connection to your dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#c4821a] animate-ping" />
          <span className="text-xs font-mono text-[#7d6a4f]">Please wait a moment</span>
        </div>
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

      // Update context — isVerified: true for Google verified email
      updateUser({ ...decodedUser, isVerified: true });

      // router.replace = clean client-side transition
      router.replace('/dashboard');
    } catch (error) {
      console.error('Google auth error:', error);
      window.location.href = '/login?error=google_failed';
    }
  }, [searchParams, router, updateUser]);

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