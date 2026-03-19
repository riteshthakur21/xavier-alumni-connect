'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UsersTab from '@/components/admin/UsersTab';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  alumniProfile?: {
    batchYear: number;
    department: string;
    company?: string;
    photoUrl?: string;
  };
}

interface Stats {
  totalUsers: number;
  totalAlumni: number;
  verifiedAlumni: number;
  pendingAlumni: number;
  totalStudents: number;
  totalEvents: number;
}

const TAB_CONFIG = [
  { key: 'overview' as const, label: 'Overview', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  )},
  { key: 'pending' as const, label: 'Pending', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { key: 'users' as const, label: 'Users', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  )},
  { key: 'reports' as const, label: 'Reports', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  )},
  { key: 'stories' as const, label: 'Stories', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  )},
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingAlumni, setPendingAlumni] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'users' | 'reports' | 'stories'>('overview');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [dataLoading, setDataLoading] = useState(true);
  const [pendingStories, setPendingStories] = useState<{ id: string; title: string; content: string; createdAt: string; author: { id: string; name: string; email: string } }[]>([]);
  const [selectedStory, setSelectedStory] = useState<{ id: string; title: string; content: string; createdAt: string; author: { id: string; name: string; email: string } } | null>(null);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
    action: 'approve' | 'reject';
  }>({ open: false, userId: '', userName: '', action: 'approve' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Track cards being removed for exit animation
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    } else if (user) {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const [statsResponse, pendingResponse, storiesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/pending'),
        axios.get('http://localhost:5000/api/stories/pending'),
      ]);

      setStats(statsResponse.data);
      setPendingAlumni(pendingResponse.data.pendingAlumni || []);
      setPendingStories(storiesResponse.data.stories || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setDataLoading(false);
    }
  };

  const openConfirm = (userId: string, userName: string, action: 'approve' | 'reject') => {
    setConfirmModal({ open: true, userId, userName, action });
  };

  const closeConfirm = () => {
    setConfirmModal({ open: false, userId: '', userName: '', action: 'approve' });
  };

  const handleVerify = async () => {
    const { userId, action } = confirmModal;
    closeConfirm();
    setActionLoading(userId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/admin/verify/${userId}`, { action });

      // Animate the card out, then remove from state
      setRemovingId(userId);
      setTimeout(() => {
        setPendingAlumni((prev) => prev.filter((u) => u.id !== userId));
        setRemovingId(null);
        setActionLoading(null);

        if (action === 'approve') {
          toast.success('User approved successfully!');
        } else {
          toast.success('User rejected and record removed.');
        }

        // Refresh stats in background
        axios.get('http://localhost:5000/api/admin/stats').then((r) => setStats(r.data)).catch(() => {});
      }, 400);
    } catch (error) {
      console.error(`Error verifying user:`, error);
      toast.error('Operation failed. Please try again.');
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/alumni/${userId}`);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleStoryAction = async (storyId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await axios.patch(`http://localhost:5000/api/stories/${storyId}/status`, { status });
      toast.success(`Story ${status.toLowerCase()} successfully`);
      setPendingStories((prev) => prev.filter((s) => s.id !== storyId));
      setSelectedStory(null);
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story status');
    }
  };

  const exportData = async (exportType: string) => {
    const toastId = toast.loading('Filtering and generating report...');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/export/alumni?type=${exportType}&batchYear=${selectedBatch}&department=${selectedDept}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Xavier_${exportType}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report downloaded!', { id: toastId });
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error("No matching records found for this filter combination.", {
          id: toastId,
          duration: 5000
        });
      } else {
        toast.error('Server connection lost!', { id: toastId });
      }
      console.error('Export Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-blue-600"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-secondary-900 mb-2 tracking-tight">Admin Dashboard</h1>
          <p className="text-secondary-600">Manage alumni system and monitor community activity</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar">
              {TAB_CONFIG.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                  }`}
                >
                  {icon}
                  {label}
                  {key === 'pending' && pendingAlumni.length > 0 && (
                    <span className="ml-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full inline-flex items-center justify-center">
                      {pendingAlumni.length}
                    </span>
                  )}
                  {key === 'stories' && pendingStories.length > 0 && (
                    <span className="ml-1 bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full inline-flex items-center justify-center">
                      {pendingStories.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataLoading ? (
              // Skeleton loading cards
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
                    <div className="h-3 w-24 bg-slate-200 rounded mb-4"></div>
                    <div className="h-10 w-20 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </>
            ) : stats ? (
              <>
                <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Users</h3>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-primary-600">{stats.totalUsers}</p>
                </div>

                <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Alumni</h3>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-primary-600">{stats.totalAlumni}</p>
                  <p className="text-[10px] text-secondary-500 font-bold mt-2 uppercase">
                    {stats.verifiedAlumni} Verified &middot; {stats.pendingAlumni} Pending
                  </p>
                </div>

                <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Students</h3>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-primary-600">{stats.totalStudents}</p>
                </div>

                <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Events</h3>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-primary-600">{stats.totalEvents}</p>
                </div>

                <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-2 ring-yellow-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-yellow-600 uppercase tracking-widest">Pending Verifications</h3>
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <p className="text-4xl font-black text-yellow-600">{stats.pendingAlumni}</p>
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="text-xs font-black text-primary-600 hover:text-primary-700 mt-2 uppercase tracking-tight underline"
                  >
                    Review Applications &rarr;
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pending Verifications</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {pendingAlumni.length} Pending
              </span>
            </div>

            {dataLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-full bg-slate-200 shrink-0"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-40 bg-slate-200 rounded"></div>
                        <div className="h-3 w-56 bg-slate-100 rounded"></div>
                        <div className="h-8 w-64 bg-slate-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingAlumni.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-700">All Caught Up!</h4>
                <p className="text-slate-500 font-medium mt-1">No pending verifications at the moment.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingAlumni.map((alumnus) => (
                  <div
                    key={alumnus.id}
                    className={`group border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 relative overflow-hidden ${
                      removingId === alumnus.id ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
                    }`}
                    style={{ transition: 'opacity 0.4s, transform 0.4s' }}
                  >
                    {/* Decorative Side Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400 group-hover:bg-blue-500 transition-colors"></div>

                    {/* Loading overlay */}
                    {actionLoading === alumnus.id && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-blue-600"></div>
                          <span className="text-sm font-bold text-slate-500">Processing...</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 pl-2 sm:pl-3">

                      {/* Profile Info Section */}
                      <div className="flex items-start gap-4 w-full md:w-auto">
                        {/* Profile Avatar */}
                        {alumnus.alumniProfile?.photoUrl ? (
                          <img
                            src={alumnus.alumniProfile.photoUrl}
                            alt={alumnus.name}
                            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 border border-blue-100 shadow-sm">
                            {alumnus.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 text-lg sm:text-xl leading-tight">{alumnus.name}</h4>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wider font-bold border border-slate-200">
                              {alumnus.role}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium mb-3">{alumnus.email}</p>

                          {/* College Details Grid */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-700 font-bold uppercase tracking-wider bg-slate-50 p-2 sm:p-2.5 rounded-lg border border-slate-100">
                            <span className="flex items-center gap-1.5 whitespace-nowrap bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                              {alumnus.rollNo || 'N/A'}
                            </span>

                            {alumnus.alumniProfile ? (
                              <>
                                <span className="flex items-center gap-1.5 whitespace-nowrap bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                  {alumnus.alumniProfile.department}
                                </span>
                                <span className="flex items-center gap-1.5 whitespace-nowrap bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  {alumnus.alumniProfile.batchYear}
                                </span>
                              </>
                            ) : (
                              <span className="text-amber-500 font-medium ml-1 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.5 14.14A1.5 1.5 0 003.07 20h17.86a1.5 1.5 0 001.28-2l-8.5-14.14a1.5 1.5 0 00-2.56 0z" /></svg>
                                Profile Incomplete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row w-full md:w-auto gap-2 sm:gap-3 mt-2 md:mt-0">
                        <button
                          onClick={() => openConfirm(alumnus.id, alumnus.name, 'approve')}
                          disabled={actionLoading === alumnus.id}
                          className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-black rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all uppercase flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Approve
                        </button>
                        <button
                          onClick={() => openConfirm(alumnus.id, alumnus.name, 'reject')}
                          disabled={actionLoading === alumnus.id}
                          className="flex-1 md:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-red-50 text-red-600 text-xs sm:text-sm font-black rounded-xl hover:bg-red-100 hover:text-red-700 transition-all uppercase flex items-center justify-center gap-2 active:scale-95 border border-red-100 hover:border-red-200 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          Reject
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-secondary-900">User Management</h3>
              <p className="text-sm text-secondary-500">Search and filter through the entire member database.</p>
            </div>
            <UsersTab />
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Export Filters
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Batch</label>
                  <input
                    type="number"
                    min="2009"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2014"
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none"
                    value={selectedBatch}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 4) {
                        setSelectedBatch(val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      const currentYear = new Date().getFullYear();
                      if (val) {
                        if (val < 2009) setSelectedBatch('2009');
                        else if (val > currentYear) setSelectedBatch(currentYear.toString());
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Department</label>
                  <select
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 cursor-pointer outline-none"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCOM (P)">BCOM (P)</option>
                    <option value="BBA (IB)">BBA (IB)</option>
                    <option value="BA (JMC)">BA (JMC)</option>
                  </select>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                *Apply filters to narrow down your report. If no match is found, we&apos;ll let you know!
              </p>
            </div>

            {/* Export Buttons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => exportData('all')} className="group p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="font-bold text-slate-900">Complete Database</h4>
                <p className="text-[10px] text-slate-400 mt-1">Full info + Status</p>
              </button>

              <button onClick={() => exportData('verified_alumni')} className="group p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl hover:bg-white hover:border-indigo-400 hover:shadow-2xl transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="font-bold text-indigo-900">Verified Alumni</h4>
                <p className="text-[10px] text-indigo-400 mt-1">Work details</p>
              </button>

              <button onClick={() => exportData('verified_student')} className="group p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl hover:bg-white hover:border-emerald-400 hover:shadow-2xl transition-all text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h4 className="font-bold text-emerald-900">Verified Students</h4>
                <p className="text-[10px] text-emerald-400 mt-1">Academic only</p>
              </button>
            </div>
          </div>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Story Reviews</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {pendingStories.length} Pending
              </span>
            </div>

            {dataLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-slate-100 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="h-5 w-48 bg-slate-200 rounded"></div>
                        <div className="h-3 w-64 bg-slate-100 rounded"></div>
                        <div className="h-16 w-full bg-slate-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingStories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h4 className="text-lg font-bold text-slate-700">No Pending Stories</h4>
                <p className="text-slate-500 font-medium mt-1">All stories have been reviewed.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingStories.map((story) => (
                  <div
                    key={story.id}
                    className="group border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white hover:border-yellow-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 group-hover:bg-yellow-500 transition-colors"></div>
                    <div className="pl-3">
                      <h4 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{story.title}</h4>
                      <p className="text-sm text-slate-500 mb-0.5">
                        by <span className="font-semibold">{story.author.name}</span> · {story.author.email}
                      </p>
                      <p className="text-xs text-slate-400 mb-4">
                        Submitted {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Review Story
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeConfirm}></div>

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8" style={{ animation: 'scaleIn 0.2s ease-out' }}>
            {/* Icon */}
            <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${
              confirmModal.action === 'approve' ? 'bg-blue-50' : 'bg-red-50'
            }`}>
              {confirmModal.action === 'approve' ? (
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-8.5 14.14A1.5 1.5 0 003.07 20h17.86a1.5 1.5 0 001.28-2l-8.5-14.14a1.5 1.5 0 00-2.56 0z" /></svg>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              {confirmModal.action === 'approve' ? 'Approve User?' : 'Reject & Delete User?'}
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              {confirmModal.action === 'approve'
                ? `This will verify ${confirmModal.userName}'s account and send them a welcome email.`
                : `This will permanently delete ${confirmModal.userName}'s registration and send a rejection email. They can re-register later.`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeConfirm}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                className={`flex-1 px-4 py-3 text-white text-sm font-bold rounded-xl transition-colors ${
                  confirmModal.action === 'approve'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmModal.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Review Modal */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-xl font-bold text-white line-clamp-2">{selectedStory.title}</h2>
                <p className="text-blue-200 text-sm mt-1">
                  by {selectedStory.author.name} · {selectedStory.author.email}
                </p>
                <p className="text-blue-300 text-xs mt-0.5">
                  Submitted {new Date(selectedStory.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-white/70 hover:text-white text-2xl leading-none flex-shrink-0 mt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Author Info Bar */}
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-200 flex-shrink-0">
                {selectedStory.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{selectedStory.author.name}</p>
                <p className="text-xs text-gray-500">{selectedStory.author.email}</p>
              </div>
            </div>

            {/* Story Full Content — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                {selectedStory.content}
              </p>
            </div>

            {/* Modal Footer — Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => handleStoryAction(selectedStory.id, 'APPROVED')}
                className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                Approve Story
              </button>
              <button
                onClick={() => handleStoryAction(selectedStory.id, 'REJECTED')}
                className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}