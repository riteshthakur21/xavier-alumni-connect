'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import {
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  BookOpen,
  Shield,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';

// ─── Explore Dropdown Items ──────────────────────────────────────────────────
const EXPLORE_ITEMS = [
  {
    href: '/jobs',
    label: 'Career & Referrals',
    desc: 'Job openings, internships & alumni referrals',
    icon: Briefcase,
  },
  {
    href: '/events',
    label: 'Events & Reunions',
    desc: 'Campus meets, webinars & chapter reunions',
    icon: Calendar,
  },
  {
    href: '/stories',
    label: 'Alumni Stories',
    desc: 'Journeys, reflections & career insights',
    icon: BookOpen,
  },
  {
    href: '/chat',
    label: 'Community Messages',
    desc: 'Direct discussions with alumni & seniors',
    icon: MessageSquare,
    authRequired: true,
  },
];

// ─── NavLink Component ───────────────────────────────────────────────────────
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
    ? 'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm'
    : 'text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg';

  const active = mobile
    ? 'bg-[#1a1410] text-[#f4efe6] shadow-xs'
    : 'text-[#1a1410] bg-[#1a1410]/8';

  const inactive = mobile
    ? 'text-[#5c4d37] hover:bg-[#1a1410]/5 hover:text-[#1a1410]'
    : 'text-[#5c4d37] hover:text-[#1a1410] hover:bg-[#1a1410]/5';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[base, isActive ? active : inactive, className || ''].join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

// ─── Desktop Explore Dropdown ────────────────────────────────────────────────
const ExploreDropdown: React.FC<{ user: any }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const visible = EXPLORE_ITEMS.filter((i) => !i.authRequired || user);
  const isAnyActive = visible.some((i) => pathname.startsWith(i.href));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 px-3 py-1.5 rounded-lg cursor-pointer ${
          isAnyActive
            ? 'text-[#1a1410] bg-[#1a1410]/8'
            : 'text-[#5c4d37] hover:text-[#1a1410] hover:bg-[#1a1410]/5'
        }`}
        aria-expanded={open}
        aria-label="Explore network resources"
      >
        <span>Explore</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#7d6a4f] transition-transform duration-200 ${
            open ? 'rotate-180 text-[#1a1410]' : ''
          }`}
        />
      </button>

      {/* Dropdown Card */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-64 bg-white rounded-2xl shadow-xl border border-[#1a1410]/12 py-2 z-50 transition-all duration-200 origin-top ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none'
        }`}
      >
        <div className="px-3 py-1.5 mb-1 border-b border-[#1a1410]/8">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#7d6a4f] font-medium">
            Network Resources
          </p>
        </div>

        {visible.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-start gap-3 px-3.5 py-2.5 mx-1.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-[#f4efe6] text-[#1a1410]'
                  : 'text-[#5c4d37] hover:bg-[#f4efe6]/70 hover:text-[#1a1410]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#1a1410] text-[#e8a93c]'
                    : 'bg-[#1a1410]/5 text-[#7d6a4f] group-hover:bg-[#1a1410] group-hover:text-[#e8a93c]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-serif font-semibold text-[#1a1410] leading-snug group-hover:text-[#c4821a] transition-colors">
                  {item.label}
                </p>
                <p className="text-[11px] text-[#7d6a4f] mt-0.5 leading-tight truncate">
                  {item.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// ─── Navbar Main Component ───────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const rawPhoto = user?.alumniProfile?.photoUrl;
  const photoUrl = rawPhoto
    ? rawPhoto.startsWith('http')
      ? rawPhoto
      : `${API_URL}/${rawPhoto.replace(/^\/+/, '').replace(/\\/g, '/')}`
    : null;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#1a1410]/12'
          : 'bg-[#f4efe6]/90 backdrop-blur-md border-b border-[#1a1410]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Logo & Editorial Title */}
          <Link
            href="/"
            className="flex-shrink-0 flex items-center gap-2.5 group py-1 focus:outline-none"
            aria-label="Xavier AlumniConnect Home"
          >
            <img
              src="/xavier-logo.png"
              alt="Xavier AlumniConnect"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif font-semibold text-[#1a1410] tracking-tight leading-none group-hover:text-[#c4821a] transition-colors">
                Xavier <span className="font-normal italic text-[#5c4d37]">Alumni</span>Connect
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#7d6a4f] mt-0.5">
                St. Xavier&apos;s College
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/directory">Directory</NavLink>
            <ExploreDropdown user={user} />
            {user?.role === 'ADMIN' && <NavLink href="/admin">Admin Portal</NavLink>}
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          </div>

          {/* Desktop Actions & User Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="relative">
                <NotificationBell isLoggedIn={true} />
              </div>
            )}

            {!loading && user && (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/70 border border-[#1a1410]/10 hover:border-[#c4821a]/50 hover:bg-white transition-all shadow-2xs group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#1a1410] text-[#e8a93c] flex items-center justify-center font-serif font-bold text-xs shadow-xs overflow-hidden flex-shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <span className="text-xs font-serif font-semibold text-[#1a1410] group-hover:text-[#c4821a] transition-colors max-w-[120px] truncate">
                    {user.name}
                  </span>
                </Link>

                <div className="w-px h-4 bg-[#1a1410]/15" />

                <button
                  onClick={logout}
                  className="text-xs font-mono font-medium text-[#7d6a4f] hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {!loading && !user && (
              <div className="hidden lg:flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#1a1410] hover:text-[#c4821a] px-3.5 py-2 rounded-xl hover:bg-[#1a1410]/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#1a1410] text-[#f4efe6] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#3d3222] active:bg-[#1a1410] border border-[#3d3222]/50 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>Join Community</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#e8a93c] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#1a1410] hover:bg-[#1a1410]/8 focus:outline-none transition-colors cursor-pointer border border-[#1a1410]/10"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MOBILE DRAWER & BACKDROP ════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 top-16 bg-[#1a1410]/50 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 z-50 bg-[#fbf9f5] border-b border-[#1a1410]/15 shadow-2xl transition-all duration-300 ease-in-out ${
          menuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-h-[calc(100vh-4.5rem)] overflow-y-auto py-5 px-4 sm:px-6 space-y-1">

          {user ? (
            <>
              {/* User Identity Header Card */}
              <div className="flex items-center gap-3.5 p-3.5 bg-white border border-[#1a1410]/10 rounded-2xl mb-4 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-[#1a1410] text-[#e8a93c] flex items-center justify-center font-serif font-bold text-sm border border-[#1a1410]/20 overflow-hidden flex-shrink-0 shadow-xs">
                  {photoUrl ? (
                    <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-serif font-semibold text-[#1a1410] truncate">
                      {user.name}
                    </p>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-wider ${
                        user.role === 'ADMIN'
                          ? 'bg-[#c4821a]/15 text-[#c4821a] border border-[#c4821a]/25'
                          : 'bg-[#3a5c3e]/10 text-[#3a5c3e] border border-[#3a5c3e]/20'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#7d6a4f] font-mono truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <NavLink href="/dashboard/profile" mobile onClick={() => setMenuOpen(false)}>
                  <UserIcon className="w-4 h-4 text-[#7d6a4f]" />
                  <span>My Profile</span>
                </NavLink>

                {user.role === 'ADMIN' && (
                  <NavLink href="/admin" mobile onClick={() => setMenuOpen(false)}>
                    <Shield className="w-4 h-4 text-[#c4821a]" />
                    <span>Admin Portal</span>
                  </NavLink>
                )}

                <NavLink href="/dashboard" mobile onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Dashboard</span>
                </NavLink>

                <div className="my-2 border-t border-[#1a1410]/10" />

                <NavLink href="/directory" mobile onClick={() => setMenuOpen(false)}>
                  <Users className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Alumni Directory</span>
                </NavLink>

                <NavLink href="/jobs" mobile onClick={() => setMenuOpen(false)}>
                  <Briefcase className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Jobs &amp; Referrals</span>
                </NavLink>

                <NavLink href="/events" mobile onClick={() => setMenuOpen(false)}>
                  <Calendar className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Events &amp; Reunions</span>
                </NavLink>

                <NavLink href="/stories" mobile onClick={() => setMenuOpen(false)}>
                  <BookOpen className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Alumni Stories</span>
                </NavLink>

                <NavLink href="/chat" mobile onClick={() => setMenuOpen(false)}>
                  <MessageSquare className="w-4 h-4 text-[#7d6a4f]" />
                  <span>Messages &amp; Chat</span>
                </NavLink>

                {/* Logout Action */}
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <NavLink href="/directory" mobile onClick={() => setMenuOpen(false)}>
                <Users className="w-4 h-4 text-[#7d6a4f]" />
                <span>Alumni Directory</span>
              </NavLink>

              <NavLink href="/events" mobile onClick={() => setMenuOpen(false)}>
                <Calendar className="w-4 h-4 text-[#7d6a4f]" />
                <span>Events</span>
              </NavLink>

              <NavLink href="/stories" mobile onClick={() => setMenuOpen(false)}>
                <BookOpen className="w-4 h-4 text-[#7d6a4f]" />
                <span>Alumni Stories</span>
              </NavLink>

              <div className="pt-4 flex flex-col gap-2.5 border-t border-[#1a1410]/10">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-3 font-semibold text-sm text-[#1a1410] bg-white border border-[#1a1410]/15 rounded-xl hover:bg-[#f4efe6] transition shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center py-3 font-semibold text-sm text-[#f4efe6] bg-[#1a1410] rounded-xl hover:bg-[#3d3222] active:bg-[#1a1410] border border-[#3d3222]/50 transition shadow-sm"
                >
                  Join Community
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;