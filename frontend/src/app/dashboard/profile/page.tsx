'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { moduleCache } from '@/lib/moduleCache';
import {
  ArrowLeft,
  Upload,
  User,
  Lock,
  GraduationCap,
  Calendar,
  Hash,
  MapPin,
  Building2,
  Briefcase,
  Link2,
  Layers,
  FileText,
  Save,
  X,
  Plus,
  BadgeCheck,
  CheckCircle2,
  Camera,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const inputCls =
  'w-full px-4 py-2.5 bg-white border border-[#1a1410]/15 text-[#1a1410] placeholder-[#7d6a4f]/60 rounded-xl text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30';
const labelCls =
  'block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5';

/**
 * Calculates academic graduation journey milestones and dynamic countdown
 * for 3-year collegiate degree programs.
 */
function getAcademicJourneyData(batchYearInput: string | number | undefined, role: string | undefined) {
  const batchYear = typeof batchYearInput === 'string' ? parseInt(batchYearInput, 10) : batchYearInput;

  if (!batchYear || isNaN(batchYear)) {
    return null;
  }

  const transitionYear = batchYear + 3;
  // Month 7 is August in JavaScript Date (0-indexed)
  const startDate = new Date(batchYear, 7, 1);
  const transitionDate = new Date(transitionYear, 7, 1);
  const now = new Date();

  const isCompleted = now >= transitionDate || role === 'ALUMNI';
  const totalMs = transitionDate.getTime() - startDate.getTime();
  const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
  const progressPct = isCompleted
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  // Calculate year, month, day difference
  let remainingText = '';
  if (now >= transitionDate) {
    remainingText = 'Graduation transition due';
  } else {
    let years = transitionDate.getFullYear() - now.getFullYear();
    let months = transitionDate.getMonth() - now.getMonth();
    let days = transitionDate.getDate() - now.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    }
    if (years === 0 && months === 0) {
      const remainingDays = Math.max(1, Math.ceil((transitionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      parts.push(`${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`);
    }

    remainingText = parts.length > 0 ? `${parts.join(' ')} remaining` : 'Transition approaching';
  }

  const formattedTransitionDate = `01 August ${transitionYear}`;

  return {
    batchYear,
    transitionYear,
    formattedTransitionDate,
    remainingText,
    progressPct,
    isCompleted,
  };
}

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    batchYear: '',
    department: '',
    rollNo: '',
    company: '',
    jobTitle: '',
    location: '',
    linkedinUrl: '',
    bio: '',
    contactPublic: false,
  });

  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Academic Journey Calculation ──────────────────────────────────────────
  const journeyData = useMemo(
    () => getAcademicJourneyData(formData.batchYear || user?.alumniProfile?.batchYear, user?.role),
    [formData.batchYear, user?.alumniProfile?.batchYear, user?.role]
  );

  // ── Fetch & prefill ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_URL}/api/alumni/${user.id}`);
        const data = res.data.alumni;
        const profile = data.alumniProfile || {};

        setFormData({
          name: data.name || '',
          batchYear: profile.batchYear || '',
          department: profile.department || '',
          rollNo: profile.rollNo || '',
          company: profile.company || '',
          jobTitle: profile.jobTitle || '',
          location: profile.location || '',
          linkedinUrl: profile.linkedinUrl || '',
          bio: profile.bio || '',
          contactPublic: profile.contactPublic || false,
        });

        if (profile.skills?.length) setSkillsList(profile.skills);
        if (profile.photoUrl) setPreviewUrl(profile.photoUrl);
      } catch {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        toast.error('Please sign in to edit your profile');
        router.push('/login?redirect=/dashboard/profile');
      } else {
        fetchProfile();
      }
    }
  }, [user, authLoading, router]);

  // ── Input change ───────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // ── Skills chip input ──────────────────────────────────────────────────────
  const addSkill = useCallback(() => {
    const skill = skillInput.trim().replace(/,+$/, '');
    if (!skill || skillsList.includes(skill)) {
      setSkillInput('');
      return;
    }
    setSkillsList((prev) => [...prev, skill]);
    setSkillInput('');
  }, [skillInput, skillsList]);

  const removeSkill = (skill: string) =>
    setSkillsList((prev) => prev.filter((s) => s !== skill));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  // ── Photo processing ───────────────────────────────────────────────────────
  const processPhotoFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5 MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WEBP)');
      return;
    }
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    toast.success('Photo selected!');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processPhotoFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processPhotoFile(file);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('company', formData.company);
      data.append('jobTitle', formData.jobTitle);
      data.append('location', formData.location);
      data.append('linkedinUrl', formData.linkedinUrl);
      data.append('bio', formData.bio);
      data.append('contactPublic', String(formData.contactPublic));
      data.append('skills', JSON.stringify(skillsList));
      if (photo) data.append('photo', photo);

      const toastId = toast.loading('Updating your profile...');
      await axios.put(`${API_URL}/api/alumni/${user?.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      moduleCache.invalidate('directory');
      if (user?.id) {
        moduleCache.invalidate(`dashboard:${user.id}`);
      }
      toast.success('Profile updated successfully!', { id: toastId, duration: 4000 });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: unknown) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Profile completion (live calculation) ──────────────────────────────────
  const completionFields = [
    { label: 'Photo', done: !!previewUrl },
    { label: 'Name', done: !!formData.name },
    { label: 'Location', done: !!formData.location },
    { label: 'Company', done: !!formData.company },
    { label: 'Job Title', done: !!formData.jobTitle },
    { label: 'LinkedIn', done: !!formData.linkedinUrl },
    { label: 'Bio', done: !!formData.bio },
    { label: 'Skills', done: skillsList.length > 0 },
  ];
  const completionPct = Math.round(
    (completionFields.filter((f) => f.done).length / completionFields.length) * 100
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1410]/10 border-t-[#c4821a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#7d6a4f]">Loading profile credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* ─── EDITORIAL HEADER (Matched with Stories & Events) ──────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Profile Settings
              </h1>
            </div>
            <p className="text-sm text-[#5c4d37] mt-1.5 max-w-xl">
              Update your alumni credentials, contact visibility, and academic journey across Xavier AlumniConnect.
            </p>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* ── Left column: Form Sections ────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-6 w-full">
              {/* Photo upload */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                  <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                  <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                    Profile Photo
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Current preview */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#261f15] border-2 border-[#3d3222] text-[#e8a93c] shadow-sm flex items-center justify-center font-serif text-3xl">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-10 h-10 text-[#7d6a4f]" />
                      )}
                    </div>
                    {/* Camera Badge button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1a1410] hover:bg-[#3d3222] text-[#e8a93c] rounded-xl flex items-center justify-center shadow-md border border-[#3d3222] transition-colors cursor-pointer"
                      title="Change photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drop zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all select-none w-full ${
                      dragging
                        ? 'border-[#c4821a] bg-[#fdf8ed]'
                        : 'border-[#1a1410]/15 hover:border-[#c4821a]/50 hover:bg-[#fcfbf9]'
                    }`}
                  >
                    <Upload
                      className={`w-6 h-6 mx-auto mb-1.5 ${
                        dragging ? 'text-[#c4821a]' : 'text-[#7d6a4f]'
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                      {photo ? photo.name : 'Drop photo here or click to browse'}
                    </p>
                    <p className="text-[11px] font-mono text-[#7d6a4f] mt-0.5">
                      JPG, PNG, WEBP up to 5 MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Academic info (Permanent / Read-Only) */}
              <div className="bg-[#fcfbf9] rounded-2xl border border-[#1a1410]/12 p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1a1410]/8">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#7d6a4f]" />
                    <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                      Academic Credentials
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-[#7d6a4f] bg-white px-2.5 py-0.5 rounded-full border border-[#1a1410]/10">
                    Read Only
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: 'Batch Year',
                      value: formData.batchYear ? `Batch of ${formData.batchYear}` : 'Not set',
                      Icon: Calendar,
                    },
                    {
                      label: 'Department',
                      value: formData.department || 'Not set',
                      Icon: GraduationCap,
                    },
                    {
                      label: 'Roll Number',
                      value: formData.rollNo || 'Not set',
                      Icon: Hash,
                    },
                  ].map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl p-3.5 border border-[#1a1410]/10 shadow-xs"
                    >
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1.5">
                        {label}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-[#1a1410] truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#7d6a4f] mt-3 font-mono">
                  Batch year, department, and university roll number are verified credentials and cannot be altered.
                </p>
              </div>

              {/* Academic Journey / Graduation Timeline (STUDENT / ALUMNI) */}
              {journeyData && user?.role !== 'ADMIN' && (
                <div
                  className={`rounded-2xl border shadow-xs p-5 sm:p-6 transition-all ${
                    user?.role === 'STUDENT'
                      ? 'bg-[#faf7f2] border-[#c4821a]/30'
                      : 'bg-[#faf7f2] border-[#3a5c3e]/25'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1a1410]/8">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          user?.role === 'STUDENT'
                            ? 'bg-[#261f15] border border-[#3d3222] text-[#e8a93c]'
                            : 'bg-[#3a5c3e]/15 border border-[#3a5c3e]/30 text-[#3a5c3e]'
                        }`}
                      >
                        {user?.role === 'STUDENT' ? (
                          <GraduationCap className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                          Academic Journey
                        </h2>
                        <p className="text-[11px] text-[#7d6a4f] font-mono">
                          {user?.role === 'STUDENT'
                            ? '3-Year Academic Session Timeline'
                            : 'Graduated Alumni Member'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider uppercase border ${
                        user?.role === 'STUDENT'
                          ? 'bg-[#261f15] text-[#e8a93c] border-[#3d3222]'
                          : 'bg-[#3a5c3e]/15 text-[#3a5c3e] border-[#3a5c3e]/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          user?.role === 'STUDENT' ? 'bg-[#e8a93c]' : 'bg-[#3a5c3e]'
                        }`}
                      />
                      {user?.role || 'STUDENT'}
                    </span>
                  </div>

                  {user?.role === 'STUDENT' ? (
                    <div className="space-y-4">
                      {/* Metric cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3.5 border border-[#1a1410]/10 shadow-xs">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                            Alumni Transition Date
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#c4821a] flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                              {journeyData.formattedTransitionDate}
                            </p>
                          </div>
                          <p className="text-[10px] text-[#7d6a4f] font-mono mt-1">
                            Batch {journeyData.batchYear} (3-Year Program)
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-3.5 border border-[#1a1410]/10 shadow-xs">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[#7d6a4f] mb-1">
                            Time Remaining
                          </p>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#3a5c3e] flex-shrink-0" />
                            <p className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                              {journeyData.remainingText}
                            </p>
                          </div>
                          <p className="text-[10px] text-[#7d6a4f] font-mono mt-1">
                            Until automatic role transition
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="bg-white rounded-xl p-4 border border-[#1a1410]/10 shadow-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#7d6a4f] mb-2">
                          <span>Session Start ({journeyData.batchYear})</span>
                          <span className="font-semibold text-[#1a1410]">
                            {journeyData.progressPct}% Elapsed
                          </span>
                          <span>Transition ({journeyData.transitionYear})</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#1a1410]/10 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-[#c4821a] to-[#3a5c3e] rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${journeyData.progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Informational banner */}
                      <div className="bg-white/80 rounded-xl p-3 border border-[#1a1410]/8 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#c4821a] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#3d3222] leading-relaxed">
                          Your profile will automatically graduate to <strong className="text-[#1a1410] font-semibold">ALUMNI</strong> status on <span className="font-mono font-medium text-[#1a1410]">{journeyData.formattedTransitionDate}</span> at the conclusion of your 3-year academic tenure.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* ALUMNI State */
                    <div className="bg-white rounded-xl p-4 border border-[#1a1410]/10 shadow-xs space-y-3">
                      <div className="flex items-center gap-3">
                        <BadgeCheck className="w-5 h-5 text-[#3a5c3e] flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                            Academic Journey Completed
                          </p>
                          <p className="text-[11px] text-[#7d6a4f] font-mono">
                            Batch of {journeyData.batchYear} • Graduated Class of {journeyData.transitionYear}
                          </p>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-[#3a5c3e]/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#3a5c3e] w-full rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Personal info */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                  <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                  <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                    Personal Information
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className={labelCls}>
                      Full Legal Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`${inputCls} pl-10`}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Current Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className={`${inputCls} pl-10`}
                        placeholder="e.g. Bengaluru, India / London, UK"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional info */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                  <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                  <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                    Professional Details &amp; Skills
                  </h2>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label className={labelCls}>Company / Institution</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className={`${inputCls} pl-10`}
                          placeholder="Current organization or startup"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Job Title / Designation</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          className={`${inputCls} pl-10`}
                          placeholder="e.g. Senior Software Architect"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>LinkedIn Profile URL</label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6a4f]" />
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        className={`${inputCls} pl-10`}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <p className="text-[11px] font-mono text-[#7d6a4f] mt-1">
                      Enables fellow alumni and juniors to reach out for professional mentorship.
                    </p>
                  </div>

                  {/* Skills chip input */}
                  <div>
                    <label className={labelCls}>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#7d6a4f]" />
                        <span>Key Skills &amp; Domain Expertise</span>
                      </span>
                    </label>

                    {/* Chip list */}
                    {skillsList.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2.5">
                        {skillsList.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#261f15] text-[#e8a93c] border border-[#3d3222] text-xs font-mono font-medium rounded-lg shadow-xs"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 text-[#e8a93c]/60 hover:text-white transition-colors cursor-pointer"
                              aria-label={`Remove ${skill}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Input + Add button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                        className={`${inputCls} flex-1`}
                        placeholder="Type a skill and press Enter..."
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1410] hover:bg-[#3d3222] text-[#f4efe6] rounded-xl text-xs sm:text-sm font-semibold border border-[#3d3222]/50 shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-[#e8a93c]" />
                        <span>Add</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-[#7d6a4f] mt-1">
                      Press <kbd className="px-1.5 py-0.5 bg-[#f4efe6] border border-[#1a1410]/15 rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-[#f4efe6] border border-[#1a1410]/15 rounded text-[10px] font-mono">,</kbd> to add each skill.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                  <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                  <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                    About You
                  </h2>
                </div>

                <label className={labelCls}>
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#7d6a4f]" />
                    <span>Bio / Professional Journey</span>
                  </span>
                </label>
                <textarea
                  name="bio"
                  rows={5}
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={1000}
                  className={`${inputCls} resize-none leading-relaxed`}
                  placeholder="Share a short bio summarizing your career journey, research interests, or milestones..."
                />
                <div className="flex items-center justify-between mt-1.5 font-mono text-xs">
                  <p className="text-[#7d6a4f]">A detailed bio helps peers discover you in the directory.</p>
                  <span
                    className={`font-semibold tabular-nums ${
                      formData.bio.length > 900 ? 'text-rose-600' : 'text-[#7d6a4f]'
                    }`}
                  >
                    {formData.bio.length} / 1000
                  </span>
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1410]/8">
                  <span className="w-2 h-2 rounded-full bg-[#c4821a]" />
                  <h2 className="text-base sm:text-lg font-serif font-normal text-[#1a1410]">
                    Privacy &amp; Contact Visibility
                  </h2>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-[#fcfbf9] rounded-xl border border-[#1a1410]/10">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#1a1410]">
                      Make contact information public to network
                    </p>
                    <p className="text-[11px] text-[#5c4d37] mt-0.5">
                      When enabled, your email and LinkedIn profile will be visible to verified alumni and enrolled students.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.contactPublic}
                    onClick={() =>
                      setFormData((p) => ({ ...p, contactPublic: !p.contactPublic }))
                    }
                    className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 cursor-pointer ${
                      formData.contactPublic ? 'bg-[#1a1410]' : 'bg-[#e8dfd0]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-xs transition-transform duration-200 ${
                        formData.contactPublic ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <span
                    className={`text-xs font-mono font-bold w-14 text-right flex-shrink-0 ${
                      formData.contactPublic ? 'text-[#3a5c3e]' : 'text-[#7d6a4f]'
                    }`}
                  >
                    {formData.contactPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-[#1a1410]/15 text-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold rounded-xl text-xs sm:text-sm shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#e8a93c]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Right column: Sticky live summary sidebar ─────────────────── */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-5 lg:sticky lg:top-8">
              {/* Live Profile Card Preview */}
              <div
                className="rounded-2xl overflow-hidden border border-[#3d3222] shadow-sm p-6 text-center relative"
                style={{
                  background:
                    'radial-gradient(circle at 85% 20%, rgba(196, 130, 26, 0.08) 0%, transparent 50%), linear-gradient(105deg, #1a1410 0%, #261f15 55%, #3d3222 100%)',
                }}
              >
                <div className="w-20 h-20 rounded-2xl border-2 border-[#3d3222] overflow-hidden bg-[#261f15] text-[#e8a93c] flex items-center justify-center mx-auto mb-3.5 shadow-md font-serif text-2xl">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    formData.name ? formData.name.charAt(0).toUpperCase() : <User className="w-8 h-8 text-[#7d6a4f]" />
                  )}
                </div>

                <h3 className="text-base font-serif text-[#f4efe6] font-normal truncate">
                  {formData.name || 'Your Full Name'}
                </h3>

                {formData.jobTitle && formData.company && (
                  <p className="text-xs text-[#e8dfd0]/80 mt-1 truncate">
                    {formData.jobTitle} &bull; {formData.company}
                  </p>
                )}

                {formData.location && (
                  <p className="text-[11px] text-[#e8a93c] mt-1 flex items-center justify-center gap-1 font-mono">
                    <MapPin className="w-3 h-3" />
                    <span>{formData.location}</span>
                  </p>
                )}

                {skillsList.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3.5 pt-3 border-t border-[#3d3222]">
                    {skillsList.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-[#261f15] border border-[#3d3222] text-[#e8a93c] text-[10px] font-mono rounded"
                      >
                        {s}
                      </span>
                    ))}
                    {skillsList.length > 3 && (
                      <span className="px-2 py-0.5 bg-[#261f15] border border-[#3d3222] text-[#e8dfd0]/70 text-[10px] font-mono rounded">
                        +{skillsList.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Completion Checklist */}
              <div className="bg-white rounded-2xl border border-[#1a1410]/12 shadow-xs p-5 sm:p-6">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-mono font-medium text-[#3d3222] uppercase tracking-wider">
                    Profile Strength
                  </p>
                  <span
                    className={`text-xs font-mono font-bold ${
                      completionPct === 100 ? 'text-[#3a5c3e]' : 'text-[#c4821a]'
                    }`}
                  >
                    {completionPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[#f4efe6] rounded-full overflow-hidden mb-4 border border-[#1a1410]/8">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completionPct === 100 ? 'bg-[#3a5c3e]' : 'bg-[#c4821a]'
                    }`}
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                {/* Field checklist */}
                <div className="space-y-2">
                  {completionFields.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2">
                      {done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3a5c3e] flex-shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#1a1410]/20 flex-shrink-0" />
                      )}
                      <span
                        className={`text-xs font-mono ${
                          done ? 'text-[#7d6a4f] line-through' : 'text-[#1a1410] font-medium'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {completionPct === 100 && (
                  <p className="text-xs text-[#3a5c3e] font-mono font-semibold mt-3.5 flex items-center gap-1.5 pt-3 border-t border-[#1a1410]/8">
                    <BadgeCheck className="w-4 h-4" />
                    Profile is 100% complete!
                  </p>
                )}
              </div>

              {/* Tips card */}
              <div className="bg-[#fdf8ed] rounded-2xl border border-[#c4821a]/30 p-5">
                <div className="flex items-center gap-1.5 mb-2 text-[#c4821a]">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider">
                    Profile Tips
                  </p>
                </div>
                <ul className="space-y-1.5 text-xs text-[#5c4d37]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#c4821a] font-bold">&bull;</span>
                    Add a clear, professional headshot.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#c4821a] font-bold">&bull;</span>
                    List skills to be discoverable in directory filters.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#c4821a] font-bold">&bull;</span>
                    Include your LinkedIn profile to expand connections.
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#c4821a] font-bold">&bull;</span>
                    Share key milestones in your bio.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
