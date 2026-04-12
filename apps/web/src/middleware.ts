import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract organization slug from subdomain
  // Format: {org-slug}.onekof.com or {org-slug}.localhost:3000
  const organizationSlug = getOrganizationSlug(hostname);

  // Admin routes — separate auth system
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/setup');
  const isAdminApiRoute = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    const adminToken = request.cookies.get('onekof-admin-token');
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Define protected routes (regular user routes)
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/settings');

  // Check if user is authenticated for protected routes
  if (isProtectedRoute) {
    // Check for session token (NextAuth uses next-auth.session-token cookie)
    const token = request.cookies.get('next-auth.session-token') ||
                  request.cookies.get('__Secure-next-auth.session-token');

    // If no token, redirect to signin
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Add organization context to request headers
  const requestHeaders = new Headers(request.headers);
  if (organizationSlug) {
    requestHeaders.set('x-organization-slug', organizationSlug);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // SECURITY: Add comprehensive security headers
  addSecurityHeaders(response, pathname);

  return response;
}

/**
 * Add comprehensive security headers to response
 * Protects against XSS, clickjacking, MIME sniffing, and other attacks
 */
function addSecurityHeaders(response: NextResponse, pathname: string) {
  // Content Security Policy (CSP)
  // Production uses nonce-based script policy; development allows unsafe-eval for HMR
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercelPreview = process.env.VERCEL_ENV === 'preview';
  const allowVercelLive = !isProduction || isVercelPreview;
  const scriptSrc = isProduction && !isVercelPreview
    ? "'self' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com"
    : "'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com https://vercel.live https://*.vercel.live";

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc} https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://accounts.google.com https://*.upstash.io https://cloudflareinsights.com https://static.cloudflareinsights.com${allowVercelLive ? ' https://vercel.live https://*.vercel.live' : ''}`,
    `frame-src 'self' https://accounts.google.com${allowVercelLive ? ' https://vercel.live https://*.vercel.live' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Strict Transport Security (HSTS) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-Frame-Options - Prevents clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - Prevents MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - Legacy XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy
  const permissionsPolicy = [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
  ].join(', ');

  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Remove X-Powered-By header
  response.headers.delete('X-Powered-By');

  // Add strict cache control for sensitive pages
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/auth') || pathname.startsWith('/admin')) {
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    );
  }
}

/**
 * Return the list of base hostnames from which tenant subdomains are extracted.
 * Driven by the `PUBLIC_HOSTS` environment variable, comma-separated.
 *
 * Default: "onekof.com,localhost" — preserves the pre-Wave-1 Tier 3 behavior
 * exactly. Self-hosted tiers set PUBLIC_HOSTS explicitly:
 *   Tier 2 (private on-prem): PUBLIC_HOSTS=onekof.et
 *   Tier 1 (gov):              PUBLIC_HOSTS=gov.onekof.et
 *   Dev against Tier 2:        PUBLIC_HOSTS=onekof.et,localhost
 *
 * The function is pure and re-reads the env var on every call so test setup
 * and hot-reload work as expected.
 */
function getPublicHosts(): string[] {
  const raw = process.env.PUBLIC_HOSTS || 'onekof.com,localhost';
  return raw
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Extract organization slug from hostname.
 *
 * Examples (with default PUBLIC_HOSTS="onekof.com,localhost"):
 *   - ministry-water-irrigation.onekof.com → "ministry-water-irrigation"
 *   - olink-tech.onekof.com                → "olink-tech"
 *   - acme.localhost:3000                  → "acme"
 *   - onekof.com                           → null (main domain)
 *   - www.onekof.com                       → null (main domain)
 *   - localhost:3000                       → null (main domain)
 *   - feature-branch.vercel.app            → null (Vercel preview)
 *
 * With PUBLIC_HOSTS="onekof.et" (Tier 2 production):
 *   - acme.onekof.et                       → "acme"
 *   - onekof.et                            → null
 *
 * The function always treats Vercel preview hostnames (*.vercel.app) as the
 * main domain so the existing preview-routing behavior in select-organization
 * page and auth cookie scoping stays consistent.
 */
function getOrganizationSlug(hostname: string): string | null {
  // Remove port if present and lowercase for case-insensitive comparison
  const host = hostname.split(':')[0].toLowerCase();

  // Vercel preview deploys always map to the main domain (no subdomain routing)
  if (host.includes('vercel.app')) {
    return null;
  }

  const publicHosts = getPublicHosts();

  for (const base of publicHosts) {
    // Exact match on the base host or www. variant → main domain
    if (host === base || host === `www.${base}`) {
      return null;
    }
    // Subdomain of the base host → extract slug
    if (host.endsWith(`.${base}`)) {
      return host.slice(0, host.length - base.length - 1);
    }
  }

  return null;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
