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
  '/verify-email',
  '/auth',
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

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function createContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  // Vercel Web Analytics serves its script and beacon same-origin
  // (/_vercel/insights/*), so 'self' covers both script-src and connect-src —
  // no external analytics domain is allowed.
  const scriptSrc = `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ''}`;
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    ...(isDev ? ['ws://127.0.0.1:3000', 'ws://localhost:3000'] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self'",
    `connect-src ${connectSrc}`,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function applySecurityHeaders(response: NextResponse, nonce: string, csp: string): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  return response;
}

function createNonceResponse(sourceResponse: NextResponse, requestHeaders: Headers): NextResponse {
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  sourceResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'set-cookie') {
      response.headers.set(key, value);
    }
  });

  sourceResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });

  return response;
}

function isPublic(path: string): boolean {
  if (AUTH_API_ROUTES.some((p) => path.startsWith(p))) return true;
  if (PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) return true;
  // Static files
  if (path.startsWith('/_next/') || path.startsWith('/favicon')) return true;
  if (/\\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$/.test(path)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = createContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const { user, response } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Public routes: always allow
  if (isPublic(path)) {
    return applySecurityHeaders(createNonceResponse(response, requestHeaders), nonce, csp);
  }

  // Check role-protected routes
  for (const [prefix, allowedRoles] of Object.entries(ROLE_PROTECTED)) {
    if (path.startsWith(prefix)) {
      // Not authenticated → redirect to home
      if (!user) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/', request.url)), nonce, csp);
      }
      // Wrong role → redirect to home
      if (!allowedRoles.includes(user.role)) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/', request.url)), nonce, csp);
      }
      // Allowed through
      return applySecurityHeaders(createNonceResponse(response, requestHeaders), nonce, csp);
    }
  }

  // API routes: allow through (API handlers do their own auth)
  if (path.startsWith('/api/')) {
    return applySecurityHeaders(createNonceResponse(response, requestHeaders), nonce, csp);
  }

  return applySecurityHeaders(createNonceResponse(response, requestHeaders), nonce, csp);
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
