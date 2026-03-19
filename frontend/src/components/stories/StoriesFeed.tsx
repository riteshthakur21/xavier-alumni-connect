'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ACCENT_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-orange-400 to-rose-500',
  'from-pink-400 to-fuchsia-500',
];

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-400', 'bg-rose-500',
];

interface Author {
  id: string;
  name: string;
  role: string;
  alumniProfile?: { photoUrl?: string } | null;
}

interface Story {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  author: Author;
}

interface StoriesFeedProps {
  previewMode: boolean;
  currentUser: { id: string; role: string } | null;
  refreshKey?: number;
}

export default function StoriesFeed({ previewMode, currentUser, refreshKey }: StoriesFeedProps) {
  const [stories, setStories]         = useState<Story[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused]           = useState(false);
  const intervalRef                   = useRef<NodeJS.Timeout | null>(null);
  const trackRef                      = useRef<HTMLDivElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/stories`);
        setStories(res.data.stories || []);
      } catch {
        toast.error('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [refreshKey]);

  const displayed = previewMode ? stories.slice(0, 5) : stories;

  // ── Auto-loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewMode || paused || displayed.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayed.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [previewMode, paused, displayed.length]);

  const goTo = (i: number) => {
    setActiveIndex(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 6000); // resume after 6s
  };

  const prev = () => goTo((activeIndex - 1 + displayed.length) % displayed.length);
  const next = () => goTo((activeIndex + 1) % displayed.length);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPhotoUrl = (author: Author) => {
    const url = author.alumniProfile?.photoUrl;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}/${url.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  const handleDelete = async (e: React.MouseEvent, storyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await axios.delete(`${API_URL}/api/stories/${storyId}`);
      setStories((prev) => prev.filter((s) => s.id !== storyId));
      toast.success('Story deleted');
    } catch {
      toast.error('Failed to delete story');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    if (previewMode) {
      return (
        <div className="flex items-center justify-center gap-5 py-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i}
                 className={`flex-shrink-0 bg-white rounded-2xl border border-slate-100
                             overflow-hidden animate-pulse transition-all duration-300
                             ${i === 1 ? 'w-[300px] h-[400px] shadow-xl' : 'w-[240px] h-[340px] opacity-50'}`}>
              <div className="h-1.5 w-full bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-24" />
                    <div className="h-2.5 bg-slate-100 rounded w-14" />
                  </div>
                </div>
                <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                <div className="space-y-1.5">
                  <div className="h-2.5 bg-slate-100 rounded w-full" />
                  <div className="h-2.5 bg-slate-100 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm
                                  overflow-hidden animate-pulse">
            <div className="h-2 w-full bg-slate-200" />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-16" />
                </div>
              </div>
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">📖</div>
        <h3 className="text-xl font-bold text-slate-700">No Stories Yet</h3>
        <p className="text-slate-400 mt-2">Be the first to share your journey!</p>
      </div>
    );
  }

  // ── Single card renderer ──────────────────────────────────────────────────
  const renderCard = (story: Story, index: number, isActive: boolean, isSide: boolean) => {
    const photoUrl  = getPhotoUrl(story.author);
    const colorIdx  = story.authorId.charCodeAt(0) % AVATAR_COLORS.length;
    const canDelete = currentUser?.id === story.authorId || currentUser?.role === 'ADMIN';
    const gradient  = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];

    return (
      <div
        className={`
          flex-shrink-0 flex flex-col bg-white rounded-2xl border overflow-hidden
          transition-all duration-500 ease-out
          ${isActive
            ? 'shadow-2xl border-slate-200 z-20 relative'
            : isSide
            ? 'shadow-md border-slate-100 opacity-60 z-10'
            : 'opacity-0 pointer-events-none w-0 overflow-hidden'}
          ${isActive ? 'w-[290px] sm:w-[320px]' : 'w-[220px] sm:w-[260px]'}
        `}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Gradient top bar */}
        <div className={`w-full bg-gradient-to-r ${gradient} transition-all duration-300
                         ${isActive ? 'h-2' : 'h-1.5'}`} />

        {/* Card body */}
        <Link
          href={`/stories/${story.id}`}
          className="flex flex-col flex-1 p-5 group cursor-pointer"
          onClick={(e) => { if (!isActive) { e.preventDefault(); goTo(index); } }}
        >
          {/* Author row */}
          <div className="flex items-center gap-3 mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={story.author.name}
                className={`rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100
                            transition-all duration-300
                            ${isActive ? 'w-11 h-11' : 'w-9 h-9'}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`rounded-full ${AVATAR_COLORS[colorIdx]}
                          flex items-center justify-center text-white font-black
                          flex-shrink-0 transition-all duration-300
                          ${isActive ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'}`}
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {story.author.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-slate-800 truncate transition-all duration-300
                             ${isActive ? 'text-sm' : 'text-xs'}`}>
                {story.author.name}
              </p>
              <span className={`inline-block px-2 py-0.5 rounded-full font-bold mt-0.5
                                transition-all duration-300
                                ${isActive ? 'text-xs' : 'text-[10px]'}
                                ${story.author.role === 'ALUMNI'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'}`}>
                {story.author.role}
              </span>
            </div>
          </div>

          {/* Title */}
          <h4 className={`font-black text-slate-900 line-clamp-2 mb-2 leading-snug
                          transition-all duration-300
                          group-hover:text-blue-600
                          ${isActive ? 'text-base' : 'text-sm'}`}>
            {story.title}
          </h4>

          {/* Content */}
          <p className={`text-slate-500 leading-relaxed flex-1 transition-all duration-300
                         ${isActive ? 'text-sm line-clamp-6' : 'text-xs line-clamp-3'}`}>
            {story.content}
          </p>

          {/* Bottom */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient}`} />
              <span className="text-xs text-slate-400">{formatDate(story.createdAt)}</span>
            </div>
            {isActive && (
              <span className="text-xs text-blue-500 font-semibold
                               group-hover:translate-x-0.5 transition-transform duration-200">
                Read Story →
              </span>
            )}
          </div>
        </Link>

        {/* Delete — only on active card */}
        {isActive && canDelete && (
          <button
            onClick={(e) => handleDelete(e, story.id)}
            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50
                       py-2 border-t border-slate-100 text-center w-full
                       transition-colors flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        )}
      </div>
    );
  };

  // ── PREVIEW MODE — center carousel ───────────────────────────────────────
  if (previewMode) {
    const prevIndex = (activeIndex - 1 + displayed.length) % displayed.length;
    const nextIndex = (activeIndex + 1) % displayed.length;

    return (
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Cards row — center aligned */}
        <div
          ref={trackRef}
          className="flex items-center justify-center gap-4 py-4 overflow-hidden"
        >
          {/* Left card */}
          <div
            className="cursor-pointer"
            onClick={prev}
          >
            {renderCard(displayed[prevIndex], prevIndex, false, true)}
          </div>

          {/* Center (active) card */}
          {renderCard(displayed[activeIndex], activeIndex, true, false)}

          {/* Right card */}
          <div
            className="cursor-pointer"
            onClick={next}
          >
            {renderCard(displayed[nextIndex], nextIndex, false, true)}
          </div>
        </div>

        {/* Left arrow button */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30
                     w-10 h-10 bg-white border border-slate-200 rounded-full shadow-md
                     flex items-center justify-center
                     hover:border-blue-300 hover:shadow-lg transition-all duration-200
                     sm:-translate-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Right arrow button */}
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30
                     w-10 h-10 bg-white border border-slate-200 rounded-full shadow-md
                     flex items-center justify-center
                     hover:border-blue-300 hover:shadow-lg transition-all duration-200
                     sm:translate-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-600"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-2 mt-4">
          {displayed.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300
                ${i === activeIndex
                  ? 'w-7 h-2 bg-blue-600'
                  : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── FULL MODE — grid (UNCHANGED) ──────────────────────────────────────────
  const renderFullCard = (story: Story, index: number) => {
    const photoUrl  = getPhotoUrl(story.author);
    const colorIdx  = story.authorId.charCodeAt(0) % AVATAR_COLORS.length;
    const canDelete = currentUser?.id === story.authorId || currentUser?.role === 'ADMIN';
    const gradient  = ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length];

    return (
      <div key={story.id}
           className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm
                      hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300
                      overflow-hidden group">
        <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}
                         group-hover:h-2 transition-all duration-300`} />
        <Link href={`/stories/${story.id}`} className="flex-1 p-4 cursor-pointer">
          <div className="flex items-center gap-2.5 mb-3">
            {photoUrl ? (
              <img src={photoUrl} alt={story.author.name}
                   className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                   onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                     if (sib) sib.style.display = 'flex';
                   }} />
            ) : null}
            <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[colorIdx]}
                            flex items-center justify-center text-white font-bold
                            text-sm flex-shrink-0`}
                 style={{ display: photoUrl ? 'none' : 'flex' }}>
              {story.author.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {story.author.name}
              </p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold mt-0.5
                ${story.author.role === 'ALUMNI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {story.author.role}
              </span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1.5
                         group-hover:text-blue-600 transition-colors duration-200">
            {story.title}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{story.content}</p>
          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-50">
            <span className="text-xs text-slate-400">{formatDate(story.createdAt)}</span>
            <span className="text-xs text-blue-500 font-medium
                             group-hover:translate-x-0.5 transition-transform duration-200">
              Read Story →
            </span>
          </div>
        </Link>
        {canDelete && (
          <button onClick={(e) => handleDelete(e, story.id)}
                  className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50
                             py-2 border-t border-slate-100 text-center w-full
                             transition-colors flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {displayed.map((story, i) => renderFullCard(story, i))}
    </div>
  );
}