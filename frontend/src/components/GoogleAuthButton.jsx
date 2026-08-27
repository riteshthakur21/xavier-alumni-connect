'use client';

import React from 'react';

export default function GoogleAuthButton({ text = 'Continue with Google' }) {
  const handleClick = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const apiRoot = apiBase.replace('/api', '');
    window.location.href = `${apiRoot}/api/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#1a1410]/15 bg-white py-3 px-4 text-sm font-semibold text-[#1a1410] shadow-sm hover:bg-[#f4efe6] hover:border-[#1a1410]/25 hover:shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#152744]/20"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" className="flex-shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.22l6.86-6.86C36.14 2.54 30.4 0 24 0 14.6 0 6.48 5.38 2.44 13.22l8.02 6.22C12.34 13.04 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24c0-1.64-.16-3.22-.45-4.75H24v9.02h12.65c-.54 2.92-2.18 5.4-4.67 7.07l7.14 5.54C43.72 36.76 46.5 30.86 46.5 24z" />
        <path fill="#FBBC05" d="M10.46 28.44a14.5 14.5 0 0 1 0-8.88l-8.02-6.22A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.44 10.66l8.02-6.22z" />
        <path fill="#34A853" d="M24 48c6.4 0 12.14-2.1 16.2-5.68l-7.14-5.54c-1.98 1.34-4.52 2.12-9.06 2.12-6.3 0-11.66-3.54-13.54-8.94l-8.02 6.22C6.48 42.62 14.6 48 24 48z" />
      </svg>
      <span>{text}</span>
    </button>
  );
}
