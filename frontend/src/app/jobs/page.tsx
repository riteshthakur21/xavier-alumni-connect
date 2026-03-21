'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function JobsPage() {
    const { user, loading: authLoading } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Jobs data lana
    useEffect(() => {
        // 👇 Pehle check karo ki auth check khatam hua ya nahi
        if (!authLoading) {
            if (user) {
                // ✅ Tera purana fetching logic yahan rahega
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
                // ❌ Agar user nahi hai, toh loading band kar do
                setLoading(false);
            }
        }
    }, [user, authLoading]); // 👈 Ye dependency array update karna zaroori hai

    // Content return karne se pehle ye check:
    if (authLoading) return <div className="p-8 text-center">Checking...</div>;

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        You need to be logged in to access this section. Join our community to discover job opportunities posted by alumni.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/login" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
                            Login
                        </Link>
                        <Link href="/register" className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    // Job delete karne ka function
    const handleDelete = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/jobs/${jobId}`);
            // Screen se bhi hata do bina refresh kiye
            setJobs(jobs.filter(job => job.id !== jobId));
            alert('Job deleted!');
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Jobs & Internships</h1>
                        <p className="text-slate-600 mt-1">Opportunities posted by our Alumni network</p>
                    </div>

                    {/* Post Job Button (Sirf Alumni/Admin ke liye) */}
                    {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
                        <Link
                            href="/jobs/create"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                        >
                            + Post a Job
                        </Link>
                    )}
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse bg-white p-6 rounded-xl border border-slate-200">
                                <div className="flex justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-slate-200 rounded w-1/2" />
                                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                                        <div className="flex gap-2 mt-2">
                                            <div className="h-6 w-16 bg-slate-200 rounded-full" />
                                            <div className="h-6 w-24 bg-slate-200 rounded-full" />
                                        </div>
                                        <div className="h-3 bg-slate-200 rounded w-full mt-2" />
                                        <div className="h-3 bg-slate-200 rounded w-4/5" />
                                    </div>
                                    <div className="h-10 w-24 bg-slate-200 rounded-lg shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">

                                    {/* Job Details */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                                        <div className="text-slate-600 font-medium mb-2">{job.company} • {job.location}</div>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                                {job.type}
                                            </span>
                                            <span className="text-slate-500 text-sm flex items-center flex-wrap gap-1">
                                                Posted by

                                                {job.postedBy?.role === 'ADMIN' ? (
                                                    // Admin has no alumni profile — render plain text + badge, no link
                                                    <>
                                                        <span className="font-medium text-slate-700 ml-1">
                                                            {job.postedBy.name}
                                                        </span>
                                                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase tracking-wide">
                                                            Admin
                                                        </span>
                                                    </>
                                                ) : job.postedBy?.id ? (
                                                    // Alumni / regular user — link to their public profile
                                                    <Link
                                                        href={`/profile/${job.postedBy.id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1"
                                                    >
                                                        {job.postedBy.name}
                                                    </Link>
                                                ) : (
                                                    <span className="ml-1">{job.postedBy?.name || 'Unknown'}</span>
                                                )}
                                            </span>

                                        </div>

                                        <p className="text-slate-600 text-sm line-clamp-2 mb-4 max-w-2xl">
                                            {job.description}
                                        </p>
                                    </div>

                                    {/* Buttons Container */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        {/* Apply Button */}
                                        {job.applyLink ? (
                                            <a
                                                href={job.applyLink.startsWith('http') ? job.applyLink : `https://${job.applyLink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition text-center"
                                            >
                                                Apply Now ↗
                                            </a>
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">No link provided</span>
                                        )}

                                        {/* Delete Button (Sirf Admin ya Owner ke liye) */}
                                        {(user?.role === 'ADMIN' || user?.id === job.postedById) && (
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                className="text-red-600 text-sm font-medium hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition border border-transparent hover:border-red-100"
                                            >
                                                🗑️ Delete Job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No jobs posted yet.</p>
                        {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
                            <p className="text-slate-400 text-sm mt-1">Be the first to post an opportunity!</p>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
