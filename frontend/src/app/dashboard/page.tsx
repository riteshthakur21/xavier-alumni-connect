// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import toast from 'react-hot-toast';
// import Link from 'next/link';
// import {
//   UserCheck,
//   UserX,
//   UserPlus,
//   Clock,
//   Check,
//   X,
//   Users,
//   RefreshCw,
//   GraduationCap,
//   Building2,
//   MessageSquare,
//   Briefcase,
//   Calendar,
//   Search,
//   ChevronRight,
//   MapPin,
//   TrendingUp,
//   PenLine,
//   BadgeCheck,
//   AlertCircle,
//   BarChart3,
//   Shield,
//   BookOpen,
// } from 'lucide-react';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// type RequestUser = {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   alumniProfile?: {
//     photoUrl?: string;
//     department?: string;
//     batchYear?: number;
//     company?: string;
//     jobTitle?: string;
//   };
// };

// type ConnectionRequest = {
//   id: string;
//   createdAt: string;
//   sender?: RequestUser;
//   receiver?: RequestUser;
// };

// export default function Dashboard() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const [stats, setStats] = useState<any>(null);

//   const [activeConnTab, setActiveConnTab] = useState<'received' | 'sent'>('received');
//   const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
//   const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
//   const [reqLoading, setReqLoading] = useState(false);
//   const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push('/login');
//     } else if (user) {
//       fetchStats();
//     }
//   }, [user, loading, router]);

//   const fetchStats = async () => {
//     try {
//       const response = await axios.get('/api/alumni/stats/overview');
//       setStats(response.data);
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const fetchRequests = useCallback(async () => {
//     const token = Cookies.get('token');
//     if (!token) return;
//     setReqLoading(true);
//     try {
//       const [pendingRes, sentRes] = await Promise.all([
//         axios.get(`${API_URL}/api/connections/pending`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         axios.get(`${API_URL}/api/connections/sent`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);
//       setPendingRequests(pendingRes.data.data || []);
//       setSentRequests(sentRes.data.data || []);
//     } catch {
//       toast.error('Could not load connection requests');
//     } finally {
//       setReqLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (user) fetchRequests();
//   }, [user, fetchRequests]);

//   const setActing = (id: string, val: boolean) =>
//     setActionLoadingIds((p) => ({ ...p, [id]: val }));

//   const handleAccept = async (requestId: string) => {
//     const token = Cookies.get('token');
//     setActing(requestId, true);
//     try {
//       await axios.post(`${API_URL}/api/connections/accept/${requestId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success('Connected!');
//       setPendingRequests((p) => p.filter((r) => r.id !== requestId));
//     } catch (err: unknown) {
//       const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept';
//       toast.error(msg || 'Failed to accept');
//     } finally {
//       setActing(requestId, false);
//     }
//   };

//   const handleDecline = async (requestId: string) => {
//     const token = Cookies.get('token');
//     setActing(requestId, true);
//     try {
//       await axios.post(`${API_URL}/api/connections/reject/${requestId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success('Request declined');
//       setPendingRequests((p) => p.filter((r) => r.id !== requestId));
//     } catch (err: unknown) {
//       const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline';
//       toast.error(msg || 'Failed to decline');
//     } finally {
//       setActing(requestId, false);
//     }
//   };

//   const handleCancel = async (requestId: string) => {
//     const token = Cookies.get('token');
//     setActing(requestId, true);
//     try {
//       await axios.post(`${API_URL}/api/connections/cancel/${requestId}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       toast.success('Request cancelled');
//       setSentRequests((p) => p.filter((r) => r.id !== requestId));
//     } catch (err: unknown) {
//       const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel';
//       toast.error(msg || 'Failed to cancel');
//     } finally {
//       setActing(requestId, false);
//     }
//   };

//   const getImageUrl = (path?: string) => {
//     if (!path) return null;
//     if (path.startsWith('http')) return path;
//     return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
//   };

//   const timeAgo = (dateStr: string) => {
//     const diff = Date.now() - new Date(dateStr).getTime();
//     const days = Math.floor(diff / 86400000);
//     if (days > 0) return `${days}d ago`;
//     const hours = Math.floor(diff / 3600000);
//     if (hours > 0) return `${hours}h ago`;
//     const mins = Math.floor(diff / 60000);
//     if (mins > 0) return `${mins}m ago`;
//     return 'Just now';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
//       </div>
//     );
//   }

//   if (!user) return null;

//   const displayList = activeConnTab === 'received' ? pendingRequests : sentRequests;
//   const photoUrl = getImageUrl(user.alumniProfile?.photoUrl);

//   // ── Profile completion ───────────────────────────────────────────────────
//   const profileFields = user.alumniProfile ? [
//     { label: 'Photo',     filled: !!user.alumniProfile.photoUrl },
//     { label: 'Bio',       filled: !!user.alumniProfile.bio },
//     { label: 'Company',   filled: !!user.alumniProfile.company },
//     { label: 'Job Title', filled: !!user.alumniProfile.jobTitle },
//     { label: 'Location',  filled: !!user.alumniProfile.location },
//     { label: 'LinkedIn',  filled: !!user.alumniProfile.linkedinUrl },
//     { label: 'Skills',    filled: (user.alumniProfile.skills?.length ?? 0) > 0 },
//     { label: 'Roll No',   filled: !!user.alumniProfile.rollNo },
//   ] : [];
//   const completedCount  = profileFields.filter((f) => f.filled).length;
//   const completionPct   = profileFields.length > 0
//     ? Math.round((completedCount / profileFields.length) * 100)
//     : 0;
//   const missingFields   = profileFields.filter((f) => !f.filled);

//   // ── Quick actions (role-aware) ───────────────────────────────────────────
//   const quickActions = [
//     {
//       label: 'Edit Profile',
//       desc:  'Update your info',
//       href:  '/dashboard/profile',
//       icon:  PenLine,
//       color: 'bg-blue-50 text-blue-600',
//       ring:  'hover:border-blue-200',
//     },
//     {
//       label: 'Browse Alumni',
//       desc:  'Explore directory',
//       href:  '/directory',
//       icon:  Search,
//       color: 'bg-violet-50 text-violet-600',
//       ring:  'hover:border-violet-200',
//     },
//     {
//       label: 'Messages',
//       desc:  'Chat with alumni',
//       href:  '/chat',
//       icon:  MessageSquare,
//       color: 'bg-emerald-50 text-emerald-600',
//       ring:  'hover:border-emerald-200',
//     },
//     {
//       label: 'Jobs & Careers',
//       desc:  'Find opportunities',
//       href:  '/jobs',
//       icon:  Briefcase,
//       color: 'bg-amber-50 text-amber-600',
//       ring:  'hover:border-amber-200',
//     },
//     {
//       label: 'Events',
//       desc:  'Upcoming events',
//       href:  '/events',
//       icon:  Calendar,
//       color: 'bg-rose-50 text-rose-600',
//       ring:  'hover:border-rose-200',
//     },
//     {
//       label: 'Your Connections',
//       desc:  'View your network',
//       href:  '/connections',
//       icon:  Users,
//       color: 'bg-cyan-50 text-cyan-600',
//       ring:  'hover:border-cyan-200',
//     },
//     {
//       label: 'Share Your Story',
//       desc:  'Inspire the community',
//       href:  '/stories',
//       icon:  BookOpen,
//       color: 'bg-orange-50 text-orange-600',
//       ring:  'hover:border-orange-200',
//     },
//     // Alumni / Admin only — post a job opening
//     ...(user.role === 'ALUMNI' || user.role === 'ADMIN' ? [{
//       label: 'Post a Job',
//       desc:  'Share openings',
//       href:  '/jobs/create',
//       icon:  TrendingUp,
//       color: 'bg-teal-50 text-teal-600',
//       ring:  'hover:border-teal-200',
//     }] : []),
//     // Admin only — platform management
//     ...(user.role === 'ADMIN' ? [{
//       label: 'Admin Panel',
//       desc:  'Manage platform',
//       href:  '/admin',
//       icon:  Shield,
//       color: 'bg-slate-100 text-slate-600',
//       ring:  'hover:border-slate-300',
//     }] : []),
//   ];

//   return (
//     <div className="min-h-screen">
//       <div className="container mx-auto px-4 py-8 space-y-6">

//       {/* ── Welcome Banner ──────────────────────────────────────────────────── */}
//       <div
//         className="rounded-2xl overflow-hidden shadow-sm"
//         style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
//       >
//         <div className="px-6 py-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">

//           {/* Avatar */}
//           <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-inner border-2 border-white/30">
//             {photoUrl ? (
//               <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
//             ) : (
//               user.name.charAt(0).toUpperCase()
//             )}
//           </div>

//           {/* Name / meta */}
//           <div className="flex-1 min-w-0">
//             <div className="flex flex-wrap items-center gap-2 mb-1">
//               <h1 className="text-2xl font-bold text-white">
//                 Welcome back, {user.name}!
//               </h1>
//               {user.isVerified ? (
//                 <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold rounded-full">
//                   <BadgeCheck className="w-3 h-3" /> Verified
//                 </span>
//               ) : (
//                 <span className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-400/40 text-yellow-200 text-xs font-semibold rounded-full">
//                   <AlertCircle className="w-3 h-3" /> Pending Verification
//                 </span>
//               )}
//             </div>
//             <p className="text-white/70 text-sm">
//               {user.email}
//               {user.alumniProfile?.department && ` · ${user.alumniProfile.department}`}
//               {user.alumniProfile?.batchYear  && ` · Batch ${user.alumniProfile.batchYear}`}
//             </p>
//             {user.alumniProfile?.jobTitle && user.alumniProfile?.company && (
//               <p className="text-white/55 text-xs mt-1 flex items-center gap-1">
//                 <Building2 className="w-3 h-3" />
//                 {user.alumniProfile.jobTitle} at {user.alumniProfile.company}
//               </p>
//             )}
//           </div>

//           {/* Role chip */}
//           <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-bold rounded-xl uppercase tracking-wider flex-shrink-0">
//             {user.role}
//           </span>
//         </div>
//       </div>

//       {/* ── Stats Row ────────────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           {
//             label: 'Total Alumni',
//             value: stats?.totalAlumni ?? '—',
//             icon:  Users,
//             color: 'text-blue-600',
//             bg:    'bg-blue-50',
//           },
//           {
//             label: 'Batch Members',
//             value: stats
//               ? (stats.byBatch.find((b: any) => b.batchYear === user.alumniProfile?.batchYear)?._count ?? 0)
//               : '—',
//             icon:  GraduationCap,
//             color: 'text-violet-600',
//             bg:    'bg-violet-50',
//           },
//           {
//             label: 'Dept. Members',
//             value: stats
//               ? (stats.byDepartment.find((d: any) => d.department === user.alumniProfile?.department)?._count ?? 0)
//               : '—',
//             icon:  BarChart3,
//             color: 'text-teal-600',
//             bg:    'bg-teal-50',
//           },
//           {
//             label: 'Pending Requests',
//             value: pendingRequests.length,
//             icon:  UserPlus,
//             color: 'text-rose-600',
//             bg:    'bg-rose-50',
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             onClick={() => {
//               if (s.label === 'Pending Requests') {
//                 document.getElementById('connection-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
//               }
//             }}
//             className={`bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex items-center gap-4 ${
//               s.label === 'Pending Requests' ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''
//             }`}
//           >
//             <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
//               <s.icon className={`w-5 h-5 ${s.color}`} />
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
//               <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* ── Quick Actions + Profile ─────────────────────────────────────────── */}
//       <div className="grid md:grid-cols-2 gap-6">

//         {/* Quick Actions */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
//           <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
//             <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
//             Quick Actions
//           </h3>
//           <div className="grid grid-cols-2 gap-3">
//             {quickActions.map((action) => (
//               <Link
//                 key={action.href + action.label}
//                 href={action.href}
//                 className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${action.ring} hover:shadow-sm transition-all group`}
//               >
//                 <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
//                   <action.icon className="w-4 h-4" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-sm font-semibold text-slate-800 truncate">{action.label}</p>
//                   <p className="text-xs text-slate-400 truncate">{action.desc}</p>
//                 </div>
//                 <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition-colors" />
//               </Link>
//             ))}
//           </div>
//         </div>

//         {/* Profile card */}
//         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">

//           {/* Profile completion bar */}
//           {user.alumniProfile && (
//             <div>
//               <div className="flex items-center justify-between mb-1.5">
//                 <p className="text-sm font-bold text-slate-900">Profile Completion</p>
//                 <span className={`text-sm font-bold ${completionPct === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
//                   {completionPct}%
//                 </span>
//               </div>
//               <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
//                   style={{ width: `${completionPct}%` }}
//                 />
//               </div>
//               {missingFields.length > 0 ? (
//                 <div className="flex flex-wrap gap-1.5 mt-2">
//                   {missingFields.map((f) => (
//                     <span
//                       key={f.label}
//                       className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-medium"
//                     >
//                       + {f.label}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
//                   <BadgeCheck className="w-3 h-3" /> Profile is complete
//                 </p>
//               )}
//             </div>
//           )}

//           <hr className="border-slate-100" />

//           {/* Profile details */}
//           <div className="flex-1">
//             <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
//               <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
//               Your Profile
//             </h3>
//             <div className="space-y-2.5">
//               {user.alumniProfile?.batchYear && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                   <span>Batch <strong className="text-slate-800">{user.alumniProfile.batchYear}</strong></span>
//                 </div>
//               )}
//               {user.alumniProfile?.department && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <BarChart3 className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                   <strong className="text-slate-800">{user.alumniProfile.department}</strong>
//                 </div>
//               )}
//               {user.alumniProfile?.company && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                   <span>
//                     {user.alumniProfile.jobTitle ? (
//                       <><strong className="text-slate-800">{user.alumniProfile.jobTitle}</strong> at {user.alumniProfile.company}</>
//                     ) : (
//                       user.alumniProfile.company
//                     )}
//                   </span>
//                 </div>
//               )}
//               {user.alumniProfile?.location && (
//                 <div className="flex items-center gap-2 text-sm text-slate-600">
//                   <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
//                   <span>{user.alumniProfile.location}</span>
//                 </div>
//               )}
//               {(user.alumniProfile?.skills?.length ?? 0) > 0 && (
//                 <div className="flex flex-wrap gap-1.5 pt-1">
//                   {user.alumniProfile!.skills.slice(0, 5).map((s) => (
//                     <span
//                       key={s}
//                       className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100"
//                     >
//                       {s}
//                     </span>
//                   ))}
//                   {user.alumniProfile!.skills.length > 5 && (
//                     <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-medium rounded-full border border-slate-100">
//                       +{user.alumniProfile!.skills.length - 5} more
//                     </span>
//                   )}
//                 </div>
//               )}
//               {!user.alumniProfile && (
//                 <p className="text-sm text-slate-400">No profile data yet.</p>
//               )}
//             </div>
//           </div>

//           {/* Edit CTA */}
//           <Link
//             href="/dashboard/profile"
//             className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
//           >
//             <PenLine className="w-4 h-4" />
//             Edit Profile
//           </Link>
//         </div>
//       </div>

//       {/* ── Connection Requests ──────────────────────────────────────────────── */}
//       <div id="connection-requests" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
//               <Users className="w-5 h-5" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">Connection Requests</h2>
//               <p className="text-xs text-slate-500 font-medium">
//                 Manage your incoming and outgoing requests
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={fetchRequests}
//             disabled={reqLoading}
//             className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`w-3.5 h-3.5 ${reqLoading ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100">
//           <button
//             onClick={() => setActiveConnTab('received')}
//             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
//               activeConnTab === 'received'
//                 ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
//                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
//             }`}
//           >
//             <UserPlus className="w-4 h-4" />
//             Received
//             {pendingRequests.length > 0 && (
//               <span className="ml-0.5 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
//                 {pendingRequests.length}
//               </span>
//             )}
//           </button>
//           <button
//             onClick={() => setActiveConnTab('sent')}
//             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
//               activeConnTab === 'sent'
//                 ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
//                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
//             }`}
//           >
//             <Clock className="w-4 h-4" />
//             Sent
//             {sentRequests.length > 0 && (
//               <span className="ml-0.5 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
//                 {sentRequests.length}
//               </span>
//             )}
//           </button>
//         </div>

//         {/* List */}
//         <div className="p-4 sm:p-6">
//           {reqLoading ? (
//             <div className="space-y-3">
//               {[1, 2, 3].map((i) => (
//                 <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 animate-pulse">
//                   <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
//                   <div className="flex-1 space-y-2">
//                     <div className="h-4 bg-slate-200 rounded w-1/3" />
//                     <div className="h-3 bg-slate-200 rounded w-1/2" />
//                   </div>
//                   <div className="flex gap-2">
//                     <div className="h-9 w-20 bg-slate-200 rounded-xl" />
//                     <div className="h-9 w-20 bg-slate-200 rounded-xl" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : displayList.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
//                 {activeConnTab === 'received' ? (
//                   <UserCheck className="w-7 h-7 text-slate-300" />
//                 ) : (
//                   <Clock className="w-7 h-7 text-slate-300" />
//                 )}
//               </div>
//               <p className="text-slate-500 font-semibold text-sm">
//                 {activeConnTab === 'received' ? 'No pending connection requests' : 'No sent requests'}
//               </p>
//               <p className="text-slate-400 text-xs mt-1">
//                 {activeConnTab === 'received'
//                   ? 'When someone sends you a request, it will appear here'
//                   : 'Requests you send will appear here until accepted'}
//               </p>
//               {activeConnTab === 'sent' && (
//                 <Link
//                   href="/directory"
//                   className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
//                 >
//                   Browse Directory
//                 </Link>
//               )}
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {displayList.map((req) => {
//                 const person   = activeConnTab === 'received' ? req.sender : req.receiver;
//                 if (!person) return null;
//                 const isActing = actionLoadingIds[req.id];
//                 const pPhoto   = getImageUrl(person.alumniProfile?.photoUrl);

//                 return (
//                   <div
//                     key={req.id}
//                     className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
//                   >
//                     {/* Avatar */}
//                     <Link href={`/profile/${person.id}`} className="flex-shrink-0">
//                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
//                         {pPhoto ? (
//                           <img src={pPhoto} alt={person.name} className="w-full h-full object-cover" />
//                         ) : (
//                           person.name.charAt(0)
//                         )}
//                       </div>
//                     </Link>

//                     {/* Info */}
//                     <div className="flex-1 min-w-0">
//                       <Link href={`/profile/${person.id}`} className="hover:text-blue-600 transition-colors">
//                         <p className="font-bold text-slate-900 text-sm truncate">{person.name}</p>
//                       </Link>
//                       <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
//                         {person.alumniProfile?.department && (
//                           <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
//                             <GraduationCap className="w-3 h-3" />
//                             {person.alumniProfile.department}
//                             {person.alumniProfile.batchYear && ` · ${person.alumniProfile.batchYear}`}
//                           </span>
//                         )}
//                         {person.alumniProfile?.company && (
//                           <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
//                             <Building2 className="w-3 h-3" />
//                             {person.alumniProfile.company}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-[10px] text-slate-400 font-medium mt-1">
//                         {timeAgo(req.createdAt)}
//                       </p>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex items-center gap-2 flex-shrink-0">
//                       {activeConnTab === 'received' ? (
//                         <>
//                           <button
//                             onClick={() => handleAccept(req.id)}
//                             disabled={isActing}
//                             className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-60 active:scale-95"
//                           >
//                             <Check className="w-3.5 h-3.5" />
//                             {isActing ? '...' : 'Accept'}
//                           </button>
//                           <button
//                             onClick={() => handleDecline(req.id)}
//                             disabled={isActing}
//                             className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold rounded-xl transition-all disabled:opacity-60 active:scale-95"
//                           >
//                             <X className="w-3.5 h-3.5" />
//                             {isActing ? '...' : 'Decline'}
//                           </button>
//                         </>
//                       ) : (
//                         <button
//                           onClick={() => handleCancel(req.id)}
//                           disabled={isActing}
//                           className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-bold rounded-xl transition-all disabled:opacity-60 active:scale-95"
//                         >
//                           <UserX className="w-3.5 h-3.5" />
//                           {isActing ? 'Cancelling...' : 'Cancel'}
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       </div>
//     </div>
//   );
// }


'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Link from 'next/link';
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

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  const [activeConnTab, setActiveConnTab] = useState<'received' | 'sent'>('received');
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [actionLoadingIds, setActionLoadingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/alumni/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRequests = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return;
    setReqLoading(true);
    try {
      const [pendingRes, sentRes] = await Promise.all([
        axios.get(`${API_URL}/api/connections/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/connections/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPendingRequests(pendingRes.data.data || []);
      setSentRequests(sentRes.data.data || []);
    } catch {
      toast.error('Could not load connection requests');
    } finally {
      setReqLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user, fetchRequests]);

  const setActing = (id: string, val: boolean) =>
    setActionLoadingIds((p) => ({ ...p, [id]: val }));

  const handleAccept = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(`${API_URL}/api/connections/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Connected!');
      setPendingRequests((p) => p.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to accept';
      toast.error(msg || 'Failed to accept');
    } finally {
      setActing(requestId, false);
    }
  };

  const handleDecline = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(`${API_URL}/api/connections/reject/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request declined');
      setPendingRequests((p) => p.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to decline';
      toast.error(msg || 'Failed to decline');
    } finally {
      setActing(requestId, false);
    }
  };

  const handleCancel = async (requestId: string) => {
    const token = Cookies.get('token');
    setActing(requestId, true);
    try {
      await axios.post(`${API_URL}/api/connections/cancel/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Request cancelled');
      setSentRequests((p) => p.filter((r) => r.id !== requestId));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to cancel';
      toast.error(msg || 'Failed to cancel');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) return null;

  const displayList = activeConnTab === 'received' ? pendingRequests : sentRequests;
  const photoUrl = getImageUrl(user.alumniProfile?.photoUrl);

  // ── Profile completion ──────────────────────────────────────────────────
  const profileFields = user.alumniProfile ? [
    { label: 'Photo',     filled: !!user.alumniProfile.photoUrl },
    { label: 'Bio',       filled: !!user.alumniProfile.bio },
    { label: 'Company',   filled: !!user.alumniProfile.company },
    { label: 'Job Title', filled: !!user.alumniProfile.jobTitle },
    { label: 'Location',  filled: !!user.alumniProfile.location },
    { label: 'LinkedIn',  filled: !!user.alumniProfile.linkedinUrl },
    { label: 'Skills',    filled: (user.alumniProfile.skills?.length ?? 0) > 0 },
    { label: 'Roll No',   filled: !!user.alumniProfile.rollNo },
  ] : [];
  const completedCount = profileFields.filter((f) => f.filled).length;
  const completionPct  = profileFields.length > 0
    ? Math.round((completedCount / profileFields.length) * 100)
    : 0;
  const missingFields  = profileFields.filter((f) => !f.filled);

  // ── Quick actions (role-aware) ──────────────────────────────────────────
  const quickActions = [
    {
      label: 'Edit Profile',
      desc:  'Update your info',
      href:  '/dashboard/profile',
      icon:  PenLine,
      color: 'bg-blue-50 text-blue-600',
      ring:  'hover:border-blue-200',
    },
    {
      label: 'Browse Alumni',
      desc:  'Explore directory',
      href:  '/directory',
      icon:  Search,
      color: 'bg-violet-50 text-violet-600',
      ring:  'hover:border-violet-200',
    },
    {
      label: 'Messages',
      desc:  'Chat with alumni',
      href:  '/chat',
      icon:  MessageSquare,
      color: 'bg-emerald-50 text-emerald-600',
      ring:  'hover:border-emerald-200',
    },
    {
      label: 'Jobs & Careers',
      desc:  'Find opportunities',
      href:  '/jobs',
      icon:  Briefcase,
      color: 'bg-amber-50 text-amber-600',
      ring:  'hover:border-amber-200',
    },
    {
      label: 'Events',
      desc:  'Upcoming events',
      href:  '/events',
      icon:  Calendar,
      color: 'bg-rose-50 text-rose-600',
      ring:  'hover:border-rose-200',
    },
    {
      label: 'Your Network',
      desc:  'View connections',
      href:  '/connections',
      icon:  Users,
      color: 'bg-cyan-50 text-cyan-600',
      ring:  'hover:border-cyan-200',
    },
    {
      label: 'Share Story',
      desc:  'Inspire others',
      href:  '/stories',
      icon:  BookOpen,
      color: 'bg-orange-50 text-orange-600',
      ring:  'hover:border-orange-200',
    },
    ...(user.role === 'ALUMNI' || user.role === 'ADMIN' ? [{
      label: 'Post a Job',
      desc:  'Share openings',
      href:  '/jobs/create',
      icon:  TrendingUp,
      color: 'bg-teal-50 text-teal-600',
      ring:  'hover:border-teal-200',
    }] : []),
    ...(user.role === 'ADMIN' ? [{
      label: 'Admin Panel',
      desc:  'Manage platform',
      href:  '/admin',
      icon:  Shield,
      color: 'bg-slate-100 text-slate-600',
      ring:  'hover:border-slate-300',
    }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-5 lg:space-y-6">

        {/* ── Welcome Banner ──────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
        >
          <div className="px-4 sm:px-6 py-5 sm:py-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">

              {/* Avatar + Name row on mobile */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0 shadow-inner border-2 border-white/30">
                  {photoUrl ? (
                    <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Role chip — only on mobile beside avatar */}
                <div className="sm:hidden">
                  <span className="px-2.5 py-1 bg-white/10 border border-white/20 text-white/80 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Name / meta */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    Welcome back, {user.name}!
                  </h1>
                  {user.isVerified ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-500/20 border border-green-400/40 text-green-200 text-xs font-semibold rounded-full whitespace-nowrap">
                      <BadgeCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/20 border border-yellow-400/40 text-yellow-200 text-xs font-semibold rounded-full whitespace-nowrap">
                      <AlertCircle className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-xs sm:text-sm break-all sm:break-normal">
                  {user.email}
                  {user.alumniProfile?.department && ` · ${user.alumniProfile.department}`}
                  {user.alumniProfile?.batchYear && ` · Batch ${user.alumniProfile.batchYear}`}
                </p>
                {user.alumniProfile?.jobTitle && user.alumniProfile?.company && (
                  <p className="text-white/55 text-xs mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{user.alumniProfile.jobTitle} at {user.alumniProfile.company}</span>
                  </p>
                )}
              </div>

              {/* Role chip — desktop only */}
              <span className="hidden sm:block px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-bold rounded-xl uppercase tracking-wider flex-shrink-0">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Alumni',
              value: stats?.totalAlumni ?? '—',
              icon:  Users,
              color: 'text-blue-600',
              bg:    'bg-blue-50',
            },
            {
              label: 'Batch Members',
              value: stats
                ? (stats.byBatch.find((b: any) => b.batchYear === user.alumniProfile?.batchYear)?._count ?? 0)
                : '—',
              icon:  GraduationCap,
              color: 'text-violet-600',
              bg:    'bg-violet-50',
            },
            {
              label: 'Dept. Members',
              value: stats
                ? (stats.byDepartment.find((d: any) => d.department === user.alumniProfile?.department)?._count ?? 0)
                : '—',
              icon:  BarChart3,
              color: 'text-teal-600',
              bg:    'bg-teal-50',
            },
            {
              label: 'Pending Requests',
              value: pendingRequests.length,
              icon:  UserPlus,
              color: 'text-rose-600',
              bg:    'bg-rose-50',
              clickable: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              onClick={() => {
                if (s.clickable) {
                  document.getElementById('connection-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className={`bg-white rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-4 ${
                s.clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : ''
              }`}
            >
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-none">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions + Profile ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              Quick Actions
            </h3>
            {/* 
              MOBILE FIX: 
              - grid-cols-2 on all screens (2 cards per row)
              - Each card is flex-col on very small, flex-row on sm+
              - NO truncate — text wraps naturally
            */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href + action.label}
                  href={action.href}
                  className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-100 ${action.ring} hover:shadow-sm transition-all group`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  {/* Text — NO truncate, allow wrapping */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">{action.label}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 leading-tight mt-0.5 hidden sm:block">{action.desc}</p>
                  </div>
                  {/* Arrow — hidden on very small screens to save space */}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition-colors hidden sm:block" />
                </Link>
              ))}
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col gap-4">

            {/* Profile completion bar */}
            {user.alumniProfile && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-slate-900">Profile Completion</p>
                  <span className={`text-sm font-bold ${completionPct === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {completionPct}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                {missingFields.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {missingFields.map((f) => (
                      <span
                        key={f.label}
                        className="text-[10px] px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-medium"
                      >
                        + {f.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Profile is complete
                  </p>
                )}
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Profile details */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
                Your Profile
              </h3>
              <div className="space-y-2 sm:space-y-2.5">
                {user.alumniProfile?.batchYear && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <GraduationCap className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>Batch <strong className="text-slate-800">{user.alumniProfile.batchYear}</strong></span>
                  </div>
                )}
                {user.alumniProfile?.department && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <BarChart3 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <strong className="text-slate-800">{user.alumniProfile.department}</strong>
                  </div>
                )}
                {user.alumniProfile?.company && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="leading-tight">
                      {user.alumniProfile.jobTitle ? (
                        <><strong className="text-slate-800">{user.alumniProfile.jobTitle}</strong> at {user.alumniProfile.company}</>
                      ) : (
                        user.alumniProfile.company
                      )}
                    </span>
                  </div>
                )}
                {user.alumniProfile?.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{user.alumniProfile.location}</span>
                  </div>
                )}
                {(user.alumniProfile?.skills?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {user.alumniProfile!.skills.slice(0, 5).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-medium rounded-full border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                    {user.alumniProfile!.skills.length > 5 && (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] sm:text-xs font-medium rounded-full border border-slate-100">
                        +{user.alumniProfile!.skills.length - 5} more
                      </span>
                    )}
                  </div>
                )}
                {!user.alumniProfile && (
                  <p className="text-sm text-slate-400">No profile data yet.</p>
                )}
              </div>
            </div>

            {/* Edit CTA */}
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* ── Connection Requests ──────────────────────────────────────────── */}
        <div id="connection-requests" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Connection Requests</h2>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
                  Manage your incoming and outgoing requests
                </p>
              </div>
            </div>
            <button
              onClick={fetchRequests}
              disabled={reqLoading}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50 px-2 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reqLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100">
            <button
              onClick={() => setActiveConnTab('received')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-1 sm:flex-none justify-center sm:justify-start ${
                activeConnTab === 'received'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Received
              {pendingRequests.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveConnTab('sent')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-1 sm:flex-none justify-center sm:justify-start ${
                activeConnTab === 'sent'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Sent
              {sentRequests.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="p-3 sm:p-4 lg:p-6">
            {reqLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 animate-pulse">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-1/3" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-16 sm:w-20 bg-slate-200 rounded-xl" />
                      <div className="h-8 w-16 sm:w-20 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 sm:mb-4">
                  {activeConnTab === 'received' ? (
                    <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" />
                  ) : (
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" />
                  )}
                </div>
                <p className="text-slate-500 font-semibold text-sm">
                  {activeConnTab === 'received' ? 'No pending requests' : 'No sent requests'}
                </p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  {activeConnTab === 'received'
                    ? 'When someone sends you a request, it will appear here'
                    : 'Requests you send will appear here until accepted'}
                </p>
                {activeConnTab === 'sent' && (
                  <Link
                    href="/directory"
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Browse Directory
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {displayList.map((req) => {
                  const person   = activeConnTab === 'received' ? req.sender : req.receiver;
                  if (!person) return null;
                  const isActing = actionLoadingIds[req.id];
                  const pPhoto   = getImageUrl(person.alumniProfile?.photoUrl);

                  return (
                    <div
                      key={req.id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                    >
                      {/* Avatar */}
                      <Link href={`/profile/${person.id}`} className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-base sm:text-lg overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                          {pPhoto ? (
                            <img src={pPhoto} alt={person.name} className="w-full h-full object-cover" />
                          ) : (
                            person.name.charAt(0)
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${person.id}`} className="hover:text-blue-600 transition-colors">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{person.name}</p>
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                          {person.alumniProfile?.department && (
                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500 font-medium">
                              <GraduationCap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {person.alumniProfile.department}
                              {person.alumniProfile.batchYear && ` · ${person.alumniProfile.batchYear}`}
                            </span>
                          )}
                          {person.alumniProfile?.company && (
                            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                              <Building2 className="w-3 h-3" />
                              {person.alumniProfile.company}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-0.5">
                          {timeAgo(req.createdAt)}
                        </p>
                      </div>

                      {/* Actions — stacked on mobile, row on sm+ */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {activeConnTab === 'received' ? (
                          <>
                            <button
                              onClick={() => handleAccept(req.id)}
                              disabled={isActing}
                              className="flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all shadow-sm disabled:opacity-60 active:scale-95"
                            >
                              <Check className="w-3 h-3" />
                              <span>{isActing ? '...' : 'Accept'}</span>
                            </button>
                            <button
                              onClick={() => handleDecline(req.id)}
                              disabled={isActing}
                              className="flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all disabled:opacity-60 active:scale-95"
                            >
                              <X className="w-3 h-3" />
                              <span>{isActing ? '...' : 'Decline'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleCancel(req.id)}
                            disabled={isActing}
                            className="flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all disabled:opacity-60 active:scale-95"
                          >
                            <UserX className="w-3 h-3" />
                            <span>{isActing ? '...' : 'Cancel'}</span>
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