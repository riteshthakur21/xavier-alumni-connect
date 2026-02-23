'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateJob() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    applyLink: ''
  });

  // Agar user Student hai, toh wapas bhej do (Security)
  if (user && user.role === 'STUDENT') {
    router.push('/jobs');
    return null;
  }

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend ko data bhejo (Token apne aap jayega kyunki humne interceptor lagaya tha)
      await axios.post('http://localhost:5000/api/jobs', formData);
      alert('Job posted successfully! 🎉');
      router.push('/jobs'); // Wapas list par bhej do
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Post a New Opportunity</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title & Company */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input type="text" name="title" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Software Engineer" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input type="text" name="company" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Google" onChange={handleChange} />
            </div>
          </div>

          {/* Location & Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input type="text" name="location" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Bangalore / Remote" onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type *</label>
              <select name="type" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" onChange={handleChange}>
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea name="description" rows={5} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Job details, requirements, etc..." onChange={handleChange}></textarea>
          </div>

          {/* Apply Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application Link (Optional)</label>
            <input type="text" name="applyLink" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." onChange={handleChange} />
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md">
            {loading ? 'Posting...' : 'Post Job 🚀'}
          </button>

        </form>
      </div>
    </div>
  );
}