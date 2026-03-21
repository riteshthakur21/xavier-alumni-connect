

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
  Linkedin,
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

  useEffect(() => {
    if (params.id) fetchAlumniProfile();
  }, [params.id]);

  const fetchAlumniProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/alumni/${params.id}`);
      setAlumni(response.data.alumni);
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

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
    if (!token) { toast.error('Please log in first'); router.push('/login'); return; }
    setConnLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/connections/send/${params.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Connection request sent!');
      setConnStatus('pending_sent');
      setConnRequestId(data.request?.id ?? null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to send request';
      toast.error(msg || 'Failed to send request');
    } finally {
      setConnLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/cancel/${connRequestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request cancelled');
      setConnStatus('not_connected');
      setConnRequestId(null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel';
      toast.error(msg || 'Failed to cancel');
    } finally {
      setConnLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/accept/${connRequestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Connected!');
      setConnStatus('connected');
      setConnRequestId(null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept';
      toast.error(msg || 'Failed to accept');
    } finally {
      setConnLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!connRequestId) return;
    setConnLoading(true);
    try {
      await axios.post(`${API_URL}/api/connections/reject/${connRequestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request declined');
      setConnStatus('not_connected');
      setConnRequestId(null);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline';
      toast.error(msg || 'Failed to decline');
    } finally {
      setConnLoading(false);
    }
  };

  const handleMessage = async () => {
    const token = Cookies.get('token');
    if (!token) { toast.error('Please log in to send messages'); router.push('/login'); return; }
    if (!alumni) return;
    setStartingChat(true);
    try {
      const { data } = await axios.post(
        `${API_URL}/api/chat/create-conversation`,
        { targetUserId: alumni.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/chat?conv=${data.data?.id}`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : 'Could not start conversation';
      toast.error(msg);
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
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to disconnect';
      toast.error(msg || 'Failed to disconnect');
    } finally {
      setConnLoading(false);
    }
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-5xl animate-pulse">
          <div className="h-48 sm:h-56 bg-gray-200 rounded-t-2xl" />
          <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 px-6 sm:px-10 pb-10">
            <div className="flex items-end gap-5 -mt-16">
              <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shrink-0" />
              <div className="flex-1 pt-20 space-y-3">
                <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
                <div className="h-4 bg-gray-200 rounded-lg w-1/4" />
              </div>
            </div>
            <div className="mt-8 h-12 bg-gray-100 rounded-2xl" />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-48 bg-gray-100 rounded-2xl" />
              <div className="lg:col-span-2 h-48 bg-gray-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserX className="w-9 h-9 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Profile Not Found</h2>
          <p className="text-gray-500 mb-8">
            The profile you are looking for doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchAlumniProfile} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm">
              Try Again
            </button>
            <Link href="/directory" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">
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

  const tabs = [
    { id: 'about',      label: 'About',      icon: FileText },
    { id: 'experience', label: 'Experience',  icon: Briefcase },
    { id: 'contact',    label: 'Contact',     icon: Mail },
  ];

  // ── Action buttons renderer ──────────────────────────────────────────────
  const renderActions = () => {
    if (isOwnProfile) {
      return (
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Link>
      );
    }

    if (!token || !currentUser) {
      return (
        <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md">
          Log in to Connect
        </Link>
      );
    }

    if (connStatus === 'idle') {
      return <div className="h-10 w-28 bg-gray-100 rounded-xl animate-pulse" />;
    }

    if (connStatus === 'connected') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDisconnectModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
          >
            <UserCheck className="w-4 h-4 group-hover:hidden" />
            <UserX className="w-4 h-4 hidden group-hover:block" />
            <span className="group-hover:hidden">Connected</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </button>
          <button
            onClick={handleMessage}
            disabled={startingChat}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
          >
            <MessageSquare className="w-4 h-4" />
            {startingChat ? 'Opening...' : 'Message'}
          </button>
        </div>
      );
    }

    if (connStatus === 'pending_sent') {
      return (
        <button
          onClick={handleCancel}
          disabled={connLoading}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-50 hover:bg-red-50 text-amber-700 hover:text-red-600 border border-amber-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 group"
        >
          <Clock className="w-4 h-4 group-hover:hidden" />
          <X className="w-4 h-4 hidden group-hover:block" />
          {connLoading ? 'Cancelling...' : 'Pending...'}
        </button>
      );
    }

    if (connStatus === 'pending_received') {
      return (
        <div className="flex items-center gap-2">
          <button onClick={handleAccept} disabled={connLoading} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60">
            <Check className="w-4 h-4" />
            Accept
          </button>
          <button onClick={handleDecline} disabled={connLoading} className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-60">
            <X className="w-4 h-4" />
            Decline
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={connLoading}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
      >
        <UserPlus className="w-4 h-4" />
        {connLoading ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors mb-5 text-sm font-medium group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Gradient banner */}
          <div
            className="relative h-40 sm:h-52 lg:h-60 w-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10">

            {/* Profile header */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-14 sm:-mt-20 mb-6 gap-3 sm:gap-5 text-center sm:text-left">

              {/* Avatar */}
              <div className="relative z-10 shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                  {photoSrc ? (
                    <Image
                      src={photoSrc}
                      alt={`${alumni.name}'s photo`}
                      width={144}
                      height={144}
                      onClick={() => setPhotoModal(true)}
                      className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition-all duration-200"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-500 text-4xl sm:text-5xl font-bold">
                      {alumni.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name + pills */}
              <div className="flex-1 min-w-0 mt-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2 truncate">
                  {alumni.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {alumni.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    {profile.department}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Class of {profile.batchYear}
                  </span>
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end sm:pb-1">
                {renderActions()}
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-0 sm:divide-x sm:divide-gray-200 py-4 px-4 sm:px-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              {profile.company && (
                <div className="flex items-center gap-2.5 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Company</p>
                    <p className="text-sm font-bold text-gray-800">{profile.company}</p>
                  </div>
                </div>
              )}
              {profile.jobTitle && (
                <div className="flex items-center gap-2.5 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Role</p>
                    <p className="text-sm font-bold text-gray-800">{profile.jobTitle}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Department</p>
                  <p className="text-sm font-bold text-gray-800">{profile.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Batch</p>
                  <p className="text-sm font-bold text-gray-800">{profile.batchYear}</p>
                </div>
              </div>
              {connStatus === 'connected' && (
                <div className="flex items-center gap-2.5 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Status</p>
                    <p className="text-sm font-bold text-green-600">Connected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl mb-8 border border-gray-200/50 max-w-md overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1 space-y-5">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Overview</h3>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Roll Number</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.rollNo || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Department</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.department || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Location</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.location || 'Not specified'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Joined</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">
                          {new Date(alumni.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Message card — only when connected */}
                {connStatus === 'connected' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                    <button
                      onClick={handleMessage}
                      disabled={startingChat}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {startingChat ? 'Opening...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="lg:col-span-2 order-1 lg:order-2">

                {/* ── About Tab ── */}
                <div className={activeTab === 'about' ? 'block' : 'hidden'}>
                  <div className="space-y-8">

                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-blue-600 rounded-full" />
                        Bio
                      </h2>
                      {profile.bio ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 p-6 hover:shadow-md transition-all duration-200">
                          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No bio added yet.</p>
                        </div>
                      )}
                    </section>

                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-indigo-600 rounded-full" />
                        Skills &amp; Expertise
                      </h2>
                      {skillsArray.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {skillsArray.map((skill: string, i: number) => (
                            <span
                              key={i}
                              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-100 transition-colors cursor-default border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No skills added yet.</p>
                        </div>
                      )}
                    </section>

                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-emerald-600 rounded-full" />
                        Current Position
                      </h2>
                      {profile.company || profile.jobTitle ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {profile.jobTitle || 'Role not specified'}
                            </p>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                              {profile.company || 'Organization not specified'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No position added yet.</p>
                        </div>
                      )}
                    </section>
                  </div>
                </div>

                {/* ── Experience Tab ── */}
                <div className={activeTab === 'experience' ? 'block' : 'hidden'}>
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-7 h-0.5 bg-emerald-600 rounded-full" />
                    Experience
                  </h2>

                  {profile.company || profile.jobTitle ? (
                    <div className="relative pl-8 border-l-2 border-blue-200">

                      {/* Current role */}
                      <div className="relative mb-8">
                        <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{profile.jobTitle || 'Role Not Specified'}</p>
                              <p className="text-gray-600 font-medium mt-0.5">{profile.company || 'Organization Not Specified'}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                  Present
                                </span>
                                {profile.location && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                    <MapPin className="w-3 h-3" />
                                    {profile.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="relative">
                        <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 bg-indigo-400 rounded-full border-2 border-white shadow-sm" />
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                              <GraduationCap className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{profile.department}</p>
                              <p className="text-gray-600 font-medium mt-0.5">St. Xavier's College, Patna</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                                  <GraduationCap className="w-3 h-3" />
                                  Class of {profile.batchYear}
                                </span>
                                {profile.rollNo && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                    <Hash className="w-3 h-3" />
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
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No experience details added yet.</p>
                      <p className="text-gray-400 text-sm mt-1">Check back later for updates.</p>
                    </div>
                  )}
                </div>

                {/* ── Contact Tab ── */}
                <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-7 h-0.5 bg-violet-600 rounded-full" />
                    Get in Touch
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">

                    {/* Email */}
                    {profile.contactPublic ? (
                      <a
                        href={`mailto:${alumni.email}`}
                        className="group flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="font-bold text-gray-800 truncate text-sm">{alumni.email}</span>
                      </a>
                    ) : (
                      <div className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-60 cursor-not-allowed">
                        <div className="w-11 h-11 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-4">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="font-bold text-gray-400 text-sm">Contact is private</span>
                      </div>
                    )}

                    {/* LinkedIn */}
                    {profile.linkedinUrl ? (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-gray-800 text-sm">View Profile →</span>
                      </a>
                    ) : (
                      <div className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-60 cursor-not-allowed">
                        <div className="w-11 h-11 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-4">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-gray-400 text-sm">Not provided</span>
                      </div>
                    )}

                    {/* Member since */}
                    <div className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 sm:col-span-2">
                      <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</span>
                      <span className="font-bold text-gray-800 text-sm">
                        {new Date(alumni.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Disconnect Modal ─────────────────────────────────────────────────── */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDisconnectModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <UserX className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Disconnect from this user?</h3>
            <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
              If you disconnect, you will no longer be able to send messages.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDisconnectModal(false)} disabled={connLoading} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
                Stay Connected
              </button>
              <button onClick={handleDisconnect} disabled={connLoading} className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60">
                {connLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox ───────────────────────────────────────────────────── */}
      {photoModal && profile.photoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" onClick={() => setPhotoModal(false)}>
          <button onClick={() => setPhotoModal(false)} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img
            src={getImageUrl(profile.photoUrl) ?? ''}
            alt={alumni.name}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl ring-4 ring-white/20"
          />
        </div>
      )}
    </div>
  );
}
