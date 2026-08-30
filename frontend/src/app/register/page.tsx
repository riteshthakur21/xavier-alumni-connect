'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  Briefcase,
  Linkedin,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Send,
  RotateCw,
} from 'lucide-react';

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
    setFormData((prev) => ({
      ...prev,
      email: googleEmail || prev.email,
      name: googleName || prev.name,
      password: prev.password || generateRandomPassword(),
    }));
    setCurrentStep(3);
  }, [isFromGoogle, googleEmail, googleName, googleIdParam]);

  useEffect(() => {
    const batch = parseInt(formData.batchYear);
    if (batch && currentYear - batch < 3) {
      setFormData((prev) => ({
        ...prev,
        role: 'STUDENT',
      }));
    }
  }, [formData.batchYear]);

  useEffect(() => {
    if (currentStep !== 2 || otpSecondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setOtpSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep, otpSecondsLeft]);

  useEffect(() => {
    if (currentStep !== 2 || resendSecondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setResendSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentStep, resendSecondsLeft]);

  const isRoleLocked = formData.batchYear && currentYear - parseInt(formData.batchYear) < 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Auto-capitalize first letter of each word in the name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
    setFormData((prev) => ({ ...prev, name: capitalized }));
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

    if (!formData.name.trim() || !formData.email.trim()) {
      setStep1Error('Please enter your full name and email address.');
      return;
    }

    setSendOtpLoading(true);
    try {
      await axios.post('/api/auth/send-otp', {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      setCurrentStep(2);
      setOtp('');
      setVerifiedToken('');
      setOtpSecondsLeft(600);
      setResendSecondsLeft(30);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send verification code. Please try again.';
      setStep1Error(message);
    } finally {
      setSendOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otp.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    setVerifyOtpLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email: formData.email.trim(),
        otp: otp.trim(),
      });
      setVerifiedToken(response.data.verifiedToken);
      setCurrentStep(3);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Invalid or expired verification code.';
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
      await axios.post('/api/auth/send-otp', {
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      setOtp('');
      setOtpSecondsLeft(600);
      setResendSecondsLeft(30);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to resend verification code.';
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        rollNo: formData.rollNo.trim().toUpperCase(),
        photo,
        verifiedToken,
        ...(googleId ? { googleId } : {}),
      });
      if (isFromGoogle && googleId) {
        try {
          await axios.post('/api/auth/google/link', {
            googleId,
            email: formData.email.trim(),
          });
        } catch (linkError) {
          console.error('Google link error:', linkError);
        }
      }
      router.push('/login');
    } catch (error) {
      // Error toast is handled by AuthContext
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#f4efe6] text-[#1a1410] py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <div className="w-full max-w-2xl">
        {/* Top Back to Home Navigation */}
        <div className="flex items-center justify-start mb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5c4d37] hover:text-[#1a1410] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#7d6a4f]" />
            <span>Back to home</span>
          </Link>
        </div>

        {/* Step Progress Indicator */}
        <div className="mb-6 bg-white rounded-2xl border border-[#1a1410]/12 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-[#3a5c3e] text-[#f4efe6]'
                          : isActive
                          ? 'bg-[#1a1410] text-[#f4efe6] ring-2 ring-[#c4821a]/30'
                          : 'bg-[#1a1410]/5 text-[#7d6a4f] border border-[#1a1410]/10'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium tracking-tight ${
                        isCompleted
                          ? 'text-[#3a5c3e] font-semibold'
                          : isActive
                          ? 'text-[#1a1410] font-semibold'
                          : 'text-[#7d6a4f]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 sm:mx-4 h-px flex-1 transition-all ${
                        isCompleted ? 'bg-[#3a5c3e]' : 'bg-[#1a1410]/12'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Admin Approval Notice Banner */}
        <div className="mb-6 rounded-xl border border-[#c4821a]/30 bg-[#fdf8ed] p-4 shadow-sm flex items-start gap-3">
          <Clock className="w-5 h-5 text-[#c4821a] flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#3d3222] leading-relaxed">
            <span className="font-semibold text-[#1a1410]">Institutional Policy:</span> After submitting registration, your profile will be reviewed by the alumni administrator before login access is activated.
          </div>
        </div>

        {/* Main Form Container Card */}
        <div className="bg-white rounded-2xl border border-[#1a1410]/12 p-7 sm:p-9 shadow-sm">
          {/* ─── STEP 1: Name & Email ────────────────────────────────────────── */}
          {currentStep === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
              <div>
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
                  Step 1 of 3
                </div>
                <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
                  Get Started
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
                  Enter your full name and institutional or personal email to receive a secure verification code.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. your name"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.name}
                      onChange={handleNameChange}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="name@college.edu or personal email"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {step1Error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">{step1Error}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sendOtpLoading || !formData.name.trim() || !formData.email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer mt-2"
              >
                {sendOtpLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#f4efe6]"
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
                    <span>Sending code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1a1410]/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#7d6a4f] font-mono tracking-wider text-[11px]">
                    or register with
                  </span>
                </div>
              </div>

              {/* Google OAuth Option */}
              <GoogleAuthButton text="Continue with Google" />
            </form>
          )}

          {/* ─── STEP 2: Verify Email OTP ────────────────────────────────────── */}
          {currentStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
              <div>
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
                  Step 2 of 3
                </div>
                <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
                  Verify Email Address
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-semibold text-[#1a1410]">{formData.email}</span>.
                </p>
              </div>

              <div className="pt-1">
                <label
                  htmlFor="otp"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5 text-center"
                >
                  6-Digit Verification Code *
                </label>
                <div className="max-w-xs mx-auto">
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    className="block w-full py-3 bg-white border border-[#1a1410]/20 text-center text-2xl font-mono font-bold text-[#1a1410] tracking-[0.4em] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] transition-all placeholder-[#7d6a4f]/30"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                  <div className="mt-2 text-center text-xs font-mono text-[#7d6a4f] flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#c4821a]" />
                    <span>Expires in {formatCountdown(otpSecondsLeft)}</span>
                  </div>
                </div>
              </div>

              {otpError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">{otpError}</div>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifyOtpLoading || otp.trim().length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer mt-2"
              >
                {verifyOtpLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#f4efe6]"
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
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Code Action */}
              <div className="text-center pt-2 text-xs sm:text-sm text-[#5c4d37]">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendSecondsLeft > 0 || sendOtpLoading}
                  className="font-semibold text-[#c4821a] hover:text-[#e8a93c] disabled:text-[#7d6a4f]/50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${sendOtpLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {resendSecondsLeft > 0
                      ? `Resend in ${resendSecondsLeft}s`
                      : 'Resend code'}
                  </span>
                </button>
              </div>

              {/* Back to Step 1 */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-[#7d6a4f] hover:text-[#1a1410] transition-colors"
                >
                  &larr; Change email address
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 3: Complete Profile ────────────────────────────────────── */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
                  Step 3 of 3
                </div>
                <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
                  Complete Your Profile
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
                  Provide your academic and professional credentials to complete your registration.
                </p>
              </div>

              {/* Verified Email Banner */}
              <div className="rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 px-4 py-3 text-xs sm:text-sm text-[#3a5c3e] shadow-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3a5c3e] flex-shrink-0" />
                <span className="font-semibold">Email address verified successfully</span>
              </div>

              {/* Google OAuth Banner */}
              {isFromGoogle && (
                <div className="rounded-xl border border-[#c4821a]/30 bg-[#fdf8ed] px-4 py-3 text-xs sm:text-sm text-[#3d3222] flex items-center justify-between gap-3 shadow-sm">
                  <span>Registering via Google Account. No password required.</span>
                  {googlePicture && (
                    <img
                      src={googlePicture}
                      alt="Google profile"
                      className="h-9 w-9 rounded-full border border-[#c4821a]/40"
                    />
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="profile-name"
                      name="name"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="profile-email"
                      name="email"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-[#f4efe6]/60 border border-[#1a1410]/10 text-sm text-[#5c4d37] rounded-xl shadow-sm cursor-not-allowed"
                      value={formData.email}
                      readOnly
                    />
                  </div>
                </div>

                {/* Password (for direct email registrants) */}
                {!isFromGoogle && (
                  <div>
                    <label
                      htmlFor="profile-password"
                      className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        id="profile-password"
                        name="password"
                        required
                        minLength={6}
                        className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </div>
                )}

                {/* Batch Year */}
                <div>
                  <label
                    htmlFor="batchYear"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Batch Year *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <select
                      id="batchYear"
                      name="batchYear"
                      required
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.batchYear}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select Batch Year
                      </option>
                      {Array.from(
                        { length: currentYear - 2009 + 1 },
                        (_, i) => currentYear - i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    required
                    className="block w-full px-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.department}
                    onChange={handleChange}
                  >
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
                  <label
                    htmlFor="rollNo"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    id="rollNo"
                    name="rollNo"
                    required
                    className="block w-full px-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm font-mono text-[#1a1410] uppercase rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.rollNo}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNo: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: BBA2023001"
                    pattern="[A-Z]+[0-9]{7}"
                    title="Format example: BBA2023001 (Department + Year + RollNo)"
                  />
                  <p className="text-[11px] text-[#7d6a4f] mt-1 font-mono">
                    Format: Dept + BatchYear + Roll (e.g. BCA2022015)
                  </p>
                </div>

                {/* Role Selection */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    I am a... *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    disabled={!!isRoleLocked}
                    className={`block w-full px-3.5 py-2.5 border text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 ${
                      isRoleLocked
                        ? 'bg-[#f4efe6]/70 border-[#1a1410]/10 cursor-not-allowed font-semibold text-[#1a1410]'
                        : 'bg-white border-[#1a1410]/15 text-[#1a1410] focus:ring-[#c4821a]/20 focus:border-[#1a1410]'
                    }`}
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="">Select your role</option>
                    <option value="ALUMNI">Alumni (Passout)</option>
                    <option value="STUDENT">Current Student</option>
                  </select>
                  {isRoleLocked && (
                    <p className="text-[11px] text-[#c4821a] font-medium mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c4821a]" />
                      <span>Role automatically assigned to Student based on batch year.</span>
                    </p>
                  )}
                </div>

                {/* Current Company */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Current Company
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Google, Tata, Startup"
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div>
                  <label
                    htmlFor="jobTitle"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                  >
                    Job Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                </div>
              </div>

              {/* LinkedIn URL */}
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Short Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  className="block w-full px-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30 resize-none"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a brief introduction about your career journey, expertise, and interests..."
                />
              </div>

              {/* Profile Photo */}
              <div>
                <label
                  htmlFor="photo"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1a1410]/15 rounded-xl text-xs font-semibold text-[#1a1410] hover:bg-[#f4efe6] hover:border-[#1a1410]/30 transition-all cursor-pointer shadow-sm">
                    <Camera className="w-4 h-4 text-[#7d6a4f]" />
                    <span>{photo ? photo.name : 'Choose image file'}</span>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#f4efe6]"
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
                    <span>Submitting registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Existing Member Sign In Promotion */}
        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-[#5c4d37]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Sign in to your portal</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#c4821a]" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
