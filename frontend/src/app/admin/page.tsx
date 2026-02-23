// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
// import UsersTab from '@/components/admin/UsersTab';
// import axios from 'axios';
// import toast from 'react-hot-toast';


// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   isVerified: boolean;
//   createdAt: string;
//   alumniProfile?: {
//     batchYear: number;
//     department: string;
//     company?: string;
//   };
// }

// interface Stats {
//   totalUsers: number;
//   totalAlumni: number;
//   verifiedAlumni: number;
//   pendingAlumni: number;
//   totalStudents: number;
//   totalEvents: number;
// }

// export default function AdminDashboard() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [pendingAlumni, setPendingAlumni] = useState<User[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'users' | 'reports'>('overview');

//   useEffect(() => {
//     if (!loading && !user) {
//       router.push('/login');
//     } else if (user && user.role !== 'ADMIN') {
//       router.push('/dashboard');
//     } else if (user) {
//       fetchAdminData();
//     }
//   }, [user, loading, router]);

//   // const fetchAdminData = async () => {
//   //   try {
//   //     const [statsResponse, pendingResponse] = await Promise.all([
//   //       // axios.get('/api/admin/stats'),
//   //       axios.get('http://localhost:5000/api/admin/stats'),
//   //       axios.get('http://localhost:5000/api/admin/pending'),
//   //     ]);

//   //     setStats(statsResponse.data);
//   //     setPendingAlumni(pendingResponse.data.pendingAlumni);
//   //   } catch (error) {
//   //     console.error('Error fetching admin data:', error);
//   //     toast.error('Failed to load admin data');
//   //   }
//   // };
// const fetchAdminData = async () => {
//     try {
//       const [statsResponse, pendingResponse] = await Promise.all([
//         // URL poora likho taaki 404 error na aaye
//         axios.get('http://localhost:5000/api/admin/stats'),
//         axios.get('http://localhost:5000/api/admin/pending'),
//       ]);

//       setStats(statsResponse.data);

//       // ✅ CORRECT: Tumhara backend 'pendingAlumni' bhej raha hai
//       setPendingAlumni(pendingResponse.data.pendingAlumni || []); 

//     } catch (error) {
//       console.error('Error fetching admin data:', error);
//       toast.error('Failed to load admin data');
//     }
//   };

//   // const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
//   //   try {
//   //     await axios.post(`/api/admin/verify/${userId}`, { action });
//   //     toast.success(`User ${action}d successfully`);
//   //     fetchAdminData();
//   //   } catch (error) {
//   //     console.error('Error verifying user:', error);
//   //     toast.error('Failed to verify user');
//   //   }
//   // };
//   const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
//     try {
//       // ✅ CORRECT: Backend POST request maang raha hai (action ke saath)
//       await axios.post(`http://localhost:5000/api/admin/verify/${userId}`, { 
//         action: action 
//       });

//       if (action === 'approve') {
//         toast.success('User Verified Successfully! 🎉');
//       } else {
//         toast.success('User Rejected ❌');
//       }

//       // List refresh karo
//       fetchAdminData();
//     } catch (error) {
//       console.error('Error verifying user:', error);
//       toast.error('Operation failed');
//     }
//   };


//   const handleDeleteUser = async (userId: string) => {
//     if (!confirm('Are you sure you want to delete this user?')) return;

//     try {
//       await axios.delete(`/api/admin/alumni/${userId}`);
//       toast.success('User deleted successfully');
//       fetchAdminData();
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       toast.error('Failed to delete user');
//     }
//   };

//   const exportData = async (type: string) => {
//     try {
//       const response = await axios.get(`/api/export/alumni?format=csv&filter=${type}`, {
//         responseType: 'blob',
//       });

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `alumni-${type}-${new Date().toISOString()}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       toast.success('Data exported successfully');
//     } catch (error) {
//       console.error('Error exporting data:', error);
//       toast.error('Failed to export data');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (!user || user.role !== 'ADMIN') {
//     return null;
//   }

//   return (
//     <div className="min-h-screen">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-secondary-900 mb-2">Admin Dashboard</h1>
//         <p className="text-secondary-600">Manage alumni system and monitor activity</p>
//       </div>

//       {/* Navigation Tabs */}
//       <div className="mb-8">
//         <div className="border-b border-secondary-200">
//           <nav className="-mb-px flex space-x-8">
//             {['overview', 'pending', 'users', 'reports'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab as any)}
//                 className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
//                   activeTab === tab
//                     ? 'border-primary-500 text-primary-600'
//                     : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Overview Tab */}
//       {activeTab === 'overview' && stats && (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           <div className="card">
//             <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Users</h3>
//             <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
//           </div>

//           <div className="card">
//             <h3 className="text-lg font-semibold text-secondary-900 mb-2">Total Alumni</h3>
//             <p className="text-3xl font-bold text-primary-600">{stats.totalAlumni}</p>
//             <p className="text-sm text-secondary-600 mt-1">
//               {stats.verifiedAlumni} verified, {stats.pendingAlumni} pending
//             </p>
//           </div>

//           <div className="card">
//             <h3 className="text-lg font-semibold text-secondary-900 mb-2">Students</h3>
//             <p className="text-3xl font-bold text-primary-600">{stats.totalStudents}</p>
//           </div>

//           <div  className="card" >
//             <h3 className="text-lg font-semibold text-secondary-900 mb-2">Events</h3>
//             <p className="text-3xl font-bold text-primary-600">{stats.totalEvents}</p>
//           </div>

//           <div className="card">
//             <h3 className="text-lg font-semibold text-secondary-900 mb-2">Pending Verifications</h3>
//             <p className="text-3xl font-bold text-yellow-600">{stats.pendingAlumni}</p>
//             <button
//               onClick={() => setActiveTab('pending')}
//               className="text-sm text-primary-600 hover:text-primary-700 mt-1"
//             >
//               Review Now →
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Pending Tab */}
//       {activeTab === 'pending' && (
//         <div className="card">
//           <h3 className="text-xl font-semibold text-secondary-900 mb-4">Pending Verifications</h3>
//           {pendingAlumni.length === 0 ? (
//             <p className="text-secondary-600">No pending verifications</p>
//           ) : (
//             <div className="space-y-4">
//               {pendingAlumni.map((alumnus) => (
//                 <div key={alumnus.id} className="border border-secondary-200 rounded-lg p-4">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="font-semibold text-secondary-900">{alumnus.name}</h4>
//                       <p className="text-sm text-secondary-600">{alumnus.email}</p>
//                       {alumnus.alumniProfile && (
//                         <div className="mt-2 text-sm text-secondary-700">
//                           <p>Batch: {alumnus.alumniProfile.batchYear}</p>
//                           <p>Department: {alumnus.alumniProfile.department}</p>
//                           {alumnus.alumniProfile.company && (
//                             <p>Company: {alumnus.alumniProfile.company}</p>
//                           )}
//                         </div>
//                       )}
//                       <p className="text-xs text-secondary-500 mt-2">
//                         Registered: {new Date(alumnus.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleVerify(alumnus.id, 'approve')}
//                         className="btn-primary text-sm"
//                       >
//                         Approve
//                       </button>
//                       <button
//                         onClick={() => handleVerify(alumnus.id, 'reject')}
//                         className="btn-secondary text-sm bg-red-100 text-red-800 hover:bg-red-200"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Reports Tab */}
//       {activeTab === 'reports' && (
//         <div className="card">
//           <h3 className="text-xl font-semibold text-secondary-900 mb-4">Export Reports</h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <button
//               onClick={() => exportData('all')}
//               className="btn-primary text-left p-4"
//             >
//               <h4 className="font-semibold mb-1">All Alumni</h4>
//               <p className="text-sm opacity-90">Complete alumni database</p>
//             </button>

//             <button
//               onClick={() => exportData('verified')}
//               className="btn-primary text-left p-4"
//             >
//               <h4 className="font-semibold mb-1">Verified Alumni</h4>
//               <p className="text-sm opacity-90">Only verified members</p>
//             </button>

//             <button
//               onClick={() => exportData('pending')}
//               className="btn-secondary text-left p-4"
//             >
//               <h4 className="font-semibold mb-1">Pending Verifications</h4>
//               <p className="text-sm opacity-75">Members awaiting approval</p>
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import UsersTab from '@/components/admin/UsersTab'; // 👈 Imported component
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  alumniProfile?: {
    batchYear: number;
    department: string;
    company?: string;
  };
}

interface Stats {
  totalUsers: number;
  totalAlumni: number;
  verifiedAlumni: number;
  pendingAlumni: number;
  totalStudents: number;
  totalEvents: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingAlumni, setPendingAlumni] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'users' | 'reports'>('overview');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    } else if (user) {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, pendingResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats'),
        axios.get('http://localhost:5000/api/admin/pending'),
      ]);

      setStats(statsResponse.data);
      setPendingAlumni(pendingResponse.data.pendingAlumni || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    }
  };

  const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
    try {
      await axios.post(`http://localhost:5000/api/admin/verify/${userId}`, {
        action: action
      });

      if (action === 'approve') {
        toast.success('User Verified Successfully! 🎉');
      } else {
        toast.success('User Rejected ❌');
      }

      fetchAdminData();
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Operation failed');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/alumni/${userId}`);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // 2. Export function ko update karo
  const exportData = async (exportType: string) => {
    const toastId = toast.loading('Filtering and generating report... ⏳');
    try {
      // 👇 Advanced parameters URL mein add kiye
      const response = await axios.get(
        `http://localhost:5000/api/export/alumni?type=${exportType}&batchYear=${selectedBatch}&department=${selectedDept}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Xavier_${exportType}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report Downloaded! ✅', { id: toastId });
    } catch (error: any) {
      // --- 👇 ASLI FIX YAHAN HAI ---
      // Agar backend 404 bhej raha hai (matlab user nahi mila)
      if (error.response?.status === 404) {
        toast.error("This combination of users isn't available in our database! 🤷‍♂️", {
          id: toastId, // Purane loading toast ko replace karega
          duration: 5000
        });
      } else {
        // Kisi aur error (like server down) ke liye
        toast.error('Server connection lost!', { id: toastId });
      }
      console.error('Export Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-secondary-900 mb-2 tracking-tight">Admin Dashboard</h1>
          <p className="text-secondary-600">Manage alumni system and monitor community activity</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-10">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'pending', 'users', 'reports'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-bold text-sm capitalize transition-all ${activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Users</h3>
              <p className="text-4xl font-black text-primary-600">{stats.totalUsers}</p>
            </div>

            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Total Alumni</h3>
              <p className="text-4xl font-black text-primary-600">{stats.totalAlumni}</p>
              <p className="text-[10px] text-secondary-500 font-bold mt-2 uppercase">
                {stats.verifiedAlumni} Verified • {stats.pendingAlumni} Pending
              </p>
            </div>

            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Students</h3>
              <p className="text-4xl font-black text-primary-600">{stats.totalStudents}</p>
            </div>

            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Active Events</h3>
              <p className="text-4xl font-black text-primary-600">{stats.totalEvents}</p>
            </div>

            <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 ring-2 ring-yellow-100">
              <h3 className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-2">Pending Verifications</h3>
              <p className="text-4xl font-black text-yellow-600">{stats.pendingAlumni}</p>
              <button
                onClick={() => setActiveTab('pending')}
                className="text-xs font-black text-primary-600 hover:text-primary-700 mt-2 uppercase tracking-tight underline"
              >
                Review Applications →
              </button>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="card bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-bold text-secondary-900 mb-6">Pending Verifications</h3>
            {pendingAlumni.length === 0 ? (
              <p className="text-secondary-500 font-medium py-10 text-center">No pending verifications at the moment.✅</p>
            ) : (
              <div className="space-y-4">
                {pendingAlumni.map((alumnus) => (
                  <div key={alumnus.id} className="border border-secondary-100 rounded-2xl p-5 bg-slate-50/50 hover:bg-white transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-secondary-900 text-lg">{alumnus.name} <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded ml-2 uppercase tracking-tighter">{alumnus.role}</span></h4>
                        <p className="text-sm text-secondary-600 font-medium">{alumnus.email}</p>
                        {alumnus.alumniProfile && (
                          <div className="mt-2 text-[11px] text-secondary-500 font-bold uppercase tracking-widest flex gap-3">
                            <span>🎓 {alumnus.alumniProfile.department}</span>
                            <span>📅 Batch: {alumnus.alumniProfile.batchYear}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleVerify(alumnus.id, 'approve')}
                          className="flex-1 sm:flex-none px-6 py-2 bg-primary-600 text-white text-xs font-black rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all uppercase"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerify(alumnus.id, 'reject')}
                          className="flex-1 sm:flex-none px-6 py-2 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-all uppercase"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 👇 NEW: Users Tab */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in duration-500">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-secondary-900">User Management</h3>
              <p className="text-sm text-secondary-500">Search and filter through the entire member database.</p>
            </div>
            <UsersTab />
          </div>
        )}

        {/* 3. Reports Tab UI (Advanced Section) */}
        {activeTab === 'reports' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* 3. UI: Advanced Filters Section Update */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Export Filters
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Batch</label>
                  <input
                    type="number"
                    placeholder="e.g. 2014"
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  />
                </div> */}

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Batch</label>
                  <input
                    type="number"
                    min="2012"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2014"
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 outline-none"
                    value={selectedBatch}
                    onChange={(e) => {
                      // ✅ FIX 1: Max 4 digits hi type karne dega
                      const val = e.target.value;
                      if (val.length <= 4) {
                        setSelectedBatch(val);
                      }
                    }}
                    onBlur={(e) => {
                      // ✅ FIX 2: Auto-Correct logic (Jab user box se bahar click karega)
                      const val = parseInt(e.target.value);
                      const currentYear = new Date().getFullYear();

                      if (val) {
                        if (val < 2012) {
                          setSelectedBatch('2012'); // Agar 2010 daala, toh automatically 2012 ho jayega
                        } else if (val > currentYear) {
                          setSelectedBatch(currentYear.toString()); // Agar 9999 daala, toh automatically current year (2026) ho jayega
                        }
                      }
                    }}
                  />
                </div>

                {/* --- 🚀 ENHANCED DEPARTMENT DROPDOWN --- */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Department</label>
                  <select
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 cursor-pointer outline-none"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCOM (P)">BCOM (P)</option>
                    <option value="BBA (IB)">BBA (IB)</option>
                    <option value="BA (JMC)">BA (JMC)</option>
                  </select>
                </div>

                {/* --- 🚀 NEW DEPARTMENT DROPDOWN --- */}
                {/* <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Filter by Department</label>
                  <select
                    className="w-full mt-2 px-5 py-3 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-slate-700 cursor-pointer"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BCOM (P)">BCOM (P)</option>
                    <option value="BBA (IB)">BBA (IB)</option>
                    <option value="BA (JMC)">BA (JMC)</option>
                  </select>
                </div> */}
              </div>
              <p className="mt-4 text-[10px] text-slate-400 italic">
                *Apply filters to narrow down your report. If no match is found, we'll let you know!
              </p>
            </div>

            {/* Export Buttons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button onClick={() => exportData('all')} className="group p-6 bg-slate-50 border border-slate-200 rounded-3xl hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all text-left">
                <div className="text-3xl mb-4">🌍</div>
                <h4 className="font-bold text-slate-900">Complete Database</h4>
                <p className="text-[10px] text-slate-400 mt-1">Full info + Status</p>
              </button>

              <button onClick={() => exportData('verified_alumni')} className="group p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl hover:bg-white hover:border-indigo-400 hover:shadow-2xl transition-all text-left">
                <div className="text-3xl mb-4">🎓</div>
                <h4 className="font-bold text-indigo-900">Verified Alumni</h4>
                <p className="text-[10px] text-indigo-400 mt-1">Work details </p>
              </button>

              <button onClick={() => exportData('verified_student')} className="group p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl hover:bg-white hover:border-emerald-400 hover:shadow-2xl transition-all text-left">
                <div className="text-3xl mb-4">🎒</div>
                <h4 className="font-bold text-emerald-900">Verified Students</h4>
                <p className="text-[10px] text-emerald-400 mt-1">Academic only </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}