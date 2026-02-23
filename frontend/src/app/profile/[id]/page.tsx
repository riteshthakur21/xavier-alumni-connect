// // 'use client';

// // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';
// // import { useParams } from 'next/navigation';

// // export default function ProfilePage() {
// //     const { id } = useParams(); // URL se ID nikal rahe hain
// //     const [user, setUser] = useState<any>(null);
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {
// //         const fetchUser = async () => {
// //             try {
// //                 const res = await axios.get(`http://localhost:5000/api/users/${id}`);
// //                 setUser(res.data.user);
// //             } catch (error) {
// //                 console.error('Error fetching profile:', error);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         if (id) fetchUser();
// //     }, [id]);

// //     if (loading) return <div className="text-center py-20">Loading Profile...</div>;
// //     if (!user) return <div className="text-center py-20">User not found 😕</div>;

// //     return (
// //         <div className="min-h-screen bg-slate-50 py-12 px-4">
// //             <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

// //                 {/* Header / Cover */}
// //                 <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

// //                 <div className="px-8 pb-8">
// //                     {/* Profile Photo & Basic Info */}
// //                     <div className="relative flex flex-col md:flex-row items-end -mt-12 mb-6 gap-6">
// //                         <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-md">
// //                             {user.profileImage ? (
// //                                 <img src={`http://localhost:5000/${user.profileImage.replace(/\\/g, '/').replace(/^\/+/, '')}`} alt={user.name} className="w-full h-full object-cover" />
// //                             ) : (
// //                                 <div className="w-full h-full flex items-center justify-center text-4xl bg-blue-100 text-blue-600 font-bold">
// //                                     {user.name.charAt(0)}
// //                                 </div>
// //                             )}
// //                         </div>

// //                         <div className="flex-1 mb-2">
// //                             <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
// //                             <p className="text-blue-600 font-medium">{user.role === 'ALUMNI' ? '🎓 Alumni' : '📚 Student'}</p>
// //                         </div>

// //                         {/* Action Buttons */}
// //                         <div className="flex gap-3 mb-2">
// //                             <a href={`mailto:${user.email}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
// //                                 Message
// //                             </a>
// //                             {user.linkedinUrl && (
// //                                 <a href={user.linkedinUrl} target="_blank" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-slate-700">
// //                                     LinkedIn
// //                                 </a>
// //                             )}
// //                         </div>
// //                     </div>

// //                     {/* Details Grid */}
// //                     <div className="grid md:grid-cols-3 gap-8 mt-8 border-t border-slate-100 pt-8">

// //                         {/* Left Sidebar */}
// //                         <div className="md:col-span-1 space-y-6">
// //                             <div>
// //                                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Details</h3>
// //                                 <ul className="space-y-3 text-slate-700">
// //                                     <li className="flex items-center gap-2">
// //                                         <span>🏢</span> {user.currentCompany || 'Not specified'}
// //                                     </li>
// //                                     <li className="flex items-center gap-2">
// //                                         <span>💼</span> {user.jobTitle || 'No Job Title'}
// //                                     </li>
// //                                     <li className="flex items-center gap-2">
// //                                         <span>🎓</span> {user.department} ({user.batchYear})
// //                                     </li>
// //                                     <li className="flex items-center gap-2">
// //                                         <span>📍</span> {user.location || 'Location hidden'}
// //                                     </li>
// //                                 </ul>
// //                             </div>
// //                         </div>

// //                         {/* Main Content */}
// //                         <div className="md:col-span-2 space-y-8">
// //                             {/* About Section */}
// //                             <div>
// //                                 <h2 className="text-xl font-bold text-slate-900 mb-3">About</h2>
// //                                 <p className="text-slate-600 leading-relaxed">
// //                                     {user.bio || "This user hasn't written a bio yet."}
// //                                 </p>
// //                             </div>

// //                             {/* Skills Section (Agar skills hain to dikhao) */}
// //                             {user.skills && user.skills.length > 0 && (
// //                                 <div>
// //                                     <h2 className="text-xl font-bold text-slate-900 mb-3">Skills</h2>
// //                                     <div className="flex flex-wrap gap-2">
// //                                         {Array.isArray(user.skills) ? user.skills.map((skill: string, index: number) => (
// //                                             <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
// //                                                 {skill}
// //                                             </span>
// //                                         )) : (
// //                                             <span className="text-slate-500">No skills listed</span>
// //                                         )}
// //                                     </div>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>

// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useParams } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
// import Link from 'next/link';
// import toast from 'react-hot-toast';

// // 1. Updated Interface to match Backend Structure
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'ALUMNI' | 'STUDENT' | 'ADMIN';
//   alumniProfile: {
//     photoUrl?: string;
//     batchYear?: string;
//     department?: string;
//     rollNo?: string;
//     company?: string;
//     jobTitle?: string;
//     location?: string;
//     bio?: string;
//     skills?: string[] | string;
//     linkedinUrl?: string;
//     phone?: string;
//   };
// }

// export default function ProfilePage() {
//   const { id } = useParams();
//   const { user: currentUser } = useAuth();
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'contact'>('about');

//   const isOwnProfile = currentUser?.id === id;

//   // 2. Data Fetching Logic (Fixed Response Key)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await axios.get(`http://localhost:5000/api/alumni/${id}`);
//         // ✅ FIX: Backend bhej raha hai { alumni: {...} }, isliye res.data.alumni use kiya
//         setUser(res.data.alumni); 
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//         toast.error('Could not load profile');
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (id) fetchUser();
//   }, [id]);

//   // 3. Intelligent Image Helper (Cloudinary Ready)
//   const getImageUrl = (path?: string) => {
//     if (!path) return null;
//     if (path.startsWith('http')) return path; // Direct Cloudinary Link
//     return `http://localhost:5000/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
//   };

//   if (loading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">Loading Profile...</div>;

//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-center p-4">
//         <div>
//           <h2 className="text-2xl font-black text-slate-800 mb-2">User not found 😕</h2>
//           <Link href="/directory" className="text-blue-600 font-bold hover:underline">Return to Directory</Link>
//         </div>
//       </div>
//     );
//   }

//   const profile = user.alumniProfile || {};
//   const skillsArray = Array.isArray(profile.skills) ? profile.skills : (profile.skills ? JSON.parse(profile.skills as string) : []);

//   return (
//     <div className="min-h-screen bg-slate-50 py-12 px-4">
//       <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        
//         {/* Cover Section */}
//         <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

//         <div className="px-8 pb-8">
//           {/* Profile Header */}
//           <div className="relative flex flex-col sm:flex-row items-end -mt-16 mb-8 gap-6">
//             <div className="relative group">
//               <div className="w-32 h-32 rounded-3xl border-4 border-white bg-slate-100 overflow-hidden shadow-xl">
//                 {profile.photoUrl ? (
//                   <img src={getImageUrl(profile.photoUrl)!} alt={user.name} className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-4xl bg-blue-50 text-blue-400 font-black">
//                     {user.name.charAt(0)}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex-1 pb-2">
//               <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
//               <p className="text-blue-600 font-bold">
//                 {user.role === 'ALUMNI' ? '🎓 Alumni' : '📚 Student'} 
//                 {profile.batchYear && ` • Class of ${profile.batchYear}`}
//               </p>
//             </div>

//             <div className="flex gap-3 pb-2">
//               {isOwnProfile && (
//                 <Link href="/dashboard/profile" className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg">
//                   Edit Profile
//                 </Link>
//               )}
//             </div>
//           </div>

//           {/* Tabs Navigation */}
//           <div className="flex gap-8 border-b border-slate-100 mb-8">
//             {['about', 'experience', 'contact'].map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab as any)}
//                 className={`pb-4 text-sm font-black uppercase tracking-widest transition-all ${
//                   activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           {/* Main Grid Content */}
//           <div className="grid md:grid-cols-3 gap-10">
//             {/* Sidebar Info */}
//             <div className="md:col-span-1 space-y-8">
//               <div>
//                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Academic Info</h3>
//                 <ul className="space-y-4">
//                   <li className="flex flex-col">
//                     <span className="text-[10px] font-bold text-blue-400 uppercase">Roll Number</span>
//                     <span className="font-bold text-slate-700">{profile.rollNo || 'N/A'}</span>
//                   </li>
//                   <li className="flex flex-col">
//                     <span className="text-[10px] font-bold text-blue-400 uppercase">Department</span>
//                     <span className="font-bold text-slate-700">{profile.department || 'N/A'}</span>
//                   </li>
//                   <li className="flex flex-col">
//                     <span className="text-[10px] font-bold text-blue-400 uppercase">Location</span>
//                     <span className="font-bold text-slate-700">📍 {profile.location || 'Unknown'}</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>

//             {/* Tab Specific Content */}
//             <div className="md:col-span-2">
//               {activeTab === 'about' && (
//                 <div className="space-y-8">
//                   <div>
//                     <h2 className="text-xl font-black text-slate-800 mb-4">Bio</h2>
//                     <p className="text-slate-600 leading-relaxed font-medium">
//                       {profile.bio || "No bio available."}
//                     </p>
//                   </div>
//                   {skillsArray.length > 0 && (
//                     <div>
//                       <h2 className="text-xl font-black text-slate-800 mb-4">Skills & Expertise</h2>
//                       <div className="flex flex-wrap gap-2">
//                         {skillsArray.map((skill: string, i: number) => (
//                           <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-black uppercase">
//                             {skill}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === 'experience' && (
//                 <div className="space-y-6">
//                   <h2 className="text-xl font-black text-slate-800">Current Experience</h2>
//                   <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
//                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl">🏢</div>
//                     <div>
//                       <h3 className="font-black text-slate-800">{profile.jobTitle || 'Role Not Specified'}</h3>
//                       <p className="text-sm font-bold text-slate-500">{profile.company || 'Organization Not Specified'}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {activeTab === 'contact' && (
//                 <div className="space-y-6">
//                   <h2 className="text-xl font-black text-slate-800">Get in Touch</h2>
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
//                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">✉️</div>
//                       <a href={`mailto:${user.email}`} className="font-bold text-blue-600 hover:underline">{user.email}</a>
//                     </div>
//                     {profile.linkedinUrl && (
//                       <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
//                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">🔗</div>
//                         <a href={profile.linkedinUrl} target="_blank" className="font-bold text-blue-600 hover:underline">LinkedIn Profile</a>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Mail, 
  Linkedin, 
  Briefcase, 
  GraduationCap, 
  Building2, 
  Hash, 
  Edit3, 
  ChevronLeft
} from 'lucide-react';

export default function App() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/alumni/${id}`);
        setUser(res.data.alumni); 
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; 
    return `http://localhost:5000/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-slate-200"></div>
          <div className="px-6 sm:px-10 pb-10">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-slate-300 border-4 border-white -mt-12 sm:-mt-18 mb-6"></div>
            <div className="h-8 bg-slate-200 w-1/3 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-200 w-1/4 rounded-lg mb-8"></div>
            <div className="h-10 bg-slate-100 w-full rounded-2xl mb-8"></div>
            <div className="h-32 bg-slate-100 w-full rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 text-center border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">User not found</h2>
          <p className="text-slate-500 mb-8">The profile you are looking for doesn't exist or has been removed.</p>
          <Link 
            href="/directory" 
            className="inline-flex items-center justify-center w-full py-3 px-6 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const profile = user.alumniProfile || {};
  const skillsArray = Array.isArray(profile.skills) ? profile.skills : (profile.skills ? JSON.parse(profile.skills) : []);

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-5xl mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100/80 overflow-hidden relative">
        
        {/* Modern Cover Section */}
        <div className="relative h-40 sm:h-56 lg:h-64 w-full bg-gradient-to-br from-blue-200 via-indigo-450 to-blue-900 overflow-hidden">
          {/* Subtle overlay pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        <div className="px-6 sm:px-10 lg:px-12 pb-10 sm:pb-12">
          
          {/* Profile Header (Responsive Stacking) */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-24 mb-8 sm:mb-10 gap-4 sm:gap-6 lg:gap-8 text-center sm:text-left">
            
            {/* Avatar */}
            <div className="relative z-10 group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full border-[6px] border-white bg-slate-100 overflow-hidden shadow-lg shadow-slate-300/50">
                {profile.photoUrl ? (
                  <img src={getImageUrl(profile.photoUrl)} alt={user.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl sm:text-6xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              {/* Online/Role Indicator Badge */}
            </div>

            {/* Title & Info */}
            <div className="flex-1 pt-2 sm:pb-4 w-full">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                {user.name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-3 text-sm sm:text-base text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                  <GraduationCap className="w-4 h-4" />
                  {user.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                </span>
                {profile.batchYear && (
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span className="hidden sm:inline">•</span>
                    Class of {profile.batchYear}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile && (
              <div className="w-full sm:w-auto flex justify-center sm:justify-end sm:pb-4 mt-2 sm:mt-0">
                <Link 
                  href="/dashboard/profile" 
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            )}
          </div>

          {/* iOS-Style Segmented Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-1 p-1 bg-slate-100/80 rounded-2xl mb-8 border border-slate-200/50 max-w-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[100px] py-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Grid Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Sidebar (Academic / Quick Info) */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Overview</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Roll Number</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{profile.rollNo || 'N/A'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Department</p>
                      <p className="font-semibold text-slate-800 mt-0.5 leading-tight">{profile.department || 'N/A'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Location</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{profile.location || 'Not specified'}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              
              {/* About Tab */}
              <div className={`transition-opacity duration-300 ${activeTab === 'about' ? 'block animate-in fade-in slide-in-from-bottom-2' : 'hidden'}`}>
                <div className="space-y-10">
                  <section>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-1 bg-blue-600 rounded-full"></span> Bio
                    </h2>
                    <p className="text-slate-600 leading-relaxed font-medium bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                      {profile.bio || "This user hasn't added a bio yet."}
                    </p>
                  </section>

                  {skillsArray.length > 0 && (
                    <section>
                      <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <span className="w-8 h-1 bg-indigo-600 rounded-full"></span> Skills & Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2.5">
                        {skillsArray.map((skill, i) => (
                          <span 
                            key={i} 
                            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {/* Experience Tab */}
              <div className={`transition-opacity duration-300 ${activeTab === 'experience' ? 'block animate-in fade-in slide-in-from-bottom-2' : 'hidden'}`}>
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-emerald-600 rounded-full"></span> Current Experience
                  </h2>
                  <div className="group p-6 sm:p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start sm:items-center gap-5 sm:gap-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Briefcase className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {profile.jobTitle || 'Role Not Specified'}
                      </h3>
                      <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
                        {profile.company || 'Organization Not Specified'}
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Contact Tab */}
              <div className={`transition-opacity duration-300 ${activeTab === 'contact' ? 'block animate-in fade-in slide-in-from-bottom-2' : 'hidden'}`}>
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-1 bg-violet-600 rounded-full"></span> Get in Touch
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Email Card */}
                    <a href={`mailto:${user.email}`} className="group flex flex-col p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:-translate-y-1 transition-all">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
                      <span className="font-bold text-slate-800 truncate">{user.email}</span>
                    </a>

                    {/* LinkedIn Card */}
                    {profile.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="group flex flex-col p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Linkedin className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-slate-800 truncate">View Profile →</span>
                      </a>
                    ) : (
                      <div className="flex flex-col p-6 bg-slate-50 rounded-3xl border border-slate-100 opacity-60 grayscale cursor-not-allowed">
                        <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                          <Linkedin className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</span>
                        <span className="font-bold text-slate-500">Not provided</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}