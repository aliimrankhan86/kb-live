import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Public routes — no auth required.
 */
const PUBLIC_PREFIXES = [
  '/',
  '/umrah',
  '/packages',
  '/search',
  '/quote',
  '/operators',
  '/robots.txt',
  '/sitemap.xml',
  '/login',
  '/signup',
  '/partner',
  '/hajj',
  '/privacy',
  '/terms',
];

/**
 * Auth-related API routes — no guard (they handle auth themselves).
 */
const AUTH_API_ROUTES = ['/api/auth/'];

/**
 * Role-protected route prefixes.
 */
const ROLE_PROTECTED: Record<string, string[]> = {
  '/operator/': ['operator', 'admin'],
  '/admin/': ['admin'],
};

function isPublic(path: string): boolean {
  if (AUTH_API_ROUTES.some((p) => path.startsWith(p))) return true;
  if (PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) return true;
  // Static files
  if (path.startsWith('/_next/') || path.startsWith('/favicon')) return true;
  if (/\\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$/.test(path)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Public routes: always allow
  if (isPublic(path)) {
    return response;
  }

  // Check role-protected routes
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PROTECTED)) {
    if (path.startsWith(prefix)) {
      // Not authenticated → redirect to home
      if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Wrong role → redirect to home
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      // Allowed through
      return response;
    }
  }

  // API routes: allow through (API handlers do their own auth)
  if (path.startsWith('/api/')) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};