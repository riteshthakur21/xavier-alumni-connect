'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Trash2,
  Plus,
  Lock,
  Building2,
  Clock,
  Search,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const jobTypeBadgeStyles: Record<string, string> = {
  'FULL-TIME': 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]',
  'PART-TIME': 'bg-[#fdf8ed] text-[#c4821a] border border-[#c4821a]/30',
  'INTERNSHIP': 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30',
  'CONTRACT': 'bg-[#f4efe6] text-[#5c4d37] border border-[#1a1410]/15',
  'REMOTE': 'bg-[#1a1410]/5 text-[#1a1410] border border-[#1a1410]/15',
};

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const cachedJobs = moduleCache.get<any[]>('career-referrals');
  const [jobs, setJobs] = useState<any[]>(() => cachedJobs || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // If data is already in cache, do not make another API request on revisit
        const cached = moduleCache.get<any[]>('career-referrals');
        if (cached) {
          setJobs(cached);
          setLoading(false);
          return;
        }

        const fetchJobs = async () => {
          try {
            const res = await axios.get(`${API_URL}/api/jobs`);
            const loadedJobs = res.data.jobs || [];
            setJobs(loadedJobs);
            moduleCache.set('career-referrals', loadedJobs);
          } catch (error) {
            console.error('Error fetching jobs:', error);
            toast.error('Failed to load job listings');
          } finally {
            setLoading(false);
          }
        };
        fetchJobs();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  // Loading indicator for Auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1410]/10 border-t-[#c4821a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#7d6a4f]">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // ── Not logged in State ───────────────────────────────────────────────────
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
            Sign In to View Opportunities
          </h2>
          <p className="text-[#5c4d37] text-xs sm:text-sm mb-8 leading-relaxed">
            Access to exclusive career postings, internships, and direct alumni referrals is reserved for registered members of Xavier AlumniConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
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

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job listing?')) return;
    setDeletingId(jobId);
    try {
      await axios.delete(`${API_URL}/api/jobs/${jobId}`);
      setJobs((prev) => {
        const next = prev.filter((job) => job.id !== jobId);
        moduleCache.set('career-referrals', next);
        return next;
      });
      toast.success('Job listing removed');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job listing');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter Logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType ? job.type?.toUpperCase() === selectedType.toUpperCase() : true;

    return matchesSearch && matchesType;
  });

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];
  const hasActiveFilters = Boolean(searchTerm || selectedType);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="h-4 w-36 bg-[#1a1410]/10 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-10 w-72 sm:w-96 bg-[#1a1410]/15 rounded-xl mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-60 sm:w-80 bg-[#1a1410]/10 rounded-full mx-auto animate-pulse" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="bg-white rounded-2xl border border-[#1a1410]/10 p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="h-12 bg-[#f4efe6] rounded-xl flex-1 animate-pulse" />
            <div className="h-12 bg-[#f4efe6] rounded-xl w-full md:w-48 animate-pulse" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#1a1410]/10 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-6 w-3/4 bg-[#1a1410]/15 rounded-lg animate-pulse" />
                  <div className="h-4 w-1/2 bg-[#1a1410]/10 rounded animate-pulse" />
                  <div className="h-20 bg-[#fcfbf9] rounded-xl border border-[#1a1410]/8 animate-pulse" />
                </div>
                <div className="mt-5 pt-4 border-t border-[#1a1410]/8 flex gap-2">
                  <div className="h-10 bg-[#1a1410]/15 rounded-xl flex-1 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-7xl mx-auto">
        {/* ─── EDITORIAL HEADER ────────────────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 text-[#3a5c3e] font-mono text-[11px] uppercase tracking-wider mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#3a5c3e] animate-pulse" />
            <span>Career Opportunities &middot; Xavier AlumniConnect</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#1a1410] tracking-tight">
            Jobs &amp; Internships
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#5c4d37] font-normal mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Discover career openings, internships, and direct referral opportunities posted by Xavier alumni and network partners.
          </p>
        </div>

        {/* ─── STICKY GLASS FILTER BAR ─────────────────────────────────────── */}
        <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#1a1410]/12 shadow-sm mb-6 sm:mb-8 sticky top-4 z-30 transition-all">
          <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f] group-focus-within:text-[#c4821a] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by title, company, location, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#fcfbf9] border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Type Dropdown */}
              <div className="relative flex-1 md:w-48">
                <select
                  className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 bg-[#fcfbf9] border border-[#1a1410]/15 text-xs sm:text-sm text-[#1a1410] font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Employment Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6a4f] pointer-events-none" />
              </div>

              {/* Reset Filter Button */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('');
                  }}
                  title="Reset filters"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-3 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] hover:bg-[#c4821a] hover:text-[#f4efe6] rounded-xl text-xs font-semibold shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Post Job CTA inside filter bar for easy access */}
              {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-xl bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold text-xs sm:text-sm shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#e8a93c]" />
                  <span className="hidden sm:inline">Post Opportunity</span>
                  <span className="sm:hidden">Post</span>
                </Link>
              )}
            </div>
          </div>

          {/* Results Counter */}
          <div className="mt-3 pt-2.5 border-t border-[#1a1410]/8 flex items-center justify-between text-xs text-[#7d6a4f]">
            <div className="font-mono">
              Showing <span className="font-bold text-[#1a1410]">{filteredJobs.length}</span> of{' '}
              <span className="font-bold text-[#1a1410]">{jobs.length}</span> opportunities
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#c4821a]">
                <Sparkles className="w-3 h-3" />
                <span>Filters active</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── JOBS GRID ───────────────────────────────────────────────────── */}
        {filteredJobs.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-[#1a1410]/15 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-normal text-[#1a1410] mb-1">
              No matching opportunities found
            </h3>
            <p className="text-xs sm:text-sm text-[#5c4d37] max-w-md mx-auto mb-4 leading-relaxed">
              {hasActiveFilters
                ? 'No job listings match your filter parameters. Try clearing your search keyword or employment type.'
                : 'There are currently no active job postings available from the alumni community.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl hover:bg-[#3d3222] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear all filters</span>
              </button>
            ) : (
              (user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
                <Link
                  href="/jobs/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl hover:bg-[#3d3222] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-[#e8a93c]" />
                  <span>Post the First Opportunity</span>
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredJobs.map((job) => {
              const typeKey = (job.type || '').toUpperCase();
              const badgeStyle =
                jobTypeBadgeStyles[typeKey] ||
                'bg-[#f4efe6] text-[#5c4d37] border border-[#1a1410]/15';

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-[#1a1410]/12 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1a1410]/25 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Job Details */}
                  <div>
                    {/* Title & Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-serif text-[#1a1410] font-normal tracking-tight line-clamp-1 group-hover:text-[#c4821a] transition-colors">
                        {job.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wider font-semibold shadow-xs shrink-0 ${badgeStyle}`}
                      >
                        {job.type || 'Full-time'}
                      </span>
                    </div>

                    {/* Company & Location Metadata */}
                    <div className="space-y-1.5 text-xs text-[#5c4d37] mb-3.5">
                      <div className="flex items-center gap-2 font-medium text-[#1a1410] truncate">
                        <Building2 className="w-4 h-4 text-[#7d6a4f] shrink-0" />
                        <span className="truncate">{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#5c4d37] truncate">
                        <MapPin className="w-4 h-4 text-[#7d6a4f] shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    </div>

                    {/* Description Box */}
                    <div className="bg-[#fcfbf9] p-3.5 rounded-xl border border-[#1a1410]/8 mb-3.5">
                      <p className="text-xs text-[#5c4d37] leading-relaxed line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {/* Posted by Attribution */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7d6a4f] mb-2 flex-wrap">
                      <Clock className="w-3.5 h-3.5 text-[#7d6a4f] shrink-0" />
                      <span>Posted by</span>
                      {job.postedBy?.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#1a1410]">
                          <span>{job.postedBy.name}</span>
                          <span className="px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-wider bg-[#261f15] text-[#e8a93c] border border-[#3d3222]">
                            Admin
                          </span>
                        </span>
                      ) : job.postedBy?.id ? (
                        <Link
                          href={`/profile/${job.postedBy.id}`}
                          className="font-medium text-[#1a1410] hover:text-[#c4821a] transition-colors underline underline-offset-2"
                        >
                          {job.postedBy.name}
                        </Link>
                      ) : (
                        <span className="font-medium text-[#1a1410]">
                          {job.postedBy?.name || 'Alumni Member'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-3.5 border-t border-[#1a1410]/8 flex items-center gap-2">
                    {job.applyLink ? (
                      <a
                        href={
                          job.applyLink.startsWith('http')
                            ? job.applyLink
                            : `https://${job.applyLink}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl border border-[#3d3222]/50 shadow-xs hover:shadow transition-all inline-flex items-center justify-center gap-1.5"
                      >
                        <span>Apply Now</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#e8a93c]" />
                      </a>
                    ) : (
                      <span className="flex-1 text-center py-2.5 text-[#7d6a4f] text-xs italic bg-[#fcfbf9] rounded-xl border border-[#1a1410]/8">
                        No direct link
                      </span>
                    )}

                    {/* Delete Action */}
                    {(user?.role === 'ADMIN' || user?.id === job.postedById) && (
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        title="Delete listing"
                        className="w-10 h-10 rounded-xl bg-white text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-[#1a1410]/15 hover:border-rose-200 transition-all shadow-xs flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}