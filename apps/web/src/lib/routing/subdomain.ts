/**
 * Client-side subdomain routing helpers.
 *
 * Onekof uses wildcard subdomains for per-tenant isolation:
 *   acme.onekof.com     → tenant "acme" (Tier 3, production)
 *   acme.onekof.et      → tenant "acme" (Tier 2, on-premise)
 *   ministry.gov.onekof.et → tenant "ministry" (Tier 1, government)
 *
 * These helpers let client components detect whether the current hostname
 * supports subdomain routing and construct tenant subdomain URLs uniformly.
 * Server-side code should use the equivalent logic in `apps/web/src/middleware.ts`.
 *
 * Configuration:
 *   NEXT_PUBLIC_SUBDOMAIN_DOMAINS — comma-separated list of base hostnames
 *   that support wildcard tenant subdomains. Default "onekof.com" preserves
 *   the Tier 3 behavior that existed before Wave 1.
 *
 * Note: this module uses NEXT_PUBLIC_* because it ships to the browser.
 * Server-side Onekof code should read PUBLIC_HOSTS instead (see middleware.ts).
 */

/** Parse the configured base domains from the public env var. */
export function getSubdomainDomains(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUBDOMAIN_DOMAINS || 'onekof.com';
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Return the base domain that matches the given hostname, or null if the
 * hostname is a preview/dev host (*.vercel.app, localhost) or unrecognized.
 *
 * Matching rule: `hostname` must equal `base`, equal `www.base`, or end with
 * `.base`. Matches are tested in `NEXT_PUBLIC_SUBDOMAIN_DOMAINS` order so
 * more-specific bases (e.g., `gov.onekof.et`) should be listed before less-
 * specific ones (`onekof.et`).
 */
export function findSubdomainBase(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase();

  if (host === 'localhost' || host.includes('vercel.app')) {
    return null;
  }

  for (const base of getSubdomainDomains()) {
    if (host === base || host === `www.${base}` || host.endsWith(`.${base}`)) {
      return base;
    }
  }

  return null;
}

/**
 * True when the current hostname sits on a domain that supports wildcard
 * tenant subdomains. Used by client components to decide whether to redirect
 * to `{slug}.{base}` (true) or stay on the same host with path-based routing
 * (false).
 */
export function isSubdomainRoutingHost(hostname: string): boolean {
  return findSubdomainBase(hostname) !== null;
}

/**
 * Extract the tenant slug from a subdomain hostname, or null if the hostname
 * is the main domain (`onekof.com`, `www.onekof.com`) or unrecognized.
 *
 * Examples (with default NEXT_PUBLIC_SUBDOMAIN_DOMAINS="onekof.com"):
 *   acme.onekof.com     → "acme"
 *   onekof.com          → null
 *   www.onekof.com      → null
 *   foo.vercel.app      → null
 */
export function getTenantSlugFromHostname(hostname: string): string | null {
  const host = hostname.split(':')[0].toLowerCase();
  const base = findSubdomainBase(host);
  if (!base) return null;
  if (host === base || host === `www.${base}`) return null;
  return host.slice(0, host.length - base.length - 1);
}

/**
 * Build the absolute URL for a tenant's subdomain on the current base domain.
 * Returns null if the current host does not support subdomain routing
 * (e.g., `*.vercel.app`, `localhost`), in which case the caller should use
 * path-based routing instead.
 *
 * Example (current host = `onekof.com`, slug = `acme`, path = `/dashboard`):
 *   → "https://acme.onekof.com/dashboard"
 */
export function buildTenantUrl(
  currentHostname: string,
  currentPort: string | undefined,
  currentProtocol: string,
  tenantSlug: string,
  pathname: string,
): string | null {
  const base = findSubdomainBase(currentHostname);
  if (!base) return null;
  const port = currentPort ? `:${currentPort}` : '';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${currentProtocol}//${tenantSlug}.${base}${port}${path}`;
}
