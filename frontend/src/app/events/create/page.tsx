'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';

export default function CreateEvent() {
  const router = useRouter();

  // ✅ FIX 1: authLoading import kiya taaki loading state pata chale
  const { user, loading: authLoading } = useAuth();

  const [audience, setAudience] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ FIX 2: Solid Security Check (Logged Out AND Non-Admin block)
  useEffect(() => {
    // Agar auth check ho raha hai, toh wait karo
    if (authLoading) return;

    // Case 1: User login hi nahi hai
    if (!user) {
      toast.error("Please login first! 🔒");
      router.push('/login');
    }
    // Case 2: User login hai par Admin nahi hai
    else if (user.role !== 'ADMIN') {
      toast.error("Access Denied! Only Admins can create events. 🚫");
      router.push('/events');
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImage(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Security check at submit time as well
    if (user?.role !== 'ADMIN') {
      toast.error('Unauthorized: Only admins can create events');
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Publishing... 🚀");

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      submitData.append('location', formData.location);
      submitData.append('targetAudience', audience);

      if (image) {
        submitData.append('image', image);
      }

      await axios.post('http://localhost:5000/api/events', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
      });

      toast.success('Event Published with Banner! 🎉', { id: toastId });
      router.push('/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.error || 'Failed to create event', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX 3: Prevent UI from rendering if not authorized (FOUC Fix)
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Verifying Access Level... 🛡️</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return null; // Redirect hone tak blank screen dikhega taaki koi UI dekh na paye
  }

  // 👇 YAHAN SE TUMHARA UI START HOTA HAI (100% SAME HAI)
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Event</h1>
          <p className="text-slate-500 font-medium mt-1">Publish an event and notify the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="mb-8">
            <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Event Banner Image</label>
            <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer h-64 flex flex-col items-center justify-center">

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
              ) : (
                <div className="text-center z-0 pointer-events-none">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 text-blue-500 text-2xl group-hover:scale-110 transition-transform">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p className="font-bold text-slate-600">Click or drag banner here</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">JPEG, PNG up to 5MB</p>
                </div>
              )}

              {imagePreview && (
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                  <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm">Change Image</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Event Title *</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Annual Alumni Meetup 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-600 transition-all placeholder:text-slate-300 resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this event about?"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  name="date"
                  required
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., College Auditorium"
                />
              </div>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-3 items-center gap-2">
                Who can see this event? 🎯
              </label>
              <div className="relative">
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-5 py-4 bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 font-bold outline-none cursor-pointer appearance-none pr-10 transition-all shadow-sm"
                >
                  <option value="ALL">🌍 Everyone (Students + Alumni)</option>
                  <option value="STUDENT">🎓 Students Only (e.g., Fresher's Party)</option>
                  <option value="ALUMNI">👔 Alumni Only (e.g., Networking Meet)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 border-2 border-slate-200 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Event ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}