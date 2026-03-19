'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white placeholder:text-slate-400';
const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

export default function EditProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name:         '',
    batchYear:    '',
    department:   '',
    rollNo:       '',
    company:      '',
    jobTitle:     '',
    location:     '',
    linkedinUrl:  '',
    bio:          '',
    contactPublic: false,
  });

  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [photo,      setPhoto]      = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Fetch & prefill ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res     = await axios.get(`${API_URL}/api/alumni/${user.id}`);
        const data    = res.data.alumni;
        const profile = data.alumniProfile || {};

        setFormData({
          name:          data.name             || '',
          batchYear:     profile.batchYear      || '',
          department:    profile.department     || '',
          rollNo:        profile.rollNo         || '',
          company:       profile.company        || '',
          jobTitle:      profile.jobTitle       || '',
          location:      profile.location       || '',
          linkedinUrl:   profile.linkedinUrl    || '',
          bio:           profile.bio            || '',
          contactPublic: profile.contactPublic  || false,
        });

        if (profile.skills?.length) setSkillsList(profile.skills);
        if (profile.photoUrl)       setPreviewUrl(profile.photoUrl);
      } catch {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) fetchProfile();
  }, [user, authLoading]);

  // ── Input change ───────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    }));
  };

  // ── Skills chip input ──────────────────────────────────────────────────────
  const addSkill = useCallback(() => {
    const skill = skillInput.trim().replace(/,+$/, '');
    if (!skill || skillsList.includes(skill)) { setSkillInput(''); return; }
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
      data.append('name',          formData.name);
      data.append('company',       formData.company);
      data.append('jobTitle',      formData.jobTitle);
      data.append('location',      formData.location);
      data.append('linkedinUrl',   formData.linkedinUrl);
      data.append('bio',           formData.bio);
      data.append('contactPublic', String(formData.contactPublic));
      data.append('skills',        JSON.stringify(skillsList));
      if (photo) data.append('photo', photo);

      const toastId = toast.loading('Updating profile...');
      await axios.put(`${API_URL}/api/alumni/${user?.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile updated!', { id: toastId, duration: 4000 });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: unknown) {
      const msg =
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
      toast.error(msg || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Profile completion (live, based on current form state) ─────────────────
  const completionFields = [
    { label: 'Photo',     done: !!previewUrl },
    { label: 'Name',      done: !!formData.name },
    { label: 'Location',  done: !!formData.location },
    { label: 'Company',   done: !!formData.company },
    { label: 'Job Title', done: !!formData.jobTitle },
    { label: 'LinkedIn',  done: !!formData.linkedinUrl },
    { label: 'Bio',       done: !!formData.bio },
    { label: 'Skills',    done: skillsList.length > 0 },
  ];
  const completionPct = Math.round(
    (completionFields.filter((f) => f.done).length / completionFields.length) * 100
  );

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Update your profile information
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Left column: form sections ──────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Photo upload ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
                Profile Photo
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">

                {/* Current preview */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-4 border-white shadow-md flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-blue-300" />
                    )}
                  </div>
                  {/* Camera badge */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Drop zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none ${
                    dragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                  }`}
                >
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
                  <p className="text-sm font-semibold text-slate-700">
                    {photo ? photo.name : 'Drop a photo here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP · max 5 MB</p>
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

            {/* Academic info (read-only) ─────────────────────────────────────── */}
            <div
              className="rounded-2xl border border-blue-100 p-5"
              style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)' }}
            >
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                Academic Information
                <span className="ml-auto text-xs font-medium text-slate-400 bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Read only
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Batch Year',  value: formData.batchYear,  Icon: Calendar,      bg: 'bg-blue-100',   text: 'text-blue-600'   },
                  { label: 'Department',  value: formData.department, Icon: GraduationCap, bg: 'bg-violet-100', text: 'text-violet-600' },
                  { label: 'Roll Number', value: formData.rollNo,     Icon: Hash,          bg: 'bg-emerald-100',text: 'text-emerald-600'},
                ].map(({ label, value, Icon, bg, text }) => (
                  <div key={label} className="bg-white/70 rounded-xl p-3 border border-white">
                    <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${text}`} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {value || 'Not set'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Batch, department and roll number are permanent and cannot be changed.
              </p>
            </div>

            {/* Personal info ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-emerald-500 inline-block" />
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${inputCls} pl-9`}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`${inputCls} pl-9`}
                      placeholder="e.g., Patna, India"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional info ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
                Professional Information
              </h2>
              <div className="space-y-4">

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Company / Organization</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={`${inputCls} pl-9`}
                        placeholder="Where do you work?"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className={`${inputCls} pl-9`}
                        placeholder="Your current role"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>LinkedIn Profile URL</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      className={`${inputCls} pl-9`}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Helps other alumni & students connect with you professionally
                  </p>
                </div>

                {/* Skills chip input */}
                <div>
                  <label className={labelCls}>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Skills &amp; Expertise
                    </span>
                  </label>

                  {/* Chip list */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2.5">
                      {skillsList.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-0.5 text-blue-400 hover:text-blue-700 transition-colors"
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
                      placeholder="Type a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="flex items-center gap-1.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">,</kbd> to add each skill
                  </p>
                </div>
              </div>
            </div>

            {/* Bio ──────────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-amber-500 inline-block" />
                About You
              </h2>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Bio / Introduction
                </span>
              </label>
              <textarea
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                maxLength={1000}
                className={`${inputCls} resize-none`}
                placeholder="Tell us about your professional journey, achievements, and interests..."
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-xs text-slate-400">A well-written bio helps others discover you</p>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    formData.bio.length > 900 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                >
                  {formData.bio.length} / 1000
                </span>
              </div>
            </div>

            {/* Privacy ──────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-teal-500 inline-block" />
                Privacy Settings
              </h2>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Make contact info visible
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Email and LinkedIn will be visible to verified alumni & students
                  </p>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.contactPublic}
                  onClick={() =>
                    setFormData((p) => ({ ...p, contactPublic: !p.contactPublic }))
                  }
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.contactPublic ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      formData.contactPublic ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>

                <span
                  className={`text-xs font-bold w-12 text-right flex-shrink-0 ${
                    formData.contactPublic ? 'text-blue-600' : 'text-slate-400'
                  }`}
                >
                  {formData.contactPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            {/* Actions ──────────────────────────────────────────────────────── */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[.98]"
                style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Right column: sticky sidebar ──────────────────────────────────── */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-4 lg:sticky lg:top-6">

            {/* Live profile preview */}
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ background: 'linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%)' }}
            >
              <div className="p-5 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center mb-3 shadow-inner">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-white/60" />
                  )}
                </div>
                <p className="text-white font-bold text-base truncate max-w-full">
                  {formData.name || 'Your Name'}
                </p>
                {formData.jobTitle && formData.company && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {formData.jobTitle} · {formData.company}
                  </p>
                )}
                {formData.location && (
                  <p className="text-white/55 text-xs mt-1 flex items-center gap-1 justify-center">
                    <MapPin className="w-3 h-3" />
                    {formData.location}
                  </p>
                )}
                {skillsList.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                    {skillsList.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-white/15 border border-white/20 text-white/80 text-[10px] font-medium rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                    {skillsList.length > 3 && (
                      <span className="px-2 py-0.5 bg-white/15 border border-white/20 text-white/60 text-[10px] font-medium rounded-full">
                        +{skillsList.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Completion checklist */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-900">Profile Completion</p>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    completionPct === 100 ? 'text-emerald-600' : 'text-blue-600'
                  }`}
                >
                  {completionPct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {/* Field checklist */}
              <div className="space-y-2">
                {completionFields.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        done
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700 font-medium'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {completionPct === 100 && (
                <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Profile is complete!
                </p>
              )}
            </div>

            {/* Tips card */}
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
              <p className="text-xs font-bold text-amber-800 mb-2">Tips for a great profile</p>
              <ul className="space-y-1.5 text-xs text-amber-700">
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">·</span>
                  Add a clear, professional photo
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">·</span>
                  List specific skills — they help alumni find you
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">·</span>
                  Write a short bio about your journey
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-0.5 flex-shrink-0">·</span>
                  Link your LinkedIn to enable networking
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
