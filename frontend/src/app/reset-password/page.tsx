// 'use client';
// import React, { useState } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// export default function ResetPassword() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get('token'); // URL se token nikalne ke liye
  
//   const [newPassword, setNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!token) return toast.error('Token missing! ❌');
    
//     setLoading(true);
//     try {
//       await axios.post('http://localhost:5000/api/auth/reset-password', { token, newPassword });
//       toast.success('Password updated! Redirecting to login... ✅');
//       setTimeout(() => router.push('/login'), 2000);
//     } catch (err: any) {
//       toast.error(err.response?.data?.error || 'Reset failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50">
//       <div className="card max-w-md w-full p-8 bg-white rounded-3xl shadow-xl">
//         <h2 className="text-2xl font-black text-slate-900 mb-6">Set New Password 🆕</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input 
//             type="password" 
//             placeholder="Enter new password"
//             className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 font-bold"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             required
//             minLength={6}
//           />
//           <button 
//             type="submit" 
//             disabled={loading}
//             className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg"
//           >
//             {loading ? 'Updating...' : 'Reset Password'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token'); 
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ✅ Naya state for confirm
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error('Token missing or invalid! ❌');
    
    // 🛡️ SECURITY CHECK: Dono password match hone chahiye
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match! Please check again. 🕵️‍♂️');
    }

    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long. 📏');
    }
    
    setLoading(true);
    const toastId = toast.loading('Securing your account... 🔐');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { token, newPassword });
      toast.success('Password updated successfully! 🎉', { id: toastId });
      
      // Redirect to login after a short delay
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reset password. Link might be expired.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      {/* Background Subtle Glows (Premium Feel) */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div> */}
      {/* <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div> */}

      {/* Main Card */}
      <div className="relative w-full max-w-md p-8 sm:p-10 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 z-10">
        
        {/* Header Area */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            {/* Pure SVG Lock Icon (Fail-Proof) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Set New Password</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">Create a strong password to secure your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* New Password Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">New Password</label>
            <input 
              type="password" 
              placeholder="•••••••••••"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 tracking-widest"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 ml-1">Confirm Password</label>
            <input 
              type="password" 
              placeholder="•••••••••••"
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 tracking-widest"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
                {/* Pure SVG Loading Spinner */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                UPDATING...
              </>
            ) : 'RESET PASSWORD ✨'}
          </button>
        </form>
      </div>
    </div>
  );
}