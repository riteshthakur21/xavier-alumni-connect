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
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Please Login First 🔒</h2>
                <p className="mb-6">You need an account to see Jobs.</p>
                <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Login</Link>
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
                    <div className="text-center py-12">Loading opportunities...</div>
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
                                            <span className="text-slate-500 text-sm flex items-center">
                                                Posted by
                                                {/* 👇 FIX: Wapas 'id' (User ID) use kar rahe hain */}
                                                {job.postedBy?.role === 'ALUMNI' && job.postedBy?.id ? (
                                                    <Link
                                                        href={`/alumni/${job.postedBy.id}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1"
                                                    >
                                                        {job.postedBy.name}
                                                    </Link>
                                                ) : (
                                                    <span className="ml-1">{job.postedBy?.name || 'User'}</span>
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