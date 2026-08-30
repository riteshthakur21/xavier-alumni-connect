'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  Mail,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Unable to send reset link. Please verify your email and try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410] px-4 sm:px-6 py-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      {/* Main Card Container */}
      <div className="relative w-full max-w-md p-7 sm:p-9 bg-white rounded-2xl border border-[#1a1410]/12 shadow-sm z-10">
        {/* Top Back to Login Link */}
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
            <KeyRound className="w-6 h-6" />
          </div>

          <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
            Account Recovery
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal font-serif text-[#1a1410] tracking-tight">
            Forgot your password?
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5c4d37] leading-relaxed">
            Enter your registered email address below, and we will send you a secure link to reset your account password.
          </p>
        </div>

        {/* Success State Notification */}
        {submitted ? (
          <div className="rounded-xl border border-[#3a5c3e]/30 bg-[#3a5c3e]/10 p-5 shadow-sm space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#3a5c3e] text-[#f4efe6] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-[#f4efe6]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[#1a1410] font-serif tracking-tight">
                  Recovery Email Sent
                </h3>
                <p className="mt-1 text-xs text-[#5c4d37] leading-relaxed">
                  We have dispatched password recovery instructions to{' '}
                  <span className="font-semibold text-[#1a1410]">{email}</span>.
                </p>
                <p className="mt-2 text-[11px] text-[#7d6a4f]">
                  Please check your inbox (including spam folder) and follow the link to complete the reset.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3a5c3e]/20 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors inline-flex items-center gap-1"
              >
                <span>Need to use a different email?</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error Banner */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 shadow-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="recovery-email"
                className="block text-[11px] font-mono font-medium text-[#3d3222] uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7d6a4f]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="recovery-email"
                  name="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@college.edu or personal email"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1a1410]/15 text-sm text-[#1a1410] rounded-xl placeholder-[#7d6a4f]/60 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#c4821a]/20 focus:border-[#1a1410] hover:border-[#1a1410]/30"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim()}
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
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Support Link */}
        <div className="mt-8 pt-5 border-t border-[#1a1410]/10 text-center">
          <p className="text-xs text-[#5c4d37]">
            Remember your credentials?{' '}
            <Link
              href="/login"
              className="font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}