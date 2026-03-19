'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import StoriesFeed from '@/components/stories/StoriesFeed';
import StoryForm from '@/components/stories/StoryForm';

export default function StoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Left: title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
                ← Back to Home
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Alumni Stories</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Inspiring journeys from our community
            </p>
          </div>

          {/* Right: toggle button */}
          {user && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className={`inline-flex items-center justify-center gap-2
                          px-3 py-2 sm:px-4 rounded-xl
                          text-sm font-semibold transition-all duration-200
                          ${showForm
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'text-white hover:shadow-lg'
                          }`}
              style={!showForm ? { background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' } : {}}
            >
              {showForm ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                  <span className="hidden sm:inline">Cancel</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                  </svg>
                  <span className="hidden sm:inline">Share Your Story</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Collapsible form */}
        {showForm && user && (
          <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-100">
            <StoryForm onSuccess={() => { setShowForm(false); setRefreshKey((k) => k + 1); }} />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stories Grid */}
        <StoriesFeed previewMode={false} currentUser={user} refreshKey={refreshKey} />
      </div>
    </div>
  );
}
