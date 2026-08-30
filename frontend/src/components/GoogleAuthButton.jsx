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
      className="w-full flex items-center justify-center gap-3 rounded-xl border border-[#1a1410]/15 bg-white py-3 px-4 text-sm font-semibold text-[#1a1410] shadow-sm hover:bg-[#f4efe6] hover:border-[#1a1410]/25 hover:shadow transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a1410]/20"
    >
      <img
        src="/Google_Favicon_2025.svg"
        alt="Google"
        width={18}
        height={18}
        className="flex-shrink-0"
      />
      <span>{text}</span>
    </button>
  );
}
