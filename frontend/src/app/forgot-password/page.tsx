// 'use client';
// import React, { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// export default function ForgotPassword() {
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       toast.success('Check your email for the reset link! 📧');
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Failed to send link');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="card max-w-md w-full p-8 bg-white rounded-3xl shadow-xl">
//         <h2 className="text-2xl font-black text-slate-900 mb-2">Forgot Password? 🔑</h2>
//         <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send you a recovery link.</p>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input 
//             type="email" 
//             placeholder="your-email@gmail.com"
//             className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 font-bold"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
//           >
//             {loading ? 'Sending...' : 'Send Reset Link'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link'; // Naya import login par wapas jaane ke liye

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending recovery link... 📨');
    
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('Check your email for the reset link! ✨', { id: toastId });
      setEmail(''); // Success ke baad field clear kar do
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send link. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      {/* Background Subtle Glows (Premium Feel) */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div> */}

      {/* Main Card */}
      <div className="relative w-full max-w-md p-8 sm:p-10 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 z-10">
        
        {/* Header Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            {/* Pure SVG Envelope Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Forgot Password?</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Enter your email and we'll send you a secure recovery link.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. yourname@gmail.com"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-2 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                {/* SVG Loading Spinner */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SENDING...
              </>
            ) : 'SEND RESET LINK ✨'}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}