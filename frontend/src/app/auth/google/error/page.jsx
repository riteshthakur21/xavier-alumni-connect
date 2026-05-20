'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GoogleAuthError() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const message =
    reason === 'pending'
      ? "Your account is pending admin approval. You'll receive an email once approved."
      : reason === 'rejected'
      ? 'Your account application was not approved. Please contact the college administration.'
      : 'We could not complete Google sign-in. Please try again.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-secondary-900 mb-3">Google sign-in failed</h1>
        <p className="text-sm text-secondary-600 mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
