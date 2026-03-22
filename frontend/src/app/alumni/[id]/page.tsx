'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
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
  ChevronLeft,
  Mail,
  FileText,
  Link2,
  CalendarDays,
  BadgeCheck,
  Wrench,
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

// ── All keyframe animations in one constant — NO @import, zero hydration issues
const XAV_STYLES = `
  @keyframes xav-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes xav-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes xav-pulse-line {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  .xav-0 { animation: xav-fadeUp 0.48s ease both; }
  .xav-1 { animation: xav-fadeUp 0.48s 0.07s ease both; }
  .xav-2 { animation: xav-fadeUp 0.48s 0.14s ease both; }
  .xav-3 { animation: xav-fadeUp 0.48s 0.21s ease both; }
  .xav-4 { animation: xav-fadeUp 0.48s 0.28s ease both; }
  .xav-banner-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%);
    background-size: 600px 100%;
    animation: xav-shimmer 5s ease-in-out infinite;
    pointer-events: none;
  }
  .xav-accent-line { animation: xav-pulse-line 3s ease-in-out infinite; }
  .xav-card { transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease; }
  .xav-card:hover { box-shadow: 0 6px 24px rgba(59,130,246,0.09) !important; border-color: #bfdbfe !important; transform: translateY(-1px); }
  .xav-stat { transition: background 0.15s ease; padding: 8px; margin: -8px; border-radius: 8px; }
  .xav-stat:hover { background: #f0f7ff; }
  .xav-skill { transition: background 0.15s ease, border-color 0.15s ease; }
  .xav-skill:hover { background: #dbeafe !important; border-color: #93c5fd !important; }
  .xav-contact { transition: all 0.2s ease; }
  .xav-contact:hover { box-shadow: 0 8px 28px rgba(59,130,246,0.12) !important; border-color: #93c5fd !important; transform: translateY(-2px); }
  .xav-avatar { transition: transform 0.2s ease; }
  .xav-avatar:hover { transform: scale(1.04); }
  .xav-avatar-mobile-wrap {
    position: relative; z-index: 20; margin-top: -48px;
    display: flex; justify-content: center;
  }
  .xav-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    background: rgba(0,0,0,0.55);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  }
  /* Bold name — guaranteed regardless of font load order */
  .xav-name {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 700 !important;
    line-height: 1.15;
    color: #111827;
  }
`;

export default function AlumniProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connRequestId, setConnRequestId] = useState<string | null>(null);
  const [connLoading, setConnLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const token = Cookies.get('token');
  const isOwnProfile = currentUser?.id === params.id;

  useEffect(() => { if (params.id) fetchAlumniProfile(); }, [params.id]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/alumni/${params.id}`);
      setAlumni(response.data.alumni);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const fetchConnStatus = useCallback(async () => {
    if (!token || !currentUser || isOwnProfile) { if (isOwnProfile) setConnStatus('self'); return; }
    try {
      const { data } = await axios.get(`${API_URL}/api/connections/status/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setConnStatus(data.status as ConnStatus);
      setConnRequestId(data.requestId ?? null);
    } catch { setConnStatus('not_connected'); }
  }, [params.id, token, currentUser, isOwnProfile]);

  useEffect(() => { fetchConnStatus(); }, [fetchConnStatus]);

  const handleConnect = async () => {
    if (!token) { toast.error('Please log in first'); router.push('/login'); return; }
    setConnLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/connections/send/${params.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Connection request sent!');
      setConnStatus('pending_sent'); setConnRequestId(data.request?.id ?? null);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to send request'); }
    finally { setConnLoading(false); }
  };

  const handleCancel = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/cancel/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request cancelled'); setConnStatus('not_connected'); setConnRequestId(null);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel'); }
    finally { setConnLoading(false); }
  };

  const handleAccept = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/accept/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Connected!'); setConnStatus('connected'); setConnRequestId(null);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept'); }
    finally { setConnLoading(false); }
  };

  const handleDecline = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/reject/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request declined'); setConnStatus('not_connected'); setConnRequestId(null);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline'); }
    finally { setConnLoading(false); }
  };

  const handleMessage = async () => {
    const tok = Cookies.get('token');
    if (!tok) { toast.error('Please log in to send messages'); router.push('/login'); return; }
    if (!alumni) return; setStartingChat(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/create-conversation`, { targetUserId: alumni.id }, { headers: { Authorization: `Bearer ${tok}` } });
      router.push(`/chat?conv=${data.data?.id}`);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'Could not start conversation'); }
    finally { setStartingChat(false); }
  };

  const handleDisconnect = async () => {
    if (!token) return; setConnLoading(true);
    try {
      await axios.delete(`${API_URL}/api/connections/disconnect/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Disconnected successfully');
      setConnStatus('not_connected'); setConnRequestId(null); setShowDisconnectModal(false);
    } catch (err: unknown) { toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to disconnect'); }
    finally { setConnLoading(false); }
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  // ── Shared font link (no @import = no hydration error) ────────────────────
  const FontLink = () => (
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" />
  );

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <FontLink />
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <div className="max-w-5xl mx-auto animate-pulse">
            <div className="h-5 w-14 bg-gray-200 rounded mb-5" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-44 sm:h-52" style={{ background: 'linear-gradient(135deg,#4a1a1a,#3a3a9f,#5ac8e8)', opacity: 0.35 }} />
              <div className="px-5 sm:px-8 pb-8">
                <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 border-4 border-white shrink-0" />
                  <div className="flex-1 space-y-2 pt-4 sm:pt-14 text-center sm:text-left">
                    <div className="h-8 bg-gray-200 rounded w-44 mx-auto sm:mx-0" />
                    <div className="h-4 bg-gray-200 rounded w-28 mx-auto sm:mx-0" />
                  </div>
                </div>
                <div className="h-14 bg-gray-100 rounded-xl mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="h-52 bg-gray-100 rounded-2xl" />
                  <div className="lg:col-span-2 h-52 bg-gray-100 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (!alumni) {
    return (
      <>
        <FontLink />
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm text-center border border-gray-100 max-w-md w-full">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <UserX className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="xav-name text-2xl mb-2">Profile Not Found</h2>
            <p className="text-gray-500 mb-7 text-sm leading-relaxed">The profile you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={fetchAlumniProfile} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm">Try Again</button>
              <Link href="/directory" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">Back to Directory</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const profile = alumni.alumniProfile;
  const skillsArray = Array.isArray(profile.skills) ? profile.skills : [];
  const photoSrc = getImageUrl(profile.photoUrl);

  const tabs = [
    { id: 'about',      label: 'About',      icon: FileText  },
    { id: 'experience', label: 'Experience',  icon: Briefcase },
    { id: 'contact',    label: 'Contact',     icon: Mail      },
  ];

  const pillClasses = [
    'bg-blue-50 text-blue-700 border-blue-100',
    'bg-indigo-50 text-indigo-700 border-indigo-100',
    'bg-violet-50 text-violet-700 border-violet-100',
    'bg-emerald-50 text-emerald-700 border-emerald-100',
  ];

  const namePills = [
    { icon: GraduationCap, label: alumni.role === 'ALUMNI' ? 'Alumni' : 'Student' },
    { icon: Building2,     label: profile.department },
    { icon: Calendar,      label: `Class of ${profile.batchYear}` },
    ...(profile.location ? [{ icon: MapPin, label: profile.location }] : []),
  ];

  const statsItems = [
    ...(profile.company  ? [{ icon: Briefcase,  label: 'Company',    value: profile.company,           iconBg: 'bg-blue-50',   iconColor: 'text-blue-500'   }] : []),
    ...(profile.jobTitle ? [{ icon: BadgeCheck,  label: 'Role',       value: profile.jobTitle,          iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' }] : []),
    { icon: Building2,    label: 'Department', value: profile.department,        iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
    { icon: CalendarDays, label: 'Batch',      value: String(profile.batchYear), iconBg: 'bg-amber-50',  iconColor: 'text-amber-500'  },
    ...(connStatus === 'connected' ? [{ icon: UserCheck, label: 'Status', value: 'Connected', iconBg: 'bg-green-50', iconColor: 'text-green-500' }] : []),
  ];

  // ── Avatar inner content (reused mobile + desktop) ────────────────────────
  const AvatarInner = ({ size }: { size: number }) =>
    photoSrc ? (
      <Image src={photoSrc} alt={`${alumni.name}'s photo`} width={size} height={size}
        onClick={() => setPhotoModal(true)}
        className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
        priority
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center font-bold"
        style={{ background: 'linear-gradient(135deg,#1e3a8a,#3b82f6)', color: 'white', fontFamily: 'Cormorant Garamond, serif', fontSize: size * 0.37 }}>
        {alumni.name.charAt(0).toUpperCase()}
      </div>
    );

  // ── Buttons ───────────────────────────────────────────────────────────────
  const btnPrimary  = "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md disabled:opacity-60";
  const btnOutline  = "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-white border text-gray-700 disabled:opacity-60";

  const renderActions = () => {
    if (isOwnProfile) return (
      <Link href="/dashboard/profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all">
        <Edit3 className="w-4 h-4" />Edit Profile
      </Link>
    );
    if (!token || !currentUser) return (
      <Link href="/login" className={btnPrimary}>Log in to Connect</Link>
    );
    if (connStatus === 'idle') return <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />;
    if (connStatus === 'connected') return (
      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDisconnectModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all group bg-green-50 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
          <UserCheck className="w-4 h-4 group-hover:hidden" />
          <UserX className="w-4 h-4 hidden group-hover:inline-flex" />
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
        <button type="button" onClick={handleMessage} disabled={startingChat} className={btnPrimary}>
          <MessageSquare className="w-4 h-4" />{startingChat ? 'Opening...' : 'Message'}
        </button>
      </div>
    );
    if (connStatus === 'pending_sent') return (
      <button type="button" onClick={handleCancel} disabled={connLoading}
        className={`${btnOutline} border-amber-200 bg-amber-50 text-amber-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 group`}>
        <Clock className="w-4 h-4 group-hover:hidden" /><X className="w-4 h-4 hidden group-hover:block" />
        {connLoading ? 'Cancelling...' : 'Pending...'}
      </button>
    );
    if (connStatus === 'pending_received') return (
      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
        <button type="button" onClick={handleAccept} disabled={connLoading} className={btnPrimary}><Check className="w-4 h-4" />Accept</button>
        <button type="button" onClick={handleDecline} disabled={connLoading} className={`${btnOutline} border-red-200 text-red-500 hover:bg-red-50`}><X className="w-4 h-4" />Decline</button>
      </div>
    );
    return (
      <button type="button" onClick={handleConnect} disabled={connLoading} className={btnPrimary}>
        <UserPlus className="w-4 h-4" />{connLoading ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <FontLink />
      {/* suppressHydrationWarning because style content is static string, not user data */}
      <style suppressHydrationWarning>{XAV_STYLES}</style>

      <div className="min-h-screen bg-gray-50 selection:bg-blue-100 selection:text-blue-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Back button */}
          <button type="button" onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors mb-5 text-sm font-medium group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Back
          </button>

          {/* ══ MAIN CARD ══ */}
          <div className="xav-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* BANNER */}
            <div className="xav-banner-shimmer relative overflow-hidden"
              style={{ height: '180px', background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}>
              <div className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)', backgroundSize: '22px 22px' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
                {[72, 48, 24].map((s, i) => (
                  <div key={i} style={{ width: s, height: s, border: '1.5px solid white', borderRadius: '50%', position: 'absolute', top: (72 - s) / 2, right: (72 - s) / 2 }} />
                ))}
              </div>
            </div>

            {/* PROFILE HEADER */}
            <div className="px-4 sm:px-8 lg:px-10 pb-6 sm:pb-8">

              {/* ── MOBILE: stacked + centered ── */}
              <div className="sm:hidden">
                <div className="xav-avatar-mobile-wrap">
                  <div className="xav-avatar w-24 h-24 rounded-full overflow-hidden bg-white"
                    style={{ border: '3px solid white', boxShadow: '0 4px 20px rgba(0,0,0,0.22)' }}>
                    <AvatarInner size={96} />
                  </div>
                </div>
                <div className="mt-4 text-center mb-4">
                  <h1 className="xav-name text-[1.8rem] mb-2.5">{alumni.name}</h1>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {namePills.map(({ icon: Icon, label }, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${pillClasses[i] ?? pillClasses[0]}`}>
                        <Icon className="w-3 h-3" />{label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mb-2">{renderActions()}</div>
              </div>

              {/* ── DESKTOP: two-row layout (avatar+actions → name+pills) ── */}
              <div className="hidden sm:block">
                {/* Row A: avatar (negative margin) + action buttons */}
                <div className="flex items-end justify-between -mt-[4.5rem] mb-3">
                  <div className="relative z-10 shrink-0 xav-avatar w-32 h-32 rounded-full overflow-hidden bg-white"
                    style={{ border: '4px solid white', boxShadow: '0 6px 28px rgba(0,0,0,0.2)' }}>
                    <AvatarInner size={128} />
                  </div>
                  <div className="shrink-0 pb-1">{renderActions()}</div>
                </div>
                {/* Row B: name + pills — fully below banner, never overlaps */}
                <div className="mb-6">
                  <h1 className="xav-name text-4xl mb-2.5">{alumni.name}</h1>
                  <div className="flex flex-wrap gap-2">
                    {namePills.map(({ icon: Icon, label }, i) => (
                      <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${pillClasses[i] ?? pillClasses[0]}`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── STATS BAR ── */}
              <div className="xav-1 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-0 py-3 px-3 sm:px-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                {statsItems.map(({ icon: Icon, label, value, iconBg, iconColor }, i) => (
                  <div key={i} className={`xav-stat flex items-center gap-2.5 sm:flex-1 sm:basis-0 sm:min-w-[100px] sm:px-3 sm:py-1 ${i !== 0 ? 'sm:border-l sm:border-gray-200' : ''}`}>
                    <div className={`w-8 h-8 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center shrink-0`}><Icon className="w-4 h-4" /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5 whitespace-nowrap">{label}</p>
                      <p className={`text-sm font-bold truncate ${label === 'Status' ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── TABS ── */}
              <div className="xav-2 flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 sm:mb-8 w-full sm:max-w-xs">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 px-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{tab.label}
                    </button>
                  );
                })}
              </div>

              {/* ── CONTENT GRID ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-8">

                {/* Sidebar */}
                <div className="lg:col-span-1 order-2 lg:order-1 space-y-4 xav-3">
                  <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overview</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <ul className="space-y-4">
                      {[
                        { icon: Hash,      label: 'Roll Number', value: profile.rollNo    || 'N/A',            iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'    },
                        { icon: Building2, label: 'Department',  value: profile.department || 'N/A',           iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-500'  },
                        { icon: MapPin,    label: 'Location',    value: profile.location   || 'Not specified',  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
                        { icon: Calendar,  label: 'Joined',      value: new Date(alumni.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
                      ].map(({ icon: Icon, label, value, iconBg, iconColor }, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`w-8 h-8 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}><Icon className="w-3.5 h-3.5" /></div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="font-semibold text-gray-800 text-sm mt-0.5 break-words">{value}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {connStatus === 'connected' && (
                    <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Actions</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <button type="button" onClick={handleMessage} disabled={startingChat}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60">
                        <MessageSquare className="w-4 h-4" />{startingChat ? 'Opening...' : 'Send Message'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Main content area */}
                <div className="lg:col-span-2 order-1 lg:order-2 xav-4">

                  {/* ABOUT TAB */}
                  <div className={activeTab === 'about' ? 'block space-y-6' : 'hidden'}>
                    <section>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-6 h-0.5 bg-blue-500 rounded-full xav-accent-line" />
                        <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Bio</h2>
                      </div>
                      {profile.bio ? (
                        <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5" style={{ borderLeft: '4px solid #60a5fa' }}>
                          <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No bio added yet.</p>
                        </div>
                      )}
                    </section>
                    <section>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-6 h-0.5 bg-indigo-500 rounded-full xav-accent-line" />
                        <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Skills &amp; Expertise</h2>
                      </div>
                      {skillsArray.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsArray.map((skill: string, i: number) => (
                            <span key={i} className="xav-skill px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 cursor-default">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No skills added yet.</p>
                        </div>
                      )}
                    </section>
                    <section>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-6 h-0.5 bg-emerald-500 rounded-full xav-accent-line" />
                        <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Current Position</h2>
                      </div>
                      {profile.company || profile.jobTitle ? (
                        <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 group">
                          <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-200">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              {profile.jobTitle || 'Role not specified'}
                            </p>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">{profile.company || 'Organization not specified'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No position added yet.</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* EXPERIENCE TAB */}
                  <div className={activeTab === 'experience' ? 'block' : 'hidden'}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-6 h-0.5 bg-blue-500 rounded-full xav-accent-line" />
                      <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Experience</h2>
                    </div>
                    {profile.company || profile.jobTitle ? (
                      <div className="relative pl-7 sm:pl-8" style={{ borderLeft: '2px solid #e0e7ff' }}>
                        <div className="relative mb-5">
                          <div className="absolute -left-[calc(1.75rem+5px)] sm:-left-[calc(2rem+5px)] w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm" style={{ top: '1.4rem' }} />
                          <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><Building2 className="w-5 h-5" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{profile.jobTitle || 'Role Not Specified'}</p>
                                <p className="text-gray-500 font-medium mt-0.5 text-sm">{profile.company || 'Organization Not Specified'}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border border-green-100">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Present
                                  </span>
                                  {profile.location && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
                                      <MapPin className="w-3 h-3" />{profile.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[calc(1.75rem+5px)] sm:-left-[calc(2rem+5px)] w-3 h-3 bg-indigo-300 rounded-full border-2 border-white shadow-sm" style={{ top: '1.4rem' }} />
                          <div className="xav-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-start gap-4">
                              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0"><GraduationCap className="w-5 h-5" /></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-base leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{profile.department}</p>
                                <p className="text-gray-500 font-medium mt-0.5 text-sm">St. Xavier&apos;s College, Patna</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold border border-indigo-100">
                                    <GraduationCap className="w-3 h-3" />Class of {profile.batchYear}
                                  </span>
                                  {profile.rollNo && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
                                      <Hash className="w-3 h-3" />{profile.rollNo}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><Wrench className="w-6 h-6 text-gray-300" /></div>
                        <p className="text-gray-500 font-medium text-sm">No experience details added yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Check back later for updates.</p>
                      </div>
                    )}
                  </div>

                  {/* CONTACT TAB */}
                  <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-6 h-0.5 bg-violet-500 rounded-full xav-accent-line" />
                      <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Get in Touch</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {profile.contactPublic ? (
                        <a href={`mailto:${alumni.email}`} className="xav-contact flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3"><Mail className="w-5 h-5" /></div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                          <span className="font-bold text-gray-800 text-sm truncate">{alumni.email}</span>
                        </a>
                      ) : (
                        <div className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
                          <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-3"><Mail className="w-5 h-5" /></div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                          <span className="font-bold text-gray-400 text-sm">Contact is private</span>
                        </div>
                      )}
                      {profile.linkedinUrl ? (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="xav-contact flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-3"><Link2 className="w-5 h-5" /></div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                          <span className="font-bold text-gray-800 text-sm">View Profile →</span>
                        </a>
                      ) : (
                        <div className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 opacity-50 cursor-not-allowed">
                          <div className="w-10 h-10 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-3"><Link2 className="w-5 h-5" /></div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                          <span className="font-bold text-gray-400 text-sm">Not provided</span>
                        </div>
                      )}
                      <div className="xav-contact flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm sm:col-span-2">
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-3"><CalendarDays className="w-5 h-5" /></div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</span>
                        <span className="font-bold text-gray-800 text-sm">
                          {new Date(alumni.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DISCONNECT MODAL */}
        {showDisconnectModal && (
          <div className="xav-modal-backdrop" onMouseDown={() => setShowDisconnectModal(false)}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-8" onMouseDown={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5"><UserX className="w-7 h-7 text-red-500" /></div>
              <h3 className="xav-name text-xl text-center mb-2">Disconnect?</h3>
              <p className="text-gray-500 text-center text-sm leading-relaxed mb-7">You will no longer be able to send messages to this person.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDisconnectModal(false)} disabled={connLoading}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm">Stay Connected</button>
                <button type="button" onClick={handleDisconnect} disabled={connLoading}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
                  {connLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO LIGHTBOX */}
        {photoModal && profile.photoUrl && (
          <div className="xav-modal-backdrop" onMouseDown={() => setPhotoModal(false)}>
            <button type="button" onClick={() => setPhotoModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <img src={getImageUrl(profile.photoUrl) ?? ''} alt={alumni.name}
              onMouseDown={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl ring-2 ring-white/20" />
          </div>
        )}
      </div>
    </>
  );
}