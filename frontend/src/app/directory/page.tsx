'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import {
  Search,
  GraduationCap,
  Building2,
  Briefcase,
  Mail,
  UserPlus,
  UserCheck,
  Clock,
  X,
  Check,
  RotateCcw,
  ChevronDown,
  Users,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

type ConnStatus = 'idle' | 'self' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Directory() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>(() => moduleCache.get<any[]>('directory') || []);
  const [loading, setLoading] = useState(() => !moduleCache.get('directory'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // ── Connection state (per-card) ──────────────────────────────────────────────
  const [connStatuses, setConnStatuses] = useState<Record<string, ConnStatus>>({});
  const [connRequestIds, setConnRequestIds] = useState<Record<string, string | null>>({});
  const [connLoadingIds, setConnLoadingIds] = useState<Record<string, boolean>>({});

  // 1. Fetch Users Logic
  const fetchUsers = useCallback(async (force = false) => {
    const cachedUsers = moduleCache.get<any[]>('directory');
    if (cachedUsers && !force) {
      setUsers(cachedUsers);
      setLoading(false);
      return;
    }

    if (!cachedUsers) {
      setLoading(true);
    }

    try {
      const res = await axios.get(`${API_URL}/api/alumni`);
      const loaded = res.data.alumni || [];
      setUsers(loaded);
      moduleCache.set('directory', loaded);
    } catch (error) {
      toast.error('Failed to load alumni directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Batch-fetch connection statuses once users are loaded
  useEffect(() => {
    if (!user || users.length === 0) return;
    const token = Cookies.get('token');
    if (!token) return;

    const fetchStatuses = async () => {
      const results = await Promise.allSettled(
        users.map((u) =>
          axios.get(`${API_URL}/api/connections/status/${u.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      const newStatuses: Record<string, ConnStatus> = {};
      const newRequestIds: Record<string, string | null> = {};
      results.forEach((result, i) => {
        const uid = users[i].id;
        if (result.status === 'fulfilled') {
          newStatuses[uid] = result.value.data.status;
          newRequestIds[uid] = result.value.data.requestId ?? null;
        } else {
          newStatuses[uid] = 'not_connected';
          newRequestIds[uid] = null;
        }
      });
      setConnStatuses(newStatuses);
      setConnRequestIds(newRequestIds);
    };
    fetchStatuses();
  }, [users, user]);

  // ── Connection action handlers ────────────────────────────────────────────────
  const handleConnect = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to connect with alumni');
      router.push('/login');
      return;
    }
    const token = Cookies.get('token');
    setConnLoadingIds((p) => ({ ...p, [targetId]: true }));
    try {
      await axios.post(
        `${API_URL}/api/connections/send/${targetId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Connection request sent');
      setConnStatuses((p) => ({ ...p, [targetId]: 'pending_sent' }));
      if (user?.id) moduleCache.invalidate(`dashboard:${user.id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to send request';
      toast.error(msg || 'Failed to send request');
    } finally {
      setConnLoadingIds((p) => ({ ...p, [targetId]: false }));
    }
  };

  const handleCancelConn = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    const requestId = connRequestIds[targetId];
    if (!requestId) return;
    const token = Cookies.get('token');
    setConnLoadingIds((p) => ({ ...p, [targetId]: true }));
    try {
      await axios.post(
        `${API_URL}/api/connections/cancel/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Connection request cancelled');
      setConnStatuses((p) => ({ ...p, [targetId]: 'not_connected' }));
      setConnRequestIds((p) => ({ ...p, [targetId]: null }));
      if (user?.id) moduleCache.invalidate(`dashboard:${user.id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel request';
      toast.error(msg || 'Failed to cancel request');
    } finally {
      setConnLoadingIds((p) => ({ ...p, [targetId]: false }));
    }
  };

  const handleAcceptConn = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    const requestId = connRequestIds[targetId];
    if (!requestId) return;
    const token = Cookies.get('token');
    setConnLoadingIds((p) => ({ ...p, [targetId]: true }));
    try {
      await axios.post(
        `${API_URL}/api/connections/accept/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Connection established');
      setConnStatuses((p) => ({ ...p, [targetId]: 'connected' }));
      setConnRequestIds((p) => ({ ...p, [targetId]: null }));
      if (user?.id) moduleCache.invalidate(`dashboard:${user.id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept connection';
      toast.error(msg || 'Failed to accept connection');
    } finally {
      setConnLoadingIds((p) => ({ ...p, [targetId]: false }));
    }
  };

  // 3. Protected Action Helper
  const handleProtectedAction = (e: React.MouseEvent, targetPath?: string) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please sign in to view member profile');
      router.push('/login');
      return false;
    }
    if (targetPath) router.push(targetPath);
    return true;
  };

  // Filter Logic
  const filteredUsers = users.filter((u) => {
    const profile = u.alumniProfile || {};
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.company && profile.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.jobTitle && profile.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (profile.department && profile.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept ? profile.department === selectedDept : true;
    const matchesYear = selectedYear ? profile.batchYear?.toString() === selectedYear : true;

    return matchesSearch && matchesDept && matchesYear;
  });

  const years = Array.from({ length: 2026 - 2009 + 1 }, (_, i) => 2026 - i);
  const departments = ['BBA', 'BCA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)'];

  const hasActiveFilters = Boolean(searchTerm || selectedDept || selectedYear);

  // ── SKELETON LOADING STATE ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-10">
            <div className="h-4 w-36 bg-[#1a1410]/10 rounded-full mx-auto mb-3 animate-pulse" />
            <div className="h-10 w-72 sm:w-96 bg-[#1a1410]/15 rounded-xl mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-60 sm:w-80 bg-[#1a1410]/10 rounded-full mx-auto animate-pulse" />
          </div>

          {/* Filter Bar Skeleton */}
          <div className="bg-white rounded-2xl border border-[#1a1410]/10 p-4 mb-8 flex flex-col md:flex-row gap-3">
            <div className="h-12 bg-[#f4efe6] rounded-xl flex-1 animate-pulse" />
            <div className="h-12 bg-[#f4efe6] rounded-xl w-full md:w-44 animate-pulse" />
            <div className="h-12 bg-[#f4efe6] rounded-xl w-full md:w-36 animate-pulse" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#1a1410]/10 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#f4efe6] animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-[#1a1410]/15 rounded-md w-3/4 animate-pulse" />
                      <div className="h-3 bg-[#1a1410]/10 rounded-md w-1/2 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2 bg-[#fcfbf9] p-3.5 rounded-xl border border-[#1a1410]/8">
                    <div className="h-3.5 bg-[#1a1410]/10 rounded w-4/5 animate-pulse" />
                    <div className="h-3.5 bg-[#1a1410]/10 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-[#1a1410]/8 flex gap-2">
                  <div className="h-11 bg-[#1a1410]/15 rounded-xl flex-1 animate-pulse" />
                  <div className="h-11 w-11 bg-[#1a1410]/10 rounded-xl animate-pulse" />
                  <div className="h-11 w-11 bg-[#1a1410]/10 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-7xl mx-auto">
        {/* ─── EDITORIAL HEADER ────────────────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 text-[#3a5c3e] font-mono text-[11px] uppercase tracking-wider mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#3a5c3e] animate-pulse" />
            <span>Alumni Registry &middot; St. Xavier&apos;s</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#1a1410] tracking-tight">
            Alumni &amp; Student Directory
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#5c4d37] font-normal mt-2.5 max-w-2xl mx-auto leading-relaxed">
            Discover, connect, and collaborate with graduates, scholars, and industry professionals across departments and batches.
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
                placeholder="Search by name, company, role, or department..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#fcfbf9] border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7d6a4f] hover:text-[#1a1410]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Department Dropdown */}
              <div className="relative flex-1 md:w-44">
                <select
                  className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 bg-[#fcfbf9] border border-[#1a1410]/15 text-xs sm:text-sm text-[#1a1410] font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6a4f] pointer-events-none" />
              </div>

              {/* Batch Year Dropdown */}
              <div className="relative flex-1 md:w-36">
                <select
                  className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 bg-[#fcfbf9] border border-[#1a1410]/15 text-xs sm:text-sm text-[#1a1410] font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Batches</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      Batch of {year}
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
                    setSelectedDept('');
                    setSelectedYear('');
                  }}
                  title="Reset all filters"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-3 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] hover:bg-[#c4821a] hover:text-[#f4efe6] rounded-xl text-xs font-semibold shadow-sm transition-all flex-shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Counter & Active Filter Indicators */}
          <div className="mt-3 pt-2.5 border-t border-[#1a1410]/8 flex flex-wrap items-center justify-between text-xs text-[#7d6a4f] gap-2">
            <div className="font-mono">
              Showing <span className="font-bold text-[#1a1410]">{filteredUsers.length}</span> of{' '}
              <span className="font-bold text-[#1a1410]">{users.length}</span> members
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#c4821a]">
                <Sparkles className="w-3 h-3" />
                <span>Filters applied</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── RESULTS GRID ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((profile) => {
              const photoSrc = profile.alumniProfile?.photoUrl
                ? profile.alumniProfile.photoUrl.startsWith('http')
                  ? profile.alumniProfile.photoUrl
                  : `${API_URL}/${profile.alumniProfile.photoUrl.replace(/^\/+/, '').replace(/\\/g, '/')}`
                : null;

              const isAlumni = profile.role === 'ALUMNI';

              return (
                <div
                  key={profile.id}
                  className="bg-white rounded-2xl border border-[#1a1410]/12 p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1a1410]/25 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Card Header & Avatar */}
                  <div>
                    <div className="flex items-start gap-3.5 sm:gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#f4efe6] border border-[#1a1410]/12 flex items-center justify-center font-serif text-xl sm:text-2xl text-[#1a1410] overflow-hidden shadow-inner group-hover:border-[#c4821a]/40 transition-colors">
                          {photoSrc ? (
                            <img
                              src={photoSrc}
                              alt={profile.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.parentElement) {
                                  e.currentTarget.parentElement.innerHTML = `<span class="font-serif text-xl text-[#1a1410]">${profile.name?.charAt(0) || 'X'}</span>`;
                                }
                              }}
                            />
                          ) : (
                            profile.name?.charAt(0) || 'X'
                          )}
                        </div>
                      </div>

                      {/* Name & Badges */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={(e) => handleProtectedAction(e, `/profile/${profile.id}`)}
                          className="font-serif text-lg sm:text-xl font-normal text-[#1a1410] truncate group-hover:text-[#c4821a] transition-colors cursor-pointer"
                        >
                          {profile.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[9px] uppercase tracking-wider font-semibold shadow-xs ${
                              isAlumni
                                ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]'
                                : 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30'
                            }`}
                          >
                            {profile.role || 'MEMBER'}
                          </span>

                          {profile.alumniProfile?.batchYear && (
                            <span className="text-[11px] font-mono text-[#7d6a4f]">
                              Class of {profile.alumniProfile.batchYear}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Academic & Professional Details Well */}
                    <div className="mt-4 space-y-2 bg-[#fcfbf9] p-3.5 rounded-xl border border-[#1a1410]/8">
                      <div className="text-xs text-[#5c4d37] flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                        <span className="font-medium text-[#1a1410] truncate">
                          {profile.alumniProfile?.department || 'Department N/A'}
                        </span>
                      </div>

                      {profile.alumniProfile?.company && (
                        <div className="text-xs text-[#5c4d37] flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                          <span className="truncate">
                            {profile.alumniProfile.jobTitle ? (
                              <>
                                <span className="font-medium text-[#1a1410]">
                                  {profile.alumniProfile.jobTitle}
                                </span>{' '}
                                &middot; {profile.alumniProfile.company}
                              </>
                            ) : (
                              profile.alumniProfile.company
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── ACTION BUTTONS ROW ───────────────────────────────── */}
                  <div className="mt-4 pt-3.5 border-t border-[#1a1410]/8 flex items-center gap-2">
                    {/* View Profile CTA */}
                    <button
                      onClick={(e) => handleProtectedAction(e, `/profile/${profile.id}`)}
                      className="flex-1 py-2.5 px-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl border border-[#3d3222]/50 shadow-xs hover:shadow transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#e8a93c]" />
                    </button>

                    {/* Dynamic Connection Button */}
                    {(() => {
                      const cs = connStatuses[profile.id];
                      const isLoading = connLoadingIds[profile.id];
                      if (!user || cs === 'self' || cs === undefined) return null;

                      if (cs === 'connected') {
                        return (
                          <span
                            title="Connected"
                            className="w-10 h-10 rounded-xl bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30 flex items-center justify-center flex-shrink-0"
                          >
                            <UserCheck className="w-4 h-4" />
                          </span>
                        );
                      }

                      if (cs === 'pending_sent') {
                        return (
                          <button
                            onClick={(e) => handleCancelConn(e, profile.id)}
                            disabled={isLoading}
                            title="Request sent — click to cancel"
                            className="w-10 h-10 rounded-xl bg-[#fdf8ed] text-[#c4821a] border border-[#c4821a]/30 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center flex-shrink-0 group/cs disabled:opacity-60 cursor-pointer"
                          >
                            <Clock className="w-4 h-4 group-hover/cs:hidden" />
                            <X className="w-4 h-4 hidden group-hover/cs:block" />
                          </button>
                        );
                      }

                      if (cs === 'pending_received') {
                        return (
                          <button
                            onClick={(e) => handleAcceptConn(e, profile.id)}
                            disabled={isLoading}
                            title="Accept connection request"
                            className="w-10 h-10 rounded-xl bg-[#3a5c3e] hover:bg-[#2d4530] text-[#f4efe6] border border-[#3a5c3e] transition-all flex items-center justify-center flex-shrink-0 disabled:opacity-60 cursor-pointer shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={(e) => handleConnect(e, profile.id)}
                          disabled={isLoading}
                          title="Send connection request"
                          className="w-10 h-10 rounded-xl bg-white text-[#1a1410] hover:bg-[#1a1410] hover:text-[#f4efe6] border border-[#1a1410]/15 hover:border-[#1a1410] transition-all shadow-xs flex items-center justify-center flex-shrink-0 disabled:opacity-60 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      );
                    })()}

                    {/* Email Mailto Action */}
                    {profile.email && (
                      <button
                        onClick={(e) => {
                          if (handleProtectedAction(e)) {
                            window.location.href = `mailto:${profile.email}`;
                          }
                        }}
                        title={`Send email to ${profile.name}`}
                        className="w-10 h-10 rounded-xl bg-white text-[#7d6a4f] hover:text-[#c4821a] hover:bg-[#fdf8ed] border border-[#1a1410]/15 hover:border-[#c4821a]/30 transition-all shadow-xs flex items-center justify-center flex-shrink-0 cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-[#1a1410]/15 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-normal text-[#1a1410] mb-1">
                No matching members found
              </h3>
              <p className="text-xs sm:text-sm text-[#5c4d37] max-w-md mx-auto mb-4">
                We couldn&apos;t find any alumni matching your search filters. Try adjusting your search term, department, or batch year.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDept('');
                    setSelectedYear('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl hover:bg-[#3d3222] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
