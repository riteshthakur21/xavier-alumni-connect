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
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Login Required</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            You need to be logged in to access this section. Join our community to explore alumni events and register for them.
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-white rounded-2xl overflow-hidden border border-slate-100">
              <div className="h-48 bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
                <div className="h-10 bg-slate-200 rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Events</h1>
          <p className="text-slate-500 mt-1">Networking, meetups, and parties in one place.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link href="/events/create" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
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
