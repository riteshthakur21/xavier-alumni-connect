'use client';

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import { PenTool, ArrowRight, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface StoryFormProps {
  onSuccess?: () => void;
}

export default function StoryForm({ onSuccess }: StoryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and story content are required');
      return;
    }
    if (title.length > 100) {
      toast.error('Title must be 100 characters or less');
      return;
    }
    if (content.length > 2000) {
      toast.error('Content must be 2000 characters or less');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/stories`, { title: title.trim(), content: content.trim() });
      moduleCache.invalidate('alumni-stories');
      toast.success('Story submitted for review! It will appear once approved by admin.');
      setTitle('');
      setContent('');
      onSuccess?.();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to submit story';
      toast.error(msg || 'Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[#1a1410]/10">
        <div className="w-9 h-9 rounded-xl bg-[#1a1410]/5 text-[#c4821a] flex items-center justify-center">
          <PenTool className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#1a1410]">
            Share Your Alumni Journey
          </h3>
          <p className="text-xs text-[#5c4d37] font-mono mt-0.5">
            Published stories inspire students and fellow alumni across batches.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider">
              Story Headline / Title
            </label>
            <span className={`text-[11px] font-mono ${title.length > 100 ? 'text-rose-600 font-bold' : 'text-[#7d6a4f]'}`}>
              {title.length}/100
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. From Campus Hackathons to Senior Engineering Lead"
            maxLength={100}
            required
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] placeholder-[#7d6a4f]/60 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] transition-all"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider">
              Your Narrative &amp; Advice
            </label>
            <span className={`text-[11px] font-mono ${content.length > 2000 ? 'text-rose-600 font-bold' : 'text-[#7d6a4f]'}`}>
              {content.length}/2000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share key turning points in your career, lessons learned, and words of wisdom for current students..."
            maxLength={2000}
            rows={6}
            required
            className="w-full px-4 py-3 rounded-xl bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] placeholder-[#7d6a4f]/60 shadow-2xs resize-none focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] transition-all leading-relaxed"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#7d6a4f] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3a5c3e]" />
            <span>Reviewed by community moderation before publishing</span>
          </div>

          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="w-full sm:w-auto px-7 py-3 bg-[#1a1410] text-[#f4efe6] text-sm font-semibold rounded-xl hover:bg-[#3d3222] active:bg-[#1a1410] border border-[#3d3222]/50 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting for Review...</span>
              </span>
            ) : (
              <>
                <span>Submit Story</span>
                <ArrowRight className="w-4 h-4 text-[#e8a93c]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
