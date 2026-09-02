'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ParticipantsList() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Search & Filters
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [batch, setBatch] = useState('');

  // 1. Fetch Participants Data
  useEffect(() => {
    const getParticipants = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events/${id}/participants`);
        setParticipants(res.data.participants || []);
      } catch (err) {
        toast.error('Failed to load participants list');
      } finally {
        setLoading(false);
      }
    };
    if (id) getParticipants();
  }, [id]);

  // 2. Reset Filters
  const resetFilters = () => {
    setSearch('');
    setDept('');
    setBatch('');
  };

  // 3. Multi-Filter Logic
  const filteredParticipants = participants.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = dept ? p.alumniProfile?.department === dept : true;
    const matchesBatch =
      user?.role !== 'STUDENT' && batch
        ? p.alumniProfile?.batchYear?.toString() === batch
        : true;
    return matchesName && matchesDept && matchesBatch;
  });

  const years = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => 2026 - i);
  const isFilterActive = Boolean(search || dept || batch);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* ─── EDITORIAL HEADER (Matched with Alumni Stories) ────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Title & Navigation */}
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Events</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Event Participants
              </h1>
            </div>
            <p className="text-sm text-[#5c4d37] mt-1.5 max-w-xl">
              Explore the directory of registered attendees, scholars, and alumni joining this event.
            </p>
          </div>

          {isFilterActive && (
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] hover:bg-[#c4821a] hover:text-[#f4efe6] rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* ─── SEARCH & FILTER BAR ─────────────────────────────────────────── */}
        <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#1a1410]/12 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f] group-focus-within:text-[#c4821a] transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search attendee by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#fcfbf9] border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
              />
            </div>

            {/* Department Dropdown */}
            <div className="relative md:w-52">
              <select
                className="w-full pl-3.5 pr-8 py-2.5 bg-[#fcfbf9] border border-[#1a1410]/15 text-xs sm:text-sm text-[#1a1410] font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none"
                onChange={(e) => setDept(e.target.value)}
                value={dept}
              >
                <option value="">All Departments</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="BCOM (P)">BCOM (P)</option>
                <option value="BBA (IB)">BBA (IB)</option>
                <option value="BA (JMC)">BA (JMC)</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6a4f] pointer-events-none" />
            </div>

            {/* Batch Year Dropdown */}
            {user?.role !== 'STUDENT' && (
              <div className="relative md:w-44">
                <select
                  className="w-full pl-3.5 pr-8 py-2.5 bg-[#fcfbf9] border border-[#1a1410]/15 text-xs sm:text-sm text-[#1a1410] font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 cursor-pointer appearance-none"
                  onChange={(e) => setBatch(e.target.value)}
                  value={batch}
                >
                  <option value="">All Batches</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      Class of {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7d6a4f] pointer-events-none" />
              </div>
            )}
          </div>

          {/* Counter */}
          <div className="mt-3 pt-2.5 border-t border-[#1a1410]/8 flex items-center justify-between text-xs text-[#7d6a4f]">
            <div className="font-mono">
              Showing <span className="font-bold text-[#1a1410]">{filteredParticipants.length}</span> of{' '}
              <span className="font-bold text-[#1a1410]">{participants.length}</span> attendees
            </div>
            {isFilterActive && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-[#c4821a]">
                <Sparkles className="w-3 h-3" />
                <span>Filters Active</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── PARTICIPANTS LIST / GRID ─────────────────────────────────────── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-[#1a1410]/10 shadow-sm flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1a1410]/10 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#1a1410]/15 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-[#1a1410]/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#1a1410]/15 shadow-sm p-6">
            <div className="w-14 h-14 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-[#1a1410] font-normal mb-1">
              No participants match your search
            </h3>
            <p className="text-xs sm:text-sm text-[#5c4d37] max-w-md mx-auto mb-5 leading-relaxed">
              Try adjusting your name keyword, department filter, or graduation cohort.
            </p>
            {isFilterActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl hover:bg-[#3d3222] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Attendees</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredParticipants.map((person) => {
              const photo = getImageUrl(person.alumniProfile?.photoUrl);
              const isAlumni = person.role === 'ALUMNI';

              return (
                <Link
                  key={person.id}
                  href={`/profile/${person.id}`}
                  className="bg-white p-5 rounded-2xl border border-[#1a1410]/12 shadow-sm hover:shadow-md hover:border-[#1a1410]/25 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 group"
                >
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center font-serif text-xl overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    {photo ? (
                      <img
                        src={photo}
                        className="w-full h-full object-cover"
                        alt={person.name}
                      />
                    ) : (
                      person.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-serif text-base text-[#1a1410] font-normal group-hover:text-[#c4821a] transition-colors truncate">
                        {person.name}
                      </h3>
                    </div>

                    <span
                      className={`inline-block px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-semibold mb-1 ${
                        isAlumni
                          ? 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]'
                          : 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30'
                      }`}
                    >
                      {person.role}
                    </span>

                    <p className="text-xs text-[#5c4d37] truncate">
                      {person.alumniProfile?.department || 'Department'}{' '}
                      &bull;{' '}
                      {user?.role === 'STUDENT'
                        ? 'Enrolled'
                        : `Class of ${person.alumniProfile?.batchYear || '—'}`}
                    </p>
                  </div>

                  <div className="text-[#7d6a4f] group-hover:text-[#1a1410] transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}