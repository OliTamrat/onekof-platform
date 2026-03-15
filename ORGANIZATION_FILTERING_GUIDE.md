# 🔒 Organization Filtering Guide

## Overview

This guide explains how to implement organization-based data isolation in API routes for the Onekof multi-tenant platform.

---

## 🎯 Why Organization Filtering?

In a multi-tenant SaaS platform like Onekof, **data isolation is critical**. Each organization must only see and modify their own data. Organization filtering ensures:

✅ **Security** - Users can't access other organizations' data
✅ **Privacy** - Complete data isolation between organizations
✅ **Compliance** - Meets data protection requirements
✅ **Scalability** - Clean architecture for multi-tenancy

---

## 🏗️ Architecture

### How It Works

1. **Middleware** (`apps/web/src/middleware.ts`)
   - Extracts organization slug from subdomain (e.g., `ministry-water-irrigation` from `ministry-water-irrigation.onekof.com`)
   - Sets `x-organization-slug` header on all requests

2. **Organization Context Utility** (`apps/web/src/lib/api-organization.ts`)
   - Reads organization slug from request headers
   - Validates organization exists and is active
   - Checks user has access to the organization
   - Returns organization context with user membership details

3. **API Routes**
   - Call `getOrganizationContext()` at the start
   - Use returned `organization.id` to filter all database queries
   - Ensures complete data isolation

---

## 📚 Using Organization Filtering

### Basic Usage

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getOrganizationContext } from '@/lib/api-organization';

export async function GET(request: NextRequest) {
  try {
    // 1. Get organization context and validate access
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;
    if (!context) {
      return NextResponse.json(
        { error: 'Failed to get organization context' },
        { status: 500 }
      );
    }

    const { organization, user, membership } = context;

    // 2. Use organization.id to filter queries
    const items = await prisma.item.findMany({
      where: {
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🔐 Role-Based Access Control

The organization context includes user membership details. Use helper functions for role checks:

```typescript
import {
  getOrganizationContext,
  hasRole,
  hasBudgetAccess,
  hasFullBudgetAccess,
} from '@/lib/api-organization';

export async function DELETE(request: NextRequest) {
  const { data: context, error } = await getOrganizationContext();
  if (error) return error;

  // Check if user is ADMIN or OWNER
  if (!hasRole(context.membership, ['ADMIN', 'OWNER'])) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Proceed with deletion...
}
```

### Available Role Helpers

- **`hasRole(membership, ['ADMIN', 'OWNER'])`** - Check if user has any of the specified roles
- **`hasBudgetAccess(membership)`** - Check if user has VIEW or FULL budget access
- **`hasFullBudgetAccess(membership)`** - Check if user has FULL budget access

---

## 📋 Example: Complete API Route

Here's a full example with GET, POST, and DELETE operations:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@onekof/database';
import { getOrganizationContext, hasRole } from '@/lib/api-organization';

/**
 * GET /api/teams
 * Returns all teams for the organization
 */
export async function GET(request: NextRequest) {
  try {
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;

    const teams = await prisma.team.findMany({
      where: {
        organizationId: context.organization.id,
        deletedAt: null,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams
 * Creates a new team
 */
export async function POST(request: NextRequest) {
  try {
    const { data: context, error } = await getOrganizationContext();
    if (error) return error;

    // Only ADMIN and OWNER can create teams
    if (!hasRole(context.membership, ['ADMIN', 'OWNER'])) {
      return NextResponse.json(
        { error: 'Only admins and owners can create teams' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        organizationId: context.organization.id,
        leadId: context.user.id,
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Updated API Routes

The following routes have been updated to use organization filtering:

- ✅ `/api/projects` - GET and POST operations
- ⏳ Other routes need to be updated (see Migration Checklist below)

---

## 📝 Migration Checklist

To update an existing API route:

1. **Import the utility**
   ```typescript
   import { getOrganizationContext } from '@/lib/api-organization';
   ```

2. **Replace session-based org lookup**
   ```typescript
   // ❌ OLD WAY
   const user = await prisma.user.findUnique({
     where: { email: session.user.email },
     include: { organizations: { include: { organization: true } } },
   });
   const organizationId = user.organizations[0].organizationId;

   // ✅ NEW WAY
   const { data: context, error } = await getOrganizationContext();
   if (error) return error;
   const organizationId = context.organization.id;
   ```

3. **Update all queries**
   - Ensure all database queries include `organizationId: context.organization.id`
   - Remove hardcoded organization selection logic

4. **Add role checks if needed**
   - Use `hasRole()` for admin-only operations
   - Use budget access helpers for budget-related routes

---

## 🚨 Critical Routes to Update

### High Priority (User-facing data)
- [ ] `/api/issues` - Issue management
- [ ] `/api/teams` - Team management
- [ ] `/api/goals` - Goals and OKRs
- [ ] `/api/budgets` - Budget management
- [ ] `/api/expenses` - Expense tracking
- [ ] `/api/documents` - Document management

### Medium Priority (Analytics)
- [ ] `/api/analytics/*` - All analytics endpoints
- [ ] `/api/dashboard/*` - Dashboard stats
- [ ] `/api/activities` - Activity feed

### Low Priority (Admin)
- [ ] `/api/automations` - Automation rules
- [ ] Already scoped to org or don't need filtering

---

## 🔍 Testing Organization Filtering

### Local Development

Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 ministry-water-irrigation.localhost
127.0.0.1 olink-tech.localhost
127.0.0.1 adwa-digital.localhost
```

Access: `http://ministry-water-irrigation.localhost:3000`

### Production

Access via subdomains:
```
https://ministry-water-irrigation.onekof.com
https://olink-tech.onekof.com
https://adwa-digital.onekof.com
```

### Test Cases

1. **Data Isolation**
   - Login to Org A
   - Create a project
   - Login to Org B
   - Verify project from Org A is NOT visible

2. **Access Control**
   - Try accessing Org A's subdomain as Org B user
   - Should return 403 Forbidden

3. **Role-Based Permissions**
   - Login as MEMBER
   - Try creating a team (should fail)
   - Login as ADMIN
   - Try creating a team (should succeed)

---

## 🎯 Benefits

Using `getOrganizationContext()` provides:

✅ **Security** - Automatic access validation
✅ **Consistency** - Standardized org filtering across all routes
✅ **Simplicity** - One line instead of 20+ lines of boilerplate
✅ **Type Safety** - TypeScript types for organization context
✅ **Maintenance** - Changes to org logic happen in one place

---

## 📞 Need Help?

If you encounter issues:

1. **Check middleware** - Verify `x-organization-slug` header is set
2. **Check subdomain** - Must access via org subdomain, not main domain
3. **Check membership** - User must be member of the organization
4. **Check organization status** - Organization must be ACTIVE

---

**Last Updated:** March 6, 2026
**Status:** Implementation in progress
**Next Steps:** Update remaining API routes per checklist above
