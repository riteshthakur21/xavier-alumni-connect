import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/chat',
  '/connections',
  '/notifications',
  '/jobs/create',
  '/events/create',
  '/stories/create',
];

// Routes accessible only to unauthenticated visitors
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Check if current route starts with any protected route prefix
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current route is an authentication route (login/register)
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. If user tries to access a protected route without a valid token, redirect to /login
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If an authenticated user tries to access login or register, redirect to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/chat/:path*',
    '/connections/:path*',
    '/notifications/:path*',
    '/jobs/create',
    '/events/create',
    '/stories/create',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
