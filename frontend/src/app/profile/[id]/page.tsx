'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import {
  MapPin,
  Mail,
  Linkedin,
  Briefcase,
  GraduationCap,
  Building2,
  Hash,
  Edit3,
  ArrowLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Check,
  X,
  BadgeCheck,
  Shield,
  FileText,
  Layers,
  Calendar,
  Eye,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ConnStatus = 'idle' | 'self' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

const HERITAGE_BANNER_ANIM_STYLES = `
  /* --- Keyframes --- */
  @keyframes heritage-spin-cw {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes heritage-spin-ccw {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }

  @keyframes heritage-glow-breathe {
    0%, 100% {
      opacity: 0.45;
      transform: scale3d(0.96, 0.96, 1);
    }
    50% {
      opacity: 0.9;
      transform: scale3d(1.05, 1.05, 1);
    }
  }

  @keyframes heritage-ripple-wave {
    0% {
      transform: scale3d(0.55, 0.55, 1);
      opacity: 0.7;
    }
    50% {
      opacity: 0.35;
    }
    100% {
      transform: scale3d(1.4, 1.4, 1);
      opacity: 0;
    }
  }

  @keyframes heritage-star-twinkle {
    0%, 100% {
      opacity: 0.2;
      transform: scale3d(0.8, 0.8, 1);
    }
    50% {
      opacity: 1;
      transform: scale3d(1.25, 1.25, 1);
    }
  }

  @keyframes heritage-sheen-sweep {
    0% {
      transform: translateX(-160%) skewX(-20deg);
    }
    35%, 100% {
      transform: translateX(260%) skewX(-20deg);
    }
  }

  /* Organic drift with horizontal wavering and slight rotation */
  @keyframes heritage-ember-float {
    0% {
      opacity: 0;
      transform: translate3d(0, 16px, 0) scale(0.6) rotate(0deg);
    }
    20% {
      opacity: 0.9;
      transform: translate3d(-5px, 2px, 0) scale(0.85) rotate(-6deg);
    }
    60% {
      opacity: 0.65;
      transform: translate3d(6px, -20px, 0) scale(1) rotate(8deg);
    }
    100% {
      opacity: 0;
      transform: translate3d(-3px, -45px, 0) scale(1.1) rotate(-12deg);
    }
  }

  /* --- Base Performance & GPU Layering --- */
  .anim-heritage-cw,
  .anim-heritage-ccw,
  .anim-heritage-glow,
  .anim-heritage-ripple,
  .anim-heritage-sheen,
  .anim-heritage-ember,
  .anim-star {
    backface-visibility: hidden;
    transform-origin: center;
    will-change: transform, opacity;
  }

  /* --- Animation Utilities --- */
  .anim-heritage-cw {
    animation: heritage-spin-cw 54s linear infinite;
  }

  .anim-heritage-ccw {
    animation: heritage-spin-ccw 38s linear infinite;
  }

  .anim-heritage-glow {
    animation: heritage-glow-breathe 6s ease-in-out infinite;
  }

  .anim-heritage-sheen {
    animation: heritage-sheen-sweep 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    will-change: transform;
  }

  /* Dynamic Ripples (Use standard class or override with CSS variables) */
  .anim-heritage-ripple {
    animation: heritage-ripple-wave var(--ripple-dur, 8s) cubic-bezier(0.16, 1, 0.3, 1) infinite var(--ripple-delay, 0s);
  }
  .anim-heritage-ripple-1 { animation: heritage-ripple-wave 8s cubic-bezier(0.16, 1, 0.3, 1) infinite 0s; }
  .anim-heritage-ripple-2 { animation: heritage-ripple-wave 8s cubic-bezier(0.16, 1, 0.3, 1) infinite 4s; }

  /* Embers */
  .anim-heritage-ember {
    animation: heritage-ember-float var(--ember-dur, 4.5s) ease-out infinite var(--ember-delay, 0s);
  }

  /* Dynamic Stars (Configurable via --star-dur and --star-delay or presets) */
  .anim-star {
    animation: heritage-star-twinkle var(--star-dur, 3.5s) ease-in-out infinite var(--star-delay, 0s);
  }
  .anim-star-1 { animation: heritage-star-twinkle 3.2s ease-in-out infinite 0s; }
  .anim-star-2 { animation: heritage-star-twinkle 4.5s ease-in-out infinite 1.4s; }
  .anim-star-3 { animation: heritage-star-twinkle 3.8s ease-in-out infinite 2.2s; }
  .anim-star-4 { animation: heritage-star-twinkle 5.2s ease-in-out infinite 0.8s; }
  .anim-star-5 { animation: heritage-star-twinkle 4.8s ease-in-out infinite 3.1s; }
  .anim-star-6 { animation: heritage-star-twinkle 3.5s ease-in-out infinite 1.8s; }

  /* --- Accessibility --- */
  @media (prefers-reduced-motion: reduce) {
    .anim-heritage-cw,
    .anim-heritage-ccw,
    .anim-heritage-glow,
    .anim-heritage-ripple,
    .anim-heritage-ripple-1,
    .anim-heritage-ripple-2,
    .anim-heritage-sheen,
    .anim-heritage-ember,
    .anim-star,
    .anim-star-1,
    .anim-star-2,
    .anim-star-3,
    .anim-star-4,
    .anim-star-5,
    .anim-star-6 {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'contact'>('about');
  const tabsRef = useRef<HTMLDivElement>(null);

  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connRequestId, setConnRequestId] = useState<string | null>(null);
  const [connLoading, setConnLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

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

  const isOwnProfile = currentUser?.id === id;
  const token = Cookies.get('token');

  const fetchConnStatus = useCallback(async () => {
    if (!token || !currentUser || isOwnProfile) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/connections/status/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnStatus(data.status as ConnStatus);
      setConnRequestId(data.requestId ?? null);
    } catch {
      setConnStatus('not_connected');
    }
  }, [id, token, currentUser, isOwnProfile]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/alumni/${id}`);
        setUser(res.data.alumni);
      } catch {
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  useEffect(() => {
    fetchConnStatus();
  }, [fetchConnStatus]);

  const handleConnect = async () => {
    if (!token) {
      toast.error('Please sign in to connect with alumni');
      router.push('/login');
      return;
    }
    setConnLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/connections/send/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Connection request sent!');
      setConnStatus('pending_sent');
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
      toast.success('Connection request cancelled');
      setConnStatus('not_connected');
      setConnRequestId(null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel request'
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
      toast.success('Connection established!');
      setConnStatus('connected');
      setConnRequestId(null);
      if (currentUser?.id) {
        moduleCache.invalidate(`dashboard:${currentUser.id}`);
      }
      moduleCache.invalidate('directory');
    } catch (err: unknown) {
      toast.error(
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept connection'
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
        axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline request'
      );
    } finally {
      setConnLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!token) {
      toast.error('Please sign in to send messages');
      router.push('/login');
      return;
    }
    setStartingChat(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/chat/create-conversation`,
        { targetUserId: id },
        { headers: { Authorization: `Bearer ${token}` } }
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
      await axios.delete(`${API_URL}/api/connections/disconnect/${id}`, {
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

  // ── SKELETON LOADING STATE ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
        {/* Header Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[#1a1410]/10 rounded-full animate-pulse" />
              <div className="h-8 w-64 bg-[#1a1410]/15 rounded-xl animate-pulse" />
              <div className="h-4 w-96 bg-[#1a1410]/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
          {/* Main Card Skeleton */}
          <div className="bg-white rounded-3xl border border-[#1a1410]/12 shadow-sm overflow-hidden animate-pulse">
            <div className="h-48 sm:h-64 lg:h-72 bg-[#261f15]" />
            <div className="px-6 sm:px-10 lg:px-12 pb-10 sm:pb-12">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-20 sm:-mt-24 lg:-mt-28 gap-6 mb-8">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-3xl bg-[#f4efe6] border-4 sm:border-[6px] border-white shadow-xl flex-shrink-0" />
                <div className="h-12 w-44 bg-[#1a1410]/10 rounded-xl" />
              </div>
              <div className="space-y-3 mb-8">
                <div className="h-8 bg-[#1a1410]/15 rounded-lg w-1/3" />
                <div className="h-4 bg-[#1a1410]/10 rounded-md w-1/4" />
              </div>
              <div className="h-12 bg-[#f4efe6] rounded-2xl w-full max-w-md mb-8" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                <div className="lg:col-span-4 h-72 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/8" />
                <div className="lg:col-span-8 h-72 bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/8" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR / NOT FOUND STATE ────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20">
        <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-[#1a1410]/12 text-center max-w-lg w-full">
          <div className="w-16 h-16 rounded-2xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto mb-4 shadow-xs font-serif text-2xl font-bold">
            X
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-[#1a1410] mb-2 tracking-tight">
            Member Profile Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#5c4d37] mb-6 leading-relaxed max-w-md mx-auto">
            The profile you are seeking is either unpublished, requires verification, or has been updated in the registry.
          </p>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto py-3 px-6 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] font-semibold text-xs sm:text-sm rounded-xl border border-[#3d3222]/50 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#e8a93c]" />
            <span>Return to Alumni Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const profile = user.alumniProfile || {};
  const skillsArray = Array.isArray(profile.skills)
    ? profile.skills
    : profile.skills
    ? JSON.parse(profile.skills)
    : [];

  const photoSrc = getImageUrl(profile.photoUrl);
  const isAlumni = user.role === 'ALUMNI';

  // ── ACTION BUTTONS RENDERER ────────────────────────────────────────────────
  const renderActions = () => {
    if (isOwnProfile) {
      return (
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm transition-all border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
        >
          <Edit3 className="w-4 h-4 text-[#e8a93c]" />
          <span>Edit My Profile</span>
        </Link>
      );
    }

    if (connStatus === 'idle') {
      return <div className="h-11 w-36 bg-[#1a1410]/10 rounded-xl animate-pulse" />;
    }

    if (connStatus === 'connected') {
      return (
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-center sm:justify-end">
          {/* Disconnect Toggle Button */}
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

          {/* Send Message Button */}
          <button
            type="button"
            onClick={handleMessage}
            disabled={startingChat}
            className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#e8a93c]" />
            <span>{startingChat ? 'Opening Chat...' : 'Send Message'}</span>
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
          className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#fdf8ed] hover:bg-rose-50 text-[#c4821a] hover:text-rose-600 border border-[#c4821a]/30 hover:border-rose-200 rounded-xl font-semibold text-xs sm:text-sm transition-all disabled:opacity-60 w-full sm:w-auto cursor-pointer group"
        >
          <Clock className="w-4 h-4 group-hover:hidden" />
          <X className="w-4 h-4 hidden group-hover:inline" />
          <span className="font-mono">
            {connLoading ? 'Cancelling...' : 'Request Sent'}
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
            <span>Accept Request</span>
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

    // Default 'not_connected' state
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={connLoading}
        className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] rounded-xl font-semibold text-xs sm:text-sm border border-[#3d3222]/50 shadow-xs hover:shadow hover:-translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer w-full sm:w-auto"
      >
        <UserPlus className="w-4 h-4 text-[#e8a93c]" />
        <span>{connLoading ? 'Connecting...' : 'Connect'}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <style>{HERITAGE_BANNER_ANIM_STYLES}</style>
      {/* ─── EDITORIAL PAGE TOP HEADER (Aligned with Stories & Events) ─────── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-2.5 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Directory</span>
            </button>

            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Alumni Member Record
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#5c4d37] mt-1 max-w-xl leading-relaxed">
              Official academic credentials, professional expertise, and direct network pathways for St. Xavier&apos;s graduates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 text-[#3a5c3e] font-mono text-[11px] uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#3a5c3e] animate-pulse" />
              <span>Official Registry</span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER (max-w-7xl with matching padding) ──────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {/* ─── MASTER PROFILE CARD ─────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#1a1410]/12 shadow-sm relative">
          {/* ─── HERITAGE EDITORIAL BANNER ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden h-36 sm:h-56 lg:h-72 w-full border-b border-[#3d3222] rounded-t-[23px]"
            style={{
              background:
                'radial-gradient(circle at 85% 25%, rgba(196, 130, 26, 0.15) 0%, transparent 55%), linear-gradient(110deg, #1a1410 0%, #261f15 50%, #3d3222 100%)',
            }}
          >
            {/* Subtle grid pattern texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, rgba(232, 169, 60, 0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1410]/70 via-transparent to-transparent pointer-events-none" />

            {/* ══ CELESTIAL CONSTELLATION MAP (Across Whole Banner) ══ */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
              viewBox="0 0 1200 240"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Twinkling Collegiate Star Nodes */}
              <g className="anim-star-1" style={{ transformOrigin: '220px 50px' }}>
                <circle cx="220" cy="50" r="2.5" fill="#e8a93c" />
                <circle cx="220" cy="50" r="6.5" stroke="#e8a93c" strokeOpacity="0.3" strokeWidth="0.5" />
              </g>
              <g className="anim-star-2" style={{ transformOrigin: '380px 140px' }}>
                <circle cx="380" cy="140" r="2" fill="#f4efe6" />
                <circle cx="380" cy="140" r="5" stroke="#f4efe6" strokeOpacity="0.2" strokeWidth="0.5" />
              </g>
              <g className="anim-star-4" style={{ transformOrigin: '720px 150px' }}>
                <circle cx="720" cy="150" r="2.5" fill="#e8a93c" />
                <circle cx="720" cy="150" r="6" stroke="#e8a93c" strokeOpacity="0.25" strokeWidth="0.5" />
              </g>
              <g className="anim-star-5" style={{ transformOrigin: '880px 50px' }}>
                <circle cx="880" cy="50" r="2" fill="#f4efe6" />
                <circle cx="880" cy="50" r="5.5" stroke="#f4efe6" strokeOpacity="0.2" strokeWidth="0.5" />
              </g>
              <g className="anim-star-6" style={{ transformOrigin: '900px 75px' }}>
                <circle cx="900" cy="75" r="2.5" fill="#e8a93c" />
                <circle cx="900" cy="75" r="7" stroke="#e8a93c" strokeOpacity="0.3" strokeWidth="0.5" />
              </g>
              <g className="anim-star-2" style={{ transformOrigin: '1060px 125px' }}>
                <circle cx="1060" cy="125" r="2" fill="#e8a93c" />
              </g>
            </svg>

            {/* Luminous Ambient Horizon Sheen across Whole Banner */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
              <div
                className="anim-heritage-sheen absolute top-0 bottom-0 w-1/3"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(232, 169, 60, 0.08) 50%, transparent 100%)',
                }}
              />
            </div>

            {/* Archival Quadrant Dial (Top Right behind Watermark) */}
            <div className="anim-heritage-ccw absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-56 h-56 sm:w-72 sm:h-72 pointer-events-none select-none z-0">
              <svg viewBox="0 0 240 240" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="105" stroke="#e8a93c" strokeOpacity="0.14" strokeWidth="1" strokeDasharray="4 8" />
                <circle cx="120" cy="120" r="80" stroke="#f4efe6" strokeOpacity="0.08" strokeWidth="0.75" />
                <circle cx="120" cy="120" r="55" stroke="#e8a93c" strokeOpacity="0.1" strokeWidth="0.75" strokeDasharray="2 4" />
                <line x1="120" y1="10" x2="120" y2="230" stroke="#e8a93c" strokeOpacity="0.12" strokeWidth="0.75" />
                <line x1="10" y1="120" x2="230" y2="120" stroke="#e8a93c" strokeOpacity="0.12" strokeWidth="0.75" />
              </svg>
            </div>

            {/* ══ CELESTIAL ASTROLABE & AMBER HALO (Behind Profile Picture) ══ */}
            <div
              className="absolute left-1/2 sm:left-[104px] lg:left-[136px] bottom-0 -translate-x-1/2 translate-y-6 sm:translate-y-4 lg:translate-y-6 pointer-events-none select-none flex items-center justify-center w-72 h-72 sm:w-96 sm:h-96 lg:w-[440px] lg:h-[440px] z-0"
              aria-hidden="true"
            >
              {/* Expanding Heritage Ripples */}
              <div className="anim-heritage-ripple-1 absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border border-[#e8a93c]/20" />
              <div className="anim-heritage-ripple-2 absolute w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border border-[#e8a93c]/20" />

              {/* Breathing Ambient Amber Aura */}
              <div
                className="anim-heritage-glow absolute w-56 h-56 sm:w-72 sm:h-72 lg:w-84 lg:h-84 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(232, 169, 60, 0.35) 0%, rgba(196, 130, 26, 0.15) 42%, rgba(26, 20, 16, 0) 72%)',
                  filter: 'blur(24px)',
                }}
              />

              {/* Outer Astrolabe Ring (Slow Clockwise Rotation) */}
              <svg
                className="anim-heritage-cw absolute w-60 h-60 sm:w-80 sm:h-80 lg:w-96 lg:h-96"
                viewBox="0 0 320 320"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Dashed Orbit */}
                <circle
                  cx="160"
                  cy="160"
                  r="146"
                  stroke="#e8a93c"
                  strokeOpacity="0.22"
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
                {/* Concentric Accent Ring */}
                <circle
                  cx="160"
                  cy="160"
                  r="134"
                  stroke="#f4efe6"
                  strokeOpacity="0.08"
                  strokeWidth="0.75"
                />
                {/* Cardinal Diamond Star Marks */}
                <polygon points="160,6 163.5,14 160,22 156.5,14" fill="#e8a93c" fillOpacity="0.55" />
                <polygon points="160,298 163.5,306 160,314 156.5,306" fill="#e8a93c" fillOpacity="0.55" />
                <polygon points="314,160 306,163.5 298,160 306,156.5" fill="#e8a93c" fillOpacity="0.55" />
                <polygon points="22,160 14,163.5 6,160 14,156.5" fill="#e8a93c" fillOpacity="0.55" />
                {/* 45-degree Astrolabe Dial Ticks */}
                <line x1="57" y1="57" x2="65" y2="65" stroke="#e8a93c" strokeOpacity="0.32" strokeWidth="1.5" />
                <line x1="263" y1="57" x2="255" y2="65" stroke="#e8a93c" strokeOpacity="0.32" strokeWidth="1.5" />
                <line x1="57" y1="263" x2="65" y2="255" stroke="#e8a93c" strokeOpacity="0.32" strokeWidth="1.5" />
                <line x1="263" y1="263" x2="255" y2="255" stroke="#e8a93c" strokeOpacity="0.32" strokeWidth="1.5" />
              </svg>

              {/* Inner Harmonic Astrolabe Ring (Counter-Clockwise Rotation) */}
              <svg
                className="anim-heritage-ccw absolute w-44 h-44 sm:w-60 sm:h-60 lg:w-72 lg:h-72"
                viewBox="0 0 240 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Inner Dashed Celestial Track */}
                <circle
                  cx="120"
                  cy="120"
                  r="106"
                  stroke="#e8a93c"
                  strokeOpacity="0.28"
                  strokeWidth="1.2"
                  strokeDasharray="10 5 3 5"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="78"
                  stroke="#f4efe6"
                  strokeOpacity="0.12"
                  strokeWidth="0.75"
                  strokeDasharray="3 6"
                />
                {/* Celestial Satellite Nodes */}
                <circle cx="120" cy="14" r="3" fill="#e8a93c" fillOpacity="0.75" />
                <circle cx="212" cy="173" r="2.5" fill="#e8a93c" fillOpacity="0.65" />
                <circle cx="28" cy="173" r="2.5" fill="#e8a93c" fillOpacity="0.65" />
              </svg>
            </div>

            {/* Distributed Micro-Embers across Whole Banner */}
            <div className="absolute inset-0 pointer-events-none select-none z-0">
              <div
                className="anim-heritage-ember absolute w-1 h-1 rounded-full bg-[#e8a93c]/80 blur-[0.3px]"
                style={{
                  left: '12%',
                  top: '38%',
                  animation: 'heritage-ember-float 5.2s ease-out infinite 0.4s',
                }}
              />
              <div
                className="anim-heritage-ember absolute w-1.5 h-1.5 rounded-full bg-[#f4efe6]/70 blur-[0.4px]"
                style={{
                  left: '24%',
                  top: '52%',
                  animation: 'heritage-ember-float 6.4s ease-out infinite 1.8s',
                }}
              />
              <div
                className="anim-heritage-ember absolute w-1 h-1 rounded-full bg-[#e8a93c]/70 blur-[0.3px]"
                style={{
                  left: '42%',
                  top: '40%',
                  animation: 'heritage-ember-float 5.8s ease-out infinite 3.1s',
                }}
              />
              <div
                className="anim-heritage-ember absolute w-1.5 h-1.5 rounded-full bg-[#e8a93c]/60 blur-[0.4px]"
                style={{
                  left: '62%',
                  top: '34%',
                  animation: 'heritage-ember-float 7s ease-out infinite 2.3s',
                }}
              />
              <div
                className="anim-heritage-ember absolute w-1 h-1 rounded-full bg-[#f4efe6]/60 blur-[0.3px]"
                style={{
                  left: '78%',
                  top: '48%',
                  animation: 'heritage-ember-float 5.5s ease-out infinite 1.1s',
                }}
              />
              <div
                className="anim-heritage-ember absolute w-1.5 h-1.5 rounded-full bg-[#e8a93c]/70 blur-[0.4px]"
                style={{
                  left: '90%',
                  top: '30%',
                  animation: 'heritage-ember-float 6.8s ease-out infinite 3.7s',
                }}
              />
            </div>

            {/* Collegiate Stamp Watermark (Top Right) */}
            <div className="absolute top-4 right-4 sm:top-7 sm:right-8 text-right opacity-85 pointer-events-none z-10">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#e8a93c] block font-semibold">
                St. Xavier&apos;s College
              </span>
              <span className="text-[8px] sm:text-[10px] font-mono text-[#f4efe6]/60 block mt-0.5">
                Alumni Registry Archive &middot; Class Record
              </span>
            </div>
          </div>

          {/* ─── PROFILE HEADER BODY ───────────────────────────────────────── */}
          <div className="px-4 sm:px-8 lg:px-12 pb-6 sm:pb-10 lg:pb-12">
            {/* Avatar & Action Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-20 lg:-mt-28 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Avatar Box with Lightbox Trigger */}
              <div className="relative group/avatar shrink-0 z-10">
                <div
                  onClick={() => photoSrc && setPhotoModal(true)}
                  className={`w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-3xl border-4 sm:border-[6px] border-white bg-[#261f15] text-[#e8a93c] shadow-xl overflow-hidden flex items-center justify-center font-serif text-3xl sm:text-5xl lg:text-6xl font-normal relative ${
                    photoSrc ? 'cursor-pointer' : ''
                  }`}
                >
                  {photoSrc ? (
                    <>
                      <img
                        src={photoSrc}
                        alt={user.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md text-[#e8a93c]" />
                      </div>
                    </>
                  ) : (
                    user.name?.charAt(0) || 'X'
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
                  {user.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold shadow-xs ${
                      isAlumni
                        ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]'
                        : 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30'
                    }`}
                  >
                    {user.role || 'MEMBER'}
                  </span>

                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md font-mono text-[10px] uppercase tracking-wider font-semibold bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30 shadow-xs">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Title / Institution */}
              {profile.jobTitle || profile.company ? (
                <p className="text-xs sm:text-base text-[#5c4d37] font-medium flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  <Building2 className="w-4 h-4 text-[#7d6a4f] flex-shrink-0" />
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

              {/* Department & Batch Cohort Meta */}
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

              {/* Action Buttons (Mobile <sm) */}
              <div className="sm:hidden mt-5 pt-4 border-t border-[#1a1410]/8 flex justify-center">
                {renderActions()}
              </div>
            </div>

            {/* ─── EDITORIAL TABS NAVIGATION (Sticky on Mobile, Static on Desktop) ─── */}
            <div
              ref={tabsRef}
              className="sticky top-16 z-30 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 lg:static lg:z-auto bg-white/95 backdrop-blur-md lg:bg-transparent py-2.5 sm:py-3 lg:py-0 border-b border-[#1a1410]/10 mb-6 sm:mb-8 transition-colors"
            >
              <div className="w-full lg:max-w-lg grid grid-cols-3 gap-1 sm:gap-1.5 p-1 bg-[#f4efe6]/80 lg:bg-[#fcfbf9] rounded-xl sm:rounded-2xl border border-[#1a1410]/10 shadow-2xs">
                {[
                  { id: 'about', label: 'About & Bio', icon: FileText },
                  { id: 'experience', label: 'Career & Work', icon: Briefcase },
                  { id: 'contact', label: 'Contact Details', icon: Mail },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id as any)}
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

            {/* ─── TAB CONTENT 12-COL GRID ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* ── Right Column: Tab Panels (8 Cols on Desktop, Top on Mobile) ── */}
              <div className="order-1 lg:order-2 lg:col-span-8 space-y-6">
                {/* 1. About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Bio Section */}
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-[#1a1410]/8">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Biography &amp; Professional Journey
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm md:text-base text-[#3d3222] font-normal leading-relaxed whitespace-pre-line">
                        {profile.bio ||
                          `${user.name} has not published a detailed biography yet. Reach out and connect to learn more about their academic and professional journey.`}
                      </p>
                    </div>

                    {/* Skills Section */}
                    {skillsArray.length > 0 && (
                      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                        <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-[#1a1410]/8">
                          <Layers className="w-4 h-4 text-[#c4821a]" />
                          <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                            Key Skills &amp; Domain Expertise
                          </h2>
                        </div>
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
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-8 border border-[#1a1410]/10 shadow-xs">
                      <div className="flex items-center gap-2 mb-5 pb-3.5 border-b border-[#1a1410]/8">
                        <Briefcase className="w-4 h-4 text-[#c4821a]" />
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Current Role &amp; Organization
                        </h2>
                      </div>

                      {profile.jobTitle || profile.company ? (
                        <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 shadow-xs">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#261f15] text-[#e8a93c] flex items-center justify-center shrink-0 border border-[#3d3222] shadow-xs">
                            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-xl font-serif font-normal text-[#1a1410]">
                              {profile.jobTitle || 'Designation N/A'}
                            </h3>
                            <p className="text-xs sm:text-sm font-medium text-[#5c4d37] mt-1">
                              {profile.company || 'Company / Organization N/A'}
                            </p>
                            {profile.location && (
                              <p className="text-xs text-[#7d6a4f] font-mono mt-2.5 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#c4821a]" />
                                <span>{profile.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 sm:py-10 px-4 bg-white rounded-2xl border border-dashed border-[#1a1410]/15">
                          <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-[#7d6a4f] mx-auto mb-2.5 opacity-50" />
                          <h4 className="text-sm font-serif font-normal text-[#1a1410] mb-1">
                            No active experience listed
                          </h4>
                          <p className="text-xs text-[#5c4d37] max-w-sm mx-auto">
                            The member has not published current organization details to their public record.
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
                        {user.email ? (
                          <a
                            href={`mailto:${user.email}`}
                            className="flex flex-col p-4 sm:p-6 bg-white rounded-2xl border border-[#1a1410]/10 hover:border-[#c4821a]/50 hover:shadow-xs transition-all group"
                          >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#261f15] text-[#e8a93c] flex items-center justify-center mb-3 sm:mb-3.5 border border-[#3d3222] group-hover:scale-105 transition-transform">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                              Institutional Email
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-[#1a1410] truncate group-hover:text-[#c4821a] transition-colors">
                              {user.email}
                            </span>
                          </a>
                        ) : null}

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
                          <div className="flex flex-col p-4 sm:p-6 bg-white/50 rounded-2xl border border-[#1a1410]/8 opacity-70">
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
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Left Column: Academic Credentials Sidebar (4 Cols on Desktop, Bottom on Mobile) ── */}
              <div className="order-2 lg:order-1 lg:col-span-4 space-y-5">
                {/* Academic Credentials Box */}
                <div className="bg-[#fcfbf9] rounded-2xl p-5 sm:p-6 border border-[#1a1410]/10 shadow-xs">
                  <div className="flex items-center gap-2 mb-4 sm:mb-5 pb-3.5 border-b border-[#1a1410]/8">
                    <GraduationCap className="w-4 h-4 text-[#c4821a]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#3d3222]">
                      Academic Registry
                    </h3>
                  </div>

                  <ul className="space-y-3.5 sm:space-y-4">
                    {/* Department */}
                    <li className="flex items-start gap-3.5 p-3 bg-white rounded-xl border border-[#1a1410]/8">
                      <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center shrink-0 border border-[#3d3222]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f]">
                          Department
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#1a1410] mt-0.5 truncate">
                          {profile.department || 'Not specified'}
                        </p>
                      </div>
                    </li>

                    {/* Batch Year */}
                    <li className="flex items-start gap-3.5 p-3 bg-white rounded-xl border border-[#1a1410]/8">
                      <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center shrink-0 border border-[#3d3222]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f]">
                          Graduation Cohort
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#1a1410] mt-0.5">
                          {profile.batchYear ? `Batch of ${profile.batchYear}` : 'Not specified'}
                        </p>
                      </div>
                    </li>

                    {/* Roll Number */}
                    <li className="flex items-start gap-3.5 p-3 bg-white rounded-xl border border-[#1a1410]/8">
                      <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center shrink-0 border border-[#3d3222]">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f]">
                          University Roll No
                        </p>
                        <p className="text-xs sm:text-sm font-semibold font-mono text-[#1a1410] mt-0.5">
                          {profile.rollNo || 'Verified on file'}
                        </p>
                      </div>
                    </li>

                    {/* Location */}
                    <li className="flex items-start gap-3.5 p-3 bg-white rounded-xl border border-[#1a1410]/8">
                      <div className="w-8 h-8 rounded-lg bg-[#261f15] text-[#e8a93c] flex items-center justify-center shrink-0 border border-[#3d3222]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f]">
                          Location
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-[#1a1410] mt-0.5 truncate">
                          {profile.location || 'Location unlisted'}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Directory Integrity Stamp */}
                <div className="bg-[#fdf8ed] rounded-2xl p-4 sm:p-5 border border-[#c4821a]/30">
                  <div className="flex items-center gap-2 mb-2 text-[#c4821a]">
                    <Shield className="w-4 h-4" />
                    <p className="text-[11px] font-mono font-bold uppercase tracking-wider">
                      Directory Integrity
                    </p>
                  </div>
                  <p className="text-xs text-[#5c4d37] leading-relaxed">
                    This profile is recorded in the official St. Xavier&apos;s alumni registry. Academic verification status is maintained by university administrators.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── DISCONNECT CONFIRMATION MODAL ─────────────────────────────────── */}
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
              Disconnect from {user.name}?
            </h3>
            <p className="text-xs text-[#5c4d37] text-center leading-relaxed mb-6">
              Disconnecting will remove this user from your direct network. You can always send a new connection request later.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                disabled={connLoading}
                className="flex-1 py-2.5 sm:py-3 px-4 bg-white hover:bg-[#f4efe6] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm border border-[#1a1410]/15 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
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

      {/* ─── PHOTO LIGHTBOX MODAL ──────────────────────────────────────────── */}
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
            <img
              src={photoSrc}
              alt={user.name}
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}