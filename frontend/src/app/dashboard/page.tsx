'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/alumni/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-secondary-600">
          {!user.isVerified ? (
            <span className="text-yellow-600">
              ⚠️ Your profile is pending admin verification
            </span>
          ) : (
            'Your dashboard'
          )}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <a href="/dashboard/profile" className="block btn-primary text-center">
              Edit Profile
            </a>
            <a href="/directory" className="block btn-secondary text-center">
              Browse Alumni
            </a>
            <a href="/events" className="block btn-secondary text-center">
              View Events
            </a>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Your Profile</h3>
          {user.alumniProfile && (
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Batch:</span> {user.alumniProfile.batchYear}</p>
              <p><span className="font-medium">Department:</span> {user.alumniProfile.department}</p>
              {user.alumniProfile.company && (
                <p><span className="font-medium">Company:</span> {user.alumniProfile.company}</p>
              )}
              {user.alumniProfile.jobTitle && (
                <p><span className="font-medium">Role:</span> {user.alumniProfile.jobTitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Community Stats */}
        {stats && (
          <div className="card">
            <h3 className="text-lg font-semibold text-secondary-900 mb-3">Community Stats</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Total Alumni:</span> {stats.totalAlumni}</p>
              <p><span className="font-medium">Your Batch:</span> {
                stats.byBatch.find((b: any) => b.batchYear === user.alumniProfile?.batchYear)?._count || 0
              } members</p>
              <p><span className="font-medium">Your Department:</span> {
                stats.byDepartment.find((d: any) => d.department === user.alumniProfile?.department)?._count || 0
              } members</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {/* <div className="card">
        <h3 className="text-xl font-semibold text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm font-semibold">📢</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">New event announced</p>
              <p className="text-xs text-secondary-600">Annual Alumni Meetup - December 15, 2024</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-sm font-semibold">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-900">New alumni joined</p>
              <p className="text-xs text-secondary-600">5 new members from your batch</p>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}