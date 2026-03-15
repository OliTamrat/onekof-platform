# Fix 403 Forbidden Error on /api/projects

## Problem
When accessing the dashboard, you see 403 (Forbidden) errors in the console for /api/projects

## Root Cause
The user is not added as a member of the organization in the OrganizationMember table.

## Quick Fix
Add the organization owner as a member using Prisma Studio or SQL.

See full documentation in the file.
