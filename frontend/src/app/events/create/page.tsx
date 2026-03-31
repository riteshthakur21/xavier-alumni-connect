// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useAuth } from '@/contexts/AuthContext';
// import Cookies from 'js-cookie';
// import { Users, GraduationCap, Briefcase, Globe, Check, Building2 } from 'lucide-react';

// const ANIM_STYLES = `
//   @keyframes ce-fadeIn {
//     from { opacity: 0; transform: translateY(8px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   .ce-fade { animation: ce-fadeIn 0.25s ease both; }
//   .ce-grad-btn {
//     background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
//     transition: opacity 0.2s ease, box-shadow 0.2s ease;
//   }
//   .ce-grad-btn:hover { opacity: 0.88; box-shadow: 0 6px 20px rgba(33,33,143,0.35); }
//   .ce-batch-chip { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
// `;

// // ── Constants ─────────────────────────────────────────────────────────────────
// const CURRENT_YEAR  = new Date().getFullYear();
// const ALUMNI_CUTOFF = CURRENT_YEAR - 4;

// const ALUMNI_BATCHES  = Array.from({ length: ALUMNI_CUTOFF - 2012 }, (_, i) => 2013 + i).reverse();
// const STUDENT_BATCHES = Array.from({ length: 4 }, (_, i) => ALUMNI_CUTOFF + 1 + i);

// const DEPARTMENTS = ['BCA', 'BBA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)', 'Others'];

// type AudienceMode = 'ALL' | 'ALUMNI_ONLY' | 'STUDENTS_ONLY' | 'CUSTOM';
// type DeptScope    = 'BOTH' | 'ALUMNI' | 'STUDENTS';

// export default function CreateEvent() {
//   const router = useRouter();
//   const { user, loading: authLoading } = useAuth();

//   const [loading, setLoading]           = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [image, setImage]               = useState<File | null>(null);
//   const [formData, setFormData]         = useState({ title: '', description: '', date: '', location: '' });

//   // ── Audience state ────────────────────────────────────────────────────────
//   const [audienceMode, setAudienceMode]                     = useState<AudienceMode>('ALL');
//   const [selectedAlumniBatches, setSelectedAlumniBatches]   = useState<number[]>([]);
//   const [selectedStudentBatches, setSelectedStudentBatches] = useState<number[]>([]);
//   const [selectedDepts, setSelectedDepts]                   = useState<string[]>([]);
//   const [deptScope, setDeptScope]                           = useState<DeptScope>('BOTH');

//   // ── Auth guard ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (authLoading) return;
//     if (!user) { toast.error('Please login first! 🔒'); router.push('/login'); }
//     else if (user.role !== 'ADMIN') { toast.error('Access Denied! Admins only. 🚫'); router.push('/events'); }
//   }, [user, authLoading, router]);

//   if (authLoading) return (
//     <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">
//       Verifying Access... 🛡️
//     </div>
//   );
//   if (!user || user.role !== 'ADMIN') return null;

//   // ── Handlers ──────────────────────────────────────────────────────────────
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
//     setFormData({ ...formData, [e.target.name]: e.target.value });

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) {
//       const file = e.target.files[0];
//       setImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const toggleBatch = (batch: number, type: 'alumni' | 'students') => {
//     if (type === 'alumni')
//       setSelectedAlumniBatches(p => p.includes(batch) ? p.filter(b => b !== batch) : [...p, batch]);
//     else
//       setSelectedStudentBatches(p => p.includes(batch) ? p.filter(b => b !== batch) : [...p, batch]);
//   };

//   const selectAllBatches = (type: 'alumni' | 'students') =>
//     type === 'alumni' ? setSelectedAlumniBatches([...ALUMNI_BATCHES]) : setSelectedStudentBatches([...STUDENT_BATCHES]);

//   const clearBatches = (type: 'alumni' | 'students') =>
//     type === 'alumni' ? setSelectedAlumniBatches([]) : setSelectedStudentBatches([]);

//   const toggleDept = (dept: string) =>
//     setSelectedDepts(p => p.includes(dept) ? p.filter(d => d !== dept) : [...p, dept]);

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (user?.role !== 'ADMIN') { toast.error('Unauthorized'); return; }
//     if (audienceMode === 'ALUMNI_ONLY'   && selectedAlumniBatches.length === 0)  { toast.error('Select at least one alumni batch');   return; }
//     if (audienceMode === 'STUDENTS_ONLY' && selectedStudentBatches.length === 0) { toast.error('Select at least one student batch');  return; }
//     if (audienceMode === 'CUSTOM' && selectedAlumniBatches.length === 0 && selectedStudentBatches.length === 0) {
//       toast.error('Select at least one batch'); return;
//     }

//     setLoading(true);
//     const toastId = toast.loading('Publishing... 🚀');
//     try {
//       const submitData = new FormData();
//       submitData.append('title',       formData.title);
//       submitData.append('description', formData.description);
//       submitData.append('date',        formData.date);
//       submitData.append('location',    formData.location);

//       let targetAudience = 'ALL';
//       const targetBatches: {
//         alumni: number[];
//         students: number[];
//         departments: string[];
//         deptScope: DeptScope;
//       } = {
//         alumni:      [],
//         students:    [],
//         departments: selectedDepts,
//         deptScope,
//       };

//       if      (audienceMode === 'ALL')           { targetAudience = 'ALL'; }
//       else if (audienceMode === 'ALUMNI_ONLY')   { targetAudience = 'ALUMNI';  targetBatches.alumni   = selectedAlumniBatches; }
//       else if (audienceMode === 'STUDENTS_ONLY') { targetAudience = 'STUDENT'; targetBatches.students = selectedStudentBatches; }
//       else if (audienceMode === 'CUSTOM')        { targetAudience = 'CUSTOM';  targetBatches.alumni   = selectedAlumniBatches; targetBatches.students = selectedStudentBatches; }

//       submitData.append('targetAudience', targetAudience);
//       submitData.append('targetBatches',  JSON.stringify(targetBatches));
//       if (image) submitData.append('image', image);

//       await axios.post('http://localhost:5000/api/events', submitData, {
//         headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${Cookies.get('token')}` },
//       });

//       toast.success('Event Published! 🎉', { id: toastId });
//       router.push('/events');
//     } catch (error: any) {
//       toast.error(error.response?.data?.error || 'Failed to create event', { id: toastId });
//     } finally { setLoading(false); }
//   };

//   // ── Config ────────────────────────────────────────────────────────────────
//   const audienceModes: { id: AudienceMode; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
//     { id: 'ALL',           icon: <Globe className="w-5 h-5" />,         label: 'Everyone',      desc: 'All students + alumni',         color: 'blue'    },
//     { id: 'ALUMNI_ONLY',   icon: <Briefcase className="w-5 h-5" />,     label: 'Alumni Only',   desc: 'Select specific batches',       color: 'indigo'  },
//     { id: 'STUDENTS_ONLY', icon: <GraduationCap className="w-5 h-5" />, label: 'Students Only', desc: 'Select specific batches',       color: 'violet'  },
//     { id: 'CUSTOM',        icon: <Users className="w-5 h-5" />,         label: 'Custom Mix',    desc: 'Pick alumni + student batches', color: 'emerald' },
//   ];

//   const colorMap: Record<string, { card: string; chip: string; chipSel: string }> = {
//     blue:    { card: 'border-blue-400 bg-blue-50',     chip: 'border-blue-200 bg-blue-50 text-blue-700',      chipSel: 'bg-blue-600 border-blue-600 text-white'     },
//     indigo:  { card: 'border-indigo-400 bg-indigo-50', chip: 'border-indigo-200 bg-indigo-50 text-indigo-700', chipSel: 'bg-indigo-600 border-indigo-600 text-white' },
//     violet:  { card: 'border-violet-400 bg-violet-50', chip: 'border-violet-200 bg-violet-50 text-violet-700', chipSel: 'bg-violet-600 border-violet-600 text-white' },
//     emerald: { card: 'border-emerald-400 bg-emerald-50',chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',chipSel: 'bg-emerald-600 border-emerald-600 text-white'},
//   };

//   // ── Batch Selector ────────────────────────────────────────────────────────
//   const BatchSelector = ({ type, batches, selected, color }: { type: 'alumni' | 'students'; batches: number[]; selected: number[]; color: string }) => {
//     const c = colorMap[color];
//     return (
//       <div className="ce-fade mt-3 p-4 bg-white rounded-2xl border border-slate-100">
//         <div className="flex items-center justify-between mb-3">
//           <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
//             {type === 'alumni' ? '🎓 Alumni Batches' : '📚 Student Batches'}
//             {selected.length > 0 && (
//               <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">{selected.length} selected</span>
//             )}
//           </p>
//           <div className="flex gap-2">
//             <button type="button" onClick={() => selectAllBatches(type)} className="text-[10px] font-bold text-blue-600 hover:underline">Select All</button>
//             <span className="text-slate-300">|</span>
//             <button type="button" onClick={() => clearBatches(type)} className="text-[10px] font-bold text-red-400 hover:underline">Clear</button>
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           {batches.map((batch) => {
//             const isSel = selected.includes(batch);
//             return (
//               <button key={batch} type="button" onClick={() => toggleBatch(batch, type)}
//                 className={`ce-batch-chip inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${isSel ? c.chipSel : c.chip}`}>
//                 {isSel && <Check className="w-3 h-3" />}{batch}
//               </button>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   // ── Department Selector ───────────────────────────────────────────────────
//   const DeptSelector = () => (
//     <div className="ce-fade mt-4 p-4 bg-white rounded-2xl border border-slate-100">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-3">
//         <div className="flex items-center gap-1.5">
//           <Building2 className="w-3.5 h-3.5 text-amber-500" />
//           <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
//             Department Filter
//             {selectedDepts.length > 0 && (
//               <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">{selectedDepts.length} selected</span>
//             )}
//           </p>
//           <span className="text-[10px] text-slate-400 font-normal normal-case tracking-normal hidden sm:inline">
//             — optional, blank = all depts
//           </span>
//         </div>
//         {selectedDepts.length > 0 && (
//           <button type="button" onClick={() => setSelectedDepts([])} className="text-[10px] font-bold text-red-400 hover:underline self-start sm:self-auto">Clear</button>
//         )}
//       </div>

//       {/* Dept chips */}
//       <div className="flex flex-wrap gap-2">
//         {DEPARTMENTS.map((dept) => {
//           const isSel = selectedDepts.includes(dept);
//           return (
//             <button key={dept} type="button" onClick={() => toggleDept(dept)}
//               className={`ce-batch-chip inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
//                 isSel
//                   ? 'bg-amber-500 border-amber-500 text-white'
//                   : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
//               }`}>
//               {isSel && <Check className="w-3 h-3" />}{dept}
//             </button>
//           );
//         })}
//       </div>

//       {/* deptScope — only in CUSTOM mode when depts selected */}
//       {audienceMode === 'CUSTOM' && selectedDepts.length > 0 && (
//         <div className="mt-4 pt-3 border-t border-slate-100">
//           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Apply department filter to:</p>
//           <div className="flex flex-wrap gap-2">
//             {(['BOTH', 'ALUMNI', 'STUDENTS'] as DeptScope[]).map((scope) => (
//               <button key={scope} type="button" onClick={() => setDeptScope(scope)}
//                 className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
//                   deptScope === scope
//                     ? 'bg-slate-800 text-white border-slate-800'
//                     : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
//                 }`}>
//                 {scope === 'BOTH' ? '👥 Both' : scope === 'ALUMNI' ? '🎓 Alumni only' : '📚 Students only'}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   // ── Live summary ──────────────────────────────────────────────────────────
//   const AudienceSummary = () => {
//     const deptStr = selectedDepts.length > 0 ? ` · Dept: ${selectedDepts.join(', ')}` : '';

//     if (audienceMode === 'ALL') return (
//       <p className="text-xs text-slate-500 mt-3 font-medium">
//         ✅ Visible to <strong>all logged-in users{deptStr}</strong>
//       </p>
//     );
//     const parts: string[] = [];
//     if (selectedAlumniBatches.length > 0)  parts.push(`Alumni ${selectedAlumniBatches.sort((a,b)=>a-b).join(', ')}`);
//     if (selectedStudentBatches.length > 0) parts.push(`Students ${selectedStudentBatches.sort((a,b)=>a-b).join(', ')}`);
//     if (parts.length === 0) return (
//       <p className="text-xs text-red-500 mt-3 font-medium">⚠️ No batches selected yet</p>
//     );
//     return (
//       <p className="text-xs text-slate-500 mt-3 font-medium">
//         ✅ Visible to: <strong className="text-slate-700">{parts.join(' · ')}{deptStr}</strong>
//       </p>
//     );
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style suppressHydrationWarning>{ANIM_STYLES}</style>
//       <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4">
//         <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-slate-100">

//           <div className="mb-8">
//             <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Create New Event</h1>
//             <p className="text-slate-500 font-medium mt-1">Publish an event and choose exactly who sees it.</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">

//             {/* Banner */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Event Banner Image</label>
//               <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer h-52 sm:h-64 flex flex-col items-center justify-center">
//                 <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
//                 {imagePreview ? (
//                   <>
//                     <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
//                     <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
//                       <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm">Change Image</p>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center z-0 pointer-events-none">
//                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">📷</div>
//                     <p className="font-bold text-slate-600 text-sm">Click or drag banner here</p>
//                     <p className="text-xs text-slate-400 mt-1 font-medium">JPEG, PNG up to 5MB</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Title */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Event Title *</label>
//               <input type="text" name="title" required
//                 className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
//                 value={formData.title} onChange={handleChange} placeholder="e.g., Annual Alumni Meetup 2026" />
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Description *</label>
//               <textarea name="description" required rows={4}
//                 className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-600 transition-all placeholder:text-slate-300 resize-none"
//                 value={formData.description} onChange={handleChange} placeholder="What is this event about?" />
//             </div>

//             {/* Date + Location */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Date &amp; Time *</label>
//                 <input type="datetime-local" name="date" required
//                   min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
//                   className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
//                   value={formData.date} onChange={handleChange} />
//               </div>
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Location *</label>
//                 <input type="text" name="location" required
//                   className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
//                   value={formData.location} onChange={handleChange} placeholder="e.g., College Auditorium" />
//               </div>
//             </div>

//             {/* ── AUDIENCE TARGETING ── */}
//             <div className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-100">
//               <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
//                 Who can see this event? 🎯
//               </label>

//               {/* Mode cards */}
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-1">
//                 {audienceModes.map(({ id, icon, label, desc, color }) => {
//                   const isActive = audienceMode === id;
//                   const c = colorMap[color];
//                   return (
//                     <button key={id} type="button" onClick={() => setAudienceMode(id)}
//                       className={`relative flex flex-col items-start gap-1 p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
//                         isActive ? `${c.card} shadow-sm` : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
//                       }`}>
//                       {isActive && (
//                         <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
//                           <Check className="w-2.5 h-2.5 text-white" />
//                         </div>
//                       )}
//                       <span className={isActive ? '' : 'text-slate-400'}>{icon}</span>
//                       <span className="text-xs font-black text-slate-800 leading-tight">{label}</span>
//                       <span className="text-[10px] text-slate-400 font-medium leading-tight hidden sm:block">{desc}</span>
//                     </button>
//                   );
//                 })}
//               </div>

//               {/* Batch selectors */}
//               {(audienceMode === 'ALUMNI_ONLY' || audienceMode === 'CUSTOM') && (
//                 <BatchSelector type="alumni" batches={ALUMNI_BATCHES} selected={selectedAlumniBatches}
//                   color={audienceMode === 'CUSTOM' ? 'emerald' : 'indigo'} />
//               )}
//               {(audienceMode === 'STUDENTS_ONLY' || audienceMode === 'CUSTOM') && (
//                 <BatchSelector type="students" batches={STUDENT_BATCHES} selected={selectedStudentBatches}
//                   color={audienceMode === 'CUSTOM' ? 'emerald' : 'violet'} />
//               )}

//               {/* ── DEPARTMENT FILTER (always visible) ── */}
//               <DeptSelector />

//               {/* Summary */}
//               <AudienceSummary />
//             </div>

//             {/* Submit */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2 border-t border-slate-100">
//               <button type="button" onClick={() => router.back()}
//                 className="flex-1 py-4 border-2 border-slate-200 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black uppercase tracking-widest transition-all text-sm">
//                 Cancel
//               </button>
//               <button type="submit" disabled={loading}
//                 className="flex-1 py-4 ce-grad-btn text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
//                 {loading ? 'Publishing...' : 'Publish Event ✨'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Cookies from 'js-cookie';
import { Users, GraduationCap, Briefcase, Globe, Check, Building2, Link2 } from 'lucide-react';

const ANIM_STYLES = `
  @keyframes ce-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ce-fade { animation: ce-fadeIn 0.25s ease both; }
  .ce-grad-btn {
    background: linear-gradient(135deg, #360707 0%, #21218F 55%, #00D4FF 100%);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;
  }
  .ce-grad-btn:hover { opacity: 0.88; box-shadow: 0 6px 20px rgba(33,33,143,0.35); }
  .ce-batch-chip { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
`;

// ── Constants ─────────────────────────────────────────────────────────────────
const CURRENT_YEAR  = new Date().getFullYear();
const ALUMNI_CUTOFF = CURRENT_YEAR - 4;

const ALUMNI_BATCHES  = Array.from({ length: ALUMNI_CUTOFF - 2012 }, (_, i) => 2013 + i).reverse();
const STUDENT_BATCHES = Array.from({ length: 4 }, (_, i) => ALUMNI_CUTOFF + 1 + i);

const DEPARTMENTS = ['BCA', 'BBA', 'BCOM (P)', 'BBA (IB)', 'BA (JMC)', 'Others'];

type AudienceMode = 'ALL' | 'ALUMNI_ONLY' | 'STUDENTS_ONLY' | 'CUSTOM';
type DeptScope    = 'BOTH' | 'ALUMNI' | 'STUDENTS';

export default function CreateEvent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading]           = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage]               = useState<File | null>(null);
  const [formData, setFormData]         = useState({ title: '', description: '', date: '', location: '' });

  // ── Registration Link ─────────────────────────────────────────────────────
  const [registrationLink, setRegistrationLink] = useState('');

  // ── Audience state ────────────────────────────────────────────────────────
  const [audienceMode, setAudienceMode]                     = useState<AudienceMode>('ALL');
  const [selectedAlumniBatches, setSelectedAlumniBatches]   = useState<number[]>([]);
  const [selectedStudentBatches, setSelectedStudentBatches] = useState<number[]>([]);
  const [selectedDepts, setSelectedDepts]                   = useState<string[]>([]);
  const [deptScope, setDeptScope]                           = useState<DeptScope>('BOTH');

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { toast.error('Please login first! 🔒'); router.push('/login'); }
    else if (user.role !== 'ADMIN') { toast.error('Access Denied! Admins only. 🚫'); router.push('/events'); }
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">
      Verifying Access... 🛡️
    </div>
  );
  if (!user || user.role !== 'ADMIN') return null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      setSelectedAlumniBatches(p => p.includes(batch) ? p.filter(b => b !== batch) : [...p, batch]);
    else
      setSelectedStudentBatches(p => p.includes(batch) ? p.filter(b => b !== batch) : [...p, batch]);
  };

  const selectAllBatches = (type: 'alumni' | 'students') =>
    type === 'alumni' ? setSelectedAlumniBatches([...ALUMNI_BATCHES]) : setSelectedStudentBatches([...STUDENT_BATCHES]);

  const clearBatches = (type: 'alumni' | 'students') =>
    type === 'alumni' ? setSelectedAlumniBatches([]) : setSelectedStudentBatches([]);

  const toggleDept = (dept: string) =>
    setSelectedDepts(p => p.includes(dept) ? p.filter(d => d !== dept) : [...p, dept]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'ADMIN') { toast.error('Unauthorized'); return; }
    if (audienceMode === 'ALUMNI_ONLY'   && selectedAlumniBatches.length === 0)  { toast.error('Select at least one alumni batch');   return; }
    if (audienceMode === 'STUDENTS_ONLY' && selectedStudentBatches.length === 0) { toast.error('Select at least one student batch');  return; }
    if (audienceMode === 'CUSTOM' && selectedAlumniBatches.length === 0 && selectedStudentBatches.length === 0) {
      toast.error('Select at least one batch'); return;
    }

    setLoading(true);
    const toastId = toast.loading('Publishing... 🚀');
    try {
      const submitData = new FormData();
      submitData.append('title',       formData.title);
      submitData.append('description', formData.description);
      submitData.append('date',        formData.date);
      submitData.append('location',    formData.location);

      // ── Registration link (optional) ──────────────────────────────────────
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
        alumni:      [],
        students:    [],
        departments: selectedDepts,
        deptScope,
      };

      if      (audienceMode === 'ALL')           { targetAudience = 'ALL'; }
      else if (audienceMode === 'ALUMNI_ONLY')   { targetAudience = 'ALUMNI';  targetBatches.alumni   = selectedAlumniBatches; }
      else if (audienceMode === 'STUDENTS_ONLY') { targetAudience = 'STUDENT'; targetBatches.students = selectedStudentBatches; }
      else if (audienceMode === 'CUSTOM')        { targetAudience = 'CUSTOM';  targetBatches.alumni   = selectedAlumniBatches; targetBatches.students = selectedStudentBatches; }

      submitData.append('targetAudience', targetAudience);
      submitData.append('targetBatches',  JSON.stringify(targetBatches));
      if (image) submitData.append('image', image);

      await axios.post('http://localhost:5000/api/events', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${Cookies.get('token')}` },
      });

      toast.success('Event Published! 🎉', { id: toastId });
      router.push('/events');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create event', { id: toastId });
    } finally { setLoading(false); }
  };

  // ── Config ────────────────────────────────────────────────────────────────
  const audienceModes: { id: AudienceMode; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
    { id: 'ALL',           icon: <Globe className="w-5 h-5" />,         label: 'Everyone',      desc: 'All students + alumni',         color: 'blue'    },
    { id: 'ALUMNI_ONLY',   icon: <Briefcase className="w-5 h-5" />,     label: 'Alumni Only',   desc: 'Select specific batches',       color: 'indigo'  },
    { id: 'STUDENTS_ONLY', icon: <GraduationCap className="w-5 h-5" />, label: 'Students Only', desc: 'Select specific batches',       color: 'violet'  },
    { id: 'CUSTOM',        icon: <Users className="w-5 h-5" />,         label: 'Custom Mix',    desc: 'Pick alumni + student batches', color: 'emerald' },
  ];

  const colorMap: Record<string, { card: string; chip: string; chipSel: string }> = {
    blue:    { card: 'border-blue-400 bg-blue-50',     chip: 'border-blue-200 bg-blue-50 text-blue-700',      chipSel: 'bg-blue-600 border-blue-600 text-white'     },
    indigo:  { card: 'border-indigo-400 bg-indigo-50', chip: 'border-indigo-200 bg-indigo-50 text-indigo-700', chipSel: 'bg-indigo-600 border-indigo-600 text-white' },
    violet:  { card: 'border-violet-400 bg-violet-50', chip: 'border-violet-200 bg-violet-50 text-violet-700', chipSel: 'bg-violet-600 border-violet-600 text-white' },
    emerald: { card: 'border-emerald-400 bg-emerald-50',chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',chipSel: 'bg-emerald-600 border-emerald-600 text-white'},
  };

  // ── Batch Selector ────────────────────────────────────────────────────────
  const BatchSelector = ({ type, batches, selected, color }: { type: 'alumni' | 'students'; batches: number[]; selected: number[]; color: string }) => {
    const c = colorMap[color];
    return (
      <div className="ce-fade mt-3 p-4 bg-white rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {type === 'alumni' ? '🎓 Alumni Batches' : '📚 Student Batches'}
            {selected.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">{selected.length} selected</span>
            )}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => selectAllBatches(type)} className="text-[10px] font-bold text-blue-600 hover:underline">Select All</button>
            <span className="text-slate-300">|</span>
            <button type="button" onClick={() => clearBatches(type)} className="text-[10px] font-bold text-red-400 hover:underline">Clear</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {batches.map((batch) => {
            const isSel = selected.includes(batch);
            return (
              <button key={batch} type="button" onClick={() => toggleBatch(batch, type)}
                className={`ce-batch-chip inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${isSel ? c.chipSel : c.chip}`}>
                {isSel && <Check className="w-3 h-3" />}{batch}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Department Selector ───────────────────────────────────────────────────
  const DeptSelector = () => (
    <div className="ce-fade mt-4 p-4 bg-white rounded-2xl border border-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Department Filter
            {selectedDepts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">{selectedDepts.length} selected</span>
            )}
          </p>
          <span className="text-[10px] text-slate-400 font-normal normal-case tracking-normal hidden sm:inline">
            — optional, blank = all depts
          </span>
        </div>
        {selectedDepts.length > 0 && (
          <button type="button" onClick={() => setSelectedDepts([])} className="text-[10px] font-bold text-red-400 hover:underline self-start sm:self-auto">Clear</button>
        )}
      </div>

      {/* Dept chips */}
      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map((dept) => {
          const isSel = selectedDepts.includes(dept);
          return (
            <button key={dept} type="button" onClick={() => toggleDept(dept)}
              className={`ce-batch-chip inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isSel
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}>
              {isSel && <Check className="w-3 h-3" />}{dept}
            </button>
          );
        })}
      </div>

      {/* deptScope — only in CUSTOM mode when depts selected */}
      {audienceMode === 'CUSTOM' && selectedDepts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Apply department filter to:</p>
          <div className="flex flex-wrap gap-2">
            {(['BOTH', 'ALUMNI', 'STUDENTS'] as DeptScope[]).map((scope) => (
              <button key={scope} type="button" onClick={() => setDeptScope(scope)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  deptScope === scope
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400'
                }`}>
                {scope === 'BOTH' ? '👥 Both' : scope === 'ALUMNI' ? '🎓 Alumni only' : '📚 Students only'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Live summary ──────────────────────────────────────────────────────────
  const AudienceSummary = () => {
    const deptStr = selectedDepts.length > 0 ? ` · Dept: ${selectedDepts.join(', ')}` : '';

    if (audienceMode === 'ALL') return (
      <p className="text-xs text-slate-500 mt-3 font-medium">
        ✅ Visible to <strong>all logged-in users{deptStr}</strong>
      </p>
    );
    const parts: string[] = [];
    if (selectedAlumniBatches.length > 0)  parts.push(`Alumni ${selectedAlumniBatches.sort((a,b)=>a-b).join(', ')}`);
    if (selectedStudentBatches.length > 0) parts.push(`Students ${selectedStudentBatches.sort((a,b)=>a-b).join(', ')}`);
    if (parts.length === 0) return (
      <p className="text-xs text-red-500 mt-3 font-medium">⚠️ No batches selected yet</p>
    );
    return (
      <p className="text-xs text-slate-500 mt-3 font-medium">
        ✅ Visible to: <strong className="text-slate-700">{parts.join(' · ')}{deptStr}</strong>
      </p>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style suppressHydrationWarning>{ANIM_STYLES}</style>
      <div className="max-w-3xl mx-auto py-8 sm:py-10 px-4">
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-sm border border-slate-100">

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Create New Event</h1>
            <p className="text-slate-500 font-medium mt-1">Publish an event and choose exactly who sees it.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Banner */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Event Banner Image</label>
              <div className="relative group rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 transition-all cursor-pointer h-52 sm:h-64 flex flex-col items-center justify-center">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover z-0" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                      <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm">Change Image</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center z-0 pointer-events-none">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">📷</div>
                    <p className="font-bold text-slate-600 text-sm">Click or drag banner here</p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">JPEG, PNG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Event Title *</label>
              <input type="text" name="title" required
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                value={formData.title} onChange={handleChange} placeholder="e.g., Annual Alumni Meetup 2026" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Description *</label>
              <textarea name="description" required rows={4}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-600 transition-all placeholder:text-slate-300 resize-none"
                value={formData.description} onChange={handleChange} placeholder="What is this event about?" />
            </div>

            {/* Date + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Date &amp; Time *</label>
                <input type="datetime-local" name="date" required
                  min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
                  value={formData.date} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Location *</label>
                <input type="text" name="location" required
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  value={formData.location} onChange={handleChange} placeholder="e.g., College Auditorium" />
              </div>
            </div>

            {/* ── REGISTRATION LINK (NEW) ── */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                Registration Link
                <span className="ml-2 text-[10px] font-medium normal-case tracking-normal text-slate-300">
                  optional — paste Google Form or external URL
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Link2 className="w-4 h-4 text-slate-300" />
                </div>
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  className="w-full pl-11 pr-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-600 transition-all placeholder:text-slate-300"
                  placeholder="https://forms.google.com/..."
                />
              </div>
              {registrationLink.trim() && (
                <p className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> External registration form will be used — internal registration disabled
                </p>
              )}
            </div>

            {/* ── AUDIENCE TARGETING ── */}
            <div className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-100">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-4">
                Who can see this event? 🎯
              </label>

              {/* Mode cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-1">
                {audienceModes.map(({ id, icon, label, desc, color }) => {
                  const isActive = audienceMode === id;
                  const c = colorMap[color];
                  return (
                    <button key={id} type="button" onClick={() => setAudienceMode(id)}
                      className={`relative flex flex-col items-start gap-1 p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isActive ? `${c.card} shadow-sm` : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <span className={isActive ? '' : 'text-slate-400'}>{icon}</span>
                      <span className="text-xs font-black text-slate-800 leading-tight">{label}</span>
                      <span className="text-[10px] text-slate-400 font-medium leading-tight hidden sm:block">{desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Batch selectors */}
              {(audienceMode === 'ALUMNI_ONLY' || audienceMode === 'CUSTOM') && (
                <BatchSelector type="alumni" batches={ALUMNI_BATCHES} selected={selectedAlumniBatches}
                  color={audienceMode === 'CUSTOM' ? 'emerald' : 'indigo'} />
              )}
              {(audienceMode === 'STUDENTS_ONLY' || audienceMode === 'CUSTOM') && (
                <BatchSelector type="students" batches={STUDENT_BATCHES} selected={selectedStudentBatches}
                  color={audienceMode === 'CUSTOM' ? 'emerald' : 'violet'} />
              )}

              {/* ── DEPARTMENT FILTER (always visible) ── */}
              <DeptSelector />

              {/* Summary */}
              <AudienceSummary />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2 border-t border-slate-100">
              <button type="button" onClick={() => router.back()}
                className="flex-1 py-4 border-2 border-slate-200 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-black uppercase tracking-widest transition-all text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-4 ce-grad-btn text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {loading ? 'Publishing...' : 'Publish Event ✨'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}