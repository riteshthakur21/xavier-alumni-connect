'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; 
import toast from 'react-hot-toast';

export default function ParticipantsList() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- States for Search & Filters ---
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [batch, setBatch] = useState('');

  // 1. Fetch Participants Data
  useEffect(() => {
    const getParticipants = async () => {
      try {
        const res = await axios.get(`/api/events/${id}/participants`);
        setParticipants(res.data.participants);
      } catch (err) {
        toast.error('Failed to load participants list');
      } finally {
        setLoading(false);
      }
    };
    if (id) getParticipants();
  }, [id]);

  // 2. Reset Filters Function (New) 🧹
  const resetFilters = () => {
    setSearch('');
    setDept('');
    setBatch('');
  };

  // 3. Multi-Filter Logic
  const filteredParticipants = participants.filter(p => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesDept = dept ? p.alumniProfile?.department === dept : true;
    const matchesBatch = (user?.role !== 'STUDENT' && batch) ? p.alumniProfile?.batchYear?.toString() === batch : true;
    return matchesName && matchesDept && matchesBatch;
  });

  const years = Array.from({ length: 2026 - 2010 + 1 }, (_, i) => 2026 - i);

  // Filter Active hai ya nahi check karne ke liye
  const isFilterActive = search !== '' || dept !== '' || batch !== '';

  if (loading) return <div className="p-20 text-center font-bold text-slate-500 text-xl animate-pulse">Loading community members... 🤝</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 bg-slate-50 hover:bg-slate-200 rounded-full transition-all text-slate-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Event Participants</h1>
        </div>
        
        {/* Reset Button (Only shows when filters are used) */}
        {isFilterActive && (
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all self-start md:self-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            Clear Filters
          </button>
        )}
      </div>

      {/* --- CONDITIONAL FILTER BAR --- */}
      <div className={`grid gap-4 mb-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 ${user?.role === 'STUDENT' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4'}`}>
        
        {/* Search Input */}
        <div className="md:col-span-2 relative">
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={search}
            className="w-full pl-4 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-500 transition-all font-medium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Department Dropdown */}
        <select 
          className="px-4 py-3.5 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-semibold text-slate-700 focus:border-blue-500 cursor-pointer"
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

        {/* Batch Year (Hidden for Students) */}
        {user?.role !== 'STUDENT' && (
          <select 
            className="px-4 py-3.5 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-semibold text-slate-700 focus:border-blue-500 cursor-pointer transition-all"
            onChange={(e) => setBatch(e.target.value)}
            value={batch}
          >
            <option value="">All Batches</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>

      {/* --- PARTICIPANTS GRID --- */}
      {filteredParticipants.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl text-slate-400 font-bold">No participants found matching your criteria.</p>
          <button onClick={resetFilters} className="mt-4 text-blue-600 font-extrabold hover:underline transition-all">Show all participants</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((person) => (
            <Link 
              key={person.id} 
              href={`/alumni/${person.id}`} 
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden group-hover:scale-110 transition-transform">
                {person.alumniProfile?.photoUrl ? (
                   <img src={person.alumniProfile.photoUrl} className="w-full h-full object-cover" alt={person.name} />
                ) : person.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {person.name}
                </h3>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-1 ${person.role === 'ALUMNI' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                   {person.role}
                </span>
                <p className="text-sm font-bold text-slate-500">
                  {person.alumniProfile?.department} • {user?.role === 'STUDENT' ? 'Current' : `Class of ${person.alumniProfile?.batchYear}`}
                </p>
              </div>
              
              {/* Arrow Icon for better UX */}
              <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}