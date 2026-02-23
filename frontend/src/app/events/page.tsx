// 'use client';

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
// import toast from 'react-hot-toast';

// export default function Events() {
//   const { user, loading: authLoading } = useAuth(); 
//   const [events, setEvents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   // 1. Events Load Karna (Headers automatically jayenge axios defaults se)
// const fetchEvents = async () => {
//   try {
//     const res = await axios.get('/api/events'); // Base URL aur Token automatically handle honge
//     setEvents(res.data.events || []);
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     toast.error('Could not load events'); 
//   } finally {
//     setLoading(false);
//   }
// };

//   useEffect(() => {
//   if (!authLoading && user) {
//     fetchEvents(); // Sirf logged-in users ke liye chalega
//   } else if (!authLoading && !user) {
//     setLoading(false); // Guest user ke liye spinner band kar do
//   }
//   }, [user, authLoading]);

//   if (!user && !authLoading) {
//   return (
//     <div className="text-center py-20">
//       <h2 className="text-2xl font-bold">Please Login First 🔒</h2>
//       <p className="mb-6">You need an account to see events.</p>
//       <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Login</Link>
//     </div>
//    );
//   }
//   // 2. Register Function (Update UI without reload)
//   const handleRegister = async (eventId: string) => {
//     if (!confirm('Are you sure you want to register for this event?')) return;

//     try {
//       await axios.post(`/api/events/${eventId}/register`);
//       toast.success('Registered successfully! 🎟️');
//       fetchEvents(); // 👈 Refresh ki jagah seedha data fetch karo
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Registration failed');
//     }
//   };

//   // 3. Delete Function
//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this event?')) return;
//     try {
//       await axios.delete(`/api/events/${id}`);
//       toast.success('Event deleted successfully');
//       fetchEvents();
//     } catch (error) {
//       toast.error('Failed to delete event');
//     }
//   };

//   if (loading) return <div className="p-8 text-center animate-pulse">Loading amazing events...</div>;

//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-8 border-b pb-6">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Events</h1>
//           <p className="text-slate-500 mt-1">Networking, meetups, and parties in one place.</p>
//         </div>
//         {user?.role === 'ADMIN' && (
//           <Link href="/events/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
//             + Create Event
//           </Link>
//         )}
//       </div>

//       {events.length === 0 ? (
//         <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
//           <p className="text-xl text-slate-400 font-medium">No events found for your group yet.</p>
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {events.map((event) => (
//             <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              
//               {/* Event Image */}
//               <div className="h-48 relative bg-slate-200">
//                 {event.imageUrl ? (
//                   <img
//                     src={`http://localhost:5000/${event.imageUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`}
//                     className="w-full h-full object-cover"
//                     alt={event.title}
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">No Preview</div>
//                 )}
//                 {/* 🎯 Target Audience Badge (Frontend pe bhi dikha dete hain convenience ke liye) */}
//                 <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 shadow-sm">
//                    For: {event.targetAudience}
//                 </div>
//               </div>

//               {/* Content Section */}
//               <div className="p-6 flex-1 flex flex-col">
//                 <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{event.title}</h3>
//                 <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>

//                 <div className="space-y-3 mb-8">
//                   <div className="flex items-center text-sm text-slate-600 gap-3">
//                     <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">📅</span>
//                     <span className="font-medium">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
//                   </div>
//                   <div className="flex items-center text-sm text-slate-600 gap-3">
//                     <span className="p-1.5 bg-orange-50 rounded-lg text-orange-500">📍</span>
//                     <span className="font-medium">{event.location}</span>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
//                   <button
//                     onClick={() => handleRegister(event.id)}
//                     className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm"
//                   >
//                     Register Now ✨
//                   </button>

//                   {user?.role === 'ADMIN' && (
//                     <button
//                       onClick={() => handleDelete(event.id)}
//                       className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-medium"
//                     >
//                       Delete
//                     </button>
//                   )}
//                 </div>

//                 {/* Participants Section */}
//                 {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
//                   <div className="mt-6 pt-4 border-t border-slate-100">
//                     <p className="text-xs font-bold text-slate-400 uppercase mb-3">Who's Joining? ({event.registrations?.length || 0})</p>
//                     <div className="flex -space-x-2 overflow-hidden">
//                       {event.registrations?.slice(0, 5).map((reg: any) => (
//                          <Link key={reg.id} href={`/alumni/${reg.user.id}`}>
//                            <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer" title={reg.user.name}>
//                              {reg.user.name.charAt(0)}
//                            </div>
//                          </Link>
//                       ))}
//                       {(event.registrations?.length > 5) && (
//                         <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
//                           +{event.registrations.length - 5}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Events() {
  const { user, loading: authLoading } = useAuth(); 
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getEventImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // Cloudinary
    return `http://localhost:5000/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`; // Local
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Could not load events'); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchEvents();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (!user && !authLoading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Please Login First 🔒</h2>
        <p className="mb-6">You need an account to see events.</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Login</Link>
      </div>
    );
  }

  const handleRegister = async (eventId: string) => {
    if (!confirm('Are you sure you want to register for this event?')) return;
    try {
      await axios.post(`/api/events/${eventId}/register`);
      toast.success('Registered successfully! 🎟️');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`/api/events/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Loading amazing events...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Events</h1>
          <p className="text-slate-500 mt-1">Networking, meetups, and parties in one place.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/events/create" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
            + Create Event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-xl text-slate-400 font-medium">No events found for your group yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              
              <div className="h-48 relative bg-slate-200">
                {event.imageUrl ? (
                  <img
                    // src={`http://localhost:5000/${event.imageUrl.replace(/\\/g, '/').replace(/^\/+/, '')}`}
                    src={getEventImageUrl(event.imageUrl)!}
                    className="w-full h-full object-cover"
                    alt={event.title}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">No Preview</div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-600 shadow-sm">
                   For: {event.targetAudience}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{event.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{event.description}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-sm text-slate-600 gap-3">
                    <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">📅</span>
                    <span className="font-medium">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-3">
                    <span className="p-1.5 bg-orange-50 rounded-lg text-orange-500">📍</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Register Now ✨
                  </button>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-4 py-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* --- UPDATED PARTICIPANTS SECTION --- */}
                {(user?.role === 'ALUMNI' || user?.role === 'ADMIN' || user?.role === 'STUDENT') && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Who's Joining? ({event.registrations?.length || 0})</p>
                      
                      {/* 👇 Naya "See All List" link add kar diya hai */}
                      <Link 
                        href={`/events/${event.id}/participants`} 
                        className="text-[10px] text-blue-600 font-extrabold hover:underline bg-blue-50 px-2 py-1 rounded-md transition-all"
                      >
                        See All List →
                      </Link>
                    </div>

                    <div className="flex -space-x-2 overflow-hidden">
                      {event.registrations?.slice(0, 5).map((reg: any) => (
                         <Link key={reg.id} href={`/alumni/${reg.user.id}`}>
                           <div className="h-8 w-8 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer" title={reg.user.name}>
                             {reg.user.name.charAt(0)}
                           </div>
                         </Link>
                      ))}
                      {(event.registrations?.length > 5) && (
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                          +{event.registrations.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}