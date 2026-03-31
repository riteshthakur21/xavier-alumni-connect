// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';
// import Link from 'next/link';

// export default function JobsPage() {
//     const { user, loading: authLoading } = useAuth();
//     const [jobs, setJobs] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     // Jobs data lana
//     useEffect(() => {
//         // 👇 Pehle check karo ki auth check khatam hua ya nahi
//         if (!authLoading) {
//             if (user) {
//                 // ✅ Tera purana fetching logic yahan rahega
//                 const fetchJobs = async () => {
//                     try {
//                         const res = await axios.get('http://localhost:5000/api/jobs');
//                         setJobs(res.data.jobs || []);
//                     } catch (error) {
//                         console.error('Error fetching jobs:', error);
//                     } finally {
//                         setLoading(false);
//                     }
//                 };
//                 fetchJobs();
//             } else {
//                 // ❌ Agar user nahi hai, toh loading band kar do
//                 setLoading(false);
//             }
//         }
//     }, [user, authLoading]); // 👈 Ye dependency array update karna zaroori hai

//     // Content return karne se pehle ye check:
//     if (authLoading) return <div className="p-8 text-center">Checking...</div>;

//     if (!user) {
//         return (
//             <div className="min-h-[60vh] flex items-center justify-center px-4">
//                 <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
//                     <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
//                         <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                         </svg>
//                     </div>
//                     <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
//                     <p className="text-slate-500 text-sm mb-8 leading-relaxed">
//                         You need to be logged in to access this section. Join our community to discover job opportunities posted by alumni.
//                     </p>
//                     <div className="flex flex-col sm:flex-row gap-3">
//                         <Link href="/login" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
//                             Login
//                         </Link>
//                         <Link href="/register" className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
//                             Create Account
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//     // Job delete karne ka function
//     const handleDelete = async (jobId: string) => {
//         if (!confirm('Are you sure you want to delete this job?')) return;

//         try {
//             await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
//             // Screen se bhi hata do bina refresh kiye
//             setJobs(jobs.filter(job => job.id !== jobId));
//             alert('Job deleted!');
//         } catch (error) {
//             console.error('Error deleting job:', error);
//             alert('Failed to delete job');
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-5xl mx-auto">

//                 {/* Header Section */}
//                 <div className="flex justify-between items-center mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-slate-900">Jobs & Internships</h1>
//                         <p className="text-slate-600 mt-1">Opportunities posted by our Alumni network</p>
//                     </div>

//                     {/* Post Job Button (Sirf Alumni/Admin ke liye) */}
//                     {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
//                         <Link
//                             href="/jobs/create"
//                             className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
//                         >
//                             + Post a Job
//                         </Link>
//                     )}
//                 </div>

//                 {/* Jobs List */}
//                 {loading ? (
//                     <div className="space-y-4">
//                         {Array.from({ length: 4 }).map((_, idx) => (
//                             <div key={idx} className="animate-pulse bg-white p-6 rounded-xl border border-slate-200">
//                                 <div className="flex justify-between gap-4">
//                                     <div className="flex-1 space-y-2">
//                                         <div className="h-5 bg-slate-200 rounded w-1/2" />
//                                         <div className="h-3 bg-slate-200 rounded w-1/3" />
//                                         <div className="flex gap-2 mt-2">
//                                             <div className="h-6 w-16 bg-slate-200 rounded-full" />
//                                             <div className="h-6 w-24 bg-slate-200 rounded-full" />
//                                         </div>
//                                         <div className="h-3 bg-slate-200 rounded w-full mt-2" />
//                                         <div className="h-3 bg-slate-200 rounded w-4/5" />
//                                     </div>
//                                     <div className="h-10 w-24 bg-slate-200 rounded-lg shrink-0" />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : jobs.length > 0 ? (
//                     <div className="space-y-4">
//                         {jobs.map((job) => (
//                             <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
//                                 <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">

//                                     {/* Job Details */}
//                                     <div>
//                                         <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
//                                         <div className="text-slate-600 font-medium mb-2">{job.company} • {job.location}</div>

//                                         <div className="flex flex-wrap gap-2 mb-3">
//                                             <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
//                                                 {job.type}
//                                             </span>
//                                             <span className="text-slate-500 text-sm flex items-center flex-wrap gap-1">
//                                                 Posted by

//                                                 {job.postedBy?.role === 'ADMIN' ? (
//                                                     // Admin has no alumni profile — render plain text + badge, no link
//                                                     <>
//                                                         <span className="font-medium text-slate-700 ml-1">
//                                                             {job.postedBy.name}
//                                                         </span>
//                                                         <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase tracking-wide">
//                                                             Admin
//                                                         </span>
//                                                     </>
//                                                 ) : job.postedBy?.id ? (
//                                                     // Alumni / regular user — link to their public profile
//                                                     <Link
//                                                         href={`/profile/${job.postedBy.id}`}
//                                                         className="text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1"
//                                                     >
//                                                         {job.postedBy.name}
//                                                     </Link>
//                                                 ) : (
//                                                     <span className="ml-1">{job.postedBy?.name || 'Unknown'}</span>
//                                                 )}
//                                             </span>

//                                         </div>

//                                         <p className="text-slate-600 text-sm line-clamp-2 mb-4 max-w-2xl">
//                                             {job.description}
//                                         </p>
//                                     </div>

//                                     {/* Buttons Container */}
//                                     <div className="flex flex-col gap-2 flex-shrink-0">
//                                         {/* Apply Button */}
//                                         {job.applyLink ? (
//                                             <a
//                                                 href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition text-center"
//                                             >
//                                                 Apply Now ↗
//                                             </a>
//                                         ) : (
//                                             <span className="text-slate-400 text-sm italic">No link provided</span>
//                                         )}

//                                         {/* Delete Button (Sirf Admin ya Owner ke liye) */}
//                                         {(user?.role === 'ADMIN' || user?.id === job.postedById) && (
//                                             <button
//                                                 onClick={() => handleDelete(job.id)}
//                                                 className="text-red-600 text-sm font-medium hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition border border-transparent hover:border-red-100"
//                                             >
//                                                 🗑️ Delete Job
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
//                         <p className="text-slate-500 text-lg">No jobs posted yet.</p>
//                         {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
//                             <p className="text-slate-400 text-sm mt-1">Be the first to post an opportunity!</p>
//                         )}
//                     </div>
//                 )}

//             </div>
//         </div>
//     );
// }

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Briefcase, MapPin, ExternalLink, Trash2, Plus, Lock, Building2, Clock } from 'lucide-react';

// ── Animations — no @import, zero hydration issues ────────────────────────────
const ANIM_STYLES = `
  @keyframes job-fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes job-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .job-fade-0 { animation: job-fadeUp 0.38s ease both; }
  .job-fade-1 { animation: job-fadeUp 0.38s 0.05s ease both; }
  .job-fade-2 { animation: job-fadeUp 0.38s 0.10s ease both; }
  .job-fade-3 { animation: job-fadeUp 0.38s 0.15s ease both; }
  .job-fade-4 { animation: job-fadeUp 0.38s 0.20s ease both; }
  .job-fade-5 { animation: job-fadeUp 0.38s 0.25s ease both; }

  .job-card {
    transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
  }
  .job-card:hover {
    box-shadow: 0 12px 36px rgba(0,0,0,0.09) !important;
    transform: translateY(-2px);
    border-color: #bfdbfe !important;
  }

  /* Same gradient as profile banner */
  .job-grad-btn {
    background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;
  }
  .job-grad-btn:hover {
    opacity: 0.88;
    box-shadow: 0 6px 20px rgba(33,33,143,0.35);
  }

  /* Skeleton shimmer */
  .job-skel {
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 600px 100%;
    animation: job-shimmer 1.5s ease-in-out infinite;
  }
`;

const jobTypeColors: Record<string, string> = {
  'FULL-TIME':   'bg-emerald-50 text-emerald-700 border-emerald-100',
  'PART-TIME':   'bg-blue-50 text-blue-700 border-blue-100',
  'INTERNSHIP':  'bg-violet-50 text-violetald-700 border-violet-100',
  'CONTRACT':    'bg-amber-50 text-amber-700 border-amber-100',
  'REMOTE':      'bg-indigo-50 text-indigo-700 border-indigo-100',
};

export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        const fetchJobs = async () => {
          try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            setJobs(res.data.jobs || []);
          } catch (error) {
            console.error('Error fetching jobs:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchJobs();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <style suppressHydrationWarning>{ANIM_STYLES}</style>
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
          <div className="job-fade-0 bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 job-grad-btn">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              You need to be logged in to discover job opportunities posted by our alumni network.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="flex-1 py-3 job-grad-btn text-white font-bold rounded-xl text-sm text-center">Login</Link>
              <Link href="/register" className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm text-center">Create Account</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch {
      alert('Failed to delete job');
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style suppressHydrationWarning>{ANIM_STYLES}</style>
        <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="job-skel h-8 w-52 rounded-xl" />
                <div className="job-skel h-4 w-40 rounded-lg" />
              </div>
              <div className="job-skel h-10 w-36 rounded-xl" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2.5">
                      <div className="job-skel h-5 w-1/2 rounded-lg" />
                      <div className="job-skel h-3.5 w-1/3 rounded" />
                      <div className="flex gap-2 mt-1">
                        <div className="job-skel h-6 w-20 rounded-full" />
                        <div className="job-skel h-6 w-28 rounded-full" />
                      </div>
                      <div className="job-skel h-3 w-full rounded mt-2" />
                      <div className="job-skel h-3 w-4/5 rounded" />
                    </div>
                    <div className="job-skel h-10 w-28 rounded-xl shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{ANIM_STYLES}</style>

      <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* ── PAGE HEADER ── */}
          <div className="job-fade-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Jobs &amp; Internships</h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">Opportunities posted by our Alumni network</p>
            </div>
            {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
              <Link
                href="/jobs/create"
                className="job-grad-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm shadow-md self-start sm:self-auto whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />Post a Job
              </Link>
            )}
          </div>

          {/* ── EMPTY STATE ── */}
          {jobs.length === 0 ? (
            <div className="job-fade-1 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-lg text-slate-400 font-semibold">No jobs posted yet.</p>
              {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
                <p className="text-sm text-slate-400 mt-1">Be the first to post an opportunity!</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, idx) => {
                const fadeClass = `job-fade-${Math.min(idx + 1, 5)}`;
                const typeStyle = jobTypeColors[job.type?.toUpperCase()] || 'bg-slate-50 text-slate-600 border-slate-200';

                return (
                  <div
                    key={job.id}
                    className={`${fadeClass} job-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden`}
                  >
                    {/* Accent top line */}
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #360707, #21218F, #00D4FF)' }} />

                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                        {/* ── JOB INFO ── */}
                        <div className="flex-1 min-w-0">

                          {/* Title + type badge */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight capitalize">{job.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${typeStyle}`}>
                              {job.type}
                            </span>
                          </div>

                          {/* Company + location */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium mb-3">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />{job.company}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />{job.location}
                            </span>
                          </div>

                          {/* Posted by */}
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3 flex-wrap">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Posted by</span>
                            {job.postedBy?.role === 'ADMIN' ? (
                              <>
                                <span className="font-semibold text-slate-700">{job.postedBy.name}</span>
                                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase tracking-wide">Admin</span>
                              </>
                            ) : job.postedBy?.id ? (
                              <Link href={`/profile/${job.postedBy.id}`} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                                {job.postedBy.name}
                              </Link>
                            ) : (
                              <span className="font-semibold text-slate-700">{job.postedBy?.name || 'Unknown'}</span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 max-w-2xl">
                            {job.description}
                          </p>
                        </div>

                        {/* ── ACTIONS ── */}
                        <div className="flex sm:flex-col gap-2 sm:gap-2 sm:items-end shrink-0">
                          {/* Apply — black */}
                          {job.applyLink ? (
                            <a
                              href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm whitespace-nowrap"
                            >
                              Apply Now <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs italic px-1 whitespace-nowrap">No link provided</span>
                          )}

                          {/* Delete */}
                          {(user?.role === 'ADMIN' || user?.id === job.postedById) && (
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="inline-flex items-center gap-1.5 text-red-500 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-500 transition-all whitespace-nowrap"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}