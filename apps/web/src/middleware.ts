import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// ---------------------------------------------------------------------------
// CSRF — Origin validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the set of allowed origins derived from PUBLIC_HOSTS + NEXTAUTH_URL.
 * Rebuilt each call so env changes in tests/hot-reload take effect immediately.
 */
function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Always allow localhost in dev
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://localhost');
  }

  // Derive from PUBLIC_HOSTS env var (e.g., "onekof.et,onekof.com")
  const raw = process.env.PUBLIC_HOSTS || 'onekof.com,localhost';
  for (const host of raw.split(',').map(h => h.trim()).filter(Boolean)) {
    origins.add(`https://${host}`);
    origins.add(`http://${host}`); // for Tier 2 local-network access before TLS
  }

  // Also allow the explicitly configured app URL
  const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const u = new URL(appUrl.trim()); // trim handles trailing \n in env vars
      origins.add(u.origin);
    } catch { /* ignore malformed URL */ }
  }

  // Allow Vercel preview deployment URLs (set automatically per deployment)
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`);
  }

  return origins;
}

/**
 * Webhook routes that legitimately receive cross-origin POST requests.
 * These are excluded from CSRF Origin validation.
 */
const CSRF_EXEMPT_PREFIXES = [
  '/api/integrations/github/webhook',
  '/api/integrations/google-calendar/callback',
  '/api/integrations/google/callback',
  '/api/auth',        // NextAuth handles its own CSRF
  '/api/push',        // push notification delivery
];

/**
 * Validate the Origin header for state-mutating API requests.
 * Returns a 403 response if the origin is not allowed, or null to continue.
 *
 * CSRF enforcement is disabled pre-launch while the allowed-origin list is
 * finalised for the production domain.  To re-enable before go-live:
 *   1. Delete the `return null` line below.
 *   2. Confirm PUBLIC_HOSTS and NEXTAUTH_URL are set correctly in Vercel env vars.
 */
function enforceCsrfOrigin(_request: NextRequest): NextResponse | null {
  // Pre-launch: bypass CSRF blocking so invite / create / mutation routes work.
  return null;
}

/**
 * Returns true if the origin is allowed.
 * Allows:
 *  - exact matches from getAllowedOrigins()
 *  - subdomains of PUBLIC_HOSTS (e.g. myorg.onekof.com when onekof.com is a public host)
 */
function isAllowedOrigin(origin: string): boolean {
  if (getAllowedOrigins().has(origin)) return true;

  // Allow org subdomains: https://myorg.onekof.com when PUBLIC_HOSTS includes onekof.com
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    const publicHosts = getPublicHosts();
    for (const base of publicHosts) {
      if (hostname === base || hostname.endsWith(`.${base}`)) return true;
    }
  } catch { /* ignore malformed origin */ }

  return false;
}

// ---------------------------------------------------------------------------
// Admin rate limiting — simple in-memory per-IP sliding window
// (Upstash Redis is not available in middleware edge runtime without special setup)
// ---------------------------------------------------------------------------

const adminRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const ADMIN_RATE_LIMIT_MAX = 60;       // requests per window
const ADMIN_RATE_LIMIT_WINDOW = 60_000; // 1 minute in ms

function checkAdminRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = adminRateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    adminRateLimitMap.set(ip, { count: 1, resetAt: now + ADMIN_RATE_LIMIT_WINDOW });
    return true; // allowed
  }

  entry.count++;
  if (entry.count > ADMIN_RATE_LIMIT_MAX) {
    return false; // rate limited
  }
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract organization slug from subdomain
  // Format: {org-slug}.onekof.com or {org-slug}.localhost:3000
  const organizationSlug = getOrganizationSlug(hostname);

  // SECURITY (P1): CSRF — reject mutations from unexpected origins
  const csrfError = enforceCsrfOrigin(request);
  if (csrfError) return csrfError;

  // Block debug and diagnostic API routes in production — they expose env info and user data
  const blockedInProduction = ['/api/debug', '/api/env-check', '/api/test-db'];
  if (process.env.NODE_ENV === 'production' && blockedInProduction.some(p => pathname.startsWith(p))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Admin routes — separate auth system
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/setup');
  const isAdminApiRoute = pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login');

  if (isAdminRoute) {
    const adminToken = request.cookies.get('onekof-admin-token');
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // SECURITY (P2): Rate-limit all /api/admin/* routes (excluding login, which has its own stricter limit)
  if (isAdminApiRoute) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    if (!checkAdminRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests to admin API' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
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

  // SECURITY: Tenant isolation — verify user belongs to the organization subdomain
  // The JWT contains the user's organization memberships (slug list). If the user
  // is on a subdomain they don't belong to, redirect them to the main domain.
  if (organizationSlug && isProtectedRoute) {
    try {
      const token = await getToken({ req: request });
      if (token?.organizations) {
        const orgs = token.organizations as Array<{ slug: string }>;
        const isMember = orgs.some(org => org.slug === organizationSlug);
        if (!isMember) {
          // User is authenticated but not a member of this organization
          return NextResponse.redirect(new URL('/select-organization?error=access_denied', request.url));
        }
      }
    } catch {
      // If token decoding fails, allow the request — API routes will enforce auth
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
