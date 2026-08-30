'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import StoriesFeed from '@/components/stories/StoriesFeed';
import StoryForm from '@/components/stories/StoryForm';
import { ArrowLeft, Plus } from 'lucide-react';

export default function StoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (showForm && formContainerRef.current) {
      const timer = setTimeout(() => {
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [showForm]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4efe6]">
        <div className="w-10 h-10 border-3 border-[#c4821a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* Header Container */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Left: Title & Navigation */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Home</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Alumni Stories &amp; Reflections
              </h1>
            </div>
            <p className="text-sm text-[#5c4d37] mt-1.5 max-w-xl">
              Authentic journeys, career transitions, and hard-earned advice shared directly by Xaverian graduates.
            </p>
          </div>

          {/* Right: Toggle Button with smooth icon rotation */}
          {user && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className={`group relative inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer shadow-sm ${
                  showForm
                    ? 'bg-[#f4efe6] border border-[#1a1410]/20 text-[#1a1410] hover:bg-[#e8dfd0]'
                    : 'bg-[#1a1410] text-[#f4efe6] hover:bg-[#3d3222] border border-[#3d3222]/50 hover:shadow hover:-translate-y-0.5 active:translate-y-0'
                }`}
                aria-expanded={showForm}
                aria-label={showForm ? 'Close story submission form' : 'Open story submission form'}
              >
                <span
                  className={`flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    showForm ? 'rotate-45 text-[#7d6a4f]' : 'rotate-0 text-[#e8a93c]'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </span>
                <span>{showForm ? 'Close Form' : 'Share Your Story'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Form Container with Smooth Height & Opacity Transition */}
        {user && (
          <div
            ref={formContainerRef}
            className={`max-w-7xl mx-auto grid transition-[grid-template-rows,opacity,margin,padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              showForm
                ? 'grid-rows-[1fr] opacity-100 mt-8 pt-8 border-t border-[#1a1410]/10'
                : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0 pointer-events-none'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  showForm ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-[0.98]'
                }`}
              >
                <StoryForm
                  onSuccess={() => {
                    setShowForm(false);
                    setRefreshKey((k) => k + 1);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <StoriesFeed previewMode={false} currentUser={user} refreshKey={refreshKey} />
      </div>
    </div>
  );
}

