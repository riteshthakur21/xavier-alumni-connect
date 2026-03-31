// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
// import toast from 'react-hot-toast';

// export default function Events() {
//   const { user, loading: authLoading } = useAuth(); 
//   const [events, setEvents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const getEventImageUrl = (path?: string) => {
//     if (!path) return null;
//     if (path.startsWith('http')) return path; // Cloudinary
//     return `http://localhost:5000/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`; // Local
//   };

//   const fetchEvents = async () => {
//     try {
//       const res = await axios.get('/api/events');
//       setEvents(res.data.events || []);
//     } catch (error) {
//       console.error('Error fetching events:', error);
//       toast.error('Could not load events'); 
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!authLoading && user) {
//       fetchEvents();
//     } else if (!authLoading && !user) {
//       setLoading(false);
//     }
//   }, [user, authLoading]);

//   if (!user && !authLoading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center px-4">
//         <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
//           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
//             <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
//           <p className="text-slate-500 text-sm mb-8 leading-relaxed">
//             You need to be logged in to access this section. Join our community to explore alumni events and register for them.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Link href="/login" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
//               Login
//             </Link>
//             <Link href="/register" className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
//               Create Account
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const handleRegister = async (eventId: string) => {
//     if (!confirm('Are you sure you want to register for this event?')) return;
//     try {
//       await axios.post(`/api/events/${eventId}/register`);
//       toast.success('Registered successfully! 🎟️');
//       fetchEvents();
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Registration failed');
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this event?')) return;
//     try {
//       await axios.delete(`/api/events/${id}`);
//       toast.success('Event deleted successfully');
//       fetchEvents();
//     } catch (error) {
//       toast.error('Failed to delete event');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-6xl mx-auto py-8 px-4">
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {Array.from({ length: 3 }).map((_, idx) => (
//             <div key={idx} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-slate-100">
//               <div className="h-48 bg-slate-200" />
//               <div className="p-6 space-y-3">
//                 <div className="h-5 bg-slate-200 rounded w-3/4" />
//                 <div className="h-3 bg-slate-200 rounded w-full" />
//                 <div className="h-3 bg-slate-200 rounded w-2/3" />
//                 <div className="h-10 bg-slate-200 rounded-xl mt-4" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-8 border-b pb-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Events</h1>
//           <p className="text-slate-500 mt-1">Networking, meetups, and parties in one place.</p>
//         </div>
//         {user?.role === 'ADMIN' && (
//           <Link href="/events/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
//             + Create Event
//           </Link>
//         )}
//       </div>

//       {events.length === 0 ? (
//         <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
//           <p className="text-xl text-slate-400 font-medium">No events found for your group yet.</p>
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {events.map((event) => (
//             <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              
//               <div className="h-48 relative bg-slate-200">
//                 {event.imageUrl ? (
//                   <img
//                     // src={`http://localhost:5000/${event.imageUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`}
//                     src={getEventImageUrl(event.imageUrl)!}
//                     className="w-full h-full object-cover"
//                     alt={event.title}
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">No Preview</div>
//                 )}
//                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 shadow-sm">
//                    For: {event.targetAudience}
//                 </div>
//               </div>

//               <div className="p-6 flex-1 flex flex-col">
//                 <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{event.title}</h3>
//                 <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>

//                 <div className="space-y-3 mb-8">
//                   <div className="flex items-center text-sm text-slate-600 gap-3">
//                     <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">📅</span>
//                     <span className="font-medium">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-slate-600 gap-3">
//                     <span className="p-1.5 bg-orange-50 rounded-lg text-orange-500">📍</span>
//                     <span className="font-medium">{event.location}</span>
//                   </div>
//                 </div>

//                 <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
//                   <button
//                     onClick={() => handleRegister(event.id)}
//                     className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm"
//                   >
//                     Register Now ✨
//                   </button>

//                   {user?.role === 'ADMIN' && (
//                     <button
//                       onClick={() => handleDelete(event.id)}
//                       className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-medium"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </div>

//                 {/* --- UPDATED PARTICIPANTS SECTION --- */}
//                 {(user?.role === 'ALUMNI' || user?.role === 'ADMIN' || user?.role === 'STUDENT') && (
//                   <div className="mt-6 pt-4 border-t border-slate-100">
//                     <div className="flex justify-between items-center mb-3">
//                       <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Who's Joining? ({event.registrations?.length || 0})</p>
                      
//                       {/* 👇 Naya "See All List" link add kar diya hai */}
//                       <Link 
//                         href={`/events/${event.id}/participants`} 
//                         className="text-[10px] text-blue-600 font-extrabold hover:underline bg-blue-50 px-2 py-1 rounded-md transition-all"
//                       >
//                         See All List →
//                       </Link>
//                     </div>

//                     <div className="flex -space-x-2 overflow-hidden">
//                       {event.registrations?.slice(0, 5).map((reg: any) => (
//                          <Link key={reg.id} href={`/alumni/${reg.user.id}`}>
//                            <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer" title={reg.user.name}>
//                              {reg.user.name.charAt(0)}
//                            </div>
//                          </Link>
//                       ))}
//                       {(event.registrations?.length > 5) && (
//                         <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
//                           +{event.registrations.length - 5}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Calendar, MapPin, Users, Plus, Trash2, Lock, Sparkles,
  X, GraduationCap, Briefcase, Globe, Info, Building2
} from 'lucide-react';

const ANIM_STYLES = `
  @keyframes ev-fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ev-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes ev-popIn {
    from { opacity: 0; transform: scale(0.92) translateY(6px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ev-fade-0 { animation: ev-fadeUp 0.4s ease both; }
  .ev-fade-1 { animation: ev-fadeUp 0.4s 0.05s ease both; }
  .ev-fade-2 { animation: ev-fadeUp 0.4s 0.1s ease both; }
  .ev-fade-3 { animation: ev-fadeUp 0.4s 0.15s ease both; }
  .ev-fade-4 { animation: ev-fadeUp 0.4s 0.2s ease both; }
  .ev-fade-5 { animation: ev-fadeUp 0.4s 0.25s ease both; }
  .ev-card { transition: box-shadow 0.25s ease, transform 0.25s ease; }
  .ev-card:hover { box-shadow: 0 16px 40px rgba(0,0,0,0.10) !important; transform: translateY(-3px); }
  .ev-img-wrap img { transition: transform 0.4s ease; }
  .ev-card:hover .ev-img-wrap img { transform: scale(1.04); }
  .ev-grad-btn {
    background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;
  }
  .ev-grad-btn:hover { opacity: 0.88; box-shadow: 0 6px 20px rgba(33,33,143,0.35); }
  .ev-register-btn { transition: background 0.2s ease, box-shadow 0.2s ease; }
  .ev-register-btn:hover { box-shadow: 0 4px 14px rgba(37,99,235,0.3); }
  .ev-skel {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 600px 100%;
    animation: ev-shimmer 1.5s ease-in-out infinite;
  }
  .ev-modal-backdrop {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    background: rgba(0,0,0,0.45);
    backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  }
  .ev-modal-card { animation: ev-popIn 0.22s ease both; }
  .ev-badge { cursor: pointer; transition: background 0.15s ease, transform 0.15s ease; }
  .ev-badge:hover { transform: scale(1.06); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseBatches = (raw?: string | null): {
  alumni: number[];
  students: number[];
  departments: string[];
  deptScope: string;
} => {
  const def = { alumni: [], students: [], departments: [], deptScope: 'BOTH' };
  if (!raw) return def;
  try { return { ...def, ...JSON.parse(raw) }; } catch { return def; }
};

const audienceConfig: Record<string, { badgeBg: string; badgeText: string }> = {
  ALL:     { badgeBg: 'bg-white/90',       badgeText: 'text-blue-700'    },
  ALUMNI:  { badgeBg: 'bg-indigo-100/90',  badgeText: 'text-indigo-700'  },
  STUDENT: { badgeBg: 'bg-violet-100/90',  badgeText: 'text-violet-700'  },
  CUSTOM:  { badgeBg: 'bg-emerald-100/90', badgeText: 'text-emerald-700' },
};

// ── Audience Detail Modal ─────────────────────────────────────────────────────
function AudienceModal({ event, onClose }: { event: any; onClose: () => void }) {
  const batches = parseBatches(event.targetBatches);

  const hasAlumniBatches  = batches.alumni?.length > 0;
  const hasStudentBatches = batches.students?.length > 0;
  const hasDepts          = batches.departments?.length > 0;

  const Icon =
    event.targetAudience === 'ALL'     ? Globe :
    event.targetAudience === 'ALUMNI'  ? Briefcase :
    event.targetAudience === 'STUDENT' ? GraduationCap : Users;

  // deptScope label
  const deptScopeLabel =
    batches.deptScope === 'ALUMNI'   ? 'Alumni only' :
    batches.deptScope === 'STUDENTS' ? 'Students only' : 'Both';

  return (
    <div className="ev-modal-backdrop" onMouseDown={onClose}>
      <div
        className="ev-modal-card bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center ev-grad-btn shrink-0">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Visibility</p>
              <h3 className="text-base font-black text-slate-900 leading-tight">{event.title}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Audience type badge */}
        <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Audience Type</p>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            event.targetAudience === 'ALL'     ? 'bg-blue-50 text-blue-700 border-blue-100'      :
            event.targetAudience === 'ALUMNI'  ? 'bg-indigo-50 text-indigo-700 border-indigo-100':
            event.targetAudience === 'STUDENT' ? 'bg-violet-50 text-violet-700 border-violet-100':
                                                  'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            <Icon className="w-3 h-3" />
            {event.targetAudience === 'ALL'     ? 'Everyone (Students + Alumni)' :
             event.targetAudience === 'ALUMNI'  ? 'Alumni Only' :
             event.targetAudience === 'STUDENT' ? 'Students Only' : 'Custom Mix'}
          </span>
        </div>

        {/* ALL — simple message */}
        {event.targetAudience === 'ALL' && !hasDepts && (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700 font-medium mb-3">
            ✅ Visible to <strong>all logged-in users</strong> — students and alumni both.
          </div>
        )}

        {/* Alumni batches */}
        {(event.targetAudience === 'ALUMNI' || event.targetAudience === 'CUSTOM') && (
          <div className="mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />Alumni Batches
            </p>
            {hasAlumniBatches ? (
              <div className="flex flex-wrap gap-1.5">
                {batches.alumni.sort((a, b) => a - b).map((yr) => (
                  <span key={yr} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                    {yr}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">All alumni batches</p>
            )}
          </div>
        )}

        {/* Student batches */}
        {(event.targetAudience === 'STUDENT' || event.targetAudience === 'CUSTOM') && (
          <div className="mb-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />Student Batches
            </p>
            {hasStudentBatches ? (
              <div className="flex flex-wrap gap-1.5">
                {batches.students.sort((a, b) => a - b).map((yr) => (
                  <span key={yr} className="px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg text-xs font-bold">
                    {yr}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">All student batches</p>
            )}
          </div>
        )}

        {/* ── DEPARTMENTS ── */}
        {hasDepts && (
          <div className="mb-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />
              Departments
              <span className="ml-auto text-[10px] font-normal normal-case text-slate-400">
                applies to: {deptScopeLabel}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {batches.departments.map((dept) => (
                <span key={dept} className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold">
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No dept filter note */}
        {!hasDepts && event.targetAudience !== 'ALL' && (
          <div className="mb-3 pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" />Departments
            </p>
            <p className="text-xs text-slate-400 italic">All departments</p>
          </div>
        )}

        <button type="button" onClick={onClose}
          className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
          Close
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Events() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents]           = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [audienceModal, setAudienceModal] = useState<any | null>(null);

  const getEventImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data.events || []);
    } catch { toast.error('Could not load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!authLoading && user) fetchEvents();
    else if (!authLoading && !user) setLoading(false);
  }, [user, authLoading]);

  const handleRegister = async (eventId: string) => {
    if (!confirm('Are you sure you want to register for this event?')) return;
    try {
      await axios.post(`/api/events/${eventId}/register`);
      toast.success('Registered successfully! 🎟️');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch { toast.error('Failed to delete event'); }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user && !authLoading) {
    return (
      <>
        <style suppressHydrationWarning>{ANIM_STYLES}</style>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
          <div className="ev-fade-0 bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ev-grad-btn">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              You need to be logged in to access this section.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1 py-3 ev-grad-btn text-white font-bold rounded-xl text-sm text-center">Login</Link>
              <Link href="/register" className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm text-center">Create Account</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style suppressHydrationWarning>{ANIM_STYLES}</style>
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="ev-skel h-8 w-52 rounded-xl" />
              <div className="ev-skel h-4 w-36 rounded-lg" />
            </div>
            <div className="ev-skel h-10 w-36 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                <div className="ev-skel h-48" />
                <div className="p-5 space-y-3">
                  <div className="ev-skel h-5 w-3/4 rounded-lg" />
                  <div className="ev-skel h-3 w-full rounded" />
                  <div className="ev-skel h-3 w-2/3 rounded" />
                  <div className="ev-skel h-10 w-full rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{ANIM_STYLES}</style>

      <div className="max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6">

        {/* Header */}
        <div className="ev-fade-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Community Events</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">Networking, meetups, and parties in one place.</p>
          </div>
          {user?.role === 'ADMIN' && (
            <Link href="/events/create"
              className="ev-grad-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md self-start sm:self-auto whitespace-nowrap">
              <Plus className="w-4 h-4" />Create Event
            </Link>
          )}
        </div>

        {/* Empty */}
        {events.length === 0 ? (
          <div className="ev-fade-1 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-lg text-slate-400 font-semibold">No events yet</p>
            <p className="text-sm text-slate-400 mt-1">Check back soon for upcoming events.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {events.map((event, idx) => {
              const fadeClass = `ev-fade-${Math.min(idx + 1, 5)}`;
              const cfg = audienceConfig[event.targetAudience] ?? audienceConfig['ALL'];
              const batches = parseBatches(event.targetBatches);
              const hasDepts = batches.departments?.length > 0;

              return (
                <div key={event.id} className={`${fadeClass} ev-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col`}>

                  {/* Image */}
                  <div className="ev-img-wrap h-44 sm:h-48 relative bg-slate-100 overflow-hidden">
                    {event.imageUrl ? (
                      <img src={getEventImageUrl(event.imageUrl)!} className="w-full h-full object-cover" alt={event.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)', opacity: 0.7 }}>
                        <Sparkles className="w-10 h-10 text-white/60" />
                      </div>
                    )}

                    {/* Clickable audience badge */}
                    <button type="button" onClick={() => setAudienceModal(event)}
                      className={`ev-badge absolute top-3 left-3 ${cfg.badgeBg} backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badgeText} shadow-sm flex items-center gap-1`}
                      title="Click to see who this event is for">
                      <Info className="w-3 h-3" />
                      {event.targetAudience === 'ALL'     ? 'For: Everyone' :
                       event.targetAudience === 'ALUMNI'  ? 'For: Alumni'   :
                       event.targetAudience === 'STUDENT' ? 'For: Students' : 'For: Custom'}
                    </button>

                    {/* Dept badge — shown if department filter is active */}
                    {hasDepts && (
                      <button type="button" onClick={() => setAudienceModal(event)}
                        className="ev-badge absolute top-3 right-3 bg-amber-100/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 shadow-sm flex items-center gap-1"
                        title="Department filter active">
                        <Building2 className="w-3 h-3" />
                        {batches.departments.length === 1
                          ? batches.departments[0]
                          : `${batches.departments.length} depts`}
                      </button>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5 leading-tight">{event.title}</h3>
                    <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">{event.description}</p>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-semibold">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-orange-500" />
                        </div>
                        <span className="font-semibold truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                      <button onClick={() => handleRegister(event.id)}
                        className="ev-register-btn flex-1 ev-grad-btn text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm">
                        Register Now ✨
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(event.id)}
                          className="w-10 h-10 sm:w-auto sm:px-4 sm:py-3 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-medium shrink-0"
                          title="Delete event">
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline ml-1.5 text-sm font-semibold">Delete</span>
                        </button>
                      )}
                    </div>

                    {/* Participants */}
                    {(user?.role === 'ALUMNI' || user?.role === 'ADMIN' || user?.role === 'STUDENT') && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                              Who&apos;s Joining? ({event.registrations?.length || 0})
                            </p>
                          </div>
                          <Link href={`/events/${event.id}/participants`}
                            className="text-[10px] text-blue-600 font-extrabold hover:underline bg-blue-50 px-2 py-1 rounded-md transition-all">
                            See All →
                          </Link>
                        </div>
                        {event.registrations?.length > 0 ? (
                          <div className="flex -space-x-2 overflow-hidden">
                            {event.registrations.slice(0, 6).map((reg: any) => (
                              <Link key={reg.id} href={`/alumni/${reg.user.id}`}>
                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer hover:scale-110 transition-transform"
                                  title={reg.user.name}>
                                  {reg.user.name.charAt(0).toUpperCase()}
                                </div>
                              </Link>
                            ))}
                            {event.registrations.length > 6 && (
                              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                                +{event.registrations.length - 6}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No registrations yet. Be the first!</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audience Modal */}
      {audienceModal && (
        <AudienceModal event={audienceModal} onClose={() => setAudienceModal(null)} />
      )}
    </>
  );
}