'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Trash2,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  User,
  GraduationCap,
} from 'lucide-react';

import DeleteStoryModal from '@/components/stories/DeleteStoryModal';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/stories/${id}`);
      toast.success('Story deleted successfully');
      setShowDeleteModal(false);
      router.push('/stories');
    } catch {
      toast.error('Failed to delete story');
      setIsDeleting(false);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please log in to view alumni profiles');
      router.push('/login');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4efe6]">
        <div className="w-10 h-10 border-3 border-[#c4821a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4efe6] text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#1a1410]/12 flex items-center justify-center mb-4 text-[#c4821a] shadow-sm">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif font-semibold text-[#1a1410] mb-2">Story Not Found</h2>
        <p className="text-sm text-[#5c4d37] mb-6 max-w-sm">
          This story may have been removed or is pending moderation approval.
        </p>
        <Link
          href="/stories"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a1410] text-[#f4efe6] text-sm font-semibold hover:bg-[#3d3222] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stories</span>
        </Link>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(story.author.alumniProfile?.photoUrl);
  const canDelete = user?.id === story.authorId || user?.role === 'ADMIN';
  const initials = story.author.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">

      {/* Top Breadcrumb Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link
          href="/stories"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Stories</span>
        </Link>
      </div>

      {/* ══ AUTHOR PROFILE SPOTLIGHT CARD ═════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-[#1a1410]/12 overflow-hidden flex flex-col sm:flex-row">

          {/* LEFT — Author Photo / Initials Frame */}
          <Link
            href={`/profile/${story.author.id}`}
            onClick={handleAuthorClick}
            className="group relative flex-shrink-0 w-full sm:w-56 md:w-64 lg:w-72 h-64 sm:h-auto bg-[#1a1410] overflow-hidden"
            style={{ minHeight: '220px' }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={story.author.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const sib = e.currentTarget.nextElementSibling as HTMLElement | null;
                  if (sib) sib.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Fallback Walnut Initials */}
            <div
              className="absolute inset-0 w-full h-full bg-[#1a1410] flex items-center justify-center text-[#e8a93c] font-serif font-bold text-7xl select-none"
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#1a1410]/0 group-hover:bg-[#1a1410]/30 transition-all duration-300 flex items-end p-4">
              <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm text-[#1a1410] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                {user ? 'View Profile →' : 'Log in to view profile'}
              </span>
            </div>
          </Link>

          {/* RIGHT — Author Info & Credentials */}
          <div className="flex flex-col justify-between p-6 sm:p-8 flex-1">
            <div>
              {/* Name */}
              <Link
                href={`/profile/${story.author.id}`}
                onClick={handleAuthorClick}
                className="group inline-block mb-3"
              >
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors leading-tight">
                  {story.author.name}
                </h2>
              </Link>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span
                  className={`text-xs px-3 py-1 rounded-md font-mono font-medium uppercase tracking-wider ${
                    story.author.role === 'ALUMNI'
                      ? 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/20'
                      : 'bg-[#c4821a]/10 text-[#c4821a] border border-[#c4821a]/20'
                  }`}
                >
                  {story.author.role}
                </span>

                {story.author.alumniProfile?.department && (
                  <span className="text-xs px-3 py-1 rounded-md font-mono font-medium bg-[#f4efe6] text-[#5c4d37] border border-[#1a1410]/10">
                    {story.author.alumniProfile.department}
                  </span>
                )}

                {story.author.alumniProfile?.batchYear && (
                  <span className="text-xs px-3 py-1 rounded-md font-mono font-medium bg-[#f4efe6] text-[#c4821a] border border-[#1a1410]/10">
                    Batch of {story.author.alumniProfile.batchYear}
                  </span>
                )}
              </div>

              <div className="w-10 h-0.5 bg-[#c4821a] rounded-full mb-5" />

              {/* Published Date */}
              <div className="flex items-center gap-2 text-[#7d6a4f] text-xs font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#c4821a]" />
                <span>Published on {formatDate(story.createdAt)}</span>
              </div>
            </div>

            {/* Profile CTA */}
            <div className="mt-6 pt-4 border-t border-[#1a1410]/10">
              {user ? (
                <Link
                  href={`/profile/${story.author.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a1410] text-[#f4efe6] text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#3d3222] active:bg-[#1a1410] border border-[#3d3222]/50 shadow-sm transition-all duration-200"
                >
                  <span>View Member Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#e8a93c]" />
                </Link>
              ) : (
                <p className="text-xs text-[#7d6a4f] font-mono">
                  <Link href="/login" className="text-[#c4821a] hover:underline font-semibold">
                    Sign in
                  </Link>{' '}
                  to access full member profile
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ══ STORY NARRATIVE CONTENT ════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm border border-[#1a1410]/12 p-7 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] mb-6 leading-tight">
            {story.title}
          </h1>

          <div className="w-full h-px bg-[#1a1410]/10 mb-8" />

          {/* Narrative Body */}
          <div className="text-[#3d3222] text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-normal">
            {story.content}
          </div>

          {/* Delete Action if authorized */}
          {canDelete && (
            <div className="mt-12 pt-6 border-t border-[#1a1410]/10 flex justify-end">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete This Story</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <DeleteStoryModal
        isOpen={showDeleteModal}
        storyTitle={story.title}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}