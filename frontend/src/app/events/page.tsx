'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { moduleCache } from '@/lib/moduleCache';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  X,
  GraduationCap,
  Briefcase,
  Globe,
  Info,
  Building2,
  ExternalLink,
  ArrowLeft,
  Clock,
  Ticket,
  Check,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseBatches = (
  raw?: string | null
): {
  alumni: number[];
  students: number[];
  departments: string[];
  deptScope: string;
} => {
  const def = { alumni: [], students: [], departments: [], deptScope: 'BOTH' };
  if (!raw) return def;
  try {
    return { ...def, ...JSON.parse(raw) };
  } catch {
    return def;
  }
};

const audienceConfig: Record<string, { badgeBg: string; badgeText: string }> = {
  ALL: { badgeBg: 'bg-[#261f15] text-[#e8a93c] border border-[#3d3222]', badgeText: 'text-[#e8a93c]' },
  ALUMNI: { badgeBg: 'bg-[#3a5c3e]/15 text-[#3a5c3e] border border-[#3a5c3e]/30', badgeText: 'text-[#3a5c3e]' },
  STUDENT: { badgeBg: 'bg-[#fdf8ed] text-[#c4821a] border border-[#c4821a]/30', badgeText: 'text-[#c4821a]' },
  CUSTOM: { badgeBg: 'bg-[#f4efe6] text-[#5c4d37] border border-[#1a1410]/15', badgeText: 'text-[#5c4d37]' },
};

// ── Audience Detail Modal ─────────────────────────────────────────────────────
function AudienceModal({ event, onClose }: { event: any; onClose: () => void }) {
  const batches = parseBatches(event.targetBatches);

  const hasAlumniBatches = batches.alumni?.length > 0;
  const hasStudentBatches = batches.students?.length > 0;
  const hasDepts = batches.departments?.length > 0;

  const Icon =
    event.targetAudience === 'ALL'
      ? Globe
      : event.targetAudience === 'ALUMNI'
      ? Briefcase
      : event.targetAudience === 'STUDENT'
      ? GraduationCap
      : Users;

  const deptScopeLabel =
    batches.deptScope === 'ALUMNI'
      ? 'Alumni only'
      : batches.deptScope === 'STUDENTS'
      ? 'Students only'
      : 'Both Students & Alumni';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#1a1410]/15 shadow-2xl w-full max-w-md p-6 sm:p-7 relative text-[#1a1410]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center shrink-0 shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-medium text-[#c4821a] uppercase tracking-wider">
                Event Visibility
              </p>
              <h3 className="text-lg font-serif text-[#1a1410] font-normal leading-snug">
                {event.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#7d6a4f] hover:text-[#1a1410] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audience type badge */}
        <div className="mb-4 p-3.5 bg-[#fcfbf9] rounded-xl border border-[#1a1410]/10">
          <p className="text-[11px] font-mono uppercase text-[#7d6a4f] tracking-wider mb-1.5 font-medium">
            Eligible Audience
          </p>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
              audienceConfig[event.targetAudience]?.badgeBg || 'bg-[#f4efe6] text-[#1a1410]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {event.targetAudience === 'ALL'
              ? 'Open to All (Students + Alumni)'
              : event.targetAudience === 'ALUMNI'
              ? 'Alumni Only'
              : event.targetAudience === 'STUDENT'
              ? 'Current Students Only'
              : 'Custom Batch Mix'}
          </span>
        </div>

        {/* ALL message */}
        {event.targetAudience === 'ALL' && !hasDepts && (
          <div className="p-3.5 bg-[#3a5c3e]/10 rounded-xl border border-[#3a5c3e]/20 text-xs text-[#3a5c3e] font-medium mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Visible to all verified members across all batches and departments.</span>
          </div>
        )}

        {/* Alumni batches */}
        {(event.targetAudience === 'ALUMNI' || event.targetAudience === 'CUSTOM') && (
          <div className="mb-3.5">
            <p className="text-[11px] font-mono uppercase text-[#7d6a4f] tracking-wider mb-2 flex items-center gap-1.5 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-[#c4821a]" />
              <span>Alumni Batches</span>
            </p>
            {hasAlumniBatches ? (
              <div className="flex flex-wrap gap-1.5">
                {batches.alumni
                  .sort((a, b) => a - b)
                  .map((yr) => (
                    <span
                      key={yr}
                      className="px-2.5 py-1 bg-[#261f15] text-[#e8a93c] border border-[#3d3222] rounded-lg text-xs font-mono font-medium"
                    >
                      Class of {yr}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[#7d6a4f] italic">All alumni graduation years</p>
            )}
          </div>
        )}

        {/* Student batches */}
        {(event.targetAudience === 'STUDENT' || event.targetAudience === 'CUSTOM') && (
          <div className="mb-3.5">
            <p className="text-[11px] font-mono uppercase text-[#7d6a4f] tracking-wider mb-2 flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-[#3a5c3e]" />
              <span>Student Batches</span>
            </p>
            {hasStudentBatches ? (
              <div className="flex flex-wrap gap-1.5">
                {batches.students
                  .sort((a, b) => a - b)
                  .map((yr) => (
                    <span
                      key={yr}
                      className="px-2.5 py-1 bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/30 rounded-lg text-xs font-mono font-medium"
                    >
                      Batch {yr}
                    </span>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[#7d6a4f] italic">All active student batches</p>
            )}
          </div>
        )}

        {/* Departments */}
        {hasDepts && (
          <div className="mb-4 pt-3 border-t border-[#1a1410]/10">
            <p className="text-[11px] font-mono uppercase text-[#7d6a4f] tracking-wider mb-2 flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#c4821a]" />
                <span>Eligible Departments</span>
              </span>
              <span className="text-[10px] text-[#7d6a4f] font-mono normal-case">
                Scope: {deptScopeLabel}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {batches.departments.map((dept) => (
                <span
                  key={dept}
                  className="px-2.5 py-1 bg-[#fdf8ed] text-[#c4821a] border border-[#c4821a]/30 rounded-lg text-xs font-semibold"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full py-2.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] font-semibold rounded-xl transition-colors text-xs sm:text-sm cursor-pointer shadow-xs"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function Events() {
  const { user, loading: authLoading } = useAuth();
  const cachedEvents = moduleCache.get<any[]>('events');
  const [events, setEvents] = useState<any[]>(() => cachedEvents || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedEvents);
  const [audienceModal, setAudienceModal] = useState<any | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());

  // Confirm Registration Modal state
  const [confirmModal, setConfirmModal] = useState<{
    eventId: string;
    eventTitle: string;
    isExternal: boolean;
    externalLink?: string;
  } | null>(null);

  // Custom Delete Confirmation Modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    eventId: string;
    eventTitle: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keyboard accessibility: Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmModal && !isDeleting) setDeleteConfirmModal(null);
        if (confirmModal) setConfirmModal(null);
        if (audienceModal) setAudienceModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmModal, isDeleting, confirmModal, audienceModal]);

  const getEventImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
  };

  const fetchEvents = async (forceRefetch = false) => {
    if (!forceRefetch) {
      const cached = moduleCache.get<any[]>('events');
      if (cached) {
        setEvents(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.get(`${API_URL}/api/events`);
      const loadedEvents = res.data.events || [];
      setEvents(loadedEvents);
      moduleCache.set('events', loadedEvents);
    } catch {
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

  // Handles registration
  const handleRegister = async (eventId: string) => {
    try {
      await axios.post(`${API_URL}/api/events/${eventId}/register`);
      toast.success('Registration confirmed for this event!');
      setRegisteredEventIds((prev) => new Set(prev).add(eventId));
      setEvents((prev) => {
        const next = prev.map((ev) => {
          if (ev.id === eventId) {
            const newReg = {
              id: 'local-' + Date.now(),
              userId: user?.id,
              eventId,
              user: { id: user?.id, name: user?.name, role: user?.role },
            };
            const currentRegs = ev.registrations || [];
            return { ...ev, registrations: [...currentRegs, newReg] };
          }
          return ev;
        });
        moduleCache.set('events', next);
        return next;
      });
      fetchEvents(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '';
      if (errorMsg.toLowerCase().includes('already registered')) {
        // Gracefully mark as registered on client without showing error toast
        setRegisteredEventIds((prev) => new Set(prev).add(eventId));
        fetchEvents(true);
      } else {
        toast.error(errorMsg || 'Registration failed. Please try again.');
      }
    } finally {
      setConfirmModal(null);
    }
  };

  // Custom modal delete confirm handler
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal) return;
    setIsDeleting(true);
    try {
      await axios.delete(`${API_URL}/api/events/${deleteConfirmModal.eventId}`);
      toast.success('Event deleted successfully');
      setEvents((prev) => {
        const next = prev.filter((ev) => ev.id !== deleteConfirmModal.eventId);
        moduleCache.set('events', next);
        return next;
      });
      setDeleteConfirmModal(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Unauthenticated Guard ──────────────────────────────────────────────────
  if (!user && !authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
        <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm p-8 sm:p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
            Authentication Required
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight mb-2">
            Sign In to View Events
          </h2>
          <p className="text-[#5c4d37] text-xs sm:text-sm mb-8 leading-relaxed">
            Access to college gatherings, alumni reunions, guest lectures, and networking meets is reserved for registered members of Xavier AlumniConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?redirect=/events"
              className="flex-1 py-3 px-4 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold rounded-xl text-sm transition-all border border-[#3d3222]/50 shadow-sm text-center"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 px-4 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-sm transition-colors border border-[#1a1410]/15 text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe6] text-[#1a1410]">
        {/* Header Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="h-4 w-32 bg-[#1a1410]/10 rounded-full animate-pulse" />
              <div className="h-9 w-64 sm:w-80 bg-[#1a1410]/15 rounded-xl animate-pulse" />
              <div className="h-4 w-72 sm:w-96 bg-[#1a1410]/10 rounded-lg animate-pulse" />
            </div>
            <div className="h-11 w-36 bg-[#1a1410]/15 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl overflow-hidden border border-[#1a1410]/10 shadow-sm"
              >
                <div className="h-48 bg-[#1a1410]/10 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-[#1a1410]/15 rounded-lg animate-pulse" />
                  <div className="h-4 w-full bg-[#1a1410]/10 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-[#1a1410]/10 rounded animate-pulse" />
                  <div className="h-10 w-full bg-[#1a1410]/15 rounded-xl mt-4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Split Upcoming vs Past Events
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const upcomingEvents = events.filter((event) => new Date(event.date) >= currentDate);
  const pastEvents = events.filter((event) => new Date(event.date) < currentDate);

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* ─── EDITORIAL HEADER (Matched with Alumni Stories) ────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Title & Navigation */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Community Events &amp; Gatherings
              </h1>
            </div>
            <p className="text-sm text-[#5c4d37] mt-1.5 max-w-xl">
              Join upcoming collegiate summits, alumni reunions, guest lectures, and networking mixers curated for the Xavier fraternity.
            </p>
          </div>

          {/* Right: Admin Action CTA */}
          {user?.role === 'ADMIN' && (
            <div className="flex-shrink-0">
              <Link
                href="/events/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold text-xs sm:text-sm shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 transition-all self-start md:self-auto"
              >
                <Plus className="w-4 h-4 text-[#e8a93c]" />
                <span>Create New Event</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#1a1410]/15 shadow-sm p-6">
            <div className="w-14 h-14 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif text-[#1a1410] font-normal mb-1">
              No events scheduled yet
            </h3>
            <p className="text-xs sm:text-sm text-[#5c4d37] max-w-md mx-auto mb-5 leading-relaxed">
              Check back soon for upcoming campus reunions, alumni webinars, and networking meetups.
            </p>
            {user?.role === 'ADMIN' && (
              <Link
                href="/events/create"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1410] text-[#f4efe6] text-xs font-semibold rounded-xl hover:bg-[#3d3222] transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-[#e8a93c]" />
                <span>Publish the First Event</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ─── UPCOMING EVENTS ─────────────────────────────────────────── */}
            {upcomingEvents.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#1a1410]/10">
                  <h2 className="text-xl sm:text-2xl font-serif text-[#1a1410] font-normal flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#c4821a]" />
                    <span>Upcoming Events</span>
                  </h2>
                  <span className="text-xs font-mono text-[#7d6a4f]">
                    {upcomingEvents.length} {upcomingEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                  {upcomingEvents.map((event) => {
                    const cfg = audienceConfig[event.targetAudience] ?? audienceConfig['ALL'];
                    const batches = parseBatches(event.targetBatches);
                    const hasDepts = batches.departments?.length > 0;
                    const isExternal = !!event.registrationLink?.trim();
                    const isUserRegistered =
                      registeredEventIds.has(event.id) ||
                      (!!user &&
                        event.registrations?.some(
                          (r: any) => r.userId === user.id || r.user?.id === user.id
                        ));

                    return (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl shadow-sm border border-[#1a1410]/12 hover:border-[#1a1410]/25 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                      >
                        {/* Image Banner */}
                        <div>
                          <div className="h-44 sm:h-48 relative bg-[#261f15] overflow-hidden">
                            {event.imageUrl ? (
                              <img
                                src={getEventImageUrl(event.imageUrl)!}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                alt={event.title}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-[#3d3222] to-[#1a1410] text-[#e8a93c]/80 p-4 text-center">
                                <Calendar className="w-10 h-10 mb-2 stroke-[1.5]" />
                                <span className="text-xs font-serif text-[#f4efe6]/90">
                                  Xavier Alumni Event
                                </span>
                              </div>
                            )}

                            {/* Audience badge */}
                            <button
                              type="button"
                              onClick={() => setAudienceModal(event)}
                              className={`absolute top-3 left-3 ${cfg.badgeBg} backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105`}
                              title="Click to view visibility details"
                            >
                              <Info className="w-3 h-3" />
                              <span>
                                {event.targetAudience === 'ALL'
                                  ? 'For: Everyone'
                                  : event.targetAudience === 'ALUMNI'
                                  ? 'For: Alumni'
                                  : event.targetAudience === 'STUDENT'
                                  ? 'For: Students'
                                  : 'For: Custom Mix'}
                              </span>
                            </button>

                            {/* Dept badge */}
                            {hasDepts && (
                              <button
                                type="button"
                                onClick={() => setAudienceModal(event)}
                                className="absolute top-3 right-3 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Department criteria active"
                              >
                                <Building2 className="w-3 h-3" />
                                <span>
                                  {batches.departments.length === 1
                                    ? batches.departments[0]
                                    : `${batches.departments.length} depts`}
                                </span>
                              </button>
                            )}
                          </div>

                          {/* Card Body */}
                          <div className="p-5 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-serif text-[#1a1410] font-normal mb-1.5 leading-snug group-hover:text-[#c4821a] transition-colors line-clamp-2">
                              {event.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#5c4d37] mb-4 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>

                            {/* Metadata */}
                            <div className="space-y-2 mb-4 bg-[#fcfbf9] p-3 rounded-xl border border-[#1a1410]/8 text-xs text-[#5c4d37]">
                              <div className="flex items-center gap-2.5 font-medium text-[#1a1410]">
                                <Calendar className="w-3.5 h-3.5 text-[#7d6a4f] shrink-0" />
                                <span>
                                  {new Date(event.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <MapPin className="w-3.5 h-3.5 text-[#7d6a4f] shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer & Actions */}
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                          <div className="pt-3 border-t border-[#1a1410]/8 flex items-center gap-2">
                            {isUserRegistered ? (
                              <button
                                type="button"
                                disabled
                                aria-disabled="true"
                                className="flex-1 py-2.5 sm:py-3 px-3 bg-[#3a5c3e]/10 text-[#3a5c3e] text-xs sm:text-sm font-semibold rounded-xl border border-[#3a5c3e]/30 shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-default select-none"
                              >
                                <Check className="w-3.5 h-3.5 text-[#3a5c3e] stroke-[2.5]" />
                                <span>Already Registered</span>
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setConfirmModal({
                                    eventId: event.id,
                                    eventTitle: event.title,
                                    isExternal,
                                    externalLink: event.registrationLink || undefined,
                                  })
                                }
                                className="flex-1 py-2.5 sm:py-3 px-3 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] text-xs sm:text-sm font-semibold rounded-xl border border-[#3d3222]/50 shadow-xs hover:shadow transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {isExternal ? (
                                  <>
                                    <span>Register via Form</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-[#e8a93c]" />
                                  </>
                                ) : (
                                  <>
                                    <Ticket className="w-3.5 h-3.5 text-[#e8a93c]" />
                                    <span>Register Now</span>
                                  </>
                                )}
                              </button>
                            )}

                            {user?.role === 'ADMIN' && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    eventId: event.id,
                                    eventTitle: event.title,
                                  })
                                }
                                className="w-10 h-10 sm:w-auto sm:px-3 sm:py-2.5 flex items-center justify-center bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 border border-rose-200 rounded-xl transition-all text-xs font-semibold shrink-0 cursor-pointer"
                                title="Delete event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline ml-1">Delete</span>
                              </button>
                            )}
                          </div>

                          {/* Participants Preview */}
                          <div className="mt-4 pt-3 border-t border-[#1a1410]/8">
                            <div className="flex justify-between items-center mb-2 text-xs">
                              <div className="flex items-center gap-1.5 text-[#7d6a4f]">
                                <Users className="w-3.5 h-3.5" />
                                <span className="font-mono text-[11px] uppercase tracking-wider">
                                  Participants ({event.registrations?.length || 0})
                                </span>
                              </div>
                              <Link
                                href={`/events/${event.id}/participants`}
                                className="text-[11px] text-[#c4821a] hover:text-[#1a1410] font-semibold underline underline-offset-2 transition-colors"
                              >
                                View Roster &rarr;
                              </Link>
                            </div>

                            {event.registrations?.length > 0 ? (
                              <div className="flex -space-x-1.5 overflow-hidden py-1">
                                {event.registrations.slice(0, 6).map((reg: any) => (
                                  <Link
                                    key={reg.id}
                                    href={`/profile/${reg.user.id}`}
                                    className="relative inline-block hover:z-10 transition-transform hover:scale-110"
                                  >
                                    <div
                                      className="h-7 w-7 rounded-full border border-white bg-[#261f15] text-[#e8a93c] flex items-center justify-center text-[10px] font-semibold"
                                      title={reg.user.name}
                                    >
                                      {reg.user.name.charAt(0).toUpperCase()}
                                    </div>
                                  </Link>
                                ))}
                                {event.registrations.length > 6 && (
                                  <div className="h-7 w-7 rounded-full border border-white bg-[#f4efe6] flex items-center justify-center text-[10px] text-[#5c4d37] font-semibold font-mono">
                                    +{event.registrations.length - 6}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-[#7d6a4f] italic">
                                Be the first member to register.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── PAST EVENTS ARCHIVE ─────────────────────────────────────── */}
            {pastEvents.length > 0 && (
              <div className="opacity-85">
                <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#1a1410]/10">
                  <h2 className="text-xl sm:text-2xl font-serif text-[#5c4d37] font-normal flex items-center gap-2.5">
                    <Clock className="w-5 h-5 text-[#7d6a4f]" />
                    <span>Past Events Archive</span>
                  </h2>
                  <span className="text-xs font-mono text-[#7d6a4f]">
                    {pastEvents.length} completed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                  {pastEvents.map((event) => {
                    const cfg = audienceConfig[event.targetAudience] ?? audienceConfig['ALL'];

                    return (
                      <div
                        key={event.id}
                        className="bg-white/80 rounded-2xl shadow-xs border border-[#1a1410]/10 overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-40 relative bg-slate-100 overflow-hidden grayscale">
                            {event.imageUrl ? (
                              <img
                                src={getEventImageUrl(event.imageUrl)!}
                                className="w-full h-full object-cover"
                                alt={event.title}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#7d6a4f]">
                                <Calendar className="w-8 h-8" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-[#1a1410]/20" />
                            <span
                              className={`absolute top-3 left-3 ${cfg.badgeBg} backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold shadow-xs`}
                            >
                              Concluded
                            </span>
                          </div>

                          <div className="p-5">
                            <h3 className="text-base sm:text-lg font-serif text-[#1a1410] font-normal mb-1 line-clamp-1">
                              {event.title}
                            </h3>
                            <p className="text-xs text-[#7d6a4f] mb-3 line-clamp-2 leading-relaxed">
                              {event.description}
                            </p>

                            <div className="space-y-1.5 text-xs text-[#7d6a4f] mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#7d6a4f]" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#7d6a4f]" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <div className="pt-3 border-t border-[#1a1410]/8 flex items-center gap-2">
                            <div className="flex-1 text-center py-2.5 bg-[#f4efe6] text-[#7d6a4f] text-xs font-mono rounded-xl border border-[#1a1410]/10">
                              Event Concluded
                            </div>
                            {user?.role === 'ADMIN' && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmModal({
                                    eventId: event.id,
                                    eventTitle: event.title,
                                  })
                                }
                                className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all text-xs cursor-pointer"
                                title="Delete past event"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────── */}
      {audienceModal && (
        <AudienceModal event={audienceModal} onClose={() => setAudienceModal(null)} />
      )}

      {/* Confirm Registration Dialog */}
      {confirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-reg-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => setConfirmModal(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#1a1410]/15 shadow-2xl w-full max-w-sm p-6 text-center text-[#1a1410]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ticket Badge */}
            <div className="w-14 h-14 bg-[#261f15] border border-[#3d3222] text-[#e8a93c] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Ticket className="w-6 h-6" />
            </div>

            <h3 id="confirm-reg-title" className="text-xl font-serif text-[#1a1410] font-normal mb-1">
              Confirm Registration
            </h3>
            <p className="text-xs text-[#5c4d37] mb-1">You are registering for:</p>
            <p className="text-sm font-semibold text-[#1a1410] mb-4 px-2 leading-snug">
              &ldquo;{confirmModal.eventTitle}&rdquo;
            </p>

            {confirmModal.isExternal ? (
              <div className="mb-5 p-3 bg-[#fdf8ed] rounded-xl border border-[#c4821a]/30 text-left flex items-start gap-2.5">
                <ExternalLink className="w-4 h-4 text-[#c4821a] mt-0.5 shrink-0" />
                <p className="text-xs text-[#c4821a] font-medium leading-relaxed">
                  This gathering uses an <strong>external registration form</strong>. Clicking continue will redirect you to the organizer&apos;s link.
                </p>
              </div>
            ) : (
              <div className="mb-5 p-3 bg-[#3a5c3e]/10 rounded-xl border border-[#3a5c3e]/30 text-left flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#3a5c3e] mt-0.5 shrink-0" />
                <p className="text-xs text-[#3a5c3e] font-medium leading-relaxed">
                  Your registration will be confirmed immediately and added to your profile roster.
                </p>
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-[#1a1410]/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmModal.isExternal && confirmModal.externalLink) {
                    window.open(confirmModal.externalLink, '_blank', 'noopener,noreferrer');
                    setConfirmModal(null);
                  } else {
                    handleRegister(confirmModal.eventId);
                  }
                }}
                className="flex-1 py-2.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] font-semibold rounded-xl text-xs sm:text-sm transition-all border border-[#3d3222]/50 shadow-sm cursor-pointer"
              >
                {confirmModal.isExternal ? 'Open Form' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CUSTOM EVENT DELETE CONFIRMATION MODAL ───────────────────────── */}
      {deleteConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-dialog-title"
          aria-describedby="delete-event-dialog-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={() => !isDeleting && setDeleteConfirmModal(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#1a1410]/15 shadow-2xl w-full max-w-sm p-6 text-center text-[#1a1410] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Destructive Warning Badge */}
            <div className="w-14 h-14 bg-rose-50 border border-rose-200/80 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3
              id="delete-event-dialog-title"
              className="text-xl font-serif text-[#1a1410] font-normal mb-1.5"
            >
              Delete Event?
            </h3>

            <p
              id="delete-event-dialog-desc"
              className="text-xs text-[#5c4d37] mb-2 leading-relaxed"
            >
              Are you sure you want to delete this event? This action cannot be undone.
            </p>

            <p className="text-sm font-semibold text-[#1a1410] mb-5 px-2 line-clamp-2 leading-snug">
              &ldquo;{deleteConfirmModal.eventTitle}&rdquo;
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 py-2.5 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-[#1a1410]/15 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-xs hover:shadow border border-rose-700 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Event</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}