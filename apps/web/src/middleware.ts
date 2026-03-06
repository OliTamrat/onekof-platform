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

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
