'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building2,
  Search,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type ConnectedUser = {
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

export default function ConnectionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchConnections = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/connections/my`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit },
      });
      setConnections(res.data.data || []);
      setTotal(res.data.pagination?.total ?? 0);
      setTotalPages(res.data.pagination?.pages ?? 1);
    } catch {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user) fetchConnections();
  }, [user, fetchConnections]);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  const filtered = search.trim()
    ? connections.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.alumniProfile?.department?.toLowerCase().includes(q) ?? false) ||
          (c.alumniProfile?.company?.toLowerCase().includes(q) ?? false)
        );
      })
    : connections;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Connections</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {total} {total === 1 ? 'connection' : 'connections'} in your network
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connections..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold">
              {search.trim() ? 'No connections match your search' : 'No connections yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {search.trim()
                ? 'Try a different search term'
                : 'Start connecting with alumni from the directory'}
            </p>
            {!search.trim() && (
              <Link
                href="/directory"
                className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Browse Directory
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((person) => {
              const photoUrl = getImageUrl(person.alumniProfile?.photoUrl);

              return (
                <Link
                  key={person.id}
                  href={`/alumni/${person.id}`}
                  className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md p-5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {photoUrl ? (
                        <img src={photoUrl} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        person.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Name & role */}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        {person.name}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wide">
                        {person.role}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 space-y-1.5">
                    {person.alumniProfile?.department && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {person.alumniProfile.department}
                          {person.alumniProfile.batchYear && ` · Batch ${person.alumniProfile.batchYear}`}
                        </span>
                      </div>
                    )}
                    {person.alumniProfile?.company && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          {person.alumniProfile.jobTitle
                            ? `${person.alumniProfile.jobTitle} at ${person.alumniProfile.company}`
                            : person.alumniProfile.company}
                        </span>
                      </div>
                    )}
                    {!person.alumniProfile?.department && !person.alumniProfile?.company && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>No profile details yet</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
