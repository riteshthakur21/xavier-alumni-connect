// import React from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// export default function Home() {
//   return (
//     <div className="min-h-screen">
//       {/* Hero Section */}
//       <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center">
//             <h1 className="text-5xl font-bold mb-6">
//               Welcome to AlumniConnect
//             </h1>
//             <p className="text-xl mb-8 opacity-90">
//               Connect with your alumni network, discover opportunities, and build lasting professional relationships
//             </p>
//             <div className="flex justify-center space-x-4">
//               <Link href="/register" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-secondary-100 transition-colors">
//                 Join Now
//               </Link>
//               <Link href="/directory" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
//                 Explore Directory
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12 text-secondary-800">
//             Why Join AlumniConnect?
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8">
//             <div className="card text-center">
//               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-3 text-secondary-800">Network & Connect</h3>
//               <p className="text-secondary-600">
//                 Build meaningful connections with alumni from your batch, department, or industry
//               </p>
//             </div>

//             <div className="card text-center">
//               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-3 text-secondary-800">Career Growth</h3>
//               <p className="text-secondary-600">
//                 Discover job opportunities and get mentorship from experienced professionals
//               </p>
//             </div>

//             <div className="card text-center">
//               <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-3 text-secondary-800">Events & Reunions</h3>
//               <p className="text-secondary-600">
//                 Stay updated with alumni events, reunions, and networking opportunities
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Statistics Section */}
//       <section className="bg-secondary-100 py-16">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl font-bold text-center mb-12 text-secondary-800">
//             Our Growing Community
//           </h2>
//           <div className="grid md:grid-cols-4 gap-8 text-center">
//             <div>
//               <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
//               <div className="text-secondary-600">Registered Alumni</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-primary-600 mb-2">20+</div>
//               <div className="text-secondary-600">Companies Represented</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-primary-600 mb-2">10+</div>
//               <div className="text-secondary-600">Batch Years</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold text-primary-600 mb-2">5+</div>
//               <div className="text-secondary-600">Departments</div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide shadow-sm">
            🎓 Welcome to Xavier's Network
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Connect with your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Alumni Network
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between graduation and professional success. 
            Discover opportunities, mentorship, and lifelong friendships.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 shadow-lg">
                <span className="mr-2">Go to Dashboard</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ) : (
              <Link href="/register" className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-md bg-blue-600 px-8 font-medium text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 shadow-lg">
                <span className="mr-2">Join Community</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
            <Link href="/directory" className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-8 font-medium text-slate-700 transition-all duration-300 hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5">
              Explore Directory
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Join AlumniConnect?</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">🤝</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Strong Networking</h3>
              <p className="text-slate-600">Connect with seniors and batchmates working in top companies globally.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">📅</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Exclusive Events</h3>
              <p className="text-slate-600">Get invited to reunions, tech talks, and career guidance workshops.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-pink-100 hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Career Growth</h3>
              <p className="text-slate-600">Find job referrals, mentorship opportunities, and internships easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---  OFFICIAL LINKS SECTION WITH IMAGES  --- */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect With Us</h2>
          <p className="text-slate-500 mb-12">Follow our official channels for updates</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* 1. College Website */}
            <a href="https://xup.ac.in/" target="_blank" rel="noopener noreferrer" 
               className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors p-3">
                {/* IMAGE TAG HERE */}
                <img src="/icons/school.png" alt="College Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-blue-600">Official Website</span>
              <span className="text-xs text-slate-400 mt-1">xavier.edu</span>
            </a>

            {/* 2. LinkedIn */}
            <a href="https://www.linkedin.com/in/xavier-alumni-association-541846322/" target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors p-3">
                {/* IMAGE TAG HERE */}
                <img src="/icons/linkedin.png" alt="LinkedIn" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-blue-700">LinkedIn</span>
              <span className="text-xs text-slate-400 mt-1">Professional Network</span>
            </a>

            {/* 3. Instagram */}
            <a href="https://www.instagram.com/xavieralumniassociation/" target="_blank" rel="noopener noreferrer"
               className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-pink-100 transition-colors p-3">
                {/* IMAGE TAG HERE */}
                <img src="/icons/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-pink-600">Instagram</span>
              <span className="text-xs text-slate-400 mt-1">@xavieralumni</span>
            </a>

            {/* 4. Contact Email */}
            <a href="mailto:sxcmt.alumniassociation@gmail.com"
               className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 group">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors p-3">
                {/* IMAGE TAG HERE */}
                <img src="/icons/email.png" alt="Email" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-700 group-hover:text-green-600">Contact Us</span>
              <span className="text-xs text-slate-400 mt-1">alumni@xaviers.edu</span>
            </a>

          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to reconnect?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join thousands of alumni who are already part of this growing community.
          </p>
          {!user && (
            <Link href="/register" className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
              Get Started for Free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}