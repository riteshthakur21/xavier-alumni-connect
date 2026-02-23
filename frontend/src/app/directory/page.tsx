// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '@/contexts/AuthContext';
// import Link from 'next/link';

// export default function Directory() {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Search & Filters State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDept, setSelectedDept] = useState('');
//   const [selectedRole, setSelectedRole] = useState('');

//   // 1. Data lana (API Call)
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/users');
//         setUsers(res.data.users || []);
//       } catch (error) {
//         console.error('Error fetching directory:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // 2. Filter Logic
//   const filteredUsers = users.filter((u) => {
//     // Search (Name or Company)
//     const nameMatch = u.name ? u.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
//     const companyMatch = u.currentCompany ? u.currentCompany.toLowerCase().includes(searchTerm.toLowerCase()) : false;
//     const matchesSearch = nameMatch || companyMatch;

//     // Dept Filter
//     const matchesDept = selectedDept ? u.department === selectedDept : true;

//     // Role Filter (Alumni/Student)
//     const matchesRole = selectedRole ? u.role === selectedRole : true;

//     return matchesSearch && matchesDept && matchesRole;
//   });

//   // --- YAHAN CHANGE KIYA HAI 👇 ---
//   const departments = ['BBA', 'BCA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)'];

//   return (
//     <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">

//         {/* Header Section */}
//         <div className="text-center mb-10">
//           <h1 className="text-3xl font-bold text-slate-900">Alumni Directory</h1>
//           <p className="text-slate-600 mt-2">Find and connect with your batchmates and seniors</p>
//         </div>

//         {/* Search & Filters Box */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-8 sticky top-4 z-10">
//           <div className="grid md:grid-cols-4 gap-4">

//             {/* Search Bar */}
//             <div className="md:col-span-2">
//               <input
//                 type="text"
//                 placeholder="🔍 Search by name or company..."
//                 className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             {/* Department Filter */}
//             <select
//               className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//               value={selectedDept}
//               onChange={(e) => setSelectedDept(e.target.value)}
//             >
//               <option value="">All Departments</option>
//               {departments.map(dept => (
//                 <option key={dept} value={dept}>{dept}</option>
//               ))}
//             </select>

//             {/* Role Filter */}
//             <select
//               className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
//               value={selectedRole}
//               onChange={(e) => setSelectedRole(e.target.value)}
//             >
//               <option value="">All Roles</option>
//               <option value="ALUMNI">Alumni</option>
//               <option value="STUDENT">Students</option>
//             </select>
//           </div>
//         </div>

//         {/* Results Grid */}
//         {loading ? (
//           <div className="text-center py-12">Loading directory...</div>
//         ) : (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredUsers.length > 0 ? (
//               filteredUsers.map((profile) => (
//                 <div key={profile.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
//                   <div className="flex items-start gap-4">
//                     {/* Avatar */}
//                     <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl flex-shrink-0 overflow-hidden">
//                       {profile.profileImage ? (
//                         <img
//                           src={`http://localhost:5000/${profile.profileImage.replace(/\\/g, '/').replace(/^\/+/, '')}`}
//                           alt={profile.name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         profile.name.charAt(0)
//                       )}
//                     </div>

//                     {/* Info */}
//                     <div className="flex-1">
//                       <h3 className="font-bold text-lg text-slate-900">{profile.name}</h3>
//                       <p className="text-sm text-blue-600 font-medium mb-1">{profile.role}</p>

//                       <div className="text-sm text-slate-500 space-y-1">
//                         {profile.role === 'ALUMNI' && profile.currentCompany && (
//                           <p>🏢 {profile.currentCompany} {profile.jobTitle ? `• ${profile.jobTitle}` : ''}</p>
//                         )}
//                         <p>🎓 {profile.department} ({profile.batchYear})</p>
//                       </div>

//                       {/* Buttons Area */}
//                       <div className="mt-4 flex gap-3">
//                         {/* Primary Button: View Profile */}
//                         <Link
//                           href={`/profile/${profile.id}`}
//                           className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm hover:shadow-md"
//                         >
//                           View Profile
//                         </Link>

//                         {/* Secondary Button: Email Icon */}
//                         <a
//                           href={`mailto:${profile.email}`}
//                           className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-slate-900 border border-slate-200 active:scale-95 transition-all"
//                           title="Send Email"
//                         >
//                           {/* SVG Mail Icon (Professional Look) */}
//                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                             <rect width="20" height="16" x="2" y="4" rx="2" />
//                             <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//                           </svg>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="col-span-full text-center py-12 text-slate-500">
//                 No profiles found matching your search.
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // 👈 Redirect ke liye
// import { useAuth } from '@/contexts/AuthContext'; // 👈 Auth check ke liye
// import toast from 'react-hot-toast';

// export default function Directory() {
//   const { user } = useAuth(); // Auth status check karne ke liye
//   const router = useRouter();

//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedDept, setSelectedDept] = useState('');
//   const [selectedRole, setSelectedRole] = useState('');
//   const [selectedYear, setSelectedYear] = useState('');

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get('http://localhost:5000/api/users');
//         setUsers(res.data.users || []);
//       } catch (error) {
//         toast.error('Failed to load directory');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // --- Protected Action Helper 🛡️ ---
//   const handleProtectedAction = (e: React.MouseEvent, targetPath?: string) => {
//     if (!user) {
//       e.preventDefault();
//       toast.error('Please login first! 🔒');
//       router.push('/login');
//       return false;
//     }
//     if (targetPath) router.push(targetPath);
//     return true;
//   };

//   const currentYear = 2026;
//   const startYear = 2013;

//   const years = Array.from(
//     { length: currentYear - startYear + 1 },
//     (_, i) => currentYear - i
//   );

//   const filteredUsers = users.filter((u) => {
//     const matchesSearch =
//       u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       u.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesDept = selectedDept ? u.department === selectedDept : true;
//     const matchesRole = selectedRole ? u.role === selectedRole : true;
//     const matchesYear = selectedYear ? u.batchYear?.toString() === selectedYear : true;

//     return matchesSearch && matchesDept && matchesRole && matchesYear;
//   });

//   const departments = ['BBA', 'BCA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)'];

//   if (loading) return <div className="p-20 text-center animate-pulse font-bold text-slate-500 text-xl">Loading directory... 🔍</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">

//         <div className="text-center mb-8">
//           <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Alumni Directory</h1>
//           <p className="text-slate-600 mt-2 text-sm sm:text-base">Connect with batchmates, seniors, and juniors across generations.</p>
//         </div>

//         {/* --- FILTER BAR (Intact) --- */}
//         <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 mb-8 sticky top-4 z-30">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
//             <div className="lg:col-span-1">
//               <input
//                 type="text"
//                 placeholder="🔍 Search name/company..."
//                 className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <select
//               className="px-4 py-3 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-semibold text-slate-700 text-sm cursor-pointer"
//               value={selectedDept}
//               onChange={(e) => setSelectedDept(e.target.value)}
//             >
//               <option value="">All Departments</option>
//               {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
//             </select>

//             <select
//               className="px-4 py-3 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-semibold text-slate-700 text-sm cursor-pointer"
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(e.target.value)}
//             >
//               <option value="">All Batches</option>
//               {years.map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>

//             <select
//               className="px-4 py-3 rounded-2xl border border-slate-200 outline-none bg-slate-50 font-semibold text-slate-700 text-sm cursor-pointer"
//               value={selectedRole}
//               onChange={(e) => setSelectedRole(e.target.value)}
//             >
//               <option value="">All Roles</option>
//               <option value="ALUMNI">Alumni</option>
//               <option value="STUDENT">Students</option>
//             </select>

//             <button
//               onClick={() => { setSearchTerm(''); setSelectedDept(''); setSelectedRole(''); setSelectedYear(''); }}
//               className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-100 transition-all"
//             >
//               Reset Filters
//             </button>
//           </div>
//         </div>

//         {/* --- RESULTS GRID --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredUsers.length > 0 ? (
//             filteredUsers.map((profile) => (
//               <div key={profile.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
//                 <div className="flex items-start gap-4">
//                   {/* Directory Card Profile Image Container */}
//                   <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-bold text-2xl sm:text-3xl flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
//                     {profile.alumniProfile?.photoUrl ? (
//                       <img
//                         src={profile.alumniProfile.photoUrl} // ✅ Direct Cloudinary link (No localhost!)
//                         alt={profile.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) => { e.currentTarget.style.display = 'none' }}
//                       />
//                     ) : (
//                       profile.name.charAt(0) // Default: Name ka pehla letter agar photo na ho
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <h3 className="font-extrabold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">{profile.name}</h3>
//                     <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest mb-2 ${profile.role === 'ALUMNI' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
//                       {profile.role}
//                     </span>
//                     <div className="text-sm text-slate-500 space-y-1 font-medium">
//                       {profile.role === 'ALUMNI' && profile.currentCompany && <p className="truncate">🏢 {profile.currentCompany}</p>}
//                       <p className="truncate">🎓 {profile.department} • {profile.batchYear}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* --- PROTECTED ACTIONS SECTION (FIXED) --- */}
//                 <div className="mt-6 flex gap-3">
//                   {/* View Profile Button: Pehle check karega login */}
//                   <button
//                     onClick={(e) => handleProtectedAction(e, `/profile/${profile.id}`)}
//                     className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
//                   >
//                     View Profile
//                   </button>

//                   {/* Email Button: Ye bhi ab protected hai */}
//                   <button
//                     onClick={(e) => {
//                       if (handleProtectedAction(e)) {
//                         window.location.href = `mailto:${profile.email}`;
//                       }
//                     }}
//                     className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-slate-100 transition-all"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                       <rect width="20" height="16" x="2" y="4" rx="2" />
//                       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
//               <p className="text-xl text-slate-400 font-bold">No results found.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Directory() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // 1. Fetch Users Logic (Corrected Route & Nested Data)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Backend route must match: /api/alumni
        const res = await axios.get('http://localhost:5000/api/alumni');
        setUsers(res.data.alumni || []);
      } catch (error) {
        toast.error('Failed to load directory');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Protected Action Helper (Login Check)
  const handleProtectedAction = (e: React.MouseEvent, targetPath?: string) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please login first! 🔒');
      router.push('/login');
      return false;
    }
    if (targetPath) router.push(targetPath);
    return true;
  };

  // 3. Filter Logic (Checking Nested alumniProfile Fields)
  const filteredUsers = users.filter((u) => {
    const profile = u.alumniProfile || {}; // Accessing nested data

    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept ? profile.department === selectedDept : true;
    const matchesRole = selectedRole ? u.role === selectedRole : true;
    const matchesYear = selectedYear ? profile.batchYear?.toString() === selectedYear : true;

    return matchesSearch && matchesDept && matchesRole && matchesYear;
  });

  const years = Array.from({ length: 2026 - 2013 + 1 }, (_, i) => 2026 - i);
  const departments = ['BBA', 'BCA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)'];

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 text-xl">Loading Xavier Alumni Directory... 🔍</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Xavier Alumni Directory 🎓</h1>
          <p className="text-slate-500 mt-2 font-medium">Find and connect with your college community.</p>
        </div>

        {/* --- FILTER BAR --- */}
        {/* <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 mb-8 sticky top-4 z-30 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="🔍 Search name or company..."
            className="flex-1 min-w-[200px] px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select className="px-4 py-3 rounded-2xl bg-slate-50 font-bold text-slate-600 text-xs border-none outline-none" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select className="px-4 py-3 rounded-2xl bg-slate-50 font-bold text-slate-600 text-xs border-none outline-none" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            <option value="">All Batches</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button onClick={() => { setSearchTerm(''); setSelectedDept(''); setSelectedYear(''); }} className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-xs hover:bg-red-100 transition-all">Reset</button>
        </div> */}
        {/* --- ENHANCED FILTER BAR --- */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/40 border border-white mb-8 sticky top-4 z-30 flex flex-col md:flex-row gap-3 sm:gap-4 transition-all">

          {/* Search Input with Custom SVG Icon */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or company..."
              className="w-full pl-11 pr-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-bold text-sm text-slate-700 transition-all placeholder:text-slate-400 placeholder:font-medium outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters Container (Adapts on mobile) */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">

            {/* Department Dropdown with custom arrow */}
            <div className="relative flex-1 sm:w-44">
              <select
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-black text-slate-600 text-xs sm:text-sm outline-none transition-all cursor-pointer appearance-none pr-10"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Batch Year Dropdown with custom arrow */}
            <div className="relative flex-1 sm:w-36">
              <select
                className="w-full px-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-black text-slate-600 text-xs sm:text-sm outline-none transition-all cursor-pointer appearance-none pr-10"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Batches</option>
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Refined Reset Button */}
            <button
              onClick={() => { setSearchTerm(''); setSelectedDept(''); setSelectedYear(''); }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-red-50 text-red-600 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95 border border-red-100 hover:border-red-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="sm:hidden lg:inline">Reset</span>
            </button>

          </div>
        </div>

        {/* --- RESULTS GRID --- */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((profile) => (
              <div key={profile.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 font-black text-3xl flex-shrink-0 overflow-hidden border-2 border-white shadow-inner">
                    {profile.alumniProfile?.photoUrl ? (
                      <img
                        src={profile.alumniProfile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                        // ✅ FIX: Agar link broken ho, toh image ko hide karke fallback letter dikhao
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-blue-600 font-black">${profile.name?.charAt(0) || 'X'}</span>`;
                        }}
                      />
                    ) : (
                      profile.name?.charAt(0) || 'X'
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-xl text-slate-800 truncate">{profile.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${profile.role === 'ALUMNI' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {profile.role}
                      </span>
                      {profile.alumniProfile?.batchYear && (
                        <span className="text-[10px] font-bold text-slate-400">Class of {profile.alumniProfile.batchYear}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <span className="opacity-50 text-base">🎓</span> {profile.alumniProfile?.department || 'N/A'}
                  </p>
                  {profile.alumniProfile?.company && (
                    <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                      <span className="opacity-50 text-base">🏢</span> {profile.alumniProfile.company}
                    </p>
                  )}
                </div>

                {/* --- ACTIONS --- 
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={(e) => handleProtectedAction(e, `/profile/${profile.id}`)}
                    className="flex-1 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                  >
                    VIEW PROFILE
                  </button>
                  {/* <button
                    onClick={(e) => { if (handleProtectedAction(e)) window.location.href = `mailto:${profile.email}`; }}
                    className="w-14 h-14 flex items-center justify-center bg-white text-slate-400 rounded-2xl hover:text-blue-600 border border-slate-100 hover:border-blue-100 transition-all shadow-sm"
                  >
                    <i className="fas fa-envelope text-lg"></i>
                  </button> 
                  <button
                    onClick={(e) => { if (handleProtectedAction(e)) window.location.href = `mailto:${profile.email}`; }}
                    title="Send Email"
                    className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all shadow-sm group/mail active:scale-95"
                  >
                    {/* Pure SVG Icon - Kabhi fail nahi hoga 
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover/mail:scale-110 transition-transform duration-300"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-xl text-slate-300 font-black">NO RESULTS MATCH YOUR FILTERS</p>
            </div>
          )}
        </div> */}
        {/* --- RESULTS GRID (Mobile Adaptive & Enhanced UI) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((profile) => (
              <div key={profile.id} className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 p-5 sm:p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group flex flex-col">

                {/* --- Header (Avatar & Details) --- */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 font-black text-2xl sm:text-3xl overflow-hidden border-[3px] border-white shadow-md">
                      {profile.alumniProfile?.photoUrl ? (
                        <img
                          src={profile.alumniProfile.photoUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          // ✅ FIX: Logic untouched
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-blue-600 font-black">${profile.name?.charAt(0) || 'X'}</span>`;
                          }}
                        />
                      ) : (
                        profile.name?.charAt(0) || 'X'
                      )}
                    </div>
                    {/* Active Dot indicator */}

                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg sm:text-xl text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {profile.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                      <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm ${profile.role === 'ALUMNI'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                        {profile.role}
                      </span>
                      {profile.alumniProfile?.batchYear && (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                          Class of {profile.alumniProfile.batchYear}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- Info Box (Department & Company) --- */}
                <div className="mt-5 sm:mt-6 space-y-2.5 bg-slate-50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white shadow-sm text-sm">🎓</span>
                    <span className="truncate">{profile.alumniProfile?.department || 'N/A'}</span>
                  </p>
                  {profile.alumniProfile?.company && (
                    <p className="text-[11px] sm:text-xs font-bold text-slate-600 flex items-center gap-2.5">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white shadow-sm text-sm">🏢</span>
                      <span className="truncate">{profile.alumniProfile.company}</span>
                    </p>
                  )}
                </div>

                {/* --- Actions (View Profile & Fixed SVG Mail) --- */}
                <div className="mt-5 sm:mt-6 flex gap-2 sm:gap-3 items-center">
                  <button
                    onClick={(e) => handleProtectedAction(e, `/profile/${profile.id}`)}
                    className="flex-1 py-3.5 sm:py-4 bg-blue-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 active:scale-95 transition-all"
                  >
                    VIEW PROFILE
                  </button>

                  <button
                    onClick={(e) => { if (handleProtectedAction(e)) window.location.href = `mailto:${profile.email}`; }}
                    title="Send Email"
                    className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white text-red-500 rounded-xl sm:rounded-2xl hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all shadow-sm hover:shadow-md group/mail active:scale-95 flex-shrink-0"
                  >
                    {/* Pure SVG Icon - Fail Proof */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover/mail:scale-110 transition-transform duration-300 sm:w-[22px] sm:h-[22px]"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 sm:py-20 bg-white rounded-[2rem] sm:rounded-[3rem] border-4 border-dashed border-slate-100">
              <p className="text-lg sm:text-xl text-slate-300 font-black tracking-widest uppercase">NO RESULTS MATCH YOUR FILTERS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}