'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  profile: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  admin: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  directory: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  jobs: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  events: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  messages: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevron: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
};

// ─── Explore dropdown items — add future features here ───────────────────────
const EXPLORE_ITEMS = [
  {
    href: '/jobs',
    label: 'Jobs & Careers',
    desc: 'Opportunities & referrals',
    icon: Icons.jobs,
  },
  {
    href: '/events',
    label: 'Events',
    desc: 'Reunions, talks & workshops',
    icon: Icons.events,
  },
  {
    href: '/chat',
    label: 'Messages',
    desc: 'Chat with alumni & students',
    icon: Icons.messages,
    authRequired: true,
  },
  // Add new features here ↓
];

// ─── NavLink ──────────────────────────────────────────────────────────────────
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className, onClick, mobile }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  const base = mobile
    ? 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-sm'
    : 'text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg';
  const active = mobile ? 'bg-blue-50 text-blue-600' : 'text-blue-700 bg-blue-50';
  const inactive = mobile
    ? 'text-slate-600 hover:bg-slate-50'
    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50';

  return (
    <Link href={href} onClick={onClick}
      className={[base, isActive ? active : inactive, className || ''].join(' ')}
      aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
};

// ─── Desktop Explore Dropdown ─────────────────────────────────────────────────
const ExploreDropdown: React.FC<{ user: any }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const visible = EXPLORE_ITEMS.filter((i) => !i.authRequired || user);
  const isAnyActive = visible.some((i) => pathname.startsWith(i.href));

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-sm font-semibold transition-all duration-200
                    px-3 py-1.5 rounded-lg
                    ${isAnyActive
            ? 'text-blue-700 bg-blue-50'
            : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}`}
      >
        Explore
        <span className={`mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          {Icons.chevron}
        </span>
      </button>

      {/* Dropdown */}
      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-56
                       bg-white rounded-xl shadow-lg border border-slate-100
                       py-1.5 z-50 transition-all duration-150 origin-top
                       ${open
          ? 'opacity-100 scale-y-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'}`}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2
                        bg-white border-l border-t border-slate-100 rotate-45" />
        {visible.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-1 rounded-lg
                              transition-colors duration-150 group
                              ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <span className={`flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`}>
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{item.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  const handleLogout = async () => { await logout(); setMenuOpen(false); };

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const rawPhoto = user?.alumniProfile?.photoUrl;
  const photoUrl = rawPhoto
    ? rawPhoto.startsWith('http') ? rawPhoto
      : `${API_URL}/${rawPhoto.replace(/^\/+/, '').replace(/\\/g, '/')}`
    : null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
      : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          {/* <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
            <div className="relative w-8 h-8 transition-transform duration-200
                            group-hover:scale-110 group-hover:rotate-3">
              <Image src="/xavier-logo.png" alt="Xavier AlumniConnect"
                     fill className="object-contain" priority />
            </div>
            <span className="text-base sm:text-lg font-extrabold
                             bg-gradient-to-r from-blue-700 to-indigo-600
                             bg-clip-text text-transparent whitespace-nowrap tracking-tight">
              Xavier AlumniConnect
            </span>
          </Link> */}

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <img
              src="/xavier-logo.png"
              alt="Xavier AlumniConnect"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
            />
            <span className="text-sm sm:text-base md:text-lg font-extrabold
                   bg-gradient-to-r from-blue-700 to-indigo-600
                   bg-clip-text text-transparent tracking-tight">
              Xavier AlumniConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            <NavLink href="/directory">Directory</NavLink>
            <ExploreDropdown user={user} />
            {user?.role === 'ADMIN' && <NavLink href="/admin">Admin</NavLink>}
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                                   hover:bg-slate-50 transition-colors group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500
                                    to-indigo-600 flex items-center justify-center
                                    border-2 border-white shadow-sm overflow-hidden
                                    group-hover:shadow-md transition-shadow">
                      {photoUrl ? (
                        <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[11px] font-black text-white">{userInitial}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700
                                     group-hover:text-blue-600 transition-colors
                                     max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </Link>
                  <div className="w-px h-5 bg-slate-200" />
                  <button onClick={logout}
                    className="text-sm font-semibold text-slate-500
                                     hover:text-red-500 hover:bg-red-50
                                     px-3 py-1.5 rounded-lg transition-all duration-200">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login"
                    className="text-sm font-semibold text-slate-600
                                   hover:text-blue-600 px-3 py-1.5 rounded-lg
                                   hover:bg-slate-50 transition-all duration-200">
                    Login
                  </Link>
                  <Link href="/register"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                                   text-sm font-semibold px-5 py-2 rounded-full
                                   hover:shadow-md hover:shadow-blue-200
                                   hover:-translate-y-0.5 active:translate-y-0
                                   transition-all duration-200 shadow-sm">
                    Join Community
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100
                             focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-expanded={menuOpen} aria-label="Toggle menu">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ══ MOBILE MENU ══════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div className={`lg:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40
                       transition-opacity duration-300
                       ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)} aria-hidden="true" />

      {/* Drawer */}
      <div className={`lg:hidden fixed inset-x-0 top-16 z-50 bg-white border-b
                       border-slate-200 shadow-lg transition-all duration-300 ease-in-out
                       ${menuOpen
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto py-4 px-4 space-y-0.5">

          {user ? (
            <>
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50
                              rounded-xl mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center
                                justify-center border border-blue-200 overflow-hidden flex-shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-blue-700">{userInitial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* My Profile */}
              <NavLink href="/dashboard/profile" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.profile}</span>
                My Profile
              </NavLink>

              {/* Admin */}
              {user.role === 'ADMIN' && (
                <NavLink href="/admin" mobile onClick={() => setMenuOpen(false)}>
                  <span className="text-slate-400">{Icons.admin}</span>
                  Admin
                </NavLink>
              )}

              {/* Dashboard */}
              <NavLink href="/dashboard" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.dashboard}</span>
                Dashboard
              </NavLink>

              <hr className="my-2 border-slate-100" />

              {/* Directory */}
              <NavLink href="/directory" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.directory}</span>
                Directory
              </NavLink>

              {/* Jobs */}
              <NavLink href="/jobs" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.jobs}</span>
                Jobs
              </NavLink>

              {/* Events */}
              <NavLink href="/events" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.events}</span>
                Events
              </NavLink>

              {/* Messages */}
              <NavLink href="/chat" mobile onClick={() => setMenuOpen(false)}>
                <span className="text-slate-400">{Icons.messages}</span>
                Messages
              </NavLink>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                           text-sm font-medium text-red-500 hover:bg-red-50
                           transition-colors mt-1"
              >
                <span className="text-red-400">{Icons.logout}</span>
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 font-medium text-slate-700
                               bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="w-full text-center py-3 font-medium text-white
                               bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition">
                Join Community
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;