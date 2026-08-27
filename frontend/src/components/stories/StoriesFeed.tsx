'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowRight,
  User,
  Calendar,
  Sparkles,
} from 'lucide-react';

import DeleteStoryModal from './DeleteStoryModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AVATAR_PALETTES = [
  { bg: 'bg-[#1a1410]', text: 'text-[#e8a93c]' },
  { bg: 'bg-[#261f15]', text: 'text-[#c4821a]' },
  { bg: 'bg-[#3a5c3e]', text: 'text-[#7aab7e]' },
  { bg: 'bg-[#3d3222]', text: 'text-[#f4efe6]' },
  { bg: 'bg-[#5c4d37]', text: 'text-[#f4efe6]' },
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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const displayed = previewMode ? stories.slice(0, 6) : stories;

  // ── Auto-loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewMode || paused || displayed.length < 2) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayed.length);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [previewMode, paused, displayed.length]);

  const goTo = (i: number) => {
    setActiveIndex(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 6000);
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

  const handleDeleteClick = (e: React.MouseEvent, story: { id: string; title: string }) => {
    e.preventDefault();
    e.stopPropagation();
    setStoryToDelete(story);
  };

  const handleConfirmDelete = async () => {
    if (!storyToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/stories/${storyToDelete.id}`);
      setStories((prev) => prev.filter((s) => s.id !== storyToDelete.id));
      toast.success('Story deleted successfully');
      setStoryToDelete(null);
    } catch {
      toast.error('Failed to delete story');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // ── Skeleton Loader ───────────────────────────────────────────────────────
  if (loading) {
    if (previewMode) {
      return (
        <div className="flex items-center justify-center gap-5 py-6 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex-shrink-0 bg-white rounded-2xl border border-[#1a1410]/10 overflow-hidden animate-pulse transition-all duration-300 ${
                i === 1 ? 'w-[320px] sm:w-[360px] h-[400px] shadow-lg' : 'w-[240px] sm:w-[280px] h-[340px] opacity-40 hidden sm:block'
              }`}
            >
              <div className="h-1.5 w-full bg-[#1a1410]/10" />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1410]/10 flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-[#1a1410]/10 rounded w-28" />
                    <div className="h-2.5 bg-[#1a1410]/5 rounded w-16" />
                  </div>
                </div>
                <div className="h-4 bg-[#1a1410]/10 rounded w-3/4" />
                <div className="space-y-2 pt-2">
                  <div className="h-2.5 bg-[#1a1410]/5 rounded w-full" />
                  <div className="h-2.5 bg-[#1a1410]/5 rounded w-5/6" />
                  <div className="h-2.5 bg-[#1a1410]/5 rounded w-4/6" />
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
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#1a1410]/10 shadow-sm overflow-hidden animate-pulse"
          >
            <div className="h-1.5 w-full bg-[#1a1410]/10" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1a1410]/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-[#1a1410]/10 rounded w-28" />
                  <div className="h-2.5 bg-[#1a1410]/5 rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-[#1a1410]/10 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-2.5 bg-[#1a1410]/5 rounded w-full" />
                <div className="h-2.5 bg-[#1a1410]/5 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Empty State ───────────────────────────────────────────────────────────
  if (displayed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white/60 backdrop-blur-sm rounded-2xl border border-[#1a1410]/10 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-xl bg-[#1a1410]/5 text-[#c4821a] flex items-center justify-center mb-3.5">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-semibold text-[#1a1410]">No Stories Published Yet</h3>
        <p className="text-xs sm:text-sm text-[#5c4d37] mt-1.5 max-w-xs leading-relaxed">
          Be the first from your batch to share experiences, career milestones, or advice.
        </p>
      </div>
    );
  }

  // ── Single Preview Card Renderer ──────────────────────────────────────────
  const renderPreviewCard = (story: Story, index: number, isActive: boolean, isSide: boolean) => {
    const photoUrl = getPhotoUrl(story.author);
    const palette = AVATAR_PALETTES[story.authorId.charCodeAt(0) % AVATAR_PALETTES.length];
    const canDelete = currentUser?.id === story.authorId || currentUser?.role === 'ADMIN';

    return (
      <div
        className={`
          flex-shrink-0 flex flex-col bg-white rounded-2xl border overflow-hidden
          transition-all duration-500 ease-out cursor-pointer select-none
          ${
            isActive
              ? 'shadow-xl border-[#1a1410]/20 z-20 relative scale-100'
              : isSide
              ? 'shadow-sm border-[#1a1410]/10 opacity-50 z-10 scale-95 hover:opacity-80'
              : 'opacity-0 pointer-events-none w-0 overflow-hidden'
          }
          ${isActive ? 'w-[300px] sm:w-[350px] md:w-[380px]' : 'w-[240px] sm:w-[280px] hidden sm:flex'}
        `}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Editorial Top Accent Border */}
        <div
          className={`w-full transition-all duration-300 ${
            isActive ? 'h-2 bg-[#1a1410]' : 'h-1.5 bg-[#1a1410]/20'
          }`}
        />

        {/* Card Body */}
        <Link
          href={`/stories/${story.id}`}
          className="flex flex-col flex-1 p-6 group"
          onClick={(e) => {
            if (!isActive) {
              e.preventDefault();
              goTo(index);
            }
          }}
        >
          {/* Author Row */}
          <div className="flex items-center gap-3.5 mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={story.author.name}
                className={`rounded-xl object-cover flex-shrink-0 ring-1 ring-[#1a1410]/15 transition-all duration-300 ${
                  isActive ? 'w-11 h-11' : 'w-9 h-9'
                }`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-serif font-bold flex-shrink-0 shadow-xs ring-1 ring-[#1a1410]/10 transition-all duration-300 ${
                isActive ? 'w-11 h-11 text-base' : 'w-9 h-9 text-sm'
              }`}
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {story.author.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`font-serif font-semibold text-[#1a1410] truncate transition-all duration-300 ${
                  isActive ? 'text-base' : 'text-sm'
                }`}
              >
                {story.author.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider text-[10px] ${
                    story.author.role === 'ALUMNI'
                      ? 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/20'
                      : 'bg-[#c4821a]/10 text-[#c4821a] border border-[#c4821a]/20'
                  }`}
                >
                  {story.author.role}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h4
            className={`font-serif font-semibold text-[#1a1410] line-clamp-2 mb-2.5 leading-snug group-hover:text-[#c4821a] transition-colors ${
              isActive ? 'text-lg' : 'text-base'
            }`}
          >
            {story.title}
          </h4>

          {/* Content Snippet */}
          <p
            className={`text-[#5c4d37] text-xs sm:text-sm leading-relaxed flex-1 ${
              isActive ? 'line-clamp-4' : 'line-clamp-2'
            }`}
          >
            {story.content}
          </p>

          {/* Bottom Row */}
          <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-[#1a1410]/10">
            <span className="text-[11px] font-mono text-[#7d6a4f] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#c4821a]" />
              {formatDate(story.createdAt)}
            </span>
            {isActive && (
              <span className="text-xs font-semibold text-[#c4821a] group-hover:text-[#e8a93c] flex items-center gap-1 transition-transform group-hover:translate-x-0.5">
                <span>Read Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </Link>

        {/* Delete — only on active card */}
        {isActive && canDelete && (
          <button
            onClick={(e) => handleDeleteClick(e, { id: story.id, title: story.title })}
            className="text-xs font-mono text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2.5 border-t border-rose-100 text-center w-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Story</span>
          </button>
        )}
      </div>
    );
  };

  // ── PREVIEW MODE CAROUSEL ─────────────────────────────────────────────────
  if (previewMode) {
    // If only 1 story exists
    if (displayed.length === 1) {
      return (
        <div className="flex flex-col items-center py-4">
          <div className="flex justify-center">
            {renderPreviewCard(displayed[0], 0, true, false)}
          </div>
          <DeleteStoryModal
            isOpen={!!storyToDelete}
            storyTitle={storyToDelete?.title}
            isDeleting={isDeleting}
            onClose={() => setStoryToDelete(null)}
            onConfirm={handleConfirmDelete}
          />
        </div>
      );
    }

    const prevIndex = (activeIndex - 1 + displayed.length) % displayed.length;
    const nextIndex = (activeIndex + 1) % displayed.length;

    return (
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Track Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 overflow-hidden">
          {/* Left peek card */}
          {displayed.length > 2 && (
            <div onClick={prev}>
              {renderPreviewCard(displayed[prevIndex], prevIndex, false, true)}
            </div>
          )}

          {/* Center active card */}
          <div>
            {renderPreviewCard(displayed[activeIndex], activeIndex, true, false)}
          </div>

          {/* Right peek card */}
          {displayed.length > 1 && (
            <div onClick={next}>
              {renderPreviewCard(displayed[nextIndex], nextIndex, false, true)}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-[#1a1410]/15 rounded-xl shadow-md flex items-center justify-center text-[#1a1410] hover:bg-[#f4efe6] hover:border-[#1a1410]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={next}
          className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white border border-[#1a1410]/15 rounded-xl shadow-md flex items-center justify-center text-[#1a1410] hover:bg-[#f4efe6] hover:border-[#1a1410]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          aria-label="Next story"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-2 mt-5">
          {displayed.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-7 h-2 bg-[#1a1410]'
                  : 'w-2 h-2 bg-[#1a1410]/20 hover:bg-[#1a1410]/40'
              }`}
              aria-label={`Go to story slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Custom Delete Confirmation Modal */}
        <DeleteStoryModal
          isOpen={!!storyToDelete}
          storyTitle={storyToDelete?.title}
          isDeleting={isDeleting}
          onClose={() => setStoryToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  }

  // ── FULL GRID MODE ────────────────────────────────────────────────────────
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((story) => {
          const photoUrl = getPhotoUrl(story.author);
          const palette = AVATAR_PALETTES[story.authorId.charCodeAt(0) % AVATAR_PALETTES.length];
          const canDelete = currentUser?.id === story.authorId || currentUser?.role === 'ADMIN';

          return (
            <div
              key={story.id}
              className="flex flex-col bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm hover:shadow-md hover:border-[#c4821a]/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
            >
              <div className="h-1.5 w-full bg-[#1a1410] group-hover:bg-[#c4821a] transition-colors duration-300" />
              <Link href={`/stories/${story.id}`} className="flex-1 p-6 cursor-pointer flex flex-col justify-between">
                <div>
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={story.author.name}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-1 ring-[#1a1410]/15"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (sib) sib.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-10 h-10 rounded-xl ${palette.bg} ${palette.text} flex items-center justify-center font-serif font-bold text-sm flex-shrink-0 shadow-xs ring-1 ring-[#1a1410]/10`}
                      style={{ display: photoUrl ? 'none' : 'flex' }}
                    >
                      {story.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-serif font-semibold text-[#1a1410] truncate">
                        {story.author.name}
                      </p>
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-mono font-medium mt-0.5 uppercase tracking-wider ${
                          story.author.role === 'ALUMNI'
                            ? 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/20'
                            : 'bg-[#c4821a]/10 text-[#c4821a] border border-[#c4821a]/20'
                        }`}
                      >
                        {story.author.role}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-serif font-semibold text-[#1a1410] line-clamp-2 mb-2 group-hover:text-[#c4821a] transition-colors leading-snug">
                    {story.title}
                  </h4>

                  {/* Snippet */}
                  <p className="text-xs sm:text-sm text-[#5c4d37] line-clamp-3 leading-relaxed">
                    {story.content}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-[#1a1410]/10">
                  <span className="text-[11px] font-mono text-[#7d6a4f]">{formatDate(story.createdAt)}</span>
                  <span className="text-xs font-semibold text-[#c4821a] group-hover:text-[#e8a93c] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>

              {canDelete && (
                <button
                  onClick={(e) => handleDeleteClick(e, { id: story.id, title: story.title })}
                  className="text-xs font-mono text-rose-600 hover:text-rose-700 hover:bg-rose-50 py-2.5 border-t border-rose-100 text-center w-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Story</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteStoryModal
        isOpen={!!storyToDelete}
        storyTitle={storyToDelete?.title}
        isDeleting={isDeleting}
        onClose={() => setStoryToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}