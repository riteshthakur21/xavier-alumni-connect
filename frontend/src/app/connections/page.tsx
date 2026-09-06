'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  ArrowUpRight,
  Sparkles,
  MapPin,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ConnectedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  alumniProfile?: {
    photoUrl?: string;
    department?: string;
    batchYear?: number;
    company?: string;
    jobTitle?: string;
    location?: string;
  };
};

export default function ConnectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchConnections = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/connections/my`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      });
      setConnections(res.data.data || []);
      setTotal(res.data.pagination?.total ?? 0);
      setTotalPages(res.data.pagination?.pages ?? 1);
    } catch {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user) fetchConnections();
  }, [user, fetchConnections]);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  const filtered = search.trim()
    ? connections.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.alumniProfile?.department?.toLowerCase().includes(q) ?? false) ||
          (c.alumniProfile?.company?.toLowerCase().includes(q) ?? false)
        );
      })
    : connections;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1a1410]/20 border-t-[#c4821a] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-7">

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-[#1a1410]/10">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <button
              onClick={() => router.push('/dashboard')}
              aria-label="Back to dashboard"
              className="w-10 h-10 rounded-xl bg-white border border-[#1a1410]/15 flex items-center justify-center text-[#5c4d37] hover:text-[#1a1410] hover:border-[#1a1410]/30 shadow-xs transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1410]">
                  My Connections
                </h1>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#1a1410]/5 text-[#5c4d37] border border-[#1a1410]/10">
                  {total}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7d6a4f] mt-0.5">
                Active connections in your professional and academic alumni network
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, department, company..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#1a1410]/15 bg-white text-[#1a1410] placeholder-[#7d6a4f]/60 text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#1a1410]/10 p-4 sm:p-5 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full bg-[#1a1410]/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1a1410]/10 rounded w-2/3" />
                    <div className="h-3 bg-[#1a1410]/5 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-[#1a1410]/5">
                  <div className="h-3.5 bg-[#1a1410]/5 rounded w-3/4" />
                  <div className="h-3.5 bg-[#1a1410]/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#261f15] border border-[#3d3222] flex items-center justify-center text-[#e8a93c] mb-4 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-normal text-[#1a1410]">
              {search.trim() ? 'No connections match your search' : 'No connections yet'}
            </h2>
            <p className="text-sm text-[#7d6a4f] max-w-md mt-1.5 leading-relaxed">
              {search.trim()
                ? `No active connections matching "${search}". Check for typos or try searching with a different term.`
                : 'Connect with fellow students, alumni, and faculty across the Xavier collegiate directory.'}
            </p>
            {!search.trim() && (
              <Link
                href="/directory"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] text-sm font-semibold rounded-xl border border-[#3d3222]/50 shadow-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#e8a93c]" />
                Browse Member Directory
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((person) => {
              const photoUrl = getImageUrl(person.alumniProfile?.photoUrl);
              const isAlumni = person.role === 'ALUMNI';
              const isStudent = person.role === 'STUDENT';

              return (
                <Link
                  key={person.id}
                  href={`/alumni/${person.id}`}
                  className="bg-white rounded-2xl border border-[#1a1410]/10 hover:border-[#c4821a]/40 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Top: Avatar & Info */}
                    <div className="flex items-start gap-3 sm:gap-3.5">
                      {/* Avatar with fixed dimensions */}
                      <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-full bg-[#261f15] border-2 border-white text-[#e8a93c] flex items-center justify-center font-serif font-bold text-lg overflow-hidden shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={person.name}
                            className="w-full h-full object-cover block"
                          />
                        ) : (
                          person.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Name & role badge */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-[#1a1410] truncate group-hover:text-[#c4821a] transition-colors">
                          {person.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-mono font-semibold rounded-full uppercase tracking-wider border ${
                              isAlumni
                                ? 'bg-[#3a5c3e]/15 text-[#3a5c3e] border-[#3a5c3e]/30'
                                : isStudent
                                ? 'bg-[#261f15] text-[#e8a93c] border-[#3d3222]'
                                : 'bg-[#c4821a]/15 text-[#c4821a] border-[#c4821a]/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAlumni
                                  ? 'bg-[#3a5c3e]'
                                  : isStudent
                                  ? 'bg-[#e8a93c]'
                                  : 'bg-[#c4821a]'
                              }`}
                            />
                            {person.role}
                          </span>
                          {person.alumniProfile?.batchYear && (
                            <span className="text-[10px] font-mono text-[#7d6a4f]">
                              Class of {person.alumniProfile.batchYear}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Academic & Professional details */}
                    <div className="mt-3.5 pt-3 border-t border-[#1a1410]/8 space-y-2 text-xs text-[#5c4d37]">
                      {person.alumniProfile?.department && (
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-[#7d6a4f] flex-shrink-0" />
                          <span className="truncate">{person.alumniProfile.department}</span>
                        </div>
                      )}
                      {person.alumniProfile?.company && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#7d6a4f] flex-shrink-0" />
                          <span className="truncate">
                            {person.alumniProfile.jobTitle
                              ? `${person.alumniProfile.jobTitle} at ${person.alumniProfile.company}`
                              : person.alumniProfile.company}
                          </span>
                        </div>
                      )}
                      {person.alumniProfile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#7d6a4f] flex-shrink-0" />
                          <span className="truncate">{person.alumniProfile.location}</span>
                        </div>
                      )}
                      {!person.alumniProfile?.department &&
                        !person.alumniProfile?.company &&
                        !person.alumniProfile?.location && (
                          <div className="flex items-center gap-2 text-[#7d6a4f]">
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="font-mono text-[11px]">Member profile active</span>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Card footer link */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#1a1410]/6 flex items-center justify-between text-[11px] font-mono text-[#7d6a4f] group-hover:text-[#c4821a] transition-colors">
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#7d6a4f]/60 group-hover:text-[#c4821a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1a1410] bg-white border border-[#1a1410]/15 rounded-xl hover:border-[#1a1410]/30 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-xs sm:text-sm text-[#7d6a4f] font-mono">
              Page <strong className="text-[#1a1410] font-semibold">{page}</strong> of{' '}
              <strong className="text-[#1a1410] font-semibold">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#1a1410] bg-white border border-[#1a1410]/15 rounded-xl hover:border-[#1a1410]/30 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

