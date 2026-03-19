'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<{ message: string; code?: string; email?: string } | null>(null);
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
    if (!value) return 'Email is required';
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

    // Mark all fields as touched
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Handle "Remember me"
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      const rawMessage = error.message || 'Invalid email or password';
      const code = error.code;
      if (rawMessage === 'EMAIL_NOT_VERIFIED') {
        setLoginError({ message: 'Please verify your email first.', code: 'EMAIL_NOT_VERIFIED', email });
      } else {
        setLoginError({ message: rawMessage, code });
      }
    } finally {
      setLoading(false);
    }
  };

  // Determine error styling based on error code
  const isPendingError = loginError?.code === 'PENDING_APPROVAL';
  const isRejectedError = loginError?.code === 'REJECTED';
  const isEmailNotVerifiedError = loginError?.code === 'EMAIL_NOT_VERIFIED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {showVerifiedBanner && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              ✓ Email verified! You can log in once an admin approves your account.
            </div>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setLoginError(null); }}
                  onBlur={() => handleBlur('email')}
                  className={`form-input block w-full rounded-md shadow-sm ${
                    touched.email && errors.email
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="you@example.com"
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                />
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" id="email-error">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Password field with visibility toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(null); }}
                  onBlur={() => handleBlur('password')}
                  className={`form-input block w-full rounded-md shadow-sm pr-12 ${
                    touched.password && errors.password
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="Enter your password"
                  aria-invalid={touched.password && !!errors.password}
                  aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-primary-600 hover:text-primary-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1" id="password-error">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          {/* Login error - contextual styling */}
          {loginError && (
            <div
                className={`rounded-xl p-4 border ${
                  isPendingError
                    ? 'bg-amber-50 border-amber-200'
                    : isEmailNotVerifiedError
                    ? 'bg-blue-50 border-blue-200'
                    : isRejectedError
                    ? 'bg-red-50 border-red-200'
                    : 'bg-red-50 border-red-200'
              }`}
              style={{ animation: 'scaleIn 0.2s ease-out' }}
            >
              <div className="flex gap-3">
                {/* Contextual icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {isPendingError ? (
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : isEmailNotVerifiedError ? (
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0l-3 3m3-3l-3-3M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
                    </svg>
                  ) : isRejectedError ? (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${
                    isPendingError ? 'text-amber-800' : isEmailNotVerifiedError ? 'text-blue-800' : 'text-red-800'
                  }`}>
                    {isPendingError
                      ? 'Account Pending Approval'
                      : isEmailNotVerifiedError
                      ? 'Email Verification Required'
                      : isRejectedError
                      ? 'Registration Rejected'
                      : 'Login Failed'}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    isPendingError ? 'text-amber-700' : isEmailNotVerifiedError ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {loginError.message}
                  </p>
                  {isPendingError && (
                    <p className="mt-2 text-xs text-amber-600">
                      The admin will review your profile shortly. You will receive an email once approved.
                    </p>
                  )}
                  {isRejectedError && (
                    <Link
                      href="/register"
                      className="mt-2 inline-block text-xs font-medium text-red-700 underline hover:text-red-800"
                    >
                      Try registering again with correct details
                    </Link>
                  )}
                  {isEmailNotVerifiedError && loginError.email && (
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(loginError.email)}`}
                      className="mt-2 inline-block text-xs font-medium text-blue-700 underline hover:text-blue-800"
                    >
                      Verify your email now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm font-medium text-secondary-500 hover:text-primary-600 transition-colors"
            >
              &larr; Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
