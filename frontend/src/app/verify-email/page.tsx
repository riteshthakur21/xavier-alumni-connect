'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isExpiredOtp, setIsExpiredOtp] = useState(false);

  const otpValue = useMemo(() => otp.join(''), [otp]);
  const isOtpComplete = otpValue.length === 6;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError('');
    setIsExpiredOtp(false);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const nextOtp = [...otp];
      if (nextOtp[index]) {
        nextOtp[index] = '';
        setOtp(nextOtp);
        return;
      }
      if (index > 0) {
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const nextOtp = ['','','','','',''];
    pasted.split('').forEach((digit, index) => {
      if (index < 6) nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    setError('');
    setIsExpiredOtp(false);

    const nextFocusIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!email) {
      setError('Missing email. Please register again.');
      return;
    }
    if (!isOtpComplete) return;

    setIsLoading(true);
    setError('');
    setIsExpiredOtp(false);

    try {
      await axios.post('/api/auth/verify-email', { email, otp: otpValue });
      setIsVerified(true);
      setTimeout(() => {
        router.push('/login?message=verified');
      }, 2000);
    } catch (err: any) {
      const apiError = err?.response?.data?.error || 'Verification failed. Please try again.';
      if (apiError.toLowerCase().includes('invalid otp')) {
        setError('Invalid OTP. Please check the code and try again.');
      } else if (apiError.toLowerCase().includes('otp expired')) {
        setError('Your OTP has expired. Request a new one.');
        setIsExpiredOtp(true);
      } else {
        setError(apiError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/resend-otp', { email });
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setIsExpiredOtp(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const apiError = err?.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>

      <div className="w-full max-w-[440px] rounded-2xl border border-[#E2E8F0] shadow-sm p-8 bg-white text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-[#FDF8ED] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V7.5Z" stroke="#C9A84C" strokeWidth="1.5" />
            <path d="M5 7L12 12L19 7" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-[2rem] leading-none mb-3 text-[#09192E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Check your inbox
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          We&apos;ve sent a 6-digit verification code to{' '}
          <span className="font-semibold text-[#C9A84C] break-all">{email || 'your email'}</span>. It expires in 10 minutes.
        </p>

        {isVerified ? (
          <div className="py-4">
            <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center" style={{ animation: 'scaleIn 0.25s ease-out' }}>
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-green-700">Email Verified!</p>
            <p className="text-sm text-slate-500 mt-1">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-2 mb-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="text-center text-xl font-semibold text-[#09192E] outline-none transition-all"
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: 8,
                    border: '1.5px solid #CBD5E1',
                    boxShadow: 'none',
                    backgroundColor: digit ? '#FDF8ED' : '#FFFFFF'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84C';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(201,168,76,0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 mb-3">
                {error}
              </p>
            )}

            {!isExpiredOtp ? (
              <button
                onClick={handleVerify}
                disabled={isLoading || !isOtpComplete}
                className="w-full h-[50px] rounded-lg font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#C9A84C', color: '#09192E' }}
                type="button"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </button>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading || resendCooldown > 0}
                className="w-full h-[50px] rounded-lg font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#C9A84C', color: '#09192E' }}
                type="button"
              >
                Request New OTP
              </button>
            )}

            <p className="mt-4 text-sm text-slate-600">
              Didn&apos;t receive it?{' '}
              {resendCooldown > 0 ? (
                <span className="text-slate-400">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="font-semibold hover:underline disabled:opacity-60"
                  style={{ color: '#C9A84C' }}
                >
                  Resend OTP
                </button>
              )}
            </p>
          </>
        )}

        <div className="mt-6">
          <Link href="/register" className="text-sm text-slate-500 hover:text-[#09192E]">
            &larr; Back to Register
          </Link>
        </div>
      </div>
    </div>
  );
}
