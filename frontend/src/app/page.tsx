// 'use client';

// import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
// import StoriesFeed from '@/components/stories/StoriesFeed';
// import SeeMoreButton from '@/components/stories/SeeMoreButton';

// // ─── Stat Counter Card ────────────────────────────────────────────────────────
// function StatCard({ number, label, icon }) {
//   return (
//     <div className="group flex flex-col items-center gap-1 px-6 py-4
//                     bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80
//                     shadow-sm hover:shadow-md hover:-translate-y-0.5
//                     transition-all duration-300 min-w-[120px]">
//       <span className="text-lg mb-0.5">{icon}</span>
//       <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
//         {number}
//       </span>
//       <span className="text-xs text-slate-500 font-medium text-center leading-tight">
//         {label}
//       </span>
//     </div>
//   );
// }

// // ─── Feature Card ─────────────────────────────────────────────────────────────
// function FeatureCard({ emoji, title, desc, accent }) {
//   const accents = {
//     blue:   { wrap: 'hover:border-blue-100',   icon: 'bg-blue-100',   text: 'group-hover:text-blue-600'   },
//     violet: { wrap: 'hover:border-violet-100', icon: 'bg-violet-100', text: 'group-hover:text-violet-600' },
//     rose:   { wrap: 'hover:border-rose-100',   icon: 'bg-rose-100',   text: 'group-hover:text-rose-600'   },
//   };
//   const a = accents[accent] || accents.blue;
//   return (
//     <div className={`group p-7 rounded-2xl bg-slate-50 border border-slate-100
//                      ${a.wrap} hover:bg-white hover:shadow-xl
//                      transition-all duration-300 cursor-default`}>
//       <div className={`w-14 h-14 ${a.icon} rounded-xl flex items-center
//                        justify-center text-2xl mb-5
//                        group-hover:scale-110 transition-transform duration-300`}>
//         {emoji}
//       </div>
//       <h3 className={`text-lg font-bold text-slate-900 mb-2 ${a.text} transition-colors`}>
//         {title}
//       </h3>
//       <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
//     </div>
//   );
// }

// // ─── Social Link Card ─────────────────────────────────────────────────────────
// function SocialCard({ href, icon, label, sub, hoverColor, bgColor }) {
//   return (
//     <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'}
//        rel="noopener noreferrer"
//        className={`flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm
//                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5
//                    border border-slate-100 group`}>
//       <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center
//                        justify-center mb-3 p-3
//                        group-hover:scale-110 transition-transform duration-300`}>
//         <img src={icon} alt={label} className="w-full h-full object-contain" />
//       </div>
//       <span className={`font-bold text-sm text-slate-700 ${hoverColor} transition-colors`}>
//         {label}
//       </span>
//       <span className="text-xs text-slate-400 mt-0.5">{sub}</span>
//     </a>
//   );
// }

// // ─── Page ─────────────────────────────────────────────────────────────────────
// export default function Home() {
//   const { user } = useAuth();

//   return (
//     <div className="min-h-screen bg-[#f8f9fc]">

//       {/* ══════════════════════════════════════════════
//           HERO SECTION
//       ══════════════════════════════════════════════ */}
//       <section className="relative overflow-hidden pt-24 pb-28 sm:pt-28 sm:pb-36">

//         {/* Ambient blobs */}
//         <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
//           <div className="absolute -top-32 -left-32 w-[500px] h-[500px]
//                           bg-blue-300 rounded-full mix-blend-multiply
//                           filter blur-[120px] opacity-25 animate-blob" />
//           <div className="absolute -top-20 right-0 w-[400px] h-[400px]
//                           bg-indigo-300 rounded-full mix-blend-multiply
//                           filter blur-[100px] opacity-20 animate-blob animation-delay-2000" />
//           <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px]
//                           bg-violet-300 rounded-full mix-blend-multiply
//                           filter blur-[100px] opacity-15 animate-blob animation-delay-4000" />
//         </div>

//         {/* Grid texture overlay */}
//         <div aria-hidden
//              className="absolute inset-0 pointer-events-none"
//              style={{
//                backgroundImage: `linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px),
//                                   linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)`,
//                backgroundSize: '40px 40px',
//              }} />

//         <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

//           {/* Badge */}
//           <div className="animate-fade-in-up inline-flex items-center gap-2
//                           px-4 py-1.5 mb-7 rounded-full
//                           bg-gradient-to-r from-blue-50 to-indigo-50
//                           border border-blue-100 shadow-sm">
//             <span className="relative flex h-2 w-2">
//               <span className="animate-ping absolute inline-flex h-full w-full
//                                rounded-full bg-blue-400 opacity-75" />
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
//             </span>
//             <span className="text-blue-600 text-sm font-semibold tracking-wide">
//               Xavier's Alumni Network — Est. 2013
//             </span>
//           </div>

//           {/* Headline */}
//           <h1 className="animate-fade-in-up animation-delay-150
//                          text-5xl sm:text-6xl md:text-7xl font-black
//                          text-slate-900 tracking-tight leading-[1.08] mb-6">
//             Where Xaverians
//             <br />
//             <span className="relative inline-block mt-1">
//               <span className="text-transparent bg-clip-text
//                                bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600">
//                 Stay Connected
//               </span>
//               {/* Underline accent */}
//               <svg aria-hidden className="absolute -bottom-2 left-0 w-full"
//                    viewBox="0 0 300 8" preserveAspectRatio="none">
//                 <path d="M0,5 Q75,0 150,5 Q225,10 300,5"
//                       fill="none" stroke="url(#uline)" strokeWidth="3"
//                       strokeLinecap="round" />
//                 <defs>
//                   <linearGradient id="uline" x1="0" y1="0" x2="1" y2="0">
//                     <stop offset="0%" stopColor="#3b82f6" />
//                     <stop offset="100%" stopColor="#8b5cf6" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//             </span>
//           </h1>

//           {/* Subtext */}
//           <p className="animate-fade-in-up animation-delay-300
//                         text-lg sm:text-xl text-slate-500 mb-10
//                         max-w-2xl mx-auto leading-relaxed font-light">
//             Bridge the gap between graduation and success.
//             Discover opportunities, mentorship, and lifelong friendships
//             — all in one place.
//           </p>

//           {/* CTA Buttons */}
//           <div className="animate-fade-in-up animation-delay-500
//                           flex flex-col sm:flex-row justify-center gap-4 mb-14">
//             {user ? (
//               <Link href="/dashboard"
//                     className="group inline-flex h-13 items-center justify-center
//                                rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
//                                px-8 py-3.5 font-semibold text-white text-base
//                                shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
//                                hover:scale-[1.03] active:scale-[0.98]
//                                transition-all duration-200">
//                 Go to Dashboard
//                 <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
//                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </Link>
//             ) : (
//               <Link href="/register"
//                     className="group inline-flex h-13 items-center justify-center
//                                rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
//                                px-8 py-3.5 font-semibold text-white text-base
//                                shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
//                                hover:scale-[1.03] active:scale-[0.98]
//                                transition-all duration-200">
//                 Join the Community
//                 <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
//                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </Link>
//             )}
//             <Link href="/directory"
//                   className="inline-flex h-13 items-center justify-center rounded-xl
//                              border-2 border-slate-200 bg-white px-8 py-3.5
//                              font-semibold text-slate-600 text-base
//                              hover:border-blue-300 hover:text-blue-600
//                              hover:shadow-md hover:-translate-y-0.5
//                              transition-all duration-200">
//               Explore Directory
//             </Link>
//           </div>

//           {/* Stats Row */}
//           <div className="animate-fade-in-up animation-delay-700
//                           flex flex-wrap justify-center gap-3">
//             <StatCard number="500+" label="Alumni Connected"  icon="🎓" />
//             <StatCard number="20+" label="Events Hosted"     icon="📅" />
//             <StatCard number="5+"  label="Departments"       icon="🏛️" />
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════
//           FEATURES SECTION
//       ══════════════════════════════════════════════ */}
//       <section className="py-20 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//           <div className="text-center mb-14">
//             <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
//               Why AlumniConnect?
//             </p>
//             <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
//               Everything you need to grow
//             </h2>
//             <div className="w-14 h-1 bg-gradient-to-r from-blue-500 to-indigo-500
//                             mx-auto rounded-full" />
//           </div>

//           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
//             <FeatureCard
//               emoji="🤝" accent="blue"
//               title="Strong Networking"
//               desc="Connect with seniors and batchmates working in top companies globally. Build relationships that last a lifetime." />
//             <FeatureCard
//               emoji="📅" accent="violet"
//               title="Exclusive Events"
//               desc="Get invited to reunions, tech talks, and career guidance workshops curated for Xaverians." />
//             <FeatureCard
//               emoji="🚀" accent="rose"
//               title="Career Growth"
//               desc="Find job referrals, mentorship opportunities, and internships — all through your trusted alumni network." />
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════
//           ALUMNI STORIES SECTION
//       ══════════════════════════════════════════════ */}
//       <section className="py-20 bg-gradient-to-b from-slate-50 to-white
//                           border-t border-slate-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//           {/* Section header */}
//           <div className="flex flex-col sm:flex-row sm:items-end
//                           justify-between gap-4 mb-10">
//             <div>
//               <p className="text-blue-600 text-sm font-semibold
//                             uppercase tracking-widest mb-2">
//                 Community
//               </p>
//               <h2 className="text-3xl sm:text-4xl font-black text-slate-900
//                              leading-tight">
//                 Alumni Stories
//               </h2>
//               <p className="text-slate-400 mt-2 text-sm">
//                 Real journeys. Real inspiration.
//               </p>
//             </div>
//             {/* Decorative pill tags */}
//             <div className="flex gap-2 flex-wrap">
//               {['Career', 'Growth', 'Mentorship', 'Success'].map((tag) => (
//                 <span key={tag}
//                       className="px-3 py-1 text-xs font-semibold rounded-full
//                                  bg-blue-50 text-blue-600 border border-blue-100">
//                   {tag}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Horizontal scroll stories feed */}
//           <StoriesFeed previewMode={true} currentUser={user} />

//           {/* See More */}
//           <div className="mt-10 flex justify-center">
//             <SeeMoreButton />
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════
//           CONNECT WITH US SECTION
//       ══════════════════════════════════════════════ */}
//       <section className="py-16 bg-white border-t border-slate-100">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <p className="text-blue-600 text-sm font-semibold
//                         uppercase tracking-widest mb-2">
//             Stay Updated
//           </p>
//           <h2 className="text-3xl font-black text-slate-900 mb-2">
//             Connect With Us
//           </h2>
//           <p className="text-slate-400 mb-10 text-sm">
//             Follow our official channels for the latest updates
//           </p>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
//             <SocialCard
//               href="https://xup.ac.in/" icon="/icons/school.png"
//               label="Official Website" sub="xavier.edu"
//               bgColor="bg-blue-50" hoverColor="group-hover:text-blue-600" />
//             <SocialCard
//               href="https://www.linkedin.com/in/xavier-alumni-association-541846322/"
//               icon="/icons/linkedin.png" label="LinkedIn" sub="Professional Network"
//               bgColor="bg-sky-50" hoverColor="group-hover:text-sky-700" />
//             <SocialCard
//               href="https://www.instagram.com/xavieralumniassociation/"
//               icon="/icons/instagram.png" label="Instagram" sub="@xavieralumni"
//               bgColor="bg-pink-50" hoverColor="group-hover:text-pink-600" />
//             <SocialCard
//               href="mailto:sxcmt.alumniassociation@gmail.com"
//               icon="/icons/email.png" label="Contact Us" sub="Get in touch"
//               bgColor="bg-emerald-50" hoverColor="group-hover:text-emerald-600" />
//           </div>
//         </div>
//       </section>

//       {/* ══════════════════════════════════════════════
//           FOOTER CTA
//       ══════════════════════════════════════════════ */}
//       <section className="relative overflow-hidden py-24 bg-slate-950 text-white text-center">
//         {/* Glow */}
//         <div aria-hidden
//              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
//                         w-[600px] h-[300px] bg-blue-600/20
//                         rounded-full filter blur-[100px] pointer-events-none" />
//         <div className="relative z-10 max-w-3xl mx-auto px-4">
//           <div className="inline-block px-4 py-1 mb-6 rounded-full
//                           bg-white/10 border border-white/10
//                           text-white/70 text-xs font-semibold tracking-widest uppercase">
//             Join the Network
//           </div>
//           <h2 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
//             Ready to reconnect
//             <span className="text-transparent bg-clip-text
//                              bg-gradient-to-r from-blue-400 to-violet-400">
//               ?
//             </span>
//           </h2>
//           <p className="text-slate-400 mb-10 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
//             Join thousands of alumni who are already part of
//             this growing community.
//           </p>
//           {!user && (
//             <Link href="/register"
//                   className="inline-flex items-center gap-2
//                              bg-white text-slate-900 px-8 py-3.5 rounded-full
//                              font-bold text-base hover:bg-blue-50
//                              transition-all duration-200 shadow-lg
//                              hover:shadow-2xl hover:-translate-y-0.5">
//               Get Started — It's Free
//               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
//                    stroke="currentColor" strokeWidth="2.5">
//                 <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round"
//                       strokeLinejoin="round"/>
//               </svg>
//             </Link>
//           )}
//         </div>
//       </section>

//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import StoriesFeed from '@/components/stories/StoriesFeed';
import SeeMoreButton from '@/components/stories/SeeMoreButton';
import {
  Users,
  CalendarDays,
  Rocket,
  Handshake,
  GraduationCap,
  Building2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

// ─── Stat Counter Card ────────────────────────────────────────────────────────
function StatCard({ number, label, Icon, iconColor, iconBg }) {
  return (
    <div className="group flex flex-col items-center gap-1.5 px-6 py-5
                    bg-white/80 backdrop-blur-sm rounded-2xl border border-white/90
                    shadow-sm hover:shadow-lg hover:-translate-y-1
                    transition-all duration-300 w-full">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-1
                       group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
        {number}
      </span>
      <span className="text-xs text-slate-500 font-medium text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ Icon, title, desc, accent }) {
  const accents = {
    blue: { wrap: 'hover:border-blue-100', icon: 'bg-blue-50 text-blue-600', title: 'group-hover:text-blue-600', ring: 'group-hover:bg-blue-100' },
    violet: { wrap: 'hover:border-violet-100', icon: 'bg-violet-50 text-violet-600', title: 'group-hover:text-violet-600', ring: 'group-hover:bg-violet-100' },
    rose: { wrap: 'hover:border-rose-100', icon: 'bg-rose-50 text-rose-600', title: 'group-hover:text-rose-600', ring: 'group-hover:bg-rose-100' },
  };
  const a = accents[accent] || accents.blue;
  return (
    <div className={`group p-7 rounded-2xl bg-slate-50 border border-slate-100
                     ${a.wrap} hover:bg-white hover:shadow-xl
                     transition-all duration-300 cursor-default`}>
      <div className={`w-14 h-14 ${a.icon} ${a.ring} rounded-xl flex items-center
                       justify-center mb-5 transition-all duration-300
                       group-hover:scale-110`}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className={`text-lg font-bold text-slate-900 mb-2 ${a.title} transition-colors`}>
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Social Link Card ─────────────────────────────────────────────────────────
function SocialCard({ href, icon, label, sub, hoverColor, bgColor }) {
  return (
    <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm
                  hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5
                  border border-slate-100 group">
      <div className={`w-14 h-14 ${bgColor} rounded-full flex items-center
                       justify-center mb-3 p-3
                       group-hover:scale-110 transition-transform duration-300`}>
        <img src={icon} alt={label} className="w-full h-full object-contain" />
      </div>
      <span className={`font-bold text-sm text-slate-700 ${hoverColor} transition-colors`}>
        {label}
      </span>
      <span className="text-xs text-slate-400 mt-0.5">{sub}</span>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8f9fc]">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-24 pb-28 sm:pt-28 sm:pb-36">

        {/* Ambient blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px]
                          bg-blue-300 rounded-full mix-blend-multiply
                          filter blur-[120px] opacity-25 animate-blob" />
          <div className="absolute -top-20 right-0 w-[400px] h-[400px]
                          bg-indigo-300 rounded-full mix-blend-multiply
                          filter blur-[100px] opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px]
                          bg-violet-300 rounded-full mix-blend-multiply
                          filter blur-[100px] opacity-15 animate-blob animation-delay-4000" />
        </div>

        {/* Grid texture overlay */}
        <div aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2
                          px-4 py-1.5 mb-7 rounded-full
                          bg-gradient-to-r from-blue-50 to-indigo-50
                          border border-blue-100 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full
                               rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-blue-600 text-sm font-semibold tracking-wide">
              Xavier's Alumni Network — Est. 2013
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-150
                         text-5xl sm:text-6xl md:text-7xl font-black
                         text-slate-900 tracking-tight leading-[1.08] mb-6">
            Where Xaverians
            <br />
            <span className="relative inline-block mt-1">
              <span className="text-transparent bg-clip-text
                               bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600">
                Stay Connected
              </span>
              {/* Underline accent */}
              <svg aria-hidden className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 8" preserveAspectRatio="none">
                <path d="M0,5 Q75,0 150,5 Q225,10 300,5"
                  fill="none" stroke="url(#uline)" strokeWidth="3"
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="uline" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in-up animation-delay-300
                        text-lg sm:text-xl text-slate-500 mb-10
                        max-w-2xl mx-auto leading-relaxed font-light">
            Bridge the gap between graduation and success.
            Discover opportunities, mentorship, and lifelong friendships
            — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up animation-delay-500
                          flex flex-col sm:flex-row justify-center gap-4 mb-14">
            {user ? (
              <Link href="/dashboard"
                className="group inline-flex items-center justify-center
                               rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                               px-8 py-3.5 font-semibold text-white text-base
                               shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
                               hover:scale-[1.03] active:scale-[0.98]
                               transition-all duration-200">
                Go to Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link href="/register"
                className="group inline-flex items-center justify-center
                               rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                               px-8 py-3.5 font-semibold text-white text-base
                               shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300
                               hover:scale-[1.03] active:scale-[0.98]
                               transition-all duration-200">
                Join the Community
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link href="/directory"
              className="inline-flex items-center justify-center rounded-xl
                             border-2 border-slate-200 bg-white px-8 py-3.5
                             font-semibold text-slate-600 text-base
                             hover:border-blue-300 hover:text-blue-600
                             hover:shadow-md hover:-translate-y-0.5
                             transition-all duration-200">
              Explore Directory
            </Link>
          </div>

          {/* Stats Row — now 4 cards including Students */}
          {/* Stats Row */}
          <div className="animate-fade-in-up animation-delay-700
        grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto w-full">
            <StatCard
              number="500+"
              label="Alumni Connected"
              Icon={GraduationCap}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <StatCard
              number="200+"
              label="Students"
              Icon={BookOpen}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
            />
            <StatCard
              number="20+"
              label="Events Hosted"
              Icon={CalendarDays}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <StatCard
              number="5+"
              label="Departments"
              Icon={Building2}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
              Why AlumniConnect?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Everything you need to grow
            </h2>
            <div className="w-14 h-1 bg-gradient-to-r from-blue-500 to-indigo-500
                            mx-auto rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <FeatureCard
              Icon={Handshake}
              accent="blue"
              title="Strong Networking"
              desc="Connect with seniors and batchmates working in top companies globally. Build relationships that last a lifetime."
            />
            <FeatureCard
              Icon={CalendarDays}
              accent="violet"
              title="Exclusive Events"
              desc="Get invited to reunions, tech talks, and career guidance workshops curated for Xaverians."
            />
            <FeatureCard
              Icon={Rocket}
              accent="rose"
              title="Career Growth"
              desc="Find job referrals, mentorship opportunities, and internships — all through your trusted alumni network."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          ALUMNI STORIES SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white
                          border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end
                          justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-600 text-sm font-semibold
                            uppercase tracking-widest mb-2">
                Community
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Alumni Stories
              </h2>
              <p className="text-slate-400 mt-2 text-sm">
                Real journeys. Real inspiration.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['Career', 'Growth', 'Mentorship', 'Success'].map((tag) => (
                <span key={tag}
                  className="px-3 py-1 text-xs font-semibold rounded-full
                                 bg-blue-50 text-blue-600 border border-blue-100">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <StoriesFeed previewMode={true} currentUser={user} />

          <div className="mt-10 flex justify-center">
            <SeeMoreButton />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONNECT WITH US SECTION
      ══════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest mb-2">
            Stay Updated
          </p>
          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Connect With Us
          </h2>
          <p className="text-slate-400 mb-10 text-sm">
            Follow our official channels for the latest updates
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
            <SocialCard
              href="https://xup.ac.in/" icon="/icons/school.png"
              label="Official Website" sub="xavier.edu"
              bgColor="bg-blue-50" hoverColor="group-hover:text-blue-600" />
            <SocialCard
              href="https://www.linkedin.com/in/xavier-alumni-association-541846322/"
              icon="/icons/linkedin.png" label="LinkedIn" sub="Professional Network"
              bgColor="bg-sky-50" hoverColor="group-hover:text-sky-700" />
            <SocialCard
              href="https://www.instagram.com/xavieralumniassociation/"
              icon="/icons/instagram.png" label="Instagram" sub="@xavieralumni"
              bgColor="bg-pink-50" hoverColor="group-hover:text-pink-600" />
            <SocialCard
              href="mailto:sxcmt.alumniassociation@gmail.com"
              icon="/icons/email.png" label="Contact Us" sub="Get in touch"
              bgColor="bg-emerald-50" hoverColor="group-hover:text-emerald-600" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER CTA
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-slate-950 text-white text-center">
        <div aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[300px] bg-blue-600/20
                        rounded-full filter blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full
                          bg-white/10 border border-white/10
                          text-white/70 text-xs font-semibold tracking-widest uppercase">
            <Users className="w-3.5 h-3.5" />
            Join the Network
          </div>
          <h2 className="text-4xl sm:text-5xl font-black mb-5 leading-tight">
            Ready to reconnect
            <span className="text-transparent bg-clip-text
                             bg-gradient-to-r from-blue-400 to-violet-400">
              ?
            </span>
          </h2>
          <p className="text-slate-400 mb-10 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Join thousands of alumni who are already part of this growing community.
          </p>
          {!user && (
            <Link href="/register"
              className="inline-flex items-center gap-2
                             bg-white text-slate-900 px-8 py-3.5 rounded-full
                             font-bold text-base hover:bg-blue-50
                             transition-all duration-200 shadow-lg
                             hover:shadow-2xl hover:-translate-y-0.5">
              Get Started — It's Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}