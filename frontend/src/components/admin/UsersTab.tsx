'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('ALL'); 
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleParam = activeSubTab === 'ALL' ? '' : `&role=${activeSubTab}`;
      const res = await axios.get(`http://localhost:5000/api/admin/users?page=${page}&search=${search}${roleParam}`);
      setUsers(res.data.users);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeSubTab, page, search]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Search & Filter */}
      <div className="p-4 sm:p-6 border-b border-slate-50 flex flex-col lg:flex-row justify-between gap-4 bg-slate-50/30">
        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
          {['ALL', 'ALUMNI', 'STUDENT'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveSubTab(tab); setPage(1); }}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeSubTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab === 'ALL' ? 'Everyone' : tab + 'S'}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <input 
            type="text" 
            placeholder="Search name, roll no, email..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 text-sm transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* --- Table Container with Full Data Support --- */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[800px]"> {/* min-w ensure karta hai ki data squish na ho */}
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Dept & Batch</th>
              <th className="px-6 py-4">Roll No</th> 
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-tighter">Syncing Records...</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/profile/${u.id}`} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 uppercase ${u.role === 'ALUMNI' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-600">{u.alumniProfile?.department || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{u.alumniProfile?.batchYear || ''}</p>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                      {u.rollNo || 'N/A'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${u.role === 'ALUMNI' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter ${u.isVerified ? 'text-blue-600' : 'text-orange-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isVerified ? 'bg-blue-600' : 'bg-orange-500 animate-pulse'}`}></span>
                      {u.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-50 flex justify-center items-center gap-4 bg-slate-50/20">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm disabled:opacity-30">Previous</button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold shadow-sm disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}