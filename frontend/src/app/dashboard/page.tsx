'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { moduleCache } from '@/lib/moduleCache';
import {
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Check,
  X,
  Users,
  RefreshCw,
  GraduationCap,
  Building2,
  MessageSquare,
  Briefcase,
  Calendar,
  Search,
  ChevronRight,
  MapPin,
  TrendingUp,
  PenLine,
  BadgeCheck,
  AlertCircle,
  BarChart3,
  Shield,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RequestUser = {
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
  };
};

type ConnectionRequest = {
  id: string;
  createdAt: string;
  sender?: RequestUser;
  receiver?: RequestUser;
};

interface DashboardData {
  stats: any;
  pendingRequests: ConnectionRequest[];
  sentRequests: ConnectionRequest[];
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // User-scoped cache key
  const cacheKey = user ? `dashboard:${user.id}` : null;
  const cached = cacheKey ? moduleCache.get<DashboardData>(cacheKey) : null;

  const [stats, setStats] = useState<any>(() => cached?.stats || null);
  const [activeConnTab, setActiveConnTab] = useState<'received' | 'sent'>('received');
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>(
    () => cached?.pendingRequests || []
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>(
    () => cached?.sentRequests || []
  );
  const [reqLoading, setReqLoading] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({});

  const fetchDashboardData = useCallback(
    async (force = false) => {
      if (!user) return;
      const key = `dashboard:${user.id}`;
      const cachedData = moduleCache.get<DashboardData>(key);

      // If data is in cache and force is false, populate state and skip network request
      if (cachedData && !force) {
        setStats(cachedData.stats);
        setPendingRequests(cachedData.pendingRequests);
        setSentRequests(cachedData.sentRequests);
        return;
      }

      const token = Cookies.get('token');
      if (!cachedData) {
        setReqLoading(true);
      }

      try {
        const [statsRes, pendingRes, sentRes] = await Promise.all([
          axios.get('/api/alumni/stats/overview').catch(() => ({ data: null })),
          token
            ? axios
                .get(`${API_URL}/api/connections/pending`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
          token
            ? axios
                .get(`${API_URL}/api/connections/sent`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .catch(() => ({ data: { data: [] } }))
            : Promise.resolve({ data: { data: [] } }),
        ]);

        const nextData: DashboardData = {
          stats: statsRes.data,
          pendingRequests: pendingRes.data.data || [],
          sentRequests: sentRes.data.data || [],
        };

        setStats(nextData.stats);
        setPendingRequests(nextData.pendingRequests);
        setSentRequests(nextData.sentRequests);
        moduleCache.set(key, nextData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setReqLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router, fetchDashboardData]);

  const setActing = (id: string, val: boolean) =>
    setActionLoadingIds((p) => ({ ...p, [id]: val }));

  const handleAccept = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(
        `${API_URL}/api/connections/accept/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Connection request accepted!');
      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        if (user) {
          const current = moduleCache.get<DashboardData>(`dashboard:${user.id}`);
          if (current) {
            moduleCache.set(`dashboard:${user.id}`, { ...current, pendingRequests: next });
          }
        }
        return next;
      });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept';
      toast.error(msg || 'Failed to accept request');
    } finally {
      setActing(requestId, false);
    }
  };

  const handleDecline = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(
        `${API_URL}/api/connections/reject/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Request declined');
      setPendingRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        if (user) {
          const current = moduleCache.get<DashboardData>(`dashboard:${user.id}`);
          if (current) {
            moduleCache.set(`dashboard:${user.id}`, { ...current, pendingRequests: next });
          }
        }
        return next;
      });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline';
      toast.error(msg || 'Failed to decline request');
    } finally {
      setActing(requestId, false);
    }
  };

  const handleCancel = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(
        `${API_URL}/api/connections/cancel/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Request cancelled');
      setSentRequests((prev) => {
        const next = prev.filter((r) => r.id !== requestId);
        if (user) {
          const current = moduleCache.get<DashboardData>(`dashboard:${user.id}`);
          if (current) {
            moduleCache.set(`dashboard:${user.id}`, { ...current, sentRequests: next });
          }
        }
        return next;
      });
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel';
      toast.error(msg || 'Failed to cancel request');
    } finally {
      setActing(requestId, false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    const mins = Math.floor(diff / 60000);
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1410]/10 border-t-[#c4821a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#7d6a4f]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayList = activeConnTab === 'received' ? pendingRequests : sentRequests;
  const photoUrl = getImageUrl(user.alumniProfile?.photoUrl);

  // ── Profile completion calculation ──────────────────────────────────────────
  const profileFields = user.alumniProfile
    ? [
        { label: 'Photo', filled: !!user.alumniProfile.photoUrl },
        { label: 'Bio', filled: !!user.alumniProfile.bio },
        { label: 'Company', filled: !!user.alumniProfile.company },
        { label: 'Job Title', filled: !!user.alumniProfile.jobTitle },
        { label: 'Location', filled: !!user.alumniProfile.location },
        { label: 'LinkedIn', filled: !!user.alumniProfile.linkedinUrl },
        { label: 'Skills', filled: (user.alumniProfile.skills?.length ?? 0) > 0 },
        { label: 'Roll No', filled: !!user.alumniProfile.rollNo },
      ]
    : [];

  const completedCount = profileFields.filter((f) => f.filled).length;
  const completionPct =
    profileFields.length > 0 ? Math.round((completedCount / profileFields.length) * 100) : 0;
  const missingFields = profileFields.filter((f) => !f.filled);

  // ── Quick actions (role-aware) ──────────────────────────────────────────────
  const quickActions = [
    {
      label: 'Edit Profile',
      desc: 'Update credentials',
      href: '/dashboard/profile',
      icon: PenLine,
      iconStyle: 'bg-[#fdf3e3] border-[#c4821a]/25 text-[#c4821a]',
    },
    {
      label: 'Browse Directory',
      desc: 'Explore alumni',
      href: '/directory',
      icon: Search,
      iconStyle: 'bg-[#f4efe6] border-[#3d3222]/20 text-[#3d3222]',
    },
    {
      label: 'Messages',
      desc: 'Chat with members',
      href: '/chat',
      icon: MessageSquare,
      iconStyle: 'bg-[#3a5c3e]/10 border-[#3a5c3e]/25 text-[#3a5c3e]',
    },
    {
      label: 'Career & Referrals',
      desc: 'Browse opportunities',
      href: '/jobs',
      icon: Briefcase,
      iconStyle: 'bg-[#fdf3e3] border-[#c4821a]/25 text-[#c4821a]',
    },
    {
      label: 'Events & Reunions',
      desc: 'Upcoming summits',
      href: '/events',
      icon: Calendar,
      iconStyle: 'bg-[#fdf8ed] border-[#e8a93c]/30 text-[#c4821a]',
    },
    {
      label: 'Your Network',
      desc: 'View connections',
      href: '/connections',
      icon: Users,
      iconStyle: 'bg-[#3a5c3e]/10 border-[#3a5c3e]/25 text-[#3a5c3e]',
    },
    {
      label: 'Alumni Stories',
      desc: 'Share reflections',
      href: '/stories',
      icon: BookOpen,
      iconStyle: 'bg-[#f4efe6] border-[#7d6a4f]/25 text-[#5c4d37]',
    },
    ...(user.role === 'ALUMNI' || user.role === 'ADMIN'
      ? [
          {
            label: 'Post Opportunity',
            desc: 'Share openings',
            href: '/jobs/create',
            icon: TrendingUp,
            iconStyle: 'bg-[#fdf3e3] border-[#c4821a]/25 text-[#c4821a]',
          },
        ]
      : []),
    ...(user.role === 'ADMIN'
      ? [
          {
            label: 'Admin Console',
            desc: 'Manage platform',
            href: '/admin',
            icon: Shield,
            iconStyle: 'bg-[#261f15]/10 border-[#3d3222]/30 text-[#3d3222]',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {/* ─── WELCOME HERO (Academic Heritage Editorial Walnut Gradient) ──── */}
        <div
          className="rounded-2xl overflow-hidden border border-[#3d3222] shadow-sm relative"
          style={{
            background:
              'radial-gradient(circle at 85% 20%, rgba(196, 130, 26, 0.08) 0%, transparent 50%), linear-gradient(105deg, #1a1410 0%, #261f15 55%, #3d3222 100%)',
          }}
        >
          <div className="px-5 sm:px-8 py-6 sm:py-8 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Avatar + Mobile Role */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#261f15] border-2 border-[#3d3222] text-[#e8a93c] font-serif text-2xl sm:text-3xl flex items-center justify-center flex-shrink-0 shadow-md">
                  {photoUrl ? (
                    <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="sm:hidden">
                  <span className="px-2.5 py-1 bg-[#261f15] border border-[#3d3222] text-[#e8a93c] font-mono text-[10px] uppercase tracking-wider font-semibold rounded-lg">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Name & Metadata */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-serif text-[#f4efe6] font-normal leading-tight tracking-tight">
                    Welcome back, {user.name}
                  </h1>

                  {user.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#7aab7e]/40 bg-[#3a5c3e]/30 text-[#7aab7e] font-mono text-[11px] uppercase tracking-wider font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#c4821a]/40 bg-[#c4821a]/20 text-[#e8a93c] font-mono text-[11px] uppercase tracking-wider font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>

                <p className="text-[#e8dfd0]/80 text-xs sm:text-sm font-normal">
                  {user.email}
                  {user.alumniProfile?.department && ` · ${user.alumniProfile.department}`}
                  {user.alumniProfile?.batchYear && ` · Batch of ${user.alumniProfile.batchYear}`}
                </p>

                {user.alumniProfile?.jobTitle && user.alumniProfile?.company && (
                  <p className="text-[#e8a93c] text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {user.alumniProfile.jobTitle} at {user.alumniProfile.company}
                    </span>
                  </p>
                )}
              </div>

              {/* Role Badge (Desktop) */}
              <span className="hidden sm:inline-flex px-3.5 py-1.5 bg-[#261f15] border border-[#3d3222] text-[#e8a93c] font-mono text-xs uppercase tracking-wider font-semibold rounded-xl flex-shrink-0 shadow-xs">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* ─── STATS ROW ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {[
            {
              label: 'Total Alumni',
              value: stats?.totalAlumni ?? '—',
              icon: Users,
            },
            {
              label: 'Batch Cohort',
              value: stats
                ? stats.byBatch?.find(
                    (b: any) => b.batchYear === user.alumniProfile?.batchYear
                  )?._count ?? 0
                : '—',
              icon: GraduationCap,
            },
            {
              label: 'Department Peers',
              value: stats
                ? stats.byDepartment?.find(
                    (d: any) => d.department === user.alumniProfile?.department
                  )?._count ?? 0
                : '—',
              icon: BarChart3,
            },
            {
              label: 'Pending Requests',
              value: pendingRequests.length,
              icon: UserPlus,
              clickable: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => {
                if (s.clickable) {
                  document
                    .getElementById('connection-requests')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`bg-white rounded-2xl border border-[#1a1410]/12 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-xs transition-all duration-200 ${
                s.clickable
                  ? 'cursor-pointer hover:border-[#c4821a]/50 hover:shadow-md hover:-translate-y-0.5'
                  : 'hover:border-[#1a1410]/20'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0 shadow-xs">
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-serif font-normal text-[#1a1410] leading-tight">
                  {s.value}
                </p>
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#7d6a4f] mt-0.5 truncate font-medium">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── QUICK ACTIONS & PROFILE SUMMARY GRID ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Quick Actions (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#1a1410]/12 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                  Quick Actions &amp; Navigation
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.href + action.label}
                    href={action.href}
                    className="flex flex-col p-3 rounded-xl border border-[#1a1410]/10 bg-[#fcfbf9] hover:bg-white hover:border-[#c4821a]/30 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 group"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2.5 transition-all duration-200 group-hover:scale-105 shadow-2xs ${action.iconStyle}`}
                    >
                      <action.icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors leading-snug">
                      {action.label}
                    </p>
                    <p className="text-[10px] font-mono text-[#7d6a4f] mt-0.5 line-clamp-1">
                      {action.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Overview (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#1a1410]/12 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              {/* Profile Completion Bar */}
              {user.alumniProfile && (
                <div className="mb-5 pb-4 border-b border-[#1a1410]/8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-mono font-medium text-[#3d3222] uppercase tracking-wider">
                      Profile Completion
                    </p>
                    <span
                      className={`text-xs font-mono font-bold ${
                        completionPct === 100 ? 'text-[#3a5c3e]' : 'text-[#c4821a]'
                      }`}
                    >
                      {completionPct}%
                    </span>
                  </div>

                  <div className="h-2 bg-[#f4efe6] rounded-full overflow-hidden border border-[#1a1410]/8">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        completionPct === 100 ? 'bg-[#3a5c3e]' : 'bg-[#c4821a]'
                      }`}
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>

                  {missingFields.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {missingFields.map((f) => (
                        <span
                          key={f.label}
                          className="text-[10px] px-2 py-0.5 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] rounded font-mono font-medium"
                        >
                          + {f.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#3a5c3e] font-medium mt-2 flex items-center gap-1 font-mono">
                      <BadgeCheck className="w-3.5 h-3.5" /> Profile is 100% complete
                    </p>
                  )}
                </div>
              )}

              {/* Profile Attributes */}
              <div className="space-y-2.5 mb-5 text-xs text-[#5c4d37]">
                {user.alumniProfile?.batchYear && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                    <span>
                      Graduation Batch{' '}
                      <strong className="text-[#1a1410]">
                        Batch of {user.alumniProfile.batchYear}
                      </strong>
                    </span>
                  </div>
                )}
                {user.alumniProfile?.department && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                    <span>
                      Department <strong className="text-[#1a1410]">{user.alumniProfile.department}</strong>
                    </span>
                  </div>
                )}
                {user.alumniProfile?.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                    <span className="truncate">
                      {user.alumniProfile.jobTitle ? (
                        <>
                          <strong className="text-[#1a1410]">{user.alumniProfile.jobTitle}</strong> at{' '}
                          {user.alumniProfile.company}
                        </>
                      ) : (
                        user.alumniProfile.company
                      )}
                    </span>
                  </div>
                )}
                {user.alumniProfile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
                    <span>{user.alumniProfile.location}</span>
                  </div>
                )}

                {/* Skills Preview */}
                {(user.alumniProfile?.skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.alumniProfile!.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-[#f4efe6] text-[#5c4d37] text-[10px] font-mono rounded border border-[#1a1410]/10"
                      >
                        {s}
                      </span>
                    ))}
                    {user.alumniProfile!.skills.length > 4 && (
                      <span className="px-2 py-0.5 bg-[#f4efe6] text-[#7d6a4f] text-[10px] font-mono rounded border border-[#1a1410]/10">
                        +{user.alumniProfile!.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile CTA */}
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold rounded-xl text-xs sm:text-sm transition-all border border-[#3d3222]/50 shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5 text-[#e8a93c]" />
              <span>Edit Profile Details</span>
            </Link>
          </div>
        </div>

        {/* ─── CONNECTION REQUESTS HUB ──────────────────────────────────────── */}
        <div
          id="connection-requests"
          className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#1a1410]/8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                  Connection Requests
                </h2>
                <p className="text-xs text-[#5c4d37] hidden sm:block">
                  Manage your incoming invites and outbound alumni network requests.
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchDashboardData(true)}
              disabled={reqLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1a1410]/12 bg-[#fcfbf9] hover:bg-[#f4efe6] text-xs font-mono font-medium text-[#5c4d37] hover:text-[#1a1410] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${reqLoading ? 'animate-spin text-[#c4821a]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-2 bg-[#fcfbf9] border-b border-[#1a1410]/8">
            <button
              onClick={() => setActiveConnTab('received')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeConnTab === 'received'
                  ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222] shadow-xs'
                  : 'text-[#5c4d37] hover:text-[#1a1410] hover:bg-[#f4efe6]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Received</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#c4821a] text-white text-[10px] font-bold rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveConnTab('sent')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                activeConnTab === 'sent'
                  ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222] shadow-xs'
                  : 'text-[#5c4d37] hover:text-[#1a1410] hover:bg-[#f4efe6]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sent</span>
              {sentRequests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#7d6a4f] text-white text-[10px] font-bold rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* List Area */}
          <div className="p-4 sm:p-6">
            {reqLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 p-4 rounded-xl border border-[#1a1410]/8 bg-[#fcfbf9] animate-pulse"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#1a1410]/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-[#1a1410]/10 rounded w-1/3" />
                      <div className="h-2.5 bg-[#1a1410]/5 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-[#1a1410]/10 rounded-xl" />
                      <div className="h-8 w-16 bg-[#1a1410]/10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mb-3 shadow-xs">
                  {activeConnTab === 'received' ? (
                    <UserCheck className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>
                <h3 className="text-base font-serif font-normal text-[#1a1410]">
                  {activeConnTab === 'received' ? 'No pending requests' : 'No sent requests'}
                </h3>
                <p className="text-xs text-[#5c4d37] mt-1 max-w-xs leading-relaxed">
                  {activeConnTab === 'received'
                    ? 'Incoming invitations from alumni and students will appear here.'
                    : 'Invitations you send to fellow members will remain pending until accepted.'}
                </p>
                {activeConnTab === 'sent' && (
                  <Link
                    href="/directory"
                    className="mt-4 px-4 py-2 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] text-xs font-semibold rounded-xl transition-colors border border-[#3d3222]/50 shadow-xs"
                  >
                    Browse Alumni Directory &rarr;
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {displayList.map((req) => {
                  const person = activeConnTab === 'received' ? req.sender : req.receiver;
                  if (!person) return null;
                  const isActing = actionLoadingIds[req.id];
                  const pPhoto = getImageUrl(person.alumniProfile?.photoUrl);

                  return (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-[#1a1410]/10 bg-white hover:border-[#1a1410]/25 hover:bg-[#fcfbf9] transition-all group"
                    >
                      {/* Avatar */}
                      <Link href={`/profile/${person.id}`} className="flex-shrink-0">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] font-serif flex items-center justify-center text-base font-normal overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                          {pPhoto ? (
                            <img src={pPhoto} alt={person.name} className="w-full h-full object-cover" />
                          ) : (
                            person.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${person.id}`}
                          className="hover:text-[#c4821a] transition-colors"
                        >
                          <p className="font-serif text-sm sm:text-base text-[#1a1410] font-normal truncate">
                            {person.name}
                          </p>
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-[#5c4d37]">
                          {person.alumniProfile?.department && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <GraduationCap className="w-3 h-3 text-[#7d6a4f]" />
                              {person.alumniProfile.department}
                              {person.alumniProfile.batchYear &&
                                ` · Batch of ${person.alumniProfile.batchYear}`}
                            </span>
                          )}
                          {person.alumniProfile?.company && (
                            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#7d6a4f]">
                              <Building2 className="w-3 h-3" />
                              {person.alumniProfile.company}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-[#7d6a4f] mt-0.5">
                          {timeAgo(req.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {activeConnTab === 'received' ? (
                          <>
                            <button
                              onClick={() => handleAccept(req.id)}
                              disabled={isActing}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] text-xs font-semibold rounded-xl transition-all border border-[#3d3222]/50 shadow-xs disabled:opacity-60 cursor-pointer"
                            >
                              <Check className="w-3 h-3 text-[#e8a93c]" />
                              <span>{isActing ? '...' : 'Accept'}</span>
                            </button>
                            <button
                              onClick={() => handleDecline(req.id)}
                              disabled={isActing}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#f4efe6] hover:bg-rose-50 hover:text-rose-700 text-[#5c4d37] border border-[#1a1410]/15 text-xs font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>{isActing ? '...' : 'Decline'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={isActing}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#f4efe6] hover:bg-rose-50 hover:text-rose-700 text-[#5c4d37] border border-[#1a1410]/15 text-xs font-semibold rounded-xl transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <UserX className="w-3 h-3" />
                            <span>{isActing ? 'Cancelling...' : 'Cancel'}</span>
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
      </div>
    </div>
  );
}