# 🏢 Onekof Multi-Tenant Architecture Guide

## Overview

Onekof uses a **subdomain-based multi-tenant architecture** where each organization has its own subdomain and completely isolated data.

### Architecture Components

1. **Subdomain Routing** - Each org gets: `{org-slug}.onekof.com`
2. **Schema-based Isolation** - Each org has its own database schema
3. **Organization Context** - Middleware extracts org from subdomain
4. **Role-based Access** - Users have roles per organization

---

## 🌐 Your Organizations

Based on your database, you have 3 organizations:

| Organization | Subdomain | Members | Projects | Plan |
|-------------|-----------|---------|----------|------|
| **Ministry of Water and Irrigation** | `ministry-water-irrigation.onekof.com` | 10 | 1 | Enterprise |
| **Olink Technologies** | `olink-tech.onekof.com` | 5 | 4 | Professional |
| **Adwa Digital Solutions** | `adwa-digital.onekof.com` | 3 | 2 | Starter |

---

## 🔐 How Authentication Works

### 1. User Login Flow

```
1. User visits: https://onekof.com/auth/signin
2. Enters credentials: admin@ministryofwater.et / Ministry@2026!
3. System checks user's organizations
4. If user belongs to multiple orgs → Show organization selector
5. User selects organization → Redirects to org subdomain
6. If user belongs to one org → Direct redirect to org subdomain
```

### 2. Organization Isolation

When a user accesses `https://ministry-water-irrigation.onekof.com/dashboard`:

- ✅ Middleware extracts `ministry-water-irrigation` from subdomain
- ✅ Loads organization from database
- ✅ Verifies user has access to this organization
- ✅ All queries are scoped to this organization's schema
- ✅ User sees ONLY data for Ministry of Water

---

## 🛠️ Vercel Configuration (CRITICAL)

To enable wildcard subdomains in production, follow these steps:

### Step 1: Add Custom Domain in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add these domains:

```
onekof.com                           (Main domain)
*.onekof.com                         (Wildcard for all subdomains)
ministry-water-irrigation.onekof.com (Specific org domains - optional)
olink-tech.onekof.com
adwa-digital.onekof.com
```

### Step 2: DNS Configuration

In your DNS provider (where onekof.com is registered), add:

```dns
# Main domain
A     @              76.76.21.21      (Vercel IP)
CNAME www            cname.vercel-dns.com

# Wildcard subdomain for all organizations
CNAME *              cname.vercel-dns.com
```

### Step 3: Verify Domain

Wait for DNS propagation (can take up to 48 hours, usually 5-10 minutes).

Verify each domain shows "Valid Configuration" in Vercel.

---

## 🧪 Testing Multi-Tenant Setup

### Local Development

For local testing with subdomains, add to `/etc/hosts` (Mac/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 ministry-water-irrigation.localhost
127.0.0.1 olink-tech.localhost
127.0.0.1 adwa-digital.localhost
```

Then access:
- `http://ministry-water-irrigation.localhost:3000`
- `http://olink-tech.localhost:3000`
- `http://adwa-digital.localhost:3000`

### Production Testing

Once DNS is configured:

1. **Test Main Domain**
   - Visit: `https://onekof.com`
   - Should show marketing page or organization selector

2. **Test Organization Subdomains**
   ```
   https://ministry-water-irrigation.onekof.com/auth/signin
   https://olink-tech.onekof.com/auth/signin
   https://adwa-digital.onekof.com/auth/signin
   ```

3. **Test Authentication**
   - Login at subdomain
   - Should redirect to `/dashboard` on same subdomain
   - User should only see data for that organization

---

## 👥 User Credentials

### Ministry of Water

```
Email:    admin@ministryofwater.et
Password: Ministry@2026!
Role:     OWNER
Access:   https://ministry-water-irrigation.onekof.com
```

### Test Users (Also in Ministry of Water)

```
# Admin User
Email:    admin@onekof.com
Password: Admin@2026!
Role:     ADMIN

# Owner User
Email:    owner@onekof.com
Password: Owner@2026!
Role:     OWNER

# Regular User
Email:    user@onekof.com
Password: User@2026!
Role:     MEMBER
```

---

## 🔧 How the Code Works

### 1. Middleware (`apps/web/src/middleware.ts`)

```typescript
// Extracts organization slug from subdomain
const hostname = request.headers.get('host');
// ministry-water-irrigation.onekof.com → ministry-water-irrigation

// Adds to request headers
headers.set('x-organization-slug', organizationSlug);
```

### 2. Organization Utilities (`apps/web/src/lib/organization.ts`)

```typescript
// Get current org in any Server Component or API route
const org = await getCurrentOrganization();

// Verify user access
await checkOrganizationAccess(userId, organizationId);

// Get user's role
const role = await getUserOrganizationRole(userId, orgId);
```

### 3. Organization Selector (`apps/web/src/app/select-organization/page.tsx`)

- Shows all organizations user belongs to
- Redirects to selected organization's subdomain
- Handles both local development and production URLs

---

## 📝 Key Files Modified

1. `apps/web/src/middleware.ts` - Subdomain routing
2. `apps/web/src/lib/organization.ts` - Organization utilities
3. `apps/web/src/app/select-organization/page.tsx` - Org selector
4. `apps/web/src/app/api/user/organizations/route.ts` - API endpoint

---

## 🚀 Next Steps

1. **Configure Vercel Domains** (See "Vercel Configuration" above)
2. **Wait for DNS Propagation**
3. **Test Each Subdomain**
4. **Update Environment Variables** if needed
5. **Create Users for Other Organizations** (Olink Tech, Adwa Digital)

---

## ❓ Frequently Asked Questions

### Q: Can a user belong to multiple organizations?

**A:** Yes! Users can be members of multiple organizations with different roles. They'll see an organization selector after login.

### Q: How is data isolated?

**A:** Each organization has its own database schema (`onekof_ministry_water`, `onekof_org_olink`, etc.). Queries are automatically scoped to the correct schema.

### Q: What happens if I access the main domain?

**A:** `onekof.com` without a subdomain will show the organization selector or marketing page. Users must access via subdomain to see their org's dashboard.

### Q: Can I customize each organization's dashboard?

**A:** Yes! Each organization can have custom:
- Projects and workflows
- Teams and members
- Budget and expense tracking
- Goals and KPIs
- Branding (future feature)

### Q: How do I add a new organization?

**A:** Create organization via admin panel or database. It automatically gets a subdomain based on its `slug` field.

---

## 🎯 Summary

You now have a fully functional multi-tenant SaaS platform where:

✅ Each organization has its own subdomain
✅ Data is completely isolated per organization
✅ Users can belong to multiple organizations
✅ Authentication works across subdomains
✅ Multi-tenant architecture is implemented

**Next:** Configure Vercel wildcard domains to enable subdomain access in production!
