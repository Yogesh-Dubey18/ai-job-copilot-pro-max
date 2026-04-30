import { NextResponse, type NextRequest } from 'next/server';

const protectedPrefixes = [
  '/admin',
  '/analytics',
  '/applications',
  '/assistant',
  '/billing',
  '/daily-digest',
  '/dashboard',
  '/interview',
  '/jobs',
  '/onboarding',
  '/portfolio',
  '/responses',
  '/resume',
  '/settings'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!request.cookies.get('session')?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/analytics/:path*',
    '/applications/:path*',
    '/assistant/:path*',
    '/billing/:path*',
    '/daily-digest/:path*',
    '/dashboard/:path*',
    '/interview/:path*',
    '/jobs/:path*',
    '/onboarding/:path*',
    '/portfolio/:path*',
    '/responses/:path*',
    '/resume/:path*',
    '/settings/:path*'
  ]
};
