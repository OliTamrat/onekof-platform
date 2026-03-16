import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract organization slug from subdomain
  // Format: {org-slug}.onekof.com or {org-slug}.localhost:3000
  const organizationSlug = getOrganizationSlug(hostname);

  // Define protected routes
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/settings') ||
    (pathname.startsWith('/admin') && !pathname.startsWith('/admin/setup'));

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
  const scriptSrc = isProduction
    ? "'self' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com"
    : "'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com https://vercel.live";

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc} https://static.cloudflareinsights.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://accounts.google.com https://*.upstash.io https://cloudflareinsights.com https://static.cloudflareinsights.com${isProduction ? '' : ' https://vercel.live'}`,
    `frame-src 'self' https://accounts.google.com${isProduction ? '' : ' https://vercel.live'}`,
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
 * Extract organization slug from hostname
 * Examples:
 *   - ministry-water-irrigation.onekof.com → ministry-water-irrigation
 *   - olink-tech.onekof.com → olink-tech
 *   - localhost:3000 → null (main domain)
 *   - onekof.com → null (main domain)
 */
function getOrganizationSlug(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];

  // Main domains (no organization)
  if (
    host === 'localhost' ||
    host === 'onekof.com' ||
    host === 'www.onekof.com' ||
    host.includes('vercel.app')
  ) {
    return null;
  }

  // Extract subdomain for onekof.com
  if (host.endsWith('.onekof.com')) {
    const subdomain = host.replace('.onekof.com', '');
    return subdomain;
  }

  // For localhost development with subdomain
  if (host.endsWith('.localhost')) {
    const subdomain = host.replace('.localhost', '');
    return subdomain;
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
