'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
// ENHANCED: import useAuth to detect own profile + connection status
import { useAuth } from '@/contexts/AuthContext';

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

// ENHANCED: connection status type matching the API responses
type ConnStatus = 'idle' | 'self' | 'not_connected' | 'pending_sent' | 'pending_received' | 'connected';

export default function AlumniProfilePage() {
  const params = useParams();
  const router = useRouter();
  // ENHANCED: added auth context
  const { user: currentUser } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);
  // ENHANCED: tab state
  const [activeTab, setActiveTab] = useState('about');

  // ENHANCED: connection state
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [connRequestId, setConnRequestId] = useState<string | null>(null);
  const [connLoading, setConnLoading] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);

  const token = Cookies.get('token');
  const isOwnProfile = currentUser?.id === params.id;

  useEffect(() => {
    if (params.id) {
      fetchAlumniProfile();
    }
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

  // ENHANCED: fetch connection status from API
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

  // ENHANCED: connection actions
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
    if (!token) {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const convId = data.data?.id;
      router.push(`/chat?conv=${convId}`);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
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

  // ENHANCED: helper to resolve image URLs
  const getImageUrl = (path: string | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };


  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="animate-pulse">
            {/* Banner skeleton */}
            <div className="h-48 sm:h-56 bg-gray-200 rounded-t-2xl"></div>
            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 px-6 sm:px-10 pb-10">
              <div className="flex items-end gap-5 -mt-16">
                <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white shrink-0"></div>
                <div className="flex-1 pt-20 space-y-3">
                  <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
                </div>
              </div>
              <div className="mt-8 h-12 bg-gray-100 rounded-2xl"></div>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="h-48 bg-gray-100 rounded-2xl"></div>
                <div className="lg:col-span-2 h-48 bg-gray-100 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Profile Not Found</h2>
          <p className="text-gray-500 mb-8">
            The profile you are looking for doesn&apos;t exist or may have been removed.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchAlumniProfile}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
            >
              Try Again
            </button>
            <Link
              href="/directory"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
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

  const tabs = [
    { id: 'about', label: 'About', icon: '📋' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'contact', label: 'Contact', icon: '📬' },
  ];

  // ENHANCED: connection action buttons renderer
  const renderActions = () => {
    if (isOwnProfile) {
      return (
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md"
        >
          {/* Edit icon SVG */}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit Profile
        </Link>
      );
    }

    if (!token || !currentUser) {
      return (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md"
        >
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl font-semibold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer group"
          >
            <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
            <span className="group-hover:hidden">Connected</span>
            <span className="hidden group-hover:inline">Disconnect</span>
          </button>
          <button
            onClick={handleMessage}
            disabled={startingChat}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
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
          <svg className="w-4 h-4 group-hover:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <svg className="w-4 h-4 hidden group-hover:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          {connLoading ? 'Cancelling...' : 'Pending...'}
        </button>
      );
    }

    if (connStatus === 'pending_received') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={handleAccept}
            disabled={connLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Accept
          </button>
          <button
            onClick={handleDecline}
            disabled={connLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            Decline
          </button>
        </div>
      );
    }

    // not_connected
    return (
      <button
        onClick={handleConnect}
        disabled={connLoading}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
        {connLoading ? 'Sending...' : 'Connect'}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ENHANCED: Back button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors mb-5 text-sm font-medium group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>

        {/* ENHANCED: Main card container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* ENHANCED: Gradient banner with dot pattern */}
          <div
            className="relative h-40 sm:h-52 lg:h-60 w-full overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10">

            {/* ENHANCED: Profile header — avatar, name, pills, actions */}
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

              {/* Name + info pills */}
              <div className="flex-1 min-w-0 mt-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1 truncate">
                  {alumni.name}
                </h1>

                {/* ENHANCED: Info pills row */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                    🎓 {alumni.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                    🏛️ {profile.department}
                  </span>

                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium">
                    📅 Class of {profile.batchYear}
                  </span>

                  {profile.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
                      📍 {profile.location}
                    </span>
                  )}
                </div>
              </div>

              {/* ENHANCED: Action buttons (connect/edit/message) */}
              <div className="shrink-0 w-full sm:w-auto flex justify-center sm:justify-end sm:pb-1">
                {renderActions()}
              </div>
            </div>

            {/* ENHANCED: Stats bar strip */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-0 sm:divide-x sm:divide-gray-200 py-4 px-4 sm:px-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              {profile.company && (
                <div className="flex items-center gap-2 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <span className="text-lg">💼</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Company</p>
                    <p className="text-sm font-bold text-gray-800">{profile.company}</p>
                  </div>
                </div>
              )}
              {profile.jobTitle && (
                <div className="flex items-center gap-2 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <span className="text-lg">👔</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Role</p>
                    <p className="text-sm font-bold text-gray-800">{profile.jobTitle}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                <span className="text-lg">🏛️</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Department</p>
                  <p className="text-sm font-bold text-gray-800">{profile.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Batch</p>
                  <p className="text-sm font-bold text-gray-800">{profile.batchYear}</p>
                </div>
              </div>
              {connStatus === 'connected' && (
                <div className="flex items-center gap-2 sm:px-5 first:sm:pl-0 last:sm:pr-0">
                  <span className="text-lg">🤝</span>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Status</p>
                    <p className="text-sm font-bold text-green-600">Connected</p>
                  </div>
                </div>
              )}
            </div>

            {/* ENHANCED: Tab navigation */}
            <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl mb-8 border border-gray-200/50 max-w-md overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ENHANCED: Content area — sidebar + main */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

              {/* Sidebar */}
              <div className="lg:col-span-1 order-2 lg:order-1 space-y-5">

                {/* ENHANCED: Overview card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Overview</h3>
                  <ul className="space-y-5">
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-base shrink-0">🔖</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Roll Number</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.rollNo || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-base shrink-0">🏛️</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Department</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.department || 'N/A'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-base shrink-0">📍</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Location</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">{profile.location || 'Not specified'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-base shrink-0">📅</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase">Joined</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">
                          {new Date(alumni.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* ENHANCED: Message card (only when connected) */}
                {connStatus === 'connected' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                    <button
                      onClick={handleMessage}
                      disabled={startingChat}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-60"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      {startingChat ? 'Opening...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>

              {/* ENHANCED: Main content area with tabs */}
              <div className="lg:col-span-2 order-1 lg:order-2">

                {/* ═══ About Tab ═══ */}
                <div className={activeTab === 'about' ? 'block' : 'hidden'}>
                  <div className="space-y-8">

                    {/* ENHANCED: Bio card with blue left border */}
                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-blue-600 rounded-full"></span>
                        Bio
                      </h2>
                      {profile.bio ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-all duration-200">
                          <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center">
                          <p className="text-gray-400 text-sm italic">No bio added yet.</p>
                        </div>
                      )}
                    </section>

                    {/* ENHANCED: Skills as rounded pill badges */}
                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-indigo-600 rounded-full"></span>
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

                    {/* ENHANCED: Current position card */}
                    <section>
                      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-7 h-0.5 bg-emerald-600 rounded-full"></span>
                        Current Position
                      </h2>
                      {profile.company || profile.jobTitle ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-all duration-200 group">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors text-xl">
                            💼
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

                {/* ═══ Experience Tab ═══ */}
                <div className={activeTab === 'experience' ? 'block' : 'hidden'}>
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-7 h-0.5 bg-emerald-600 rounded-full"></span>
                    Experience
                  </h2>

                  {profile.company || profile.jobTitle ? (
                    // ENHANCED: Timeline-style layout
                    <div className="relative pl-8 border-l-2 border-blue-200">
                      {/* Current role entry */}
                      <div className="relative mb-8 last:mb-0">
                        {/* Timeline dot */}
                        <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl shrink-0">🏢</div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{profile.jobTitle || 'Role Not Specified'}</p>
                              <p className="text-gray-600 font-medium mt-0.5">{profile.company || 'Organization Not Specified'}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
                                  🟢 Present
                                </span>
                                {profile.location && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                    📍 {profile.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Education entry */}
                      <div className="relative">
                        <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 bg-indigo-400 rounded-full border-2 border-white shadow-sm"></div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shrink-0">🎓</div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-lg">{profile.department}</p>
                              <p className="text-gray-600 font-medium mt-0.5">Xavier University</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                                  🎓 Class of {profile.batchYear}
                                </span>
                                {profile.rollNo && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-100">
                                    # {profile.rollNo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // ENHANCED: Empty state for experience
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
                      <div className="text-5xl mb-4">🏗️</div>
                      <p className="text-gray-500 font-medium">No experience details added yet.</p>
                      <p className="text-gray-400 text-sm mt-1">Check back later for updates.</p>
                    </div>
                  )}
                </div>

                {/* ═══ Contact Tab ═══ */}
                <div className={activeTab === 'contact' ? 'block' : 'hidden'}>
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-7 h-0.5 bg-violet-600 rounded-full"></span>
                    Get in Touch
                  </h2>

                  {/* ENHANCED: Contact cards grid */}
                  <div className="grid sm:grid-cols-2 gap-4">

                    {/* Email card */}
                    {profile.contactPublic ? (
                      <a
                        href={`mailto:${alumni.email}`}
                        className="group flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="font-bold text-gray-800 truncate text-sm">{alumni.email}</span>
                      </a>
                    ) : (
                      <div className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-60 cursor-not-allowed">
                        <div className="w-11 h-11 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</span>
                        <span className="font-bold text-gray-400 text-sm">Contact is private</span>
                      </div>
                    )}

                    {/* LinkedIn card */}
                    {profile.linkedinUrl ? (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-gray-800 text-sm">View Profile →</span>
                      </a>
                    ) : (
                      <div className="flex flex-col p-6 bg-gray-50 rounded-2xl border border-gray-100 opacity-60 cursor-not-allowed">
                        <div className="w-11 h-11 bg-gray-200 text-gray-400 rounded-xl flex items-center justify-center mb-4">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-gray-400 text-sm">Not provided</span>
                      </div>
                    )}

                    {/* Member since card */}
                    <div className="flex flex-col p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 sm:col-span-2">
                      <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-lg">
                        📅
                      </div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Member Since</span>
                      <span className="font-bold text-gray-800 text-sm">
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Disconnect Confirmation Modal ──────────────────────────────────── */}
      {showDisconnectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDisconnectModal(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" />

          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning icon */}
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Disconnect from this user?
            </h3>
            <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
              If you disconnect, you will no longer be able to send messages.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                disabled={connLoading}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm disabled:opacity-60"
              >
                Stay Connected
              </button>
              <button
                onClick={handleDisconnect}
                disabled={connLoading}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60"
              >
                {connLoading ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Lightbox Modal ──────────────────────────────────────────── */}
      {photoModal && profile.photoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setPhotoModal(false)}
        >
          <button
            onClick={() => setPhotoModal(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center transition-colors"
          >
            ✕
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
