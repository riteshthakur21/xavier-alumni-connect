'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StoryDetail {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    alumniProfile?: {
      photoUrl?: string;
      department?: string;
      batchYear?: number;
    } | null;
  };
}

export default function StoryDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/stories/${id}`);
        setStory(res.data.story);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStory();
  }, [id]);

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}/${url.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await axios.delete(`${API_URL}/api/stories/${id}`);
      toast.success('Story deleted');
      router.push('/stories');
    } catch {
      toast.error('Failed to delete story');
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please login to view profiles');
      router.push('/login');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
                      bg-slate-50 text-center px-4">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Story not found</h2>
        <p className="text-slate-500 mb-6">
          This story may have been removed or is still pending review.
        </p>
        <Link href="/stories" className="text-blue-600 hover:underline font-medium">
          ← Back to Stories
        </Link>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(story.author.alumniProfile?.photoUrl);
  const canDelete = user?.id === story.authorId || user?.role === 'ADMIN';
  const initials  = story.author.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link href="/stories"
              className="inline-flex items-center gap-1.5 text-sm font-medium
                         text-slate-500 hover:text-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Stories
        </Link>
      </div>

      {/* ══ AUTHOR CARD — left square image + right info ══════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100
                        overflow-hidden flex flex-col sm:flex-row">

          {/* LEFT — Square image */}
          <Link
            href={`/profile/${story.author.id}`}
            onClick={handleAuthorClick}
            className="group relative flex-shrink-0
                       w-full sm:w-56 md:w-64 lg:w-72
                       h-64 sm:h-auto"
            style={{ minHeight: '220px' }}
          >
            {/* Photo */}
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={story.author.name}
                className="absolute inset-0 w-full h-full object-cover
                           group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback gradient initial */}
            <div
              className="absolute inset-0 w-full h-full
                         bg-gradient-to-br from-blue-500 to-indigo-600
                         flex items-center justify-center
                         text-white font-black text-8xl select-none"
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20
                            transition-all duration-300 flex items-end p-4">
              <span className="opacity-0 group-hover:opacity-100 translate-y-2
                               group-hover:translate-y-0 transition-all duration-300
                               bg-white/90 backdrop-blur-sm text-slate-800 text-xs
                               font-semibold px-3 py-1.5 rounded-full shadow">
                {user ? 'View Profile →' : 'Login to view profile'}
              </span>
            </div>
          </Link>

          {/* RIGHT — Author info */}
          <div className="flex flex-col justify-between p-6 sm:p-8 flex-1">
            <div>
              {/* Name */}
              <Link
                href={`/profile/${story.author.id}`}
                onClick={handleAuthorClick}
                className="group inline-block mb-3"
              >
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900
                               group-hover:text-blue-600 transition-colors
                               leading-tight capitalize">
                  {story.author.name}
                </h2>
              </Link>

              {/* Badge pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-xs px-3 py-1 rounded-full font-bold
                  ${story.author.role === 'ALUMNI'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-emerald-100 text-emerald-700'}`}>
                  {story.author.role}
                </span>
                {story.author.alumniProfile?.department && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold
                                   bg-slate-100 text-slate-600">
                    {story.author.alumniProfile.department}
                  </span>
                )}
                {story.author.alumniProfile?.batchYear && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold
                                   bg-indigo-50 text-indigo-600">
                    Batch {story.author.alumniProfile.batchYear}
                  </span>
                )}
              </div>

              {/* Blue accent line */}
              <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500
                              rounded-full mb-5" />

              {/* Published date */}
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Published {formatDate(story.createdAt)}
              </div>
            </div>

            {/* CTA or guest nudge */}
            <div className="mt-6">
              {user ? (
                <Link
                  href={`/profile/${story.author.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5
                             bg-slate-900 text-white text-sm font-semibold
                             rounded-xl hover:bg-blue-600 active:scale-95
                             transition-all duration-200 shadow-sm"
                >
                  View Full Profile
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </Link>
              ) : (
                <p className="text-sm text-slate-400">
                  <Link href="/login"
                        className="text-blue-500 hover:underline font-semibold">
                    Login
                  </Link>
                  {' '}to view full profile
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STORY CONTENT ════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 leading-tight">
            {story.title}
          </h1>
          <hr className="border-blue-100 mb-8" />
          <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap">
            {story.content}
          </p>

          {canDelete && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 border border-red-200
                           text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl
                           text-sm font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
                Delete My Story
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}