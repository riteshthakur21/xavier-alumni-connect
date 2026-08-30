'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Clock, XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

function GoogleAuthErrorInner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const isPending = reason === 'pending';
  const isRejected = reason === 'rejected';

  const title = isPending
    ? 'Account Pending Approval'
    : isRejected
    ? 'Registration Not Approved'
    : 'Google Sign-in Failed';

  const message = isPending
    ? 'Your alumni registration was submitted successfully and is pending verification by college administrators. You will receive an email once approved.'
    : isRejected
    ? 'Your alumni account application was not approved. Please contact the alumni association office or administration for further details.'
    : 'We were unable to complete your Google sign-in. Please try again or use your email and password to log in.';

  return (
    <div className="max-w-md w-full rounded-2xl border border-[#1a1410]/12 bg-white p-7 sm:p-9 text-center shadow-sm">
      {/* Icon Badge */}
      <div className="mb-4">
        {isPending ? (
          <div className="w-12 h-12 rounded-xl bg-[#fdf8ed] border border-[#c4821a]/30 text-[#c4821a] flex items-center justify-center mx-auto shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
        ) : isRejected ? (
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
            <XCircle className="w-6 h-6" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-[#261f15] border border-[#3d3222] text-[#e8a93c] flex items-center justify-center mx-auto shadow-sm">
            <AlertCircle className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-[#c4821a] mb-1 font-medium">
        Authentication Notice
      </div>
      <h1 className="text-2xl font-normal font-serif text-[#1a1410] tracking-tight mb-2">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-[#5c4d37] leading-relaxed mb-7">
        {message}
      </p>

      <div className="space-y-3">
        <Link
          href="/login"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a1410] hover:bg-[#3d3222] active:bg-[#1a1410] px-5 py-3 text-sm font-semibold text-[#f4efe6] border border-[#3d3222]/50 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sign In</span>
        </Link>

        {isRejected && (
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#c4821a] hover:text-[#e8a93c] transition-colors pt-2"
          >
            <span>Submit a new registration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Footer Support Link */}
      <div className="mt-8 pt-5 border-t border-[#1a1410]/10 text-center">
        <p className="text-xs text-[#5c4d37]">
          Need help?{' '}
          <a
            href="mailto:sxcmt.alumniassociation@gmail.com"
            className="font-semibold text-[#1a1410] hover:text-[#c4821a] transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function GoogleAuthError() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#f4efe6] text-[#1a1410] px-4 py-8 selection:bg-[#c4821a]/20 selection:text-[#1a1410]">
      <Suspense
        fallback={
          <div className="max-w-md w-full rounded-2xl border border-[#1a1410]/12 bg-white p-8 text-center shadow-sm text-xs font-mono text-[#7d6a4f] animate-pulse">
            Loading notification details...
          </div>
        }
      >
        <GoogleAuthErrorInner />
      </Suspense>
    </div>
  );
}
