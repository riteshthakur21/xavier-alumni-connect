'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromGoogle = searchParams.get('fromGoogle') === 'true';
  const googleEmail = searchParams.get('email') || '';
  const googleName = searchParams.get('name') || '';
  const googleIdParam = searchParams.get('googleId') || '';
  const googlePicture = searchParams.get('picture') || '';
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
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(isFromGoogle ? 3 : 1);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [step1Error, setStep1Error] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [googleId, setGoogleId] = useState('');

  // --- Smart Role Logic ---
  const currentYear = 2026;

  const generateRandomPassword = () =>
    `GX-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;

  useEffect(() => {
    if (!isFromGoogle) return;
    setGoogleId(googleIdParam);
    setFormData(prev => ({
      ...prev,
      email: googleEmail || prev.email,
      name: googleName || prev.name,
      password: prev.password || generateRandomPassword(),
    }));
    setCurrentStep(3);
  }, [isFromGoogle, googleEmail, googleName, googleIdParam]);

  useEffect(() => {
    const batch = parseInt(formData.batchYear);
    if (batch && (currentYear - batch < 3)) {
      setFormData(prev => ({
        ...prev,
        role: 'STUDENT'
      }));
    }
  }, [formData.batchYear]);

  useEffect(() => {
    if (currentStep !== 2 || otpSecondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setOtpSecondsLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep, otpSecondsLeft]);

  useEffect(() => {
    if (currentStep !== 2 || resendSecondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setResendSecondsLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep, resendSecondsLeft]);

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
    setFormData(prev => ({ ...prev, name: capitalized }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep1Error('');
    setOtpError('');

    if (!formData.name || !formData.email) {
      setStep1Error('Please enter your name and email');
      return;
    }

    setSendOtpLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { name: formData.name, email: formData.email });
      setCurrentStep(2);
      setOtp('');
      setVerifiedToken('');
      setOtpSecondsLeft(600);
      setResendSecondsLeft(30);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send OTP';
      setStep1Error(message);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otp.trim().length !== 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }

    setVerifyOtpLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', { email: formData.email, otp });
      setVerifiedToken(response.data.verifiedToken);
      setCurrentStep(3);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid or expired code';
      setOtpError(message);
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendSecondsLeft > 0 || sendOtpLoading) return;
    setOtpError('');
    setSendOtpLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { name: formData.name, email: formData.email });
      setOtp('');
      setOtpSecondsLeft(600);
      setResendSecondsLeft(30);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to resend OTP';
      setOtpError(message);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        ...formData,
        photo,
        verifiedToken,
        ...(googleId ? { googleId } : {})
      });
      if (isFromGoogle && googleId) {
        try {
          await axios.post('/api/auth/google/link', { googleId, email: formData.email });
        } catch (linkError) {
          console.error('Google link error:', linkError);
        }
      }
      router.push('/login');
    } catch (error) {
      // Error toast is already shown by AuthContext
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  };

  const steps = [
    { id: 1, label: 'Email' },
    { id: 2, label: 'Verify' },
    { id: 3, label: 'Profile' },
  ];

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

        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                            ? 'bg-primary-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓' : step.id}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isCompleted
                          ? 'text-green-600'
                          : isActive
                            ? 'text-primary-700'
                            : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-3 h-px flex-1 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
          {currentStep === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">Get Started</h3>
                <p className="text-sm text-secondary-600">Enter your name and email to receive a verification code.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {step1Error && (
                <div className="text-sm text-red-600">{step1Error}</div>
              )}

              <button
                type="submit"
                disabled={sendOtpLoading}
                className="w-full btn-primary py-3 font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {sendOtpLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-semibold text-slate-500">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <GoogleAuthButton text="Continue with Google" />
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">Verify Email</h3>
                <p className="text-sm text-secondary-600">
                  We sent a 6-digit code to <span className="font-semibold">{formData.email}</span>
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="form-label">Verification Code *</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="form-input tracking-[0.4em] text-center text-lg font-semibold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="●●●●●●"
                  autoComplete="one-time-code"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Code expires in {formatCountdown(otpSecondsLeft)}
                </div>
              </div>

              {otpError && (
                <div className="text-sm text-red-600">{otpError}</div>
              )}

              <button
                type="submit"
                disabled={verifyOtpLoading}
                className="w-full btn-primary py-3 font-bold tracking-wide flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {verifyOtpLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-sm text-secondary-600">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendSecondsLeft > 0}
                  className="text-primary-600 hover:text-primary-700 font-semibold disabled:text-slate-400"
                >
                  {resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-1">Complete Your Profile</h3>
                <p className="text-sm text-secondary-600">Finish your profile to submit registration.</p>
              </div>

              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <span className="font-semibold">✓ Email verified successfully</span>
              </div>

              {isFromGoogle && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex items-center justify-between gap-3">
                  <span>Completing registration via Google. No password needed.</span>
                  {googlePicture && (
                    <img
                      src={googlePicture}
                      alt="Google profile"
                      className="h-10 w-10 rounded-full border border-blue-200"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div>
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input bg-slate-100 cursor-not-allowed"
                    value={formData.email}
                    readOnly
                  />
                </div>

                {!isFromGoogle && (
                  <div>
                    <label htmlFor="password" className="form-label">Password *</label>
                    <input type="password" id="password" name="password" required minLength={6} className="form-input" value={formData.password} onChange={handleChange} />
                    <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                  </div>
                )}

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

                <div>
                  <label htmlFor="company" className="form-label">Current Company</label>
                  <input type="text" id="company" name="company" className="form-input" value={formData.company} onChange={handleChange} />
                </div>

                <div>
                  <label htmlFor="jobTitle" className="form-label">Job Title</label>
                  <input type="text" id="jobTitle" name="jobTitle" className="form-input" value={formData.jobTitle} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label htmlFor="linkedinUrl" className="form-label">LinkedIn Profile URL</label>
                <input type="url" id="linkedinUrl" name="linkedinUrl" className="form-input" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/yourprofile" />
              </div>

              <div>
                <label htmlFor="bio" className="form-label">Short Bio</label>
                <textarea id="bio" name="bio" rows={4} className="form-input" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
              </div>

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
          )}
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
