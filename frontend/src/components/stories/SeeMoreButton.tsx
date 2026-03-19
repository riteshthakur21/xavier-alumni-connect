'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SeeMoreButton() {
  const { user } = useAuth();
  const href = user ? '/stories' : '/login';

  return (
    <div className="text-center mt-10">
      <Link
        href={href}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
      >
        See All Stories
        <span>→</span>
      </Link>
    </div>
  );
}
