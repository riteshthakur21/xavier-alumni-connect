// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';

// export default function Register() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     batchYear: '',
//     role: '',
//     department: '',
//     rollNo: '',
//     company: '',
//     jobTitle: '',
//     linkedinUrl: '',
//     bio: '',
//   });
//   const [photo, setPhoto] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const { register } = useAuth();
//   const router = useRouter();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setPhoto(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Purana sab hatakar bas ye likho:
//       await register({ ...formData, photo });
//       router.push('/dashboard');
//     } catch (error) {
//       console.error('Registration error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-extrabold text-secondary-900">
//             Create your account
//           </h2>
//           <p className="mt-2 text-sm text-secondary-600">
//             Join our alumni community and start networking
//           </p>
//         </div>

//         <div className="card">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="name" className="form-label">
//                   Full Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   required
//                   className="form-input"
//                   value={formData.name}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="form-label">
//                   Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   required
//                   className="form-input"
//                   value={formData.email}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="password" className="form-label">
//                   Password *
//                 </label>
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   required
//                   className="form-input"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="batchYear" className="form-label">
//                   Batch Year *
//                 </label>
//                 <input
//                   type="number"
//                   id="batchYear"
//                   name="batchYear"
//                   required
//                   min="2014"
//                   max={new Date().getFullYear()}
//                   className="form-input"
//                   value={formData.batchYear}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="department" className="form-label">
//                   Department *
//                 </label>
//                 <select
//                   id="department"
//                   name="department"
//                   required
//                   className="form-input bg-white"
//                   value={formData.department}
//                   onChange={(e: any) => handleChange(e)}
//                 >
//                   <option value="">Select your Department</option>
//                   <option value="BCA">BCA</option>
//                   <option value="BBA">BBA</option>
//                   <option value="BCOM (P)">BCOM (P)</option>
//                   <option value="BBA (IB)">BBA (IB)</option>
//                   <option value="BA (JMC)">BA (JMC)</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="rollNo" className="form-label">
//                   Roll Number * <span className="text-xs font-normal text-gray-500">(Mandatory)</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="rollNo"
//                   name="rollNo"
//                   required // 👈 Ab ye bharna zaroori hai
//                   className="form-input uppercase" // 👈 'uppercase' class se dikhne me bada dikhega
//                   value={formData.rollNo}
//                   // 👇 Ye naya logic: Type karte hi Capital letter ban jayega
//                   onChange={(e) => {
//                     setFormData({
//                       ...formData,
//                       rollNo: e.target.value.toUpperCase()
//                     });
//                   }}
//                   placeholder="Ex: BBA2023001"
//                   // 👇 Ye raha MAGIC: Ye check karega ki format sahi hai ya nahi
//                   pattern="[A-Z]+[0-9]{7}"
//                   title="Format example: BBA2023001 (Department + Year + RollNo)"
//                 />
//                 <p className="text-xs text-slate-500 mt-1">
//                   Format: Dept (e.g. BCA) + BatchYear (2025) + Roll (001)
//                 </p>
//               </div>

//               {/* --- Role Selection (New) --- */}
//               <div>
//                 <label htmlFor="role" className="form-label">
//                   I am a...*
//                 </label>
//                 <select
//                   id="role"
//                   name="role"
//                   required
//                   className="form-input bg-white"
//                   value={formData.role}
//                   onChange={(e: any) => handleChange(e)}
//                 >
//                   <option value="">select your role</option>
//                   <option value="ALUMNI">Alumni (Passout) 💼</option>
//                   <option value="STUDENT">Current Student 🎓</option>
//                 </select>
//               </div>

//               <div>
//                 <label htmlFor="company" className="form-label">
//                   Current Company
//                 </label>
//                 <input
//                   type="text"
//                   id="company"
//                   name="company"
//                   className="form-input"
//                   value={formData.company}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="jobTitle" className="form-label">
//                   Job Title
//                 </label>
//                 <input
//                   type="text"
//                   id="jobTitle"
//                   name="jobTitle"
//                   className="form-input"
//                   value={formData.jobTitle}
//                   onChange={handleChange}
//                 />
//               </div>
//             </div>

//             <div>
//               <label htmlFor="linkedinUrl" className="form-label">
//                 LinkedIn Profile URL
//               </label>
//               <input
//                 type="url"
//                 id="linkedinUrl"
//                 name="linkedinUrl"
//                 className="form-input"
//                 value={formData.linkedinUrl}
//                 onChange={handleChange}
//                 placeholder="https://linkedin.com/in/yourprofile"
//               />
//             </div>

//             <div>
//               <label htmlFor="bio" className="form-label">
//                 Short Bio
//               </label>
//               <textarea
//                 id="bio"
//                 name="bio"
//                 rows={4}
//                 className="form-input"
//                 value={formData.bio}
//                 onChange={handleChange}
//                 placeholder="Tell us about yourself..."
//               />
//             </div>

//             <div>
//               <label htmlFor="photo" className="form-label">
//                 Profile Photo
//               </label>
//               <input
//                 type="file"
//                 id="photo"
//                 name="photo"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="form-input"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500">
//                 Already have an account? Sign in
//               </Link>
//             </div>

//             <div>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full btn-primary py-3"
//               >
//                 {loading ? 'Creating Account...' : 'Create Account'}
//               </button>
//             </div>
//           </form>
//         </div>

//         <div className="mt-6 text-center">
//           <Link href="/" className="text-sm text-primary-600 hover:text-primary-500">
//             ← Back to Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react'; // 👈 useEffect add kiya
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    batchYear: '',
    role: '',
    department: '',
    rollNo: '',
    company: '',
    jobTitle: '',
    linkedinUrl: '',
    bio: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // --- 🔒 Smart Role Logic Start ---
  const currentYear = 2026; //

  useEffect(() => {
    const batch = parseInt(formData.batchYear);
    // Agar batch 3 saal ke andar hai (2024, 2025, 2026)
    if (batch && (currentYear - batch < 3)) {
      setFormData(prev => ({
        ...prev,
        role: 'STUDENT'
      }));
    }
  }, [formData.batchYear]);

  // Check karne ke liye ki dropdown lock hona chahiye ya nahi
  const isRoleLocked = formData.batchYear && (currentYear - parseInt(formData.batchYear)) < 3;
  // --- 🔒 Smart Role Logic End ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({ ...formData, photo });
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Join our alumni community at Xavier AlumniConnect
          </p>
        </div>

        <div className="card bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input type="text" id="name" name="name" required className="form-input" value={formData.name} onChange={handleChange} />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input type="email" id="email" name="email" required className="form-input" value={formData.email} onChange={handleChange} />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">Password *</label>
                <input type="password" id="password" name="password" required className="form-input" value={formData.password} onChange={handleChange} />
              </div>

              {/* Batch Year */}
              <div>
                <label htmlFor="batchYear" className="form-label">Batch Year *</label>
                <input
                  type="number"
                  id="batchYear"
                  name="batchYear"
                  required
                  min="2014"
                  max={currentYear}
                  className="form-input"
                  value={formData.batchYear}
                  onChange={handleChange}
                />
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="form-label">Department *</label>
                <select id="department" name="department" required className="form-input bg-white" value={formData.department} onChange={handleChange}>
                  <option value="">Select your Department</option>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="BCOM (P)">BCOM (P)</option>
                  <option value="BBA (IB)">BBA (IB)</option>
                  <option value="BA (JMC)">BA (JMC)</option>
                </select>
              </div>

              {/* Roll Number (Preserved Magic Logic) */}
              <div>
                <label htmlFor="rollNo" className="form-label">
                  Roll Number * <span className="text-xs font-normal text-gray-500">(Mandatory)</span>
                </label>
                <input
                  type="text"
                  id="rollNo"
                  name="rollNo"
                  required
                  className="form-input uppercase"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })}
                  placeholder="Ex: BBA2023001"
                  pattern="[A-Z]+[0-9]{7}"
                  title="Format example: BBA2023001 (Department + Year + RollNo)"
                />
                <p className="text-xs text-slate-500 mt-1">Format: Dept + BatchYear + Roll</p>
              </div>

              {/* --- 🔒 Role Selection (Updated Feature) --- */}
              <div>
                <label htmlFor="role" className="form-label">I am a...*</label>
                <select
                  id="role"
                  name="role"
                  required
                  disabled={isRoleLocked} // 👈 Lock logic here
                  className={`form-input transition-all ${isRoleLocked ? 'bg-slate-100 cursor-not-allowed opacity-80 font-bold text-primary-600' : 'bg-white'}`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">select your role</option>
                  <option value="ALUMNI">Alumni (Passout) 💼</option>
                  <option value="STUDENT">Current Student 🎓</option>
                </select>
                {isRoleLocked && (
                  <p className="text-[10px] text-blue-600 font-bold mt-1 px-1">
                    ℹ️ Locked: You are currently a student based on your batch.
                  </p>
                )}
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="form-label">Current Company</label>
                <input type="text" id="company" name="company" className="form-input" value={formData.company} onChange={handleChange} />
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="form-label">Job Title</label>
                <input type="text" id="jobTitle" name="jobTitle" className="form-input" value={formData.jobTitle} onChange={handleChange} />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedinUrl" className="form-label">LinkedIn Profile URL</label>
              <input type="url" id="linkedinUrl" name="linkedinUrl" className="form-input" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="form-label">Short Bio</label>
              <textarea id="bio" name="bio" rows={4} className="form-input" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            </div>

            {/* Photo */}
            <div>
              <label htmlFor="photo" className="form-label">Profile Photo</label>
              <input type="file" id="photo" name="photo" accept="image/*" onChange={handleFileChange} className="form-input" />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/login" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                Already have an account? Sign in
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    {/* Native ghoomne wala SVG Spinner */}
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-secondary-500 hover:text-primary-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}