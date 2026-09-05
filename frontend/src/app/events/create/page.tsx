'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { moduleCache } from '@/lib/moduleCache';
import {
  Users,
  GraduationCap,
  Briefcase,
  Globe,
  Check,
  Building2,
  Calendar,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  Link as LinkIcon,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const CURRENT_YEAR = new Date().getFullYear();
const ALUMNI_CUTOFF = CURRENT_YEAR - 4;

const ALUMNI_BATCHES = Array.from({ length: ALUMNI_CUTOFF - 2012 }, (_, i) => 2013 + i).reverse();
const STUDENT_BATCHES = Array.from({ length: 4 }, (_, i) => ALUMNI_CUTOFF + 1 + i);

const DEPARTMENTS = ['BCA', 'BBA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)', 'Others'];

type AudienceMode = 'ALL' | 'ALUMNI_ONLY' | 'STUDENTS_ONLY' | 'CUSTOM';
type DeptScope = 'BOTH' | 'ALUMNI' | 'STUDENTS';

export default function CreateEvent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
  });

  // Registration Link
  const [registrationLink, setRegistrationLink] = useState('');

  // Audience state
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('ALL');
  const [selectedAlumniBatches, setSelectedAlumniBatches] = useState<number[]>([]);
  const [selectedStudentBatches, setSelectedStudentBatches] = useState<number[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [deptScope, setDeptScope] = useState<DeptScope>('BOTH');

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please sign in to publish events');
        router.push('/login?redirect=/events/create');
      } else if (user.role !== 'ADMIN') {
        toast.error('Event creation is restricted to Administrators');
        router.push('/events');
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1a1410]/10 border-t-[#c4821a] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#7d6a4f]">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleBatch = (batch: number, type: 'alumni' | 'students') => {
    if (type === 'alumni')
      setSelectedAlumniBatches((p) =>
        p.includes(batch) ? p.filter((b) => b !== batch) : [...p, batch]
      );
    else
      setSelectedStudentBatches((p) =>
        p.includes(batch) ? p.filter((b) => b !== batch) : [...p, batch]
      );
  };

  const selectAllBatches = (type: 'alumni' | 'students') =>
    type === 'alumni'
      ? setSelectedAlumniBatches([...ALUMNI_BATCHES])
      : setSelectedStudentBatches([...STUDENT_BATCHES]);

  const clearBatches = (type: 'alumni' | 'students') =>
    type === 'alumni'
      ? setSelectedAlumniBatches([])
      : setSelectedStudentBatches([]);

  const toggleDept = (dept: string) =>
    setSelectedDepts((p) =>
      p.includes(dept) ? p.filter((d) => d !== dept) : [...p, dept]
    );

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') {
      toast.error('Unauthorized access');
      return;
    }
    if (audienceMode === 'ALUMNI_ONLY' && selectedAlumniBatches.length === 0) {
      toast.error('Select at least one alumni batch year');
      return;
    }
    if (audienceMode === 'STUDENTS_ONLY' && selectedStudentBatches.length === 0) {
      toast.error('Select at least one student batch year');
      return;
    }
    if (
      audienceMode === 'CUSTOM' &&
      selectedAlumniBatches.length === 0 &&
      selectedStudentBatches.length === 0
    ) {
      toast.error('Select at least one batch cohort');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Publishing event to alumni network...');
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      submitData.append('location', formData.location);

      if (registrationLink.trim()) {
        submitData.append('registrationLink', registrationLink.trim());
      }

      let targetAudience = 'ALL';
      const targetBatches: {
        alumni: number[];
        students: number[];
        departments: string[];
        deptScope: DeptScope;
      } = {
        alumni: [],
        students: [],
        departments: selectedDepts,
        deptScope,
      };

      if (audienceMode === 'ALL') {
        targetAudience = 'ALL';
      } else if (audienceMode === 'ALUMNI_ONLY') {
        targetAudience = 'ALUMNI';
        targetBatches.alumni = selectedAlumniBatches;
      } else if (audienceMode === 'STUDENTS_ONLY') {
        targetAudience = 'STUDENT';
        targetBatches.students = selectedStudentBatches;
      } else if (audienceMode === 'CUSTOM') {
        targetAudience = 'CUSTOM';
        targetBatches.alumni = selectedAlumniBatches;
        targetBatches.students = selectedStudentBatches;
      }

      submitData.append('targetAudience', targetAudience);
      submitData.append('targetBatches', JSON.stringify(targetBatches));
      if (image) submitData.append('image', image);

      const token = Cookies.get('token') || localStorage.getItem('token');
      await axios.post(`${API_URL}/api/events`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      moduleCache.invalidate('events');
      toast.success('Event published successfully!', { id: toastId });
      router.push('/events');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish event', {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  const audienceModes: {
    id: AudienceMode;
    icon: React.ReactNode;
    label: string;
    desc: string;
  }[] = [
    {
      id: 'ALL',
      icon: <Globe className="w-5 h-5" />,
      label: 'Everyone',
      desc: 'All students & alumni',
    },
    {
      id: 'ALUMNI_ONLY',
      icon: <Briefcase className="w-5 h-5" />,
      label: 'Alumni Only',
      desc: 'Specific batches',
    },
    {
      id: 'STUDENTS_ONLY',
      icon: <GraduationCap className="w-5 h-5" />,
      label: 'Students Only',
      desc: 'Current cohorts',
    },
    {
      id: 'CUSTOM',
      icon: <Users className="w-5 h-5" />,
      label: 'Custom Mix',
      desc: 'Selective mix',
    },
  ];

  // Batch Selector component
  const BatchSelector = ({
    type,
    batches,
    selected,
  }: {
    type: 'alumni' | 'students';
    batches: number[];
    selected: number[];
  }) => {
    return (
      <div className="mt-3 p-4 bg-[#fcfbf9] rounded-xl border border-[#1a1410]/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider">
            {type === 'alumni' ? 'Alumni Batches' : 'Student Batches'}
            {selected.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#261f15] text-[#e8a93c] rounded font-mono text-[10px]">
                {selected.length} selected
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => selectAllBatches(type)}
              className="text-[11px] font-mono font-semibold text-[#c4821a] hover:underline cursor-pointer"
            >
              Select All
            </button>
            <span className="text-[#1a1410]/20">&bull;</span>
            <button
              type="button"
              onClick={() => clearBatches(type)}
              className="text-[11px] font-mono font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {batches.map((batch) => {
            const isSel = selected.includes(batch);
            return (
              <button
                key={batch}
                type="button"
                onClick={() => toggleBatch(batch, type)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[#261f15] text-[#e8a93c] border-[#3d3222] shadow-xs'
                    : 'bg-white border-[#1a1410]/15 text-[#5c4d37] hover:border-[#1a1410]/30 hover:bg-[#f4efe6]'
                }`}
              >
                {isSel && <Check className="w-3 h-3 text-[#e8a93c]" />}
                <span>{batch}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Department Selector component
  const DeptSelector = () => (
    <div className="mt-4 p-4 bg-[#fcfbf9] rounded-xl border border-[#1a1410]/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#c4821a]" />
          <p className="text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider">
            Department Restriction
            {selectedDepts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] rounded font-mono text-[10px]">
                {selectedDepts.length} selected
              </span>
            )}
          </p>
          <span className="text-[10px] text-[#7d6a4f] font-mono hidden sm:inline">
            (Blank = all departments)
          </span>
        </div>
        {selectedDepts.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedDepts([])}
            className="text-[11px] font-mono font-semibold text-rose-600 hover:underline self-start sm:self-auto cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map((dept) => {
          const isSel = selectedDepts.includes(dept);
          return (
            <button
              key={dept}
              type="button"
              onClick={() => toggleDept(dept)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSel
                  ? 'bg-[#261f15] text-[#e8a93c] border-[#3d3222]'
                  : 'bg-white border-[#1a1410]/15 text-[#5c4d37] hover:border-[#1a1410]/30 hover:bg-[#f4efe6]'
              }`}
            >
              {isSel && <Check className="w-3 h-3 text-[#e8a93c]" />}
              <span>{dept}</span>
            </button>
          );
        })}
      </div>

      {audienceMode === 'CUSTOM' && selectedDepts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#1a1410]/10">
          <p className="text-[11px] font-mono uppercase text-[#7d6a4f] tracking-wider mb-2 font-medium">
            Apply Department Filter to:
          </p>
          <div className="flex flex-wrap gap-2">
            {(['BOTH', 'ALUMNI', 'STUDENTS'] as DeptScope[]).map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setDeptScope(scope)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  deptScope === scope
                    ? 'bg-[#1a1410] text-[#f4efe6] border-[#3d3222]'
                    : 'bg-white text-[#5c4d37] border-[#1a1410]/15 hover:border-[#1a1410]/30'
                }`}
              >
                {scope === 'BOTH'
                  ? '👥 Both Alumni & Students'
                  : scope === 'ALUMNI'
                  ? '🎓 Alumni Only'
                  : '📚 Students Only'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* ─── EDITORIAL HEADER (Matched with Alumni Stories) ────────────────── */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#1a1410]/10 px-4 sm:px-6 lg:px-8 py-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Left: Title & Navigation */}
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#7d6a4f] hover:text-[#1a1410] transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Events</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-normal font-serif text-[#1a1410] tracking-tight">
                Create New Event
              </h1>
            </div>
            <p className="text-sm text-[#5c4d37] mt-1.5 max-w-xl">
              Publish a collegiate event, reunion, or workshop and define tailored visibility rules for batches and departments.
            </p>
          </div>
        </div>
      </div>

      {/* ─── FORM CONTAINER ────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white p-6 sm:p-10 rounded-2xl border border-[#1a1410]/12 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Banner Image Upload */}
            <div>
              <label className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-2">
                Event Banner Image (Optional)
              </label>
              <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-[#1a1410]/15 bg-[#fcfbf9] hover:bg-[#f4efe6] hover:border-[#c4821a]/50 transition-all cursor-pointer h-52 sm:h-60 flex flex-col items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="absolute inset-0 bg-[#1a1410]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                      <p className="text-[#f4efe6] text-xs font-semibold bg-[#1a1410]/80 px-4 py-2 rounded-xl backdrop-blur-xs border border-[#3d3222]">
                        Change Banner Image
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center z-0 pointer-events-none p-4">
                    <div className="w-12 h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center shadow-xs mx-auto mb-3">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm text-[#1a1410]">
                      Click or drop banner here to upload
                    </p>
                    <p className="text-[11px] text-[#7d6a4f] mt-1 font-mono">
                      PNG, JPG or WebP up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="e.g. Annual Alumni Reunion & Tech Summit 2026"
                className="block w-full px-4 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                Description &amp; Agenda *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Provide event details, schedule, key speakers, or registration guidelines..."
                className="block w-full px-4 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 resize-none leading-relaxed"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label
                  htmlFor="date"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Date &amp; Time *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    required
                    min={new Date(
                      new Date().getTime() - new Date().getTimezoneOffset() * 60000
                    )
                      .toISOString()
                      .slice(0, 16)}
                    className="block w-full px-4 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Venue / Location *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    placeholder="e.g. Main Auditorium / Zoom Meet"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* External Registration Link */}
            <div>
              <label
                htmlFor="registrationLink"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                External Registration URL (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  id="registrationLink"
                  name="registrationLink"
                  placeholder="https://forms.gle/... or https://eventbrite.com/..."
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-[#7d6a4f] mt-1 font-mono">
                Leave empty for standard 1-click in-app registration.
              </p>
            </div>

            {/* ─── AUDIENCE TARGETING ──────────────────────────────────────── */}
            <div className="bg-[#fcfbf9] p-5 sm:p-6 rounded-2xl border border-[#1a1410]/10 space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1">
                  Audience Targeting &amp; Cohort Rules 🎯
                </label>
                <p className="text-xs text-[#5c4d37]">
                  Define which members will see and register for this event.
                </p>
              </div>

              {/* Mode Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {audienceModes.map(({ id, icon, label, desc }) => {
                  const isActive = audienceMode === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAudienceMode(id)}
                      className={`relative flex flex-col items-start gap-1 p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-[#261f15] border-[#3d3222] text-[#f4efe6] shadow-sm'
                          : 'bg-white border-[#1a1410]/15 text-[#5c4d37] hover:border-[#1a1410]/30 hover:bg-[#f4efe6]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#c4821a] rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <span className={isActive ? 'text-[#e8a93c]' : 'text-[#7d6a4f]'}>
                        {icon}
                      </span>
                      <span className="text-xs font-semibold leading-tight">{label}</span>
                      <span
                        className={`text-[10px] leading-tight hidden sm:block ${
                          isActive ? 'text-[#e8dfd0]/80' : 'text-[#7d6a4f]'
                        }`}
                      >
                        {desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Batch Selectors */}
              {(audienceMode === 'ALUMNI_ONLY' || audienceMode === 'CUSTOM') && (
                <BatchSelector
                  type="alumni"
                  batches={ALUMNI_BATCHES}
                  selected={selectedAlumniBatches}
                />
              )}
              {(audienceMode === 'STUDENTS_ONLY' || audienceMode === 'CUSTOM') && (
                <BatchSelector
                  type="students"
                  batches={STUDENT_BATCHES}
                  selected={selectedStudentBatches}
                />
              )}

              {/* Department Filter */}
              <DeptSelector />
            </div>

            {/* Submit Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#1a1410]/10">
              <Link
                href="/events"
                className="flex-1 py-3 px-4 bg-[#f4efe6] hover:bg-[#e8dfd0] text-[#1a1410] font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-[#1a1410]/15 text-center cursor-pointer"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] text-[#f4efe6] font-semibold rounded-xl text-xs sm:text-sm shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Publishing event...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#e8a93c]" />
                    <span>Publish Event</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}