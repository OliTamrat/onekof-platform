# Source Code Deposit Instructions

## EIPA Requirement
Two (2) copies of the source code must be submitted:
- **If source code is 50+ pages:** Submit the first 25 pages AND last 25 pages
- **If source code is under 50 pages:** Submit the full source code

## How to Prepare the Source Code Deposit

### Step 1: Identify Key Source Files
The OneKof Platform core files to include:

**Application Core (First 25 pages):**
```
apps/web/src/app/layout.tsx
apps/web/src/app/page.tsx
apps/web/src/app/(dashboard)/layout.tsx
apps/web/src/app/(dashboard)/projects/page.tsx
apps/web/src/app/(dashboard)/teams/page.tsx
apps/web/src/middleware.ts
packages/database/prisma/schema.prisma
packages/auth/src/index.ts
```

**Application Features (Last 25 pages):**
```
apps/web/src/components/dashboard/*
apps/web/src/lib/api/*
packages/database/src/*
```

### Step 2: Print or Export
1. Print source code on A4 paper, single-sided
2. Use a monospace font (Courier New, 10pt recommended)
3. Include file path headers on each page
4. Number all pages sequentially

### Step 3: Generate the Deposit
Run from project root:
```bash
# Generate a formatted source code PDF for deposit
# (You may use any code-to-PDF tool of your choice)
```

## Notes
- Do NOT include node_modules, .env files, or third-party dependencies
- Do NOT include API keys, secrets, or credentials
- Include only original source code authored by the applicant
