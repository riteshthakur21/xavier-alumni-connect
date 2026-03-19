'use client';

import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface StoryFormProps {
  onSuccess?: () => void;
}

export default function StoryForm({ onSuccess }: StoryFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
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
      await axios.post('http://localhost:5000/api/stories', { title, content });
      toast.success('Story submitted! It will appear after admin approval.');
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Share Your Story
      </h3>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
            <span className={`text-xs font-medium ${title.length > 100 ? 'text-red-500' : 'text-slate-400'}`}>
              {title.length}/100
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your story a compelling title..."
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Content */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Story</label>
            <span className={`text-xs font-medium ${content.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
              {content.length}/2000
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your journey, experience, or advice with the community..."
            maxLength={2000}
            rows={5}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Submitting...
            </span>
          ) : (
            'Submit Story for Review'
          )}
        </button>
      </div>
    </div>
  );
}
