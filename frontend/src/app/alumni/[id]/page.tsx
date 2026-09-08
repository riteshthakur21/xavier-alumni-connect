'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import { moduleCache } from '@/lib/moduleCache';
import {
  GraduationCap,
  Building2,
  Calendar,
  MapPin,
  Briefcase,
  Hash,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  Check,
  X,
  MessageSquare,
  Edit3,
  ArrowLeft,
  Mail,
  FileText,
  Linkedin,
  CalendarDays,
  BadgeCheck,
  Wrench,
  Layers,
  Shield,
  Eye,
  ArrowUpRight,
  BookOpen,
  Award,
  Handshake,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AlumniProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  alumniProfile: {
    batchYear: number;
    department: string;
    rollNo?: string;
    company?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    photoUrl?: string;
    bio?: string;
    location?: string;
    skills: string[];
    contactPublic: boolean;
  };
}

type ConnStatus = 'idle' | 'self' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

export default function AlumniProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'contact'>('about');
  const tabsRef = useRef<HTMLDivElement>(null);

  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connRequestId, setConnRequestId] = useState<string | null>(null);
  const [connLoading, setConnLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const token = Cookies.get('token');
  const isOwnProfile = currentUser?.id === params.id;

  const handleTabChange = (tabId: 'about' | 'experience' | 'contact') => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && tabsRef.current) {
      const rect = tabsRef.current.getBoundingClientRect();
      const navbarHeight = 64; // standard sticky navbar height (h-16 = 64px)
      if (rect.top < navbarHeight) {
        const scrollY = window.scrollY + rect.top - navbarHeight;
        window.scrollTo({
          top: Math.max(0, scrollY),
          behavior: 'smooth',
        });
      }
    }
  };

  const fetchAlumniProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/alumni/${params.id}`);
      setAlumni(response.data.alumni);
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchAlumniProfile();
  }, [params.id, fetchAlumniProfile]);

  const fetchConnStatus = useCallback(async () => {
    if (!token || !currentUser || isOwnProfile) {
      if (isOwnProfile) setConnStatus('self');
      return;
    }
    try {
      const { data } = await axios.get(`${API_URL}/api/connections/status/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnStatus(data.status as ConnStatus);
      setConnRequestId(data.requestId ?? null);
    } catch {
      setConnStatus('not_connected');
    }
  }, [params.id, token, currentUser, isOwnProfile]);

  useEffect(() => {
    fetchConnStatus();
  }, [fetchConnStatus]);

  const handleConnect = async () => {
    if (!token) {
      toast.error('Please log in first');
      router.push('/login');
      return;
    }
    setConnLoading(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/connections/send/${params.id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Connection request sent!');
      setConnStatus('pending_sent');
      setConnRequestId(data.request?.id ?? null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to send request'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/connections/cancel/${connRequestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request cancelled');
      setConnStatus('not_connected');
      setConnRequestId(null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/connections/accept/${connRequestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Connected!');
      setConnStatus('connected');
      setConnRequestId(null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/connections/reject/${connRequestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Request declined');
      setConnStatus('not_connected');
      setConnRequestId(null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const handleMessage = async () => {
    const tok = Cookies.get('token');
    if (!tok) {
      toast.error('Please log in to send messages');
      router.push('/login');
      return;
    }
    if (!alumni) return;
    setStartingChat(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/chat/create-conversation`,
        { targetUserId: alumni.id },
        { headers: { Authorization: `Bearer ${tok}` } }
      );
      router.push(`/chat?conv=${data.data?.id}`);
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : 'Could not start conversation'
      );
    } finally {
      setStartingChat(false);
    }
  };

  const handleDisconnect = async () => {
    if (!token) return;
    setConnLoading(true);
    try {
      await axios.delete(`${API_URL}/api/connections/disconnect/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Disconnected successfully');
      setConnStatus('not_connected');
      setConnRequestId(null);
      setShowDisconnectModal(false);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to disconnect'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  // ── SKELETON LOADING STATE ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="h-4 w-28 bg-[#1a1410]/10 rounded-full animate-pulse mb-5" />
          <div className="bg-white rounded-3xl border border-[#1a1410]/12 shadow-sm overflow-hidden animate-pulse">
            <div className="h-40 sm:h-56 lg:h-64 bg-[#261f15]" />
            <div className="px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#f4efe6] border-4 sm:border-[6px] border-white shadow-xl shrink-0" />
                <div className="h-11 w-40 bg-[#1a1410]/10 rounded-xl" />
              </div>
              <div className="space-y-3 mb-6">
                <div className="h-8 bg-[#1a1410]/15 rounded-lg w-1/3" />
                <div className="h-4 bg-[#1a1410]/10 rounded-md w-1/4" />
              </div>
              <div className="h-14 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/10 mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-64 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/10" />
                <div className="lg:col-span-2 h-64 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR / NOT FOUND STATE ───────────────────────────────────────────────
  if (!alumni) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#1a1410]/12 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto mb-4 shadow-xs font-serif text-2xl font-bold">
            X
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1410] mb-2 tracking-tight">
            Profile Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#5c4d37] mb-6 leading-relaxed max-w-sm mx-auto">
            The profile you are looking for doesn&apos;t exist, is unpublished, or may have been updated.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={fetchAlumniProfile}
              className="px-5 py-2.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs transition-all cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/directory"
              className="px-5 py-2.5 bg-white hover:bg-[#f4efe6] text-[#1a1410] border border-[#1a1410]/15 rounded-xl font-semibold text-xs sm:text-sm transition-colors text-center"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = alumni.alumniProfile;
  const skillsArray = Array.isArray(profile.skills) ? profile.skills : [];
  const photoSrc = getImageUrl(profile.photoUrl);
  const isAlumni = alumni.role === 'ALUMNI';

  const tabs = [
    { id: 'about', label: 'About & Bio', icon: FileText },
    { id: 'experience', label: 'Career & Work', icon: Briefcase },
    { id: 'contact', label: 'Contact Details', icon: Mail },
  ] as const;

  const statsItems = [
    ...(profile.company
      ? [{ icon: Building2, label: 'Company', value: profile.company }]
      : []),
    ...(profile.jobTitle
      ? [{ icon: Award, label: 'Role', value: profile.jobTitle }]
      : []),
    { icon: BookOpen, label: 'Department', value: profile.department },
    { icon: GraduationCap, label: 'Batch', value: `Class of ${profile.batchYear}` },
    ...(connStatus === 'connected'
      ? [{ icon: Handshake, label: 'Network', value: 'Connected' }]
      : []),
  ];

  // ── ACTION BUTTONS RENDERER ────────────────────────────────────────────────
  const renderActions = () => {
    if (isOwnProfile) {
      return (
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm transition-all border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
        >
          <Edit3 className="w-4 h-4 text-[#e8a93c]" />
          <span>Edit My Profile</span>
        </Link>
      );
    }

    if (!token || !currentUser) {
      return (
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 transition-all cursor-pointer w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 text-[#e8a93c]" />
          <span>Log in to Connect</span>
        </Link>
      );
    }

    if (connStatus === 'idle') {
      return <div className="h-11 w-32 bg-[#1a1410]/10 rounded-xl animate-pulse" />;
    }

    if (connStatus === 'connected') {
      return (
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDisconnectModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30 rounded-xl font-semibold text-xs sm:text-sm hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all group cursor-pointer"
          >
            <UserCheck className="w-4 h-4 group-hover:hidden" />
            <UserX className="w-4 h-4 hidden group-hover:inline" />
            <span className="group-hover:hidden font-mono">Connected</span>
            <span className="hidden group-hover:inline font-mono">Disconnect</span>
          </button>

          <button
            type="button"
            onClick={handleMessage}
            disabled={startingChat}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#e8a93c]" />
            <span>{startingChat ? 'Opening Chat...' : 'Message'}</span>
          </button>
        </div>
      );
    }

    if (connStatus === 'pending_sent') {
      return (
        <button
          type="button"
          onClick={handleCancel}
          disabled={connLoading}
          title="Click to cancel pending request"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#fdf8ed] hover:bg-rose-50 text-[#c4821a] hover:text-rose-600 border border-[#c4821a]/30 hover:border-rose-200 rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:opacity-60 w-full sm:w-auto cursor-pointer group"
        >
          <Clock className="w-4 h-4 group-hover:hidden" />
          <X className="w-4 h-4 hidden group-hover:inline" />
          <span className="font-mono">
            {connLoading ? 'Cancelling...' : 'Request Pending'}
          </span>
        </button>
      );
    }

    if (connStatus === 'pending_received') {
      return (
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
          <button
            type="button"
            onClick={handleAccept}
            disabled={connLoading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-3 bg-[#3a5c3e] hover:bg-[#2d4530] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3a5c3e] shadow-xs transition-all disabled:opacity-60 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            disabled={connLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 bg-[#f4efe6] hover:bg-rose-50 text-[#5c4d37] hover:text-rose-600 border border-[#1a1410]/15 hover:border-rose-200 rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={connLoading}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer w-full sm:w-auto"
      >
        <UserPlus className="w-4 h-4 text-[#e8a93c]" />
        <span>{connLoading ? 'Connecting...' : 'Connect'}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410] overflow-x-hidden">
      {/* ─── MAIN CONTENT CONTAINER (max-w-7xl with matching padding) ──────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 min-w-0 max-w-full">
        {/* Back navigation button */}
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#7d6a4f] group-hover:text-[#e8a93c]" />
            <span>Back to Directory</span>
          </button>
        </div>

        {/* ══ MASTER CARD ══ */}
        <div className="bg-white rounded-3xl border border-[#1a1410]/12 shadow-sm relative overflow-hidden min-w-0 max-w-full">
          {/* HERITAGE EDITORIAL BANNER */}
          <div
            className="relative overflow-hidden h-36 sm:h-56 lg:h-72 w-full border-b border-[#3d3222] rounded-t-[23px]"
            style={{
              background:
                'radial-gradient(circle at 85% 25%, rgba(196, 130, 26, 0.15) 0%, transparent 55%), linear-gradient(110deg, #1a1410 0%, #261f15 50%, #3d3222 100%)',
            }}
          >
            {/* Subtle collegiate grid pattern */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, rgba(232, 169, 60, 0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/70 via-transparent to-transparent pointer-events-none" />

            {/* Collegiate Stamp Watermark */}
            <div className="absolute top-4 right-4 sm:top-7 sm:right-8 text-right opacity-85 pointer-events-none">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e8a93c] block font-semibold">
                St. Xavier&apos;s College
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-[#f4efe6]/60 block mt-0.5">
                Alumni Network &middot; Member Profile
              </span>
            </div>
          </div>

          {/* PROFILE HEADER CONTENT */}
          <div className="px-4 sm:px-8 lg:px-12 pb-6 sm:pb-10 lg:pb-12 min-w-0 max-w-full">
            {/* Avatar & Actions Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-20 lg:-mt-28 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Avatar with Lightbox trigger */}
              <div className="relative group/avatar shrink-0">
                <div
                  onClick={() => photoSrc && setPhotoModal(true)}
                  className={`w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-3xl border-4 sm:border-[6px] border-white bg-[#261f15] text-[#e8a93c] shadow-xl overflow-hidden flex items-center justify-center font-serif text-3xl sm:text-5xl lg:text-6xl font-normal relative ${
                    photoSrc ? 'cursor-pointer' : ''
                  }`}
                >
                  {photoSrc ? (
                    <>
                      <Image
                        src={photoSrc}
                        alt={`${alumni.name}'s photo`}
                        width={176}
                        height={176}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md text-[#e8a93c]" />
                      </div>
                    </>
                  ) : (
                    alumni.name?.charAt(0).toUpperCase() || 'X'
                  )}
                </div>
              </div>

              {/* Action Buttons (Desktop sm+) */}
              <div className="hidden sm:flex items-center gap-3">
                {renderActions()}
              </div>
            </div>

            {/* Name, Role & Headline Row */}
            <div className="text-center sm:text-left mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3.5 mb-2.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                  {alumni.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold shadow-xs ${
                      isAlumni
                        ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]'
                        : 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30'
                    }`}
                  >
                    {alumni.role || 'MEMBER'}
                  </span>

                  {connStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30 shadow-xs">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Connected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Title / Organization */}
              {profile.jobTitle || profile.company ? (
                <p className="text-xs sm:text-base text-[#5c4d37] font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-[#7d6a4f] shrink-0" />
                  <span>
                    {profile.jobTitle ? (
                      <>
                        <strong className="text-[#1a1410] font-semibold">
                          {profile.jobTitle}
                        </strong>{' '}
                        {profile.company && (
                          <>
                            &middot; <span>{profile.company}</span>
                          </>
                        )}
                      </>
                    ) : (
                      profile.company
                    )}
                  </span>
                </p>
              ) : null}

              {/* Department, Batch & Location Meta */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mt-3 text-xs sm:text-sm text-[#7d6a4f] font-mono">
                {profile.department && (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#5c4d37]" />
                    <span>{profile.department}</span>
                  </span>
                )}

                {profile.batchYear && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#5c4d37]" />
                    <span>Batch of {profile.batchYear}</span>
                  </span>
                )}

                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 text-[#5c4d37]">
                    <MapPin className="w-4 h-4 text-[#c4821a]" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>

              {/* Mobile Action Buttons (<sm) */}
              <div className="sm:hidden mt-5 pt-4 border-t border-[#1a1410]/8 flex justify-center">
                {renderActions()}
              </div>
            </div>

            {/* STATS BAR (Preserved & Styled into Heritage Walnut System) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-0 py-3 px-4 sm:px-6 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/10 mb-6 sm:mb-8 shadow-2xs">
              {statsItems.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 sm:flex-1 sm:basis-0 sm:min-w-[100px] sm:px-3 sm:py-1 ${
                    i !== 0 ? 'sm:border-l sm:border-[#1a1410]/8' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] border border-[#3d3222] flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#7d6a4f] font-mono uppercase tracking-wide leading-none mb-0.5 whitespace-nowrap">
                      {label}
                    </p>
                    <p
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        label === 'Network' ? 'text-[#3a5c3e]' : 'text-[#1a1410]'
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ─── EDITORIAL TABS NAVIGATION (Sticky on Mobile, Static on Desktop) ─── */}
            <div
              ref={tabsRef}
              className="sticky top-16 z-30 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 lg:static lg:z-auto bg-white/95 backdrop-blur-md lg:bg-transparent py-2.5 sm:py-3 lg:py-0 border-b border-[#1a1410]/10 mb-6 sm:mb-8 transition-colors"
            >
              <div className="w-full lg:max-w-lg grid grid-cols-3 gap-1 sm:gap-1.5 p-1 bg-[#f4efe6]/80 lg:bg-[#fcfbf9] rounded-xl sm:rounded-2xl border border-[#1a1410]/10 shadow-2xs">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-1 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all duration-150 cursor-pointer min-h-[40px] touch-manipulation select-none ${
                        isActive
                          ? 'bg-[#1a1410] text-[#f4efe6] shadow-xs'
                          : 'bg-transparent text-[#5c4d37] hover:text-[#1a1410] hover:bg-white/70'
                      }`}
                      aria-selected={isActive}
                      role="tab"
                    >
                      <Icon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#e8a93c]' : 'text-[#7d6a4f]'
                        }`}
                      />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── CONTENT GRID ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Overview Sidebar (4 cols on lg, bottom on mobile) */}
              <div className="order-2 lg:order-1 lg:col-span-4 space-y-5">
                {/* Academic Registry Overview Box */}
                <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-6 border border-[#1a1410]/10 shadow-xs">
                  <div className="flex items-center gap-2 mb-4 sm:mb-5 pb-3.5 border-b border-[#1a1410]/8">
                    <GraduationCap className="w-4 h-4 text-[#c4821a]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d3222]">
                      Academic Overview
                    </h3>
                  </div>

                  <ul className="space-y-3.5 sm:space-y-4">
                    {[
                      {
                        icon: Hash,
                        label: 'Roll Number',
                        value: profile.rollNo || 'Verified on file',
                      },
                      {
                        icon: Building2,
                        label: 'Department',
                        value: profile.department || 'Not specified',
                      },
                      {
                        icon: MapPin,
                        label: 'Location',
                        value: profile.location || 'Not specified',
                      },
                      {
                        icon: Calendar,
                        label: 'Registry Joined',
                        value: new Date(alumni.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }),
                      },
                    ].map(({ icon: Icon, label, value }, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3.5 p-3 bg-white rounded-xl border border-[#1a1410]/8"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] border border-[#3d3222] flex items-center justify-center shrink-0 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f]">
                            {label}
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-[#1a1410] mt-0.5 break-words">
                            {value}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Action when Connected */}
                {connStatus === 'connected' && (
                  <div className="bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs p-5">
                    <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-[#1a1410]/8">
                      <span className="w-2 h-2 rounded-full bg-[#3a5c3e]" />
                      <span className="text-[11px] font-mono font-bold text-[#3d3222] uppercase tracking-wider">
                        Direct Communication
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleMessage}
                      disabled={startingChat}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#e8a93c]" />
                      <span>{startingChat ? 'Opening...' : 'Send Direct Message'}</span>
                    </button>
                  </div>
                )}

                {/* Registry Integrity Badge */}
                <div className="bg-[#fdf8ed] rounded-2xl p-4 sm:p-5 border border-[#c4821a]/30">
                  <div className="flex items-center gap-2 mb-1.5 text-[#c4821a]">
                    <Shield className="w-4 h-4" />
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider">
                      Verified Member Record
                    </p>
                  </div>
                  <p className="text-xs text-[#5c4d37] leading-relaxed">
                    This profile is recorded in the St. Xavier&apos;s College AlumniConnect directory. All institutional credentials are authenticated.
                  </p>
                </div>
              </div>

              {/* Right Column: Tab Panels (8 cols on lg, top on mobile) */}
              <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
                {/* 1. About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Bio Section */}
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-[#1a1410]/8">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Biography &amp; Background
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-[#3d3222] font-normal leading-relaxed whitespace-pre-line">
                        {profile.bio || (
                          <span className="italic text-[#7d6a4f]">
                            {alumni.name} has not published a detailed biography yet. Connect to learn more about their professional journey.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-[#1a1410]/8">
                        <Layers className="w-4 h-4 text-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Skills &amp; Expertise
                        </h2>
                      </div>
                      {skillsArray.length > 0 ? (
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {skillsArray.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-3 py-1.5 sm:px-3.5 bg-[#261f15] text-[#e8a93c] border border-[#3d3222] text-[11px] sm:text-xs font-mono font-medium rounded-xl shadow-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center border border-dashed border-[#1a1410]/15 rounded-xl bg-[#fcfbf9]">
                          <p className="text-xs text-[#7d6a4f] italic">
                            No skills listed on record yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Current Position Card */}
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-[#1a1410]/8">
                        <Briefcase className="w-4 h-4 text-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Current Position
                        </h2>
                      </div>
                      {profile.company || profile.jobTitle ? (
                        <div className="flex items-start sm:items-center gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs group">
                          <div className="w-11 h-11 bg-[#261f15] text-[#e8a93c] rounded-xl flex items-center justify-center shrink-0 border border-[#3d3222] shadow-xs group-hover:scale-105 transition-transform">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-serif font-normal text-[#1a1410] text-base sm:text-xl leading-tight">
                              {profile.jobTitle || 'Role not specified'}
                            </p>
                            <p className="text-xs sm:text-sm text-[#5c4d37] font-medium mt-0.5">
                              {profile.company || 'Organization not specified'}
                            </p>
                            {profile.location && (
                              <p className="text-xs text-[#7d6a4f] font-mono mt-2 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#c4821a]" />
                                <span>{profile.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center border border-dashed border-[#1a1410]/15 rounded-xl bg-white">
                          <p className="text-xs text-[#7d6a4f] italic">
                            No current position details provided.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-5 pb-3.5 border-b border-[#1a1410]/8">
                        <Briefcase className="w-4 h-4 text-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Career &amp; Academic Timeline
                        </h2>
                      </div>

                      {profile.company || profile.jobTitle ? (
                        <div className="relative pl-6 sm:pl-8 border-l-2 border-[#1a1410]/15 space-y-5">
                          {/* Current Job Role */}
                          <div className="relative">
                            <div className="absolute -left-[calc(1.5rem+7px)] sm:-left-[calc(2rem+7px)] top-5 w-3 h-3 bg-[#c4821a] rounded-full border-2 border-white shadow-xs" />
                            <div className="bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs p-5 sm:p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#261f15] rounded-xl flex items-center justify-center text-[#e8a93c] border border-[#3d3222] shrink-0">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-serif font-normal text-base sm:text-xl text-[#1a1410] leading-tight">
                                    {profile.jobTitle || 'Role Not Specified'}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-[#5c4d37] font-medium mt-0.5">
                                    {profile.company || 'Organization Not Specified'}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#3a5c3e]/10 text-[#3a5c3e] rounded-lg text-xs font-mono font-semibold border border-[#3a5c3e]/30">
                                      <span className="w-1.5 h-1.5 bg-[#3a5c3e] rounded-full animate-pulse" />
                                      Present
                                    </span>
                                    {profile.location && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fcfbf9] text-[#7d6a4f] rounded-lg text-xs font-mono border border-[#1a1410]/10">
                                        <MapPin className="w-3 h-3 text-[#c4821a]" />
                                        {profile.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Academic Department Item */}
                          <div className="relative">
                            <div className="absolute -left-[calc(1.5rem+7px)] sm:-left-[calc(2rem+7px)] top-5 w-3 h-3 bg-[#7d6a4f] rounded-full border-2 border-white shadow-xs" />
                            <div className="bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs p-5 sm:p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#261f15] rounded-xl flex items-center justify-center text-[#e8a93c] border border-[#3d3222] shrink-0">
                                  <GraduationCap className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-serif font-normal text-base sm:text-xl text-[#1a1410] leading-tight">
                                    {profile.department}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-[#5c4d37] font-medium mt-0.5">
                                    St. Xavier&apos;s College, Patna
                                  </p>
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#261f15] text-[#e8a93c] rounded-lg text-xs font-mono font-semibold border border-[#3d3222]">
                                      <GraduationCap className="w-3 h-3" />
                                      Batch of {profile.batchYear}
                                    </span>
                                    {profile.rollNo && (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fcfbf9] text-[#7d6a4f] rounded-lg text-xs font-mono border border-[#1a1410]/10">
                                        <Hash className="w-3 h-3 text-[#c4821a]" />
                                        {profile.rollNo}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-10 px-4 bg-white rounded-2xl border border-dashed border-[#1a1410]/15">
                          <Wrench className="w-8 h-8 text-[#7d6a4f] mx-auto mb-2.5 opacity-50" />
                          <h4 className="text-sm font-serif font-normal text-[#1a1410] mb-1">
                            No experience details listed
                          </h4>
                          <p className="text-xs text-[#5c4d37] max-w-sm mx-auto">
                            The member has not published current work details to their public record.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Contact Tab */}
                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-5 pb-3.5 border-b border-[#1a1410]/8">
                        <Mail className="w-4 h-4 text-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Contact &amp; Network Channels
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        {/* Email Card */}
                        {profile.contactPublic ? (
                          <a
                            href={`mailto:${alumni.email}`}
                            className="flex flex-col p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 hover:border-[#c4821a]/50 hover:shadow-xs transition-all group"
                          >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#261f15] text-[#e8a93c] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#3d3222] group-hover:scale-105 transition-transform">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                              Verified Email
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-[#1a1410] truncate group-hover:text-[#c4821a] transition-colors">
                              {alumni.email}
                            </span>
                          </a>
                        ) : (
                          <div className="flex flex-col p-4 sm:p-6 bg-white/60 rounded-2xl border border-[#1a1410]/8 opacity-75">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#f4efe6] text-[#7d6a4f] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#1a1410]/10">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                              Email Address
                            </span>
                            <span className="text-xs font-mono text-[#7d6a4f]">
                              Set to Private by Member
                            </span>
                          </div>
                        )}

                        {/* LinkedIn Card */}
                        {profile.linkedinUrl ? (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 hover:border-[#c4821a]/50 hover:shadow-xs transition-all group"
                          >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#261f15] text-[#e8a93c] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#3d3222] group-hover:scale-105 transition-transform">
                              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                              LinkedIn Profile
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-[#1a1410] truncate group-hover:text-[#c4821a] transition-colors inline-flex items-center gap-1.5">
                              <span>View Profile</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-[#c4821a]" />
                            </span>
                          </a>
                        ) : (
                          <div className="flex flex-col p-4 sm:p-6 bg-white/60 rounded-2xl border border-[#1a1410]/8 opacity-75">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#f4efe6] text-[#7d6a4f] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#1a1410]/10">
                              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                              LinkedIn Profile
                            </span>
                            <span className="text-xs font-mono text-[#7d6a4f]">
                              Not linked by member
                            </span>
                          </div>
                        )}

                        {/* Member Since Card */}
                        <div className="flex flex-col p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs sm:col-span-2">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#261f15] text-[#e8a93c] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#3d3222]">
                            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                            Alumni Registry Member Since
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                            {new Date(alumni.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCONNECT CONFIRMATION MODAL */}
      {showDisconnectModal && (
        <div
          className="fixed inset-0 z-50 bg-[#1a1410]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onMouseDown={() => setShowDisconnectModal(false)}
        >
          <div
            className="relative bg-[#fcfbf9] rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 border border-[#1a1410]/15"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <UserX className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-normal text-[#1a1410] text-center mb-1.5">
              Disconnect from {alumni.name}?
            </h3>
            <p className="text-xs text-[#5c4d37] text-center leading-relaxed mb-6">
              Disconnecting will remove this member from your direct network. Direct messaging will be disabled until you reconnect.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                disabled={connLoading}
                className="flex-1 py-2.5 sm:py-3 px-4 bg-white hover:bg-[#f4efe6] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm border border-[#1a1410]/15 transition-colors cursor-pointer disabled:opacity-60"
              >
                Stay Connected
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={connLoading}
                className="flex-1 py-2.5 sm:py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {connLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {photoModal && photoSrc && (
        <div
          className="fixed inset-0 z-50 bg-[#1a1410]/80 backdrop-blur-md flex items-center justify-center p-4"
          onMouseDown={() => setPhotoModal(false)}
        >
          <button
            type="button"
            onClick={() => setPhotoModal(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-[#f4efe6] flex items-center justify-center transition-colors cursor-pointer z-10"
            aria-label="Close photo preview"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="relative max-w-2xl max-h-[85vh] rounded-3xl overflow-hidden border-2 border-[#3d3222] shadow-2xl bg-[#261f15]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Image
              src={photoSrc}
              alt={alumni.name}
              width={800}
              height={800}
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}