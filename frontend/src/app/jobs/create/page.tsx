'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import {
  Briefcase,
  Building2,
  MapPin,
  Link as LinkIcon,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Lock,
  ChevronDown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CreateJob() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    applyLink: '',
  });

  // ── Route Protection Guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please sign in to post a job opportunity');
        router.push('/login?redirect=/jobs/create');
      } else if (user.role === 'STUDENT') {
        toast.error('Posting opportunities is restricted to Alumni and Administrators');
        router.push('/jobs');
      }
    }
  }, [user, authLoading, router]);

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1410]/10 border-t-[#c4821a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#7d6a4f]">Verifying account permissions...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated User Gate
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
        <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
            Authentication Required
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight mb-2">
            Sign In to Post Opportunities
          </h2>
          <p className="text-[#5c4d37] text-xs sm:text-sm mb-8 leading-relaxed">
            You must be logged in as an approved alumnus or administrator to publish job openings and internships.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?redirect=/jobs/create"
              className="flex-1 py-3 px-4 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold rounded-xl text-sm transition-all border border-[#3d3222]/50 shadow-sm text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 px-4 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-sm transition-colors border border-[#1a1410]/15 text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Student Role Restriction Gate
  if (user.role === 'STUDENT') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
        <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
            Access Restricted
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight mb-2">
            Alumni Privilege Only
          </h2>
          <p className="text-[#5c4d37] text-xs sm:text-sm mb-8 leading-relaxed">
            Posting new career and referral opportunities is exclusive to Alumni and Administrators. Students can browse and apply for all active listings.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] font-semibold rounded-xl text-sm transition-all border border-[#3d3222]/50 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Job Listings</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/jobs`,
        formData,
        token
          ? {
              headers: { Authorization: `Bearer ${token}` },
            }
          : undefined
      );
      moduleCache.invalidate('career-referrals');
      toast.success('Job opportunity published successfully');
      router.push('/jobs');
    } catch (error: any) {
      console.error('Error posting job:', error);
      const msg = error.response?.data?.error || 'Failed to publish job. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Authorized Form Render ────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f4efe6] text-[#1a1410] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-2xl mx-auto">
        {/* Back Navigation */}
        <div className="flex items-center justify-start mb-5">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5c4d37] hover:text-[#1a1410] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#7d6a4f]" />
            <span>Back to opportunities</span>
          </Link>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-[#1a1410]/12 p-7 sm:p-9 shadow-sm">
          {/* Header */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mb-4 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
              Alumni Network Dispatch
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
              Post an Opportunity
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
              Share a career opening, internship, or referral opportunity with the Xavier community.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Job Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Software Engineer"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Company / Organization *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    placeholder="e.g. Tata Consultancy Services"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Location & Employment Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label
                  htmlFor="location"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    placeholder="e.g. Patna / Bangalore / Remote"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Employment Type *
                </label>
                <div className="relative">
                  <select
                    id="type"
                    name="type"
                    required
                    className="block w-full px-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none pr-8"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6a4f] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                Role Overview &amp; Requirements *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                placeholder="Describe the responsibilities, qualifications, batch eligibility, or referral instructions..."
                className="block w-full px-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 resize-none leading-relaxed"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Apply Link */}
            <div>
              <label
                htmlFor="applyLink"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                Application or Referral Link (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  id="applyLink"
                  name="applyLink"
                  placeholder="https://careers.company.com/job/..."
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                  value={formData.applyLink}
                  onChange={handleChange}
                />
              </div>
              <p className="text-[11px] text-[#7d6a4f] mt-1 font-mono">
                Applicants will be redirected to this URL upon clicking &quot;Apply Now&quot;.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#f4efe6]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Publishing opportunity...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Opportunity</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}