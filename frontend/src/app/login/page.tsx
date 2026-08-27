'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Users,
  Briefcase,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<{ message: string; code?: string; email?: string } | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<{ name?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showVerifiedBanner = searchParams.get('message') === 'verified';

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  // Validation functions
  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Email address is required';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({
      email: emailError,
      password: passwordError,
    });
    return !emailError && !passwordError;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const loggedInUser: any = await login(email.trim(), password);
      // Handle "Remember me"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      const rawName = loggedInUser?.name || '';
      const firstName = rawName ? rawName.trim().split(' ')[0] : '';
      setLoginSuccess({ name: firstName });
      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch (error: any) {
      setLoginSuccess(null);
      const rawMessage = error.message || 'Invalid email or password';
      const code = error.code;
      if (rawMessage === 'EMAIL_NOT_VERIFIED') {
        setLoginError({ message: 'Please verify your email address first.', code: 'EMAIL_NOT_VERIFIED', email: email.trim() });
      } else {
        setLoginError({ message: rawMessage, code });
      }
      setLoading(false);
    }
  };

  // Determine error styling based on error code
  const isPendingError = loginError?.code === 'PENDING_APPROVAL';
  const isRejectedError = loginError?.code === 'REJECTED';
  const isEmailNotVerifiedError = loginError?.code === 'EMAIL_NOT_VERIFIED';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-[#f4efe6] text-[#1a1410] selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* ─── Left Editorial & Heritage Panel (Desktop) ────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1a1410] border-r border-[#3d3222]/50 text-[#f4efe6] flex-col justify-between p-8 xl:p-12 overflow-hidden">
        {/* Architectural Subtle Watermark Frame */}
        <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#e8a93c] to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 pt-2 pb-6">
          {/* Status Stamp */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-[#3a5c3e] bg-[#3a5c3e]/20 text-[#7aab7e] font-mono text-[11px] uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-[#7aab7e] animate-pulse" />
            <span>Verified Alumni Network</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-normal font-serif tracking-tight text-[#f4efe6] leading-tight mb-3.5">
            Where alumni <br />
            <span className="italic text-[#e8a93c]">stay connected.</span>
          </h1>
          <p className="text-[#bfb09a] text-sm xl:text-base leading-relaxed max-w-lg mb-6">
            Stay in touch with mentors, recruit top talent from your alma mater, and participate in exclusive alumni initiatives worldwide.
          </p>

          {/* Value Pillars */}
          <div className="space-y-3 max-w-lg">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#261f15]/90 border border-[#3d3222] transition-colors hover:border-[#c4821a]/50">
              <div className="w-8 h-8 rounded-lg bg-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#f4efe6]">Global Directory Access</h2>
                <p className="text-xs text-[#a08c6e] mt-0.5">Search and connect with thousands of alumni across industries and batches.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#261f15]/90 border border-[#3d3222] transition-colors hover:border-[#c4821a]/50">
              <div className="w-8 h-8 rounded-lg bg-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#f4efe6]">Exclusive Career Board</h2>
                <p className="text-xs text-[#a08c6e] mt-0.5">Post and apply to alumni-referred job postings and collaborative ventures.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#261f15]/90 border border-[#3d3222] transition-colors hover:border-[#c4821a]/50">
              <div className="w-8 h-8 rounded-lg bg-[#3d3222] text-[#e8a93c] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#f4efe6]">Reunions & Masterclasses</h2>
                <p className="text-xs text-[#a08c6e] mt-0.5">Register for campus homecomings, webinars, and regional chapter meets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof */}
        <div className="relative z-10 pt-4 border-t border-[#3d3222] flex items-center justify-between text-xs text-[#8a7a65] font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7aab7e]" />
            <span>End-to-End Verified Profiles</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Xavier Connect</span>
        </div>
      </div>

      {/* ─── Right Form Area ──────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-5 sm:px-8 md:px-12 xl:px-16 py-6 lg:py-10">
        <div className="w-full max-w-md">
          {/* Top navigation / Back link */}
          <div className="flex items-center justify-start mb-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#5c4d37] hover:text-[#1a1410] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#7d6a4f]" />
              <span>Back to home</span>
            </Link>
          </div>

          {/* Form Card Container */}
          <div className="bg-white rounded-2xl border border-[#1a1410]/12 p-7 sm:p-9 shadow-sm">
            {/* Card Header */}
            <div className="mb-6">
              <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-2 font-medium">
                Portal Authentication
              </div>
              <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
                Sign in to your account
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
                Welcome back! Please enter your registered credentials to access the alumni portal.
              </p>
            </div>

            {/* Verified Account Banner */}
            {showVerifiedBanner && (
              <div className="mb-6 rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 p-4 text-xs sm:text-sm text-[#3a5c3e] shadow-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#3a5c3e] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Email verified successfully!</p>
                  <p className="text-xs text-[#3a5c3e]/90 mt-0.5">
                    Your email has been confirmed. You will be able to log in once an administrator approves your profile.
                  </p>
                </div>
              </div>
            )}

            {/* Inline Success Notification */}
            {loginSuccess && (
              <div className="mb-6 rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 p-4 sm:p-5 shadow-sm animate-fadeIn">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3a5c3e] text-[#f4efe6] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-[#f4efe6]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[#1a1410] font-serif tracking-tight">
                      {loginSuccess.name ? `Welcome back, ${loginSuccess.name}!` : 'Welcome back!'}
                    </h3>
                    <p className="mt-1 text-xs text-[#5c4d37] leading-relaxed">
                      You&apos;re successfully signed in. Redirecting you to your dashboard...
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono font-medium text-[#3a5c3e]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3a5c3e] animate-ping" />
                      <span>Redirecting...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contextual Error Alert Box */}
            {loginError && (
              <div
                className={`mb-6 rounded-xl border p-4 shadow-sm transition-all ${
                  isPendingError
                    ? 'bg-[#c4821a]/10 border-[#c4821a]/30 text-[#3d3222]'
                    : isEmailNotVerifiedError
                    ? 'bg-[#c4821a]/10 border-[#c4821a]/30 text-[#3d3222]'
                    : isRejectedError
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isPendingError ? (
                      <Clock className="w-5 h-5 text-[#c4821a]" />
                    ) : isEmailNotVerifiedError ? (
                      <Mail className="w-5 h-5 text-[#c4821a]" />
                    ) : isRejectedError ? (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold">
                      {isPendingError
                        ? 'Account Pending Admin Approval'
                        : isEmailNotVerifiedError
                        ? 'Email Verification Required'
                        : isRejectedError
                        ? 'Registration Not Approved'
                        : 'Unable to Sign In'}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed opacity-90">
                      {loginError.message}
                    </p>

                    {isPendingError && (
                      <p className="mt-2 text-xs text-[#7d6a4f] font-medium">
                        Our administrative team reviews all alumni profiles to safeguard community integrity. You will receive an email once approved.
                      </p>
                    )}

                    {isRejectedError && (
                      <Link
                        href="/register"
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2"
                      >
                        <span>Submit a new registration with updated details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {isEmailNotVerifiedError && loginError.email && (
                      <Link
                        href={`/verify-email?email=${encodeURIComponent(loginError.email)}`}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#c4821a] hover:text-[#e8a93c] underline underline-offset-2"
                      >
                        <span>Complete email verification</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Form */}
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (loginError) setLoginError(null);
                      if (touched.email) {
                        setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur('email')}
                    className={`block w-full pl-10 pr-3.5 py-2.5 bg-white border text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                      touched.email && errors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-[#1a1410]/15 focus:border-[#1a1410] focus:ring-[#c4821a]/20 hover:border-[#1a1410]/30'
                    }`}
                    placeholder="name@college.edu or personal email"
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1.5 font-medium" id="email-error">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#c4821a] hover:text-[#e8a93c] transition-colors"
                    tabIndex={0}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError(null);
                      if (touched.password) {
                        setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur('password')}
                    className={`block w-full pl-10 pr-11 py-2.5 bg-white border text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                      touched.password && errors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                        : 'border-[#1a1410]/15 focus:border-[#1a1410] focus:ring-[#c4821a]/20 hover:border-[#1a1410]/30'
                    }`}
                    placeholder="Enter your password"
                    aria-invalid={touched.password && !!errors.password}
                    aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d6a4f] hover:text-[#1a1410] focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1.5 font-medium" id="password-error">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-[#1a1410] border-[#1a1410]/20 rounded focus:ring-[#c4821a]/40 transition"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[#3d3222]">
                    Remember my email
                  </span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading || !!loginSuccess}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer mt-2"
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#7aab7e]" />
                    <span>Signed In · Redirecting...</span>
                  </>
                ) : loading ? (
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1a1410]/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-[#7d6a4f] font-mono tracking-wider text-[11px]">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <GoogleAuthButton />
            </form>
          </div>

          {/* Registration Promotion Link */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-[#5c4d37]">
              New to the alumni network?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors inline-flex items-center gap-1 group"
              >
                <span>Create an account</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-[#c4821a]" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
