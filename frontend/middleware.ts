import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths accessible without authentication
  const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/features' || pathname.startsWith('/blogs');

  // If user has token and visits public auth pages or root landing page, redirect to dashboard
  if (token && isPublicPath) {
    const dashboardUrl = new URL('/hosted-zones', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If no token and user is trying to access protected dashboard route
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
