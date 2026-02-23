'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className, onClick, mobile }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const baseClasses = mobile
    ? 'block px-4 py-3 rounded-xl font-medium transition-colors'
    : 'text-sm font-semibold transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all hover:after:w-full';

  const activeClasses = mobile
    ? 'bg-blue-50 text-blue-600'
    : 'text-blue-600 after:w-full';

  const inactiveClasses = mobile
    ? 'text-slate-700 hover:bg-slate-50'
    : 'text-slate-600 hover:text-blue-600';

  // Combine classes conditionally
  const linkClasses = [
    baseClasses,
    isActive ? activeClasses : inactiveClasses,
    className || ''
  ].join(' ');

  return (
    <Link
      href={href}
      onClick={onClick}
      className={linkClasses}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
};

const Navbar: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  // Get user initials for avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-110">
              <Image
                src="/xavier-logo.png"
                alt="Xavier AlumniConnect"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-base sm:text-lg md:text-xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
              Xavier AlumniConnect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLink href="/directory">Directory</NavLink>
            <NavLink href="/jobs">Jobs</NavLink>
            <NavLink href="/events">Events</NavLink>
            {user?.role === 'ADMIN' && <NavLink href="/admin">Admin</NavLink>}
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 transition-colors">
                      <span className="text-xs font-bold text-blue-700 group-hover:text-white">
                        {userInitial}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
                  >
                    Join Community
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden fixed inset-x-0 top-16 bg-white border-b border-slate-200 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto py-4 px-4 space-y-1">
          {user ? (
            <>
              {/* User Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                  <span className="text-sm font-bold text-blue-700">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Mobile Links */}
              <NavLink href="/dashboard/profile" mobile onClick={() => setIsMenuOpen(false)}>
                👤 My Profile
              </NavLink>

              {user.role === 'ADMIN' && (
                <NavLink href="/admin" mobile onClick={() => setIsMenuOpen(false)}>
                   Admin 
                </NavLink>
              )}

              <NavLink href="/dashboard" mobile onClick={() => setIsMenuOpen(false)}>
                 Dashboard
              </NavLink>

              <hr className="my-2 border-slate-100" />

              <NavLink href="/directory" mobile onClick={() => setIsMenuOpen(false)}>
                 Directory
              </NavLink>
              <NavLink href="/jobs" mobile onClick={() => setIsMenuOpen(false)}>
                 Jobs
              </NavLink>
              <NavLink href="/events" mobile onClick={() => setIsMenuOpen(false)}>
                 Events
              </NavLink>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                 Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 p-2">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3 font-medium text-white bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition"
              >
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