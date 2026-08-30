'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      const msg = 'The password reset token is missing or invalid.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 6) {
      const msg = 'Password must be at least 6 characters in length.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'Passwords do not match. Please verify and re-enter.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      setSuccess(true);
      toast.success('Password updated successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Failed to reset password. The link might be expired or already used.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-[#c4821a]/30 bg-[#fdf3e3] p-5 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#c4821a] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-[#1a1410] font-serif">
              Invalid or Expired Link
            </h3>
            <p className="mt-1 text-xs text-[#5c4d37] leading-relaxed">
              This password reset link is missing a security token or has already expired. Please request a new recovery link.
            </p>
          </div>
        </div>
        <div className="pt-3 border-t border-[#c4821a]/20">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors"
          >
            <span>Request a new recovery link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 p-5 shadow-sm space-y-4 animate-fadeIn">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#3a5c3e] text-[#f4efe6] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-[#f4efe6]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1a1410] font-serif tracking-tight">
              Password Reset Complete
            </h3>
            <p className="mt-1 text-xs text-[#5c4d37] leading-relaxed">
              Your password has been updated securely. Redirecting you to the sign-in portal...
            </p>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] font-mono font-medium text-[#3a5c3e]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a5c3e] animate-ping" />
              <span>Redirecting to login...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {/* New Password Input */}
      <div>
        <label
          htmlFor="new-password"
          className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
        >
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="new-password"
            name="new-password"
            type={showNewPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            className="block w-full pl-10 pr-11 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d6a4f] hover:text-[#1a1410] focus:outline-none"
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
        >
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="confirm-password"
            name="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="block w-full pl-10 pr-11 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7d6a4f] hover:text-[#1a1410] focus:outline-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#f4efe6] bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] shadow-sm hover:shadow hover:-translate-y-0.5 border border-[#3d3222]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c4821a]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer mt-2"
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
            <span>Updating password...</span>
          </>
        ) : (
          <>
            <span>Reset Password</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410] px-4 sm:px-6 py-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* Main Card Container */}
      <div className="relative w-full max-w-md p-7 sm:p-9 bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm z-10">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5c4d37] hover:text-[#1a1410] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-[#7d6a4f]" />
            <span>Back to login</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mb-4 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
            Security Credentials
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
            Set New Password
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
            Create a strong password to restore and safeguard access to your account.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-xs font-mono text-[#7d6a4f] animate-pulse">
              Validating security token...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        {/* Footer Support Link */}
        <div className="mt-8 pt-5 border-t border-[#1a1410]/10 text-center">
          <p className="text-xs text-[#5c4d37]">
            Need further help?{' '}
            <a
              href="mailto:sxcmt.alumniassociation@gmail.com"
              className="font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}