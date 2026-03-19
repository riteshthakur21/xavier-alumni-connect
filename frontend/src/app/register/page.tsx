'use client';

import React, { useState, useEffect } from 'react';
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
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // --- Smart Role Logic ---
  const currentYear = 2026;

  useEffect(() => {
    const batch = parseInt(formData.batchYear);
    if (batch && (currentYear - batch < 3)) {
      setFormData(prev => ({
        ...prev,
        role: 'STUDENT'
      }));
    }
  }, [formData.batchYear]);

  const isRoleLocked = formData.batchYear && (currentYear - parseInt(formData.batchYear)) < 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Auto-capitalize first letter of each word in the name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
    setFormData({ ...formData, name: capitalized });
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
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      // Error toast is already shown by AuthContext
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Success screen after registration
  if (registerSuccess) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10" style={{ animation: 'scaleIn 0.3s ease-out' }}>
            {/* Success checkmark */}
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Registration Successful!</h2>
            <p className="text-secondary-600 mb-6 leading-relaxed">
              Your profile has been submitted and is now <span className="font-semibold text-amber-600">pending admin approval</span>. You will be able to log in once an admin verifies your account.
            </p>

            {/* Info card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>The admin will review your details</li>
                    <li>You will receive an email once approved</li>
                    <li>After approval, login with your credentials</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Redirect notice */}
            <div className="flex items-center justify-center gap-2 text-sm text-secondary-500">
              <svg className="animate-spin h-4 w-4 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Redirecting to login page...
            </div>

            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Go to Login now
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Approval notice */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Note:</span> After registration, your account will require admin approval before you can log in.
            </p>
          </div>
        </div>

        <div className="card bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name - with auto-capitalization */}
              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input type="email" id="email" name="email" required className="form-input" value={formData.email} onChange={handleChange} />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">Password *</label>
                <input type="password" id="password" name="password" required minLength={6} className="form-input" value={formData.password} onChange={handleChange} />
                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Batch Year */}
              <div>
                <label htmlFor="batchYear" className="form-label">Batch Year *</label>
                <select
                  id="batchYear"
                  name="batchYear"
                  required
                  className="form-input"
                  value={formData.batchYear}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Batch Year</option>
                  {Array.from({ length: currentYear - 2009 + 1 }, (_, i) => currentYear - i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
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

              {/* Roll Number */}
              <div>
                <label htmlFor="rollNo" className="form-label">
                  Roll Number * <span className="text-xs font-normal text-gray-500"></span>
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

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="form-label">I am a... *</label>
                <select
                  id="role"
                  name="role"
                  required
                  disabled={!!isRoleLocked}
                  className={`form-input transition-all ${isRoleLocked ? 'bg-slate-100 cursor-not-allowed opacity-80 font-bold text-primary-600' : 'bg-white'}`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select your role</option>
                  <option value="ALUMNI">Alumni (Passout)</option>
                  <option value="STUDENT">Current Student</option>
                </select>
                {isRoleLocked && (
                  <p className="text-xs text-blue-600 font-semibold mt-1 px-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked: You are currently a student based on your batch.
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
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
