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
        className="inline-flex items-center gap-2 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] px-8 py-3.5 rounded-xl font-semibold text-sm sm:text-base border border-[#3d3222]/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95 group"
      >
        <span>See All Stories</span>
        <span className="text-[#e8a93c] transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
