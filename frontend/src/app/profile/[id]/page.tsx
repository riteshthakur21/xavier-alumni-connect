'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  MapPin,
  Mail,
  Linkedin,
  Briefcase,
  GraduationCap,
  Building2,
  Hash,
  Edit3,
  ChevronLeft,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
  Check,
  X,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ConnStatus = 'idle' | 'self' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

// ── Only animations injected — no @import to avoid hydration mismatch ─────────
const ANIM_STYLES = `
  @keyframes prof-shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position:  700px 0; }
  }
  .prof-banner-shimmer::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.09) 50%, transparent 70%);
    background-size: 700px 100%;
    animation: prof-shimmer 5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes prof-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .prof-fade { animation: prof-fadeUp 0.45s ease both; }

  /* Mobile avatar pull-up */
  .prof-avatar-wrap {
    position: relative;
    z-index: 20;
    margin-top: -52px;
    display: flex;
    justify-content: center;
  }

  /* Modal backdrop */
  .prof-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(0,0,0,0.52);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
`;

export default function App() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connRequestId, setConnRequestId] = useState<string | null>(null);
  const [connLoading, setConnLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

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

  useEffect(() => { fetchConnStatus(); }, [fetchConnStatus]);

  const handleConnect = async () => {
    if (!token) { toast.error('Please log in first'); router.push('/login'); return; }
    setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/send/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Connection request sent!'); setConnStatus('pending_sent');
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to send request');
    } finally { setConnLoading(false); }
  };

  const handleCancel = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/cancel/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request cancelled'); setConnStatus('not_connected'); setConnRequestId(null);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel');
    } finally { setConnLoading(false); }
  };

  const handleAccept = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/accept/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Connected!'); setConnStatus('connected'); setConnRequestId(null);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept');
    } finally { setConnLoading(false); }
  };

  const handleDecline = async () => {
    if (!connRequestId) return; setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/reject/${connRequestId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Request declined'); setConnStatus('not_connected'); setConnRequestId(null);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline');
    } finally { setConnLoading(false); }
  };

  const handleMessage = async () => {
    if (!token) { toast.error('Please log in first'); router.push('/login'); return; }
    setStartingChat(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/chat/create-conversation`, { targetUserId: id }, { headers: { Authorization: `Bearer ${token}` } });
      router.push(`/chat?conv=${data.data?.id}`);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : 'Could not start conversation');
    } finally { setStartingChat(false); }
  };

  const handleDisconnect = async () => {
    if (!token) return; setConnLoading(true);
    try {
      await axios.delete(`${API_URL}/api/connections/disconnect/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Disconnected successfully');
      setConnStatus('not_connected'); setConnRequestId(null); setShowDisconnectModal(false);
    } catch (err: unknown) {
      toast.error(axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to disconnect');
    } finally { setConnLoading(false); }
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex justify-center bg-slate-50">
        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-lg border border-slate-200/60 overflow-hidden animate-pulse">
          <div className="h-48 bg-slate-200" />
          <div className="px-6 sm:px-10 pb-10">
            {/* FIX: flex + items-center mobile pe, sm pe left align */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-slate-300 border-4 border-white -mt-12 sm:-mt-18 mb-6" />
              <div className="h-8 bg-slate-200 w-40 sm:w-1/3 rounded-lg mb-4" />
              <div className="h-4 bg-slate-200 w-28 sm:w-1/4 rounded-lg mb-8" />
            </div>
            <div className="h-10 bg-slate-100 w-full rounded-2xl mb-8" />
            <div className="h-32 bg-slate-100 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">User not found</h2>
          <p className="text-slate-500 mb-8">The profile you are looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/directory" className="inline-flex items-center justify-center w-full py-3 px-6 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-2" />Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const profile = user.alumniProfile || {};
  const skillsArray = Array.isArray(profile.skills)
    ? profile.skills
    : (profile.skills ? JSON.parse(profile.skills) : []);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ];

  // ── Action buttons ────────────────────────────────────────────────────────
  const renderActions = () => {
    if (isOwnProfile) return (
      <Link href="/dashboard/profile" className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center">
        <Edit3 className="w-4 h-4" />Edit Profile
      </Link>
    );
    if (connStatus === 'idle') return <div className="h-11 w-32 bg-slate-100 rounded-xl animate-pulse" />;

    if (connStatus === 'connected') return (
      <div className="flex flex-wrap gap-2 justify-center sm:justify-end w-full sm:w-auto">
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDisconnectModal(true); }}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group">
          <UserCheck className="w-4 h-4 group-hover:hidden" />
          <UserX className="w-4 h-4 hidden group-hover:inline" />
          <span className="group-hover:hidden">Connected</span>
          <span className="hidden group-hover:inline">Disconnect</span>
        </button>
        <button type="button" onClick={handleMessage} disabled={startingChat}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-60">
          <MessageSquare className="w-4 h-4" />{startingChat ? 'Opening...' : 'Message'}
        </button>
      </div>
    );

    if (connStatus === 'pending_sent') return (
      <button type="button" onClick={handleCancel} disabled={connLoading}
        className="flex items-center gap-2 px-6 py-3 bg-amber-50 hover:bg-red-50 text-amber-700 hover:text-red-600 border border-amber-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 w-full sm:w-auto justify-center group">
        <Clock className="w-4 h-4 group-hover:hidden" /><X className="w-4 h-4 hidden group-hover:inline" />
        {connLoading ? 'Cancelling...' : 'Request Sent'}
      </button>
    );

    if (connStatus === 'pending_received') return (
      <div className="flex gap-2 w-full sm:w-auto justify-center">
        <button type="button" onClick={handleAccept} disabled={connLoading}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md disabled:opacity-60 transition-all">
          <Check className="w-4 h-4" />Accept
        </button>
        <button type="button" onClick={handleDecline} disabled={connLoading}
          className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl font-semibold text-sm disabled:opacity-60 transition-all">
          <X className="w-4 h-4" />Decline
        </button>
      </div>
    );

    return (
      <button type="button" onClick={handleConnect} disabled={connLoading}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center disabled:opacity-60">
        <UserPlus className="w-4 h-4" />{connLoading ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Animations only — no @import */}
      <style suppressHydrationWarning>{ANIM_STYLES}</style>

      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900 bg-slate-50">

        {/* ── BACK BUTTON ── */}
        <div className="max-w-5xl mx-auto mb-4">
          <button type="button" onClick={() => window.history.back()}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Back
          </button>
        </div>

        <div className="prof-fade max-w-5xl mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-lg border border-slate-200/60 overflow-hidden relative">

          {/* ── BANNER with shimmer animation ── */}
          <div
            className="prof-banner-shimmer relative overflow-hidden h-40 sm:h-56 lg:h-64 w-full"
            style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {/* decorative rings */}
            <div className="absolute top-4 right-4 opacity-[0.15] pointer-events-none">
              {[72, 48, 24].map((s, i) => (
                <div key={i} style={{ width: s, height: s, border: '1.5px solid white', borderRadius: '50%', position: 'absolute', top: (72 - s) / 2, right: (72 - s) / 2 }} />
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-10 lg:px-12 pb-10 sm:pb-12">

            {/* ── MOBILE HEADER (< sm) ── */}
            <div className="sm:hidden">
              {/* Avatar pull-up */}
              <div className="prof-avatar-wrap">
                <div className="w-28 h-28 rounded-full border-[5px] border-white bg-slate-100 overflow-hidden shadow-lg">
                  {profile.photoUrl ? (
                    <img src={getImageUrl(profile.photoUrl) ?? ''} alt={user.name}
                      onClick={() => setPhotoModal(true)}
                      className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              {/* Name + role */}
              <div className="mt-3 text-center mb-4">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">{user.name}</h1>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />{user.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                  </span>
                  {profile.batchYear && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                      Class of {profile.batchYear}
                    </span>
                  )}
                  {profile.location && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                      <MapPin className="w-3 h-3" />{profile.location}
                    </span>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-center mb-2">{renderActions()}</div>
            </div>

            {/* ── DESKTOP HEADER (sm+) — original structure ── */}
            <div className="hidden sm:flex sm:flex-row items-center sm:items-start -mt-16 sm:-mt-24 mb-10 sm:mb-12 gap-5 sm:gap-6 lg:gap-8 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative z-10 group shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full border-[6px] border-white bg-slate-100 overflow-hidden shadow-lg shadow-slate-300/50">
                  {profile.photoUrl ? (
                    <img src={getImageUrl(profile.photoUrl) ?? ''} alt={user.name}
                      onClick={() => setPhotoModal(true)}
                      className="w-full h-full object-cover group-hover:scale-105 cursor-pointer hover:brightness-90 transition-all duration-200" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name + role */}
              <div className="flex-1 pt-2 sm:pt-24 w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">{user.name}</h1>
                <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                    <GraduationCap className="w-4 h-4" />{user.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                  </span>
                  {profile.batchYear && (
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <span className="hidden sm:inline">•</span>Class of {profile.batchYear}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:pt-28 mt-1 sm:mt-0">
                {renderActions()}
              </div>
            </div>

            {/* ── TABS ── */}
            <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200/50 max-w-sm sm:max-w-lg">
              {tabs.map((tab) => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[80px] py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── CONTENT GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

              {/* SIDEBAR */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Overview</h3>
                  <ul className="space-y-5 sm:space-y-6">
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Roll Number</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.rollNo || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Department</p>
                        <p className="font-semibold text-slate-800 mt-0.5 leading-tight">{profile.department || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase">Location</p>
                        <p className="font-semibold text-slate-800 mt-0.5">{profile.location || 'Not specified'}</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="lg:col-span-2 order-1 lg:order-2">

                {/* About */}
                <div className={activeTab === 'about' ? 'block' : 'hidden'}>
                  <div className="space-y-8 sm:space-y-10">
                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-8 h-1 bg-blue-600 rounded-full" />Bio
                      </h2>
                      <p className="text-slate-600 leading-relaxed font-medium bg-white border border-slate-100 p-5 sm:p-6 rounded-3xl shadow-sm">
                        {profile.bio || "This user hasn't added a bio yet."}
                      </p>
                    </section>
                    {skillsArray.length > 0 && (
                      <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4 sm:mb-5 flex items-center gap-2">
                          <span className="w-8 h-1 bg-indigo-600 rounded-full" />Skills &amp; Expertise
                        </h2>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                          {skillsArray.map((skill: string, i: number) => (
                            <span key={i} className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className={activeTab === 'experience' ? 'block' : 'hidden'}>
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="w-8 h-1 bg-emerald-600 rounded-full" />Current Experience
                    </h2>
                    <div className="group p-5 sm:p-6 lg:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start sm:items-center gap-5 sm:gap-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {profile.jobTitle || 'Role Not Specified'}
                        </h3>
                        <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
                          {profile.company || 'Organization Not Specified'}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Contact */}
                <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <span className="w-8 h-1 bg-violet-600 rounded-full" />Get in Touch
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <a href={`mailto:${user.email}`}
                        className="group flex flex-col p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Mail className="w-6 h-6" />
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="font-bold text-slate-800 truncate text-sm sm:text-base">{user.email}</span>
                      </a>
                      {profile.linkedinUrl ? (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="group flex flex-col p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Linkedin className="w-6 h-6" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</span>
                          <span className="font-bold text-slate-800 truncate">View Profile →</span>
                        </a>
                      ) : (
                        <div className="flex flex-col p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-100 opacity-60 grayscale cursor-not-allowed">
                          <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                            <Linkedin className="w-6 h-6" />
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</span>
                          <span className="font-bold text-slate-500">Not provided</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── DISCONNECT MODAL ── */}
        {showDisconnectModal && (
          <div className="prof-modal-backdrop" onMouseDown={() => setShowDisconnectModal(false)}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" onMouseDown={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <UserX className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Disconnect from this user?</h3>
              <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">If you disconnect, you will no longer be able to send messages.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowDisconnectModal(false)} disabled={connLoading}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
                  Stay Connected
                </button>
                <button type="button" onClick={handleDisconnect} disabled={connLoading}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
                  {connLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PHOTO LIGHTBOX ── */}
        {photoModal && profile.photoUrl && (
          <div className="prof-modal-backdrop" onMouseDown={() => setPhotoModal(false)}>
            <button type="button" onClick={() => setPhotoModal(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <img src={getImageUrl(profile.photoUrl) ?? ''} alt={user.name}
              onMouseDown={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl ring-4 ring-white/20" />
          </div>
        )}

      </div>
    </>
  );
}