# INTELLECTUAL PROPERTY REGISTRATION — ONEKOF PLATFORM
## Ethiopian Intellectual Property Authority (EIPA)

**Applicant:** OliTamrat
**Date:** March 22, 2026
**Software Name:** Onekof — Enterprise Project Management & Budget Platform
**Version:** 1.0
**First Publication Date:** March 2026
**Country of Origin:** Ethiopia

---

## PART A: SOFTWARE COPYRIGHT REGISTRATION

### A.1 — Title of Work

**Onekof Platform** — An AI-Powered Enterprise Project Management, Budget Tracking, and Document Processing Software System

### A.2 — Nature of Work

Computer software (source code and object code), including:
- Server-side application logic (TypeScript/Node.js)
- Client-side user interface (React/TypeScript)
- Database schema and data models (PostgreSQL/Prisma)
- AI document processing algorithms
- Ethiopian calendar conversion library
- Multi-tenant routing and security middleware

### A.3 — Description of the Software

Onekof is a web-based, multi-tenant enterprise platform that provides:

1. **Project Management** — Task tracking, issue boards, sprint planning, and workflow automation for 6 industry-specific project types (Software, Business, Marketing, Operations, Research, Construction)

2. **Budget & Financial Management** — Multi-level budget access control, expense tracking with approval workflows, multi-currency support with ETB (Ethiopian Birr) as default, and real-time financial dashboards

3. **AI-Powered Document Processing** — Automated extraction of structured data from invoices, receipts, contracts, proposals, and government budget documents using natural language processing

4. **Ethiopian-First Localization** — Native Ethiopian calendar (Ge'ez/13-month) with bidirectional Gregorian conversion, Amharic/Oromo/Tigrinya/Somali language support, ETB currency, and Ethiopian fiscal year alignment (Hamle 1 — Sene 30)

5. **Multi-Tenant Architecture** — Subdomain-based organization isolation with cross-subdomain authentication, role-based access control, and data separation

### A.4 — Total Lines of Source Code

- **Application Source Code:** ~85,000+ lines (TypeScript, TSX, CSS)
- **Database Schema:** ~1,200 lines (Prisma SDL)
- **Configuration & Build:** ~2,000 lines
- **Total Files:** 465+ source files across 120+ API routes

### A.5 — Programming Languages & Technologies

| Layer | Technology |
|-------|-----------|
| Application Framework | Next.js 14 (App Router) |
| Programming Language | TypeScript 5.0 |
| User Interface | React 18, Radix UI, Tailwind CSS |
| Database | PostgreSQL 14+ with Prisma ORM 5.0 |
| Authentication | NextAuth.js v4 (JWT strategy) |
| AI Processing | Anthropic API (document analysis) |
| Deployment | Vercel (serverless) |
| Monorepo | Turborepo with apps/web + packages/database |

### A.6 — Unique Elements of the Software (Copyrightable Expression)

The following represent original creative expression in the software:

#### A.6.1 — Ethiopian Calendar Conversion Library
**File:** `apps/web/src/lib/ethiopian-calendar.ts` (229 lines)

Original implementation of bidirectional Gregorian ↔ Ethiopian (Ge'ez) calendar conversion with:
- 13-month calendar support (12 × 30 days + Pagumen 5-6 days)
- Leap year calculation (Ethiopian leap year rule: year % 4 === 3)
- Full month calendar grid generation for UI rendering
- Date arithmetic (add days, compare dates, range queries)
- Formatting with short/long/full display modes
- Month names: Meskerem, Tikimt, Hidar, Tahsas, Tir, Yekatit, Megabit, Miazia, Genbot, Sene, Hamle, Nehasse, Pagumen
- Day names: Segno, Maksegno, Erob, Hamus, Arb, Kidame, Ehud

#### A.6.2 — Multi-Tenant Routing & Organization Resolution System
**Files:** `apps/web/src/middleware.ts`, `apps/web/src/lib/api-organization.ts`

Three-tier fallback algorithm for determining organization context:
1. Subdomain extraction from hostname → organization slug lookup
2. User's default organization ID (stored preference)
3. First organization membership (deployment fallback)

With cross-subdomain JWT session management via cookie domain scoping.

#### A.6.3 — AI Document Processing Pipeline
**Files:** `apps/web/src/lib/ai/ai-service.ts`, `apps/web/src/app/api/budgets/process-document/route.ts`, `apps/web/src/app/api/budgets/analyze-receipt/route.ts`

Three-phase document extraction system:
1. Document ingestion (PDF, images, Word, CSV) with base64 encoding
2. Type-specific prompt engineering with structured JSON extraction templates
3. Cost-optimized model selection with confidence scoring and token tracking

Supports 6 document types with ETB currency default: invoices, receipts, contracts, proposals, RFPs, and government budget documents.

#### A.6.4 — Hierarchical Budget Access Control
**File:** `apps/web/src/lib/budget-access.ts`

Five-tier access hierarchy with field-level data filtering:
- NO_ACCESS → VIEW_ONLY → EDIT → APPROVE → FULL_CONTROL
- Project-level permissions override organization-level
- Role-based auto-grant (OWNER/ADMIN → FULL_CONTROL)
- Dynamic field masking based on access level (hides sensitive financial data)

#### A.6.5 — Project-Type Navigation Engine
**File:** `apps/web/src/lib/project-navigation.ts`

Dynamic navigation generation for 6 industry verticals:
- SOFTWARE: Board, Backlog, Code, Releases, Deployments, Timeline
- BUSINESS: Summary, List, Board, Calendar, Budget, Documents
- MARKETING: Campaigns, Content, Social, Analytics, Assets
- OPERATIONS: Incidents, Monitoring, Checklists, SLAs, Runbooks
- RESEARCH: Data, Findings, Objectives, Publications
- CONSTRUCTION: Plans, Materials, Inspections, Budget, Specs

Each type generates 10-12 context-specific navigation tabs with appropriate icons.

#### A.6.6 — Jira-Style Layout System
**Files:** `apps/web/src/components/layouts/jira-style-layout.tsx`, `apps/web/src/components/layouts/collapsible-sidebar.tsx`

Original layout implementation featuring:
- Collapsible sidebar with section-based navigation
- Workspace selector for multi-organization switching
- Command palette (Cmd+K) for keyboard-driven navigation
- Three-tier dark mode surface system (#1B1F23, #22272B, #282E33)
- Responsive design (desktop sidebar → mobile drawer)

#### A.6.7 — Database Schema (48 Interconnected Models)
**File:** `packages/database/prisma/schema.prisma` (~1,200 lines)

Original data architecture including:
- Multi-tenant organization model with Ethiopian customization fields
- Budget system with categories, expenses, approvals, revisions, and audit logs
- Task hierarchy with subtasks, budget allocation, and watcher notifications
- Goal/OKR system with key results and project contribution weights
- Automation rules with JSON-based conditions and actions
- Activity tracking with AI summaries and impact scoring
- Language enum (EN, AM, OM, TI, SO) and Calendar enum (GREGORIAN, ETHIOPIAN)
- Currency enum with ETB as default

---

## PART B: PATENTABLE INVENTIONS / UTILITY MODELS

The following describe novel methods and systems that may qualify for patent or utility model protection under Ethiopian Patent Law (Proclamation No. 123/1995, as amended).

### Patent Application 1: Multi-Tenant Subdomain Routing with Hierarchical Organization Resolution

**Title:** A Method and System for Subdomain-Based Multi-Tenant Organization Isolation in Web Applications

**Technical Problem:** In multi-tenant SaaS applications, users who belong to multiple organizations need seamless context switching without re-authentication, while maintaining strict data isolation between tenants.

**Novel Solution:**
1. Middleware intercepts incoming HTTP requests and extracts organization slug from the subdomain portion of the hostname (e.g., `ministry-water.onekof.com` → `ministry-water`)
2. The extracted slug is injected as a custom HTTP header (`x-organization-slug`) into the request
3. API routes resolve the organization using a three-tier fallback hierarchy:
   - **Tier 1:** Subdomain slug → database lookup by slug → validate user membership
   - **Tier 2:** User's stored default organization ID
   - **Tier 3:** First organization in user's membership list (deployment fallback)
4. Cross-subdomain session persistence via JWT tokens with cookie domain scoping (`.onekof.com`)
5. Every API response is scoped to the resolved organization, preventing cross-tenant data leakage

**Claims:**
- A method for resolving tenant context from HTTP request subdomains with multi-tier fallback
- A system for maintaining authenticated sessions across multiple subdomains using domain-scoped JWT cookies
- A middleware pipeline that injects tenant context headers for downstream API route consumption

---

### Patent Application 2: AI-Powered Financial Document Extraction with Currency-Aware Processing

**Title:** A Method for Automated Extraction of Structured Financial Data from Unstructured Documents Using AI with Default Currency Inference

**Technical Problem:** Government agencies and organizations in developing markets receive financial documents (invoices, contracts, budget proposals) in various formats (PDF, images, scans). Manual data entry is slow, error-prone, and expensive. Existing tools don't support local currencies as defaults.

**Novel Solution:**
1. Document ingestion converts uploaded files (PDF, JPEG, PNG, DOCX, CSV) to base64-encoded content
2. Document type classification determines extraction template:
   - Invoice/Receipt → vendor, line items, tax, payment terms
   - Contract → parties, value, milestones, penalties
   - Proposal/RFP → budget, timeline, objectives, deliverables
   - Government Budget → categories with accounting codes, fiscal year, ministry
3. Type-specific prompt engineering with structured JSON response format
4. **Currency inference:** If no currency is specified in the document, the system defaults to ETB (Ethiopian Birr) based on organization locale settings
5. Confidence scoring (0-100) indicates extraction reliability
6. Cost tracking per processing request (input/output tokens × model pricing)
7. Extracted data is automatically mapped to the organization's budget category structure

**Claims:**
- A method for type-specific AI extraction of financial data from unstructured documents
- A system for currency-aware document processing with locale-based default currency inference
- A pipeline for mapping AI-extracted budget items to organizational budget category hierarchies

---

### Patent Application 3: Ethiopian-Gregorian Dual Calendar System for Enterprise Applications

**Title:** A Method and System for Bidirectional Ethiopian (Ge'ez) and Gregorian Calendar Conversion in Enterprise Project Management Software

**Technical Problem:** Ethiopian government agencies, NGOs, and businesses operate on the Ethiopian calendar (13 months, 7-8 years offset from Gregorian), but international stakeholders and tools use Gregorian dates. No existing project management software provides native Ethiopian calendar support with seamless switching.

**Novel Solution:**
1. **Conversion algorithm:** Mathematical transformation between Gregorian and Ethiopian date systems accounting for:
   - 13-month structure (12 × 30 days + Pagumen 5-6 days)
   - Year offset calculation (Gregorian year − 7 or 8, depending on month)
   - Leap year determination (Ethiopian: year % 4 === 3)
   - New Year offset (September 11/12 Gregorian = Meskerem 1 Ethiopian)
2. **Dual-calendar UI component:** Side-by-side or toggle-based display showing both calendar systems simultaneously
3. **Organization-level calendar preference:** Configurable per organization type:
   - Government → Ethiopian calendar default
   - Private → Gregorian calendar default
   - Both calendars available to all users
4. **Fiscal year alignment:** Ethiopian fiscal year (Hamle 1 — Sene 30) mapped to Gregorian equivalents for budget reporting
5. **Date range queries:** Gregorian month → Ethiopian date range conversion for database queries

**Claims:**
- A bidirectional calendar conversion algorithm between Ethiopian (Ge'ez) and Gregorian calendar systems
- A dual-calendar user interface component for enterprise applications
- A system for organization-configurable calendar preferences with fiscal year alignment

---

### Patent Application 4: Hierarchical Budget Access Control with Dynamic Field-Level Data Masking

**Title:** A Method for Role-Based Financial Data Access Control with Dynamic Field Visibility in Multi-Tenant Applications

**Technical Problem:** In government and enterprise projects, different team members require different levels of budget visibility. A project coordinator may see total amounts, but only a financial officer should see vendor details, receipts, and audit trails. Existing tools provide binary access (view all or view nothing).

**Novel Solution:**
1. Five-tier access hierarchy: NO_ACCESS → VIEW_ONLY → EDIT → APPROVE → FULL_CONTROL
2. Two-level permission resolution:
   - **Project-level:** Specific budget permissions per project (highest priority)
   - **Organization-level:** Default budget permissions across all projects (fallback)
3. Role-based auto-grant: Organization OWNER and ADMIN roles automatically receive FULL_CONTROL
4. **Dynamic field masking (`filterBudgetData`):**
   - VIEW_ONLY: Total amounts, category names
   - EDIT: + Category details, basic expenses
   - APPROVE: + Vendor details, receipts, approval actions
   - FULL_CONTROL: + Settings, audit logs, revision history
5. API responses dynamically strip restricted fields before returning to client

**Claims:**
- A method for hierarchical budget access control with project-level override of organization-level permissions
- A system for dynamic field-level data masking based on user access tier
- An API response filtering mechanism that strips restricted financial data fields based on resolved access level

---

### Patent Application 5: Project-Type-Aware Dynamic Navigation System

**Title:** A Method for Generating Context-Specific Application Navigation Based on Project Classification

**Technical Problem:** General-purpose project management tools (Jira, Asana) show the same navigation to all projects regardless of industry. A construction project doesn't need "Code Repositories" and a software project doesn't need "Materials Tracking." This creates UI clutter and confusion.

**Novel Solution:**
1. Projects are classified into one of 6 industry types at creation: SOFTWARE, BUSINESS, MARKETING, OPERATIONS, RESEARCH, CONSTRUCTION
2. A navigation engine dynamically generates 10-12 contextually relevant tabs per project type:
   - Each type maps to specific feature modules (e.g., CONSTRUCTION → Plans, Materials, Inspections)
   - Each tab includes type-appropriate icons and routing
3. The sidebar renders only relevant navigation items, reducing cognitive load
4. Users see industry-specific terminology (e.g., "Incidents" for OPERATIONS vs. "Issues" for SOFTWARE)
5. New project types can be added without modifying existing navigation code

**Claims:**
- A method for generating dynamic application navigation based on project type classification
- A system for industry-specific feature module selection in enterprise project management
- A navigation engine that maps project classifications to contextually relevant UI components

---

## PART C: TRADE SECRETS & PROPRIETARY KNOW-HOW

The following constitute trade secrets and confidential business information:

### C.1 — AI Prompt Engineering Templates

The specific prompt structures, extraction templates, and confidence calibration parameters used in the document processing pipeline. These are optimized through iterative testing for Ethiopian government document formats.

### C.2 — Budget Category Mapping Logic

The algorithm for automatically mapping AI-extracted line items to organizational budget category hierarchies, including government accounting code matching (e.g., codes 5210-5260).

### C.3 — Multi-Currency Exchange Rate Handling

The system for tracking additional funding sources with exchange rates, disbursement schedules, and automatic ETB conversion for international donor funding.

### C.4 — Progressive Account Lockout Algorithm

Escalating lockout durations [15, 30, 60, 240, 1440 minutes] with automatic unlock and email notification, designed to prevent brute-force attacks while maintaining user accessibility.

### C.5 — Organization Type Configuration System

The specific feature flag combinations and default settings for each organization type (Government, NGO, Private, Construction, Education, Healthcare), calibrated for Ethiopian market requirements.

---

## PART D: TRADEMARK REGISTRATION

### D.1 — Word Marks

| Mark | Class | Description |
|------|-------|-------------|
| **ONEKOF** | Class 9 (Software) | Computer software for project management and budget tracking |
| **ONEKOF** | Class 42 (SaaS) | Software as a service for enterprise project management |

### D.2 — Domain Names

| Domain | Status |
|--------|--------|
| onekof.com | Registered |
| *.onekof.com | Wildcard subdomain (multi-tenant) |

---

## PART E: SUPPORTING EVIDENCE

### E.1 — Source Code Repository

- **Repository:** github.com/OliTamrat/onekof-platform
- **Total Commits:** 130 commits
- **First Commit Date:** [earliest commit date]
- **Contributors:** OliTamrat (sole author)
- **License:** Proprietary (all rights reserved)

### E.2 — Key Source Files for Examination

| File | Lines | Purpose |
|------|-------|---------|
| `apps/web/src/lib/ethiopian-calendar.ts` | 229 | Ethiopian calendar conversion algorithms |
| `apps/web/src/lib/budget-access.ts` | ~150 | Budget access control system |
| `apps/web/src/lib/api-organization.ts` | ~100 | Multi-tenant organization resolution |
| `apps/web/src/middleware.ts` | ~200 | Subdomain routing & security headers |
| `apps/web/src/lib/ai/ai-service.ts` | 350 | AI document processing pipeline |
| `apps/web/src/lib/project-navigation.ts` | ~200 | Project-type navigation engine |
| `apps/web/src/lib/auth.ts` | ~250 | Cross-subdomain JWT authentication |
| `packages/database/prisma/schema.prisma` | 1,200 | Complete database schema (48 models) |
| `apps/web/src/config/organization-types.ts` | ~150 | Ethiopian organization type configs |
| `apps/web/src/components/calendar/dual-calendar.tsx` | ~300 | Dual calendar UI component |

### E.3 — Deployment Evidence

- **Production URL:** https://onekof.com
- **Hosting Provider:** Vercel (San Francisco, CA)
- **Database Provider:** PostgreSQL (managed)
- **Active Since:** March 2026

---

## PART F: DECLARATION

I, OliTamrat, hereby declare that:

1. I am the sole author and creator of the Onekof Platform software described herein.
2. The software is an original work of authorship and has not been copied from any other work.
3. The algorithms and methods described in Part B represent novel inventions to the best of my knowledge.
4. I am the rightful owner of all intellectual property rights in the software.
5. All information provided in this application is true and correct to the best of my knowledge.

**Signature:** ___________________________

**Name:** OliTamrat

**Date:** March 22, 2026

**Contact:** oli.oli@udc.edu

---

## APPENDIX: ETHIOPIAN IP LAW REFERENCES

### Applicable Legislation

| Law | Coverage |
|-----|----------|
| **Copyright and Neighboring Rights Protection Proclamation No. 410/2004** | Software copyright (automatic, registration strengthens enforcement) |
| **Inventions, Minor Inventions and Industrial Designs Proclamation No. 123/1995** | Patent and utility model protection for algorithms/methods |
| **Trademark Registration and Protection Proclamation No. 501/2006** | "ONEKOF" brand protection |
| **Trade Secrets Protection (Civil Code Art. 2057-2060)** | Confidential algorithms and business logic |

### EIPA Filing Requirements

**For Software Copyright:**
- [ ] Completed application form (Form C-1)
- [ ] Two copies of source code (first and last 25 pages, or full if under 50 pages)
- [ ] Description of the software functionality
- [ ] Date of first publication
- [ ] Filing fee (currently ~500 ETB)

**For Patent/Utility Model:**
- [ ] Patent application form (Form P-1)
- [ ] Detailed technical description with claims
- [ ] Abstract (max 150 words per patent)
- [ ] Drawings/flowcharts (if applicable)
- [ ] Filing fee (currently ~1,000 ETB per patent)
- [ ] Priority claim (if applicable)

**For Trademark:**
- [ ] Trademark application form (Form TM-1)
- [ ] Logo/wordmark specimen
- [ ] List of goods/services with Nice Classification
- [ ] Filing fee (currently ~2,000 ETB per class)

### Recommended Filing Order

1. **Software Copyright** — File immediately (strongest, easiest, cheapest)
2. **Trademark "ONEKOF"** — File in Classes 9 and 42
3. **Utility Model** for Ethiopian Calendar System — Strongest novelty claim
4. **Patent Application** for AI Document Processing — Broadest commercial value
5. **Patent Application** for Multi-Tenant Routing — Core architecture protection
6. **Patent Application** for Budget Access Control — Enterprise differentiation
7. **Patent Application** for Project-Type Navigation — UI/UX innovation

---

*This document was prepared for submission to the Ethiopian Intellectual Property Authority (EIPA), Addis Ababa, Ethiopia.*
