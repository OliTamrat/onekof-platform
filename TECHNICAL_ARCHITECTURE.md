# Onekof - Enterprise Technical Architecture
## World-Class Project Management Platform

**Version:** 1.0
**Target:** Enterprise-grade project management for Ethiopian organizations
**Scale:** 100K+ organizations, 10M+ users

---

## Executive Summary

Onekof is built as a modern, cloud-native SaaS platform purpose-built for Ethiopian government agencies, NGOs, and enterprises. The architecture prioritizes:

- **Real-time collaboration** at scale
- **Multi-tenancy** with complete data isolation
- **Event-driven architecture** for extensibility
- **AI-native** features, not bolt-ons
- **Offline-first** mobile experience
- **Sub-second performance** globally

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CDN Layer (Cloudflare)                   │
│              Static Assets, Edge Caching, DDoS Protection        │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                      Load Balancer (Vercel Edge)                 │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│   Web App      │    │   API Gateway       │    │  Mobile API     │
│   (Next.js)    │    │   (tRPC/REST)       │    │  (React Native) │
│                │    │                     │    │                 │
│ - SSR/RSC      │    │ - Authentication    │    │ - Offline sync  │
│ - Edge Runtime │    │ - Rate limiting     │    │ - Push notif    │
└────────────────┘    └─────────────────────┘    └─────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  Core Services │    │  Collaboration      │    │  AI Services    │
│                │    │  Engine             │    │                 │
│ - Projects     │    │                     │    │ - Anthropic API │
│ - Issues       │    │ - WebSocket Server  │    │ - Embeddings    │
│ - Workflows    │    │ - CRDT Sync (Yjs)   │    │ - Smart Suggest │
│ - Permissions  │    │ - Presence          │    │ - Summarization │
└────────────────┘    └─────────────────────┘    └─────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  PostgreSQL    │    │   Redis Cluster     │    │  Elasticsearch  │
│  (Primary DB)  │    │                     │    │                 │
│                │    │ - Caching           │    │ - Full-text     │
│ - Multi-tenant │    │ - Sessions          │    │ - Semantic      │
│ - pgvector     │    │ - Pub/Sub           │    │ - Analytics     │
│ - Row-level    │    │ - Rate limiting     │    │                 │
└────────────────┘    └─────────────────────┘    └─────────────────┘
        │                         │                         │
┌───────▼────────┐    ┌──────────▼──────────┐    ┌────────▼────────┐
│  Object Store  │    │  Message Queue      │    │  Observability  │
│  (S3/R2)       │    │  (BullMQ/Redis)     │    │                 │
│                │    │                     │    │ - Sentry        │
│ - Attachments  │    │ - Async jobs        │    │ - OpenTelemetry │
│ - Documents    │    │ - Webhooks          │    │ - Logs (Better) │
│ - Exports      │    │ - Email queue       │    │ - Metrics       │
└────────────────┘    └─────────────────────┘    └─────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | Next.js 14+ (App Router) | Server components, streaming, edge runtime, best DX |
| **Language** | TypeScript 5+ | Type safety, better tooling, reduced runtime errors |
| **UI Library** | React 18+ | Industry standard, great ecosystem |
| **Styling** | Tailwind CSS 4 | Utility-first, fast development, small bundle |
| **Components** | Radix UI + Headless UI | Accessible primitives, unstyled, composable |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable (NO EMOJIS) |
| **State** | Zustand + TanStack Query | Lightweight state, powerful data fetching |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation |
| **Tables** | TanStack Table | Headless, powerful, handles 10K+ rows |
| **Drag & Drop** | dnd-kit | Accessible, smooth, keyboard support |
| **Rich Text** | Tiptap + Prosemirror | Extensible, collaborative, like Notion |
| **Charts** | Recharts + Tremor | Declarative, responsive, beautiful |
| **Real-time** | Yjs + y-websocket | CRDT for conflict-free collaboration |
| **Animations** | Framer Motion | Smooth, declarative, spring physics |
| **Typography** | SF Pro (Latin), Abyssinica SIL (Ge'ez) | Apple-quality fonts for professional UI |

### Backend Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | Next.js API Routes + tRPC | Type-safe APIs, end-to-end TypeScript |
| **ORM** | Prisma 5+ | Type-safe queries, migrations, excellent DX |
| **Database** | PostgreSQL 16+ | ACID, JSON support, pgvector, mature |
| **Caching** | Redis (Upstash) | In-memory speed, pub/sub, distributed locks |
| **Search** | Elasticsearch 8+ | Full-text, faceted, real-time indexing |
| **Vector DB** | pgvector (in Postgres) | Semantic search, AI embeddings, single DB |
| **Queue** | BullMQ (Redis-based) | Reliable, retries, scheduling, UI |
| **Storage** | Cloudflare R2 | S3-compatible, no egress fees, fast |
| **Auth** | NextAuth.js v5 + Lucia | Flexible, secure, OAuth + credentials |
| **Email** | Resend | Developer-friendly, React email templates |
| **WebSocket** | Socket.io + Redis adapter | Real-time, rooms, reliable, scalable |
| **Logging** | Pino + Better Stack | Structured, fast, searchable |
| **Monitoring** | Sentry + OpenTelemetry | Error tracking, performance, traces |

### AI Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **LLM** | Anthropic 3.5 Sonnet | Best reasoning, long context, function calling |
| **AI SDK** | Vercel AI SDK | Streaming, tool calling, edge-compatible |
| **Embeddings** | text-embedding-3-large | Best quality embeddings for search |
| **Vector Store** | pgvector | Keep everything in Postgres, simpler |

### DevOps & Infrastructure

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Hosting** | Vercel (frontend) + Railway (backend) | Edge network, zero-config, great DX |
| **Database** | Supabase or Neon | Managed Postgres, connection pooling, backups |
| **CI/CD** | GitHub Actions | Free, powerful, integrated |
| **Monitoring** | Datadog or Grafana Cloud | Dashboards, alerts, APM |
| **CDN** | Cloudflare | Global edge, DDoS protection, caching |
| **Domain** | Cloudflare | DNS, SSL, security |

### Mobile Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Framework** | React Native + Expo | Native performance, code sharing, OTA updates |
| **Navigation** | Expo Router | File-based, type-safe, deep linking |
| **Offline** | WatermelonDB | SQLite-based, syncs with backend |
| **Push** | Expo Notifications | Cross-platform, reliable |

---

## Database Schema Design

### Multi-Tenancy Strategy

**Approach:** Schema-based isolation (best balance of isolation and performance)

Each organization gets its own schema in a shared database:
- `onekof_org_123` (Organization 1)
- `onekof_org_456` (Organization 2)
- `onekof_public` (Shared/system tables)

**Benefits:**
- Data isolation (security)
- Easier compliance (GDPR, data residency)
- Per-tenant backups and migrations
- Query performance (smaller tables)

### Core Tables

```prisma
// prisma/schema.prisma

// ============================================
// SHARED SCHEMA (onekof_public)
// ============================================

model Organization {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  schemaName      String   @unique // e.g., "onekof_org_abc123"

  // Subscription
  plan            Plan     @default(FREE)
  status          OrgStatus @default(ACTIVE)
  billingEmail    String?

  // Settings
  settings        Json     @default("{}")
  features        Json     @default("[]")

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  // Relations
  members         OrganizationMember[]
  invitations     Invitation[]

  @@map("organizations")
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  emailVerified   DateTime?

  // Profile
  name            String?
  avatar          String?
  timezone        String   @default("Africa/Addis_Ababa")
  language        Language @default(EN)

  // Authentication
  password        String?  // Hashed

  // Preferences
  preferences     Json     @default("{}")

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastLoginAt     DateTime?

  // Relations
  accounts        Account[]
  sessions        Session[]
  organizations   OrganizationMember[]

  @@map("users")
}

model OrganizationMember {
  id              String   @id @default(cuid())

  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])

  userId          String
  user            User     @relation(fields: [userId], references: [id])

  role            OrgRole  @default(MEMBER)

  joinedAt        DateTime @default(now())
  invitedBy       String?

  @@unique([organizationId, userId])
  @@map("organization_members")
}

// ============================================
// TENANT SCHEMA (onekof_org_*)
// ============================================

// Each organization has these tables in their schema

model Workspace {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?

  // Settings
  visibility      Visibility @default(PRIVATE)
  settings        Json     @default("{}")

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  archivedAt      DateTime?

  // Relations
  projects        Project[]
  members         WorkspaceMember[]

  @@map("workspaces")
}

model Project {
  id              String   @id @default(cuid())
  key             String   @unique // e.g., "ONEKOF"
  name            String
  description     String?

  workspaceId     String
  workspace       Workspace @relation(fields: [workspaceId], references: [id])

  // Settings
  type            ProjectType @default(SOFTWARE)
  template        String?  // e.g., "scrum", "kanban", "ngo"
  settings        Json     @default("{}")

  // Lead & Team
  leadId          String?
  defaultAssigneeId String?

  // Status
  status          ProjectStatus @default(ACTIVE)

  // Dates
  startDate       DateTime?
  targetDate      DateTime?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  archivedAt      DateTime?

  // Relations
  issues          Issue[]
  sprints         Sprint[]
  boards          Board[]
  documents       Document[]
  workflows       Workflow[]

  @@map("projects")
}

model Issue {
  id              String   @id @default(cuid())
  key             String   @unique // e.g., "ONEKOF-123"

  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])

  // Core fields
  type            IssueType @default(TASK)
  title           String
  description     String?  // Markdown or JSON (Tiptap)

  // Assignment
  assigneeId      String?
  reporterId      String

  // Status & Priority
  status          String   // Custom per workflow
  priority        Priority @default(MEDIUM)

  // Hierarchy
  parentId        String?  // For epics/subtasks
  parent          Issue?   @relation("IssueHierarchy", fields: [parentId], references: [id])
  children        Issue[]  @relation("IssueHierarchy")

  // Sprint
  sprintId        String?
  sprint          Sprint?  @relation(fields: [sprintId], references: [id])

  // Estimation
  storyPoints     Int?
  originalEstimate Int?   // minutes
  timeSpent       Int?     // minutes
  remainingEstimate Int?   // minutes

  // Workflow
  workflowId      String
  workflow        Workflow @relation(fields: [workflowId], references: [id])

  // AI fields
  embedding       Unsupported("vector(1536)")?  // pgvector for semantic search
  aiSummary       String?
  aiTags          String[]

  // Dates
  dueDate         DateTime?
  startDate       DateTime?
  resolvedAt      DateTime?
  closedAt        DateTime?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  comments        Comment[]
  attachments     Attachment[]
  links           IssueLink[] @relation("IssueLinks")
  linkedBy        IssueLink[] @relation("LinkedIssues")
  labels          IssueLabel[]
  watchers        IssueWatcher[]
  history         IssueHistory[]

  @@map("issues")
}

model Comment {
  id              String   @id @default(cuid())

  issueId         String
  issue           Issue    @relation(fields: [issueId], references: [id])

  authorId        String

  content         String   // Markdown or JSON

  // Threading
  parentId        String?
  parent          Comment? @relation("CommentThread", fields: [parentId], references: [id])
  replies         Comment[] @relation("CommentThread")

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  @@map("comments")
}

model Document {
  id              String   @id @default(cuid())
  title           String

  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])

  // Content
  content         Json     // Tiptap JSON
  contentText     String   // Plain text for search

  // Hierarchy (for folders/pages)
  parentId        String?
  parent          Document? @relation("DocumentTree", fields: [parentId], references: [id])
  children        Document[] @relation("DocumentTree")

  // Authorship
  createdBy       String
  lastEditedBy    String?

  // Permissions
  visibility      DocVisibility @default(PROJECT)

  // Collaboration
  isTemplate      Boolean  @default(false)

  // AI
  embedding       Unsupported("vector(1536)")?
  aiSummary       String?

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  publishedAt     DateTime?
  archivedAt      DateTime?

  // Relations
  versions        DocumentVersion[]
  comments        DocumentComment[]

  @@map("documents")
}

model Workflow {
  id              String   @id @default(cuid())
  name            String

  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])

  // Workflow definition
  states          Json     // Array of state objects
  transitions     Json     // State machine rules

  // Settings
  isDefault       Boolean  @default(false)
  issueTypes      IssueType[]

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  issues          Issue[]

  @@map("workflows")
}

model Sprint {
  id              String   @id @default(cuid())
  name            String
  goal            String?

  projectId       String
  project         Project  @relation(fields: [projectId], references: [id])

  // Sprint dates
  startDate       DateTime
  endDate         DateTime

  // Status
  status          SprintStatus @default(PLANNED)

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?

  // Relations
  issues          Issue[]

  @@map("sprints")
}

// ... Additional tables:
// - Board (Kanban/Scrum boards)
// - BoardColumn
// - Attachment
// - IssueLink
// - Label
// - IssueLabel
// - IssueWatcher
// - IssueHistory
// - DocumentVersion
// - DocumentComment
// - Automation
// - Webhook
// - Integration
// - AuditLog

// ============================================
// ENUMS
// ============================================

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum OrgStatus {
  ACTIVE
  SUSPENDED
  TRIAL
  CANCELLED
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
  GUEST
}

enum Language {
  EN    // English
  AM    // Amharic
  OM    // Afaan Oromo
  TI    // Tigrinya
  SO    // Somali
}

enum Visibility {
  PUBLIC
  PRIVATE
  INTERNAL
}

enum ProjectType {
  SOFTWARE
  BUSINESS
  NGO
  GOVERNMENT
  CONSTRUCTION
  CUSTOM
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  ON_HOLD
}

enum IssueType {
  EPIC
  STORY
  TASK
  BUG
  SUBTASK
  IMPROVEMENT
}

enum Priority {
  LOWEST
  LOW
  MEDIUM
  HIGH
  HIGHEST
  CRITICAL
}

enum SprintStatus {
  PLANNED
  ACTIVE
  COMPLETED
}

enum DocVisibility {
  PROJECT
  WORKSPACE
  ORGANIZATION
  PUBLIC
}
```

---

## Real-Time Collaboration Architecture

### Technology: Yjs + WebSocket

**Why Yjs?**
- CRDT (Conflict-free Replicated Data Type) - no locking needed
- Used by Notion, Linear, Figma
- Automatic conflict resolution
- Offline-first

**Architecture:**

```
Client 1                    Client 2                    Client 3
   │                           │                           │
   │ Edit document            │                           │
   └──────► Yjs Doc           │                           │
              │                │                           │
              │ Send update    │                           │
              └────────────────┼───────► WebSocket Server  │
                               │              │            │
                               │              │ Broadcast  │
                               │              └────────────┼───►
                               │                           │
                               │ ◄─────────────────────────┘
                               │ Receive & apply update
                               ▼
                          Yjs Doc (synced)
```

**Implementation:**

```typescript
// server/realtime/collaboration-server.ts
import { Server } from 'socket.io';
import { Redis } from 'ioredis';
import * as Y from 'yjs';

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL },
  adapter: createAdapter(redisClient), // For horizontal scaling
});

// Document rooms
const documents = new Map<string, Y.Doc>();

io.on('connection', (socket) => {
  // Authenticate
  const user = await authenticateSocket(socket);

  socket.on('join-document', async (docId: string) => {
    // Check permissions
    const canAccess = await checkDocumentAccess(user.id, docId);
    if (!canAccess) return socket.disconnect();

    // Join room
    socket.join(`doc:${docId}`);

    // Get or create Yjs document
    let doc = documents.get(docId);
    if (!doc) {
      doc = await loadDocument(docId);
      documents.set(docId, doc);
    }

    // Send initial state
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit('sync-document', state);

    // Handle updates
    socket.on('document-update', (update: Uint8Array) => {
      Y.applyUpdate(doc, update);
      socket.to(`doc:${docId}`).emit('document-update', update);

      // Persist to DB (debounced)
      debouncedSave(docId, doc);
    });

    // Presence (who's viewing)
    socket.on('presence-update', (presence) => {
      socket.to(`doc:${docId}`).emit('presence-update', {
        userId: user.id,
        ...presence,
      });
    });
  });
});
```

---

## Permission System

### RBAC + ABAC Hybrid

**Organization Roles:**
- Owner (full control)
- Admin (manage members, billing)
- Member (default access)
- Guest (limited access)

**Project Roles:**
- Project Admin
- Developer
- Viewer

**Issue-Level Permissions:**
- Assignee (can edit, transition)
- Reporter (can comment)
- Watcher (can view updates)

**Implementation:**

```typescript
// lib/permissions/index.ts

type Permission =
  | 'project:create'
  | 'project:edit'
  | 'project:delete'
  | 'issue:create'
  | 'issue:edit'
  | 'issue:assign'
  | 'issue:transition'
  | 'document:create'
  | 'document:edit'
  | 'document:delete';

interface Context {
  userId: string;
  organizationId: string;
  projectId?: string;
  resourceId?: string;
}

class PermissionEngine {
  async can(
    permission: Permission,
    context: Context
  ): Promise<boolean> {
    // 1. Check organization role
    const orgRole = await this.getOrganizationRole(
      context.userId,
      context.organizationId
    );

    if (orgRole === 'OWNER' || orgRole === 'ADMIN') {
      return true; // Admins can do most things
    }

    // 2. Check project role
    if (context.projectId) {
      const projectRole = await this.getProjectRole(
        context.userId,
        context.projectId
      );

      // Apply project-level rules
      if (permission.startsWith('project:')) {
        return this.checkProjectPermission(permission, projectRole);
      }
    }

    // 3. Check resource-specific permissions
    if (context.resourceId) {
      return this.checkResourcePermission(
        permission,
        context.userId,
        context.resourceId
      );
    }

    return false;
  }

  // ...implementation details
}

export const permissions = new PermissionEngine();

// Usage in API routes
export async function updateIssue(issueId: string, userId: string, data: any) {
  const canEdit = await permissions.can('issue:edit', {
    userId,
    organizationId: await getOrgId(issueId),
    projectId: await getProjectId(issueId),
    resourceId: issueId,
  });

  if (!canEdit) {
    throw new ForbiddenError('You cannot edit this issue');
  }

  // Proceed with update
}
```

---

## Search Architecture

### Multi-Layer Search

1. **Basic search:** PostgreSQL full-text search (fast, simple queries)
2. **Advanced search:** Elasticsearch (complex filters, facets, aggregations)
3. **Semantic search:** pgvector embeddings (AI-powered, find similar)

**Implementation:**

```typescript
// lib/search/search-engine.ts

interface SearchQuery {
  query: string;
  filters?: {
    projectId?: string;
    type?: IssueType[];
    status?: string[];
    assignee?: string;
    dateRange?: { start: Date; end: Date };
  };
  searchType?: 'keyword' | 'semantic' | 'hybrid';
  limit?: number;
}

class SearchEngine {
  // 1. Keyword search (Elasticsearch)
  async keywordSearch(query: SearchQuery) {
    const result = await elasticsearchClient.search({
      index: 'issues',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: query.query,
                  fields: ['title^3', 'description', 'comments'],
                  fuzziness: 'AUTO',
                },
              },
            ],
            filter: this.buildFilters(query.filters),
          },
        },
        highlight: {
          fields: {
            title: {},
            description: {},
          },
        },
        size: query.limit || 20,
      },
    });

    return this.formatResults(result);
  }

  // 2. Semantic search (pgvector)
  async semanticSearch(query: SearchQuery) {
    // Generate embedding for query
    const embedding = await generateEmbedding(query.query);

    // Find similar issues using cosine similarity
    const results = await prisma.$queryRaw`
      SELECT
        id, title, description,
        1 - (embedding <=> ${embedding}::vector) AS similarity
      FROM issues
      WHERE
        project_id = ${query.filters?.projectId}
        AND (embedding <=> ${embedding}::vector) < 0.3
      ORDER BY embedding <=> ${embedding}::vector
      LIMIT ${query.limit || 20}
    `;

    return results;
  }

  // 3. Hybrid search (combine both)
  async hybridSearch(query: SearchQuery) {
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordSearch({ ...query, limit: 15 }),
      this.semanticSearch({ ...query, limit: 15 }),
    ]);

    // Merge and re-rank (RRF - Reciprocal Rank Fusion)
    return this.mergeResults(keywordResults, semanticResults);
  }
}
```

---

## Workflow Engine

### State Machine Implementation

**Visual Builder** + **JSON Definition** approach for workflow automation

```typescript
// lib/workflows/workflow-engine.ts

interface WorkflowState {
  id: string;
  name: string;
  type: 'TODO' | 'IN_PROGRESS' | 'DONE';
  color: string;
}

interface WorkflowTransition {
  id: string;
  from: string;      // state ID
  to: string;        // state ID
  name: string;      // e.g., "Start Progress"
  conditions?: {
    type: 'field' | 'permission' | 'custom';
    field?: string;
    operator?: '==' | '!=' | '>' | '<';
    value?: any;
    permission?: Permission;
  }[];
  actions?: {
    type: 'set_field' | 'notify' | 'webhook' | 'assign';
    field?: string;
    value?: any;
    webhookUrl?: string;
  }[];
}

interface Workflow {
  id: string;
  name: string;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  initialState: string;
}

class WorkflowEngine {
  async canTransition(
    issue: Issue,
    transitionId: string,
    userId: string
  ): Promise<boolean> {
    const workflow = await this.getWorkflow(issue.workflowId);
    const transition = workflow.transitions.find(t => t.id === transitionId);

    if (!transition) return false;
    if (transition.from !== issue.status) return false;

    // Check conditions
    for (const condition of transition.conditions || []) {
      const passed = await this.evaluateCondition(condition, issue, userId);
      if (!passed) return false;
    }

    return true;
  }

  async executeTransition(
    issue: Issue,
    transitionId: string,
    userId: string
  ) {
    const workflow = await this.getWorkflow(issue.workflowId);
    const transition = workflow.transitions.find(t => t.id === transitionId);

    // Update status
    await prisma.issue.update({
      where: { id: issue.id },
      data: { status: transition.to },
    });

    // Execute actions
    for (const action of transition.actions || []) {
      await this.executeAction(action, issue, userId);
    }

    // Create history entry
    await this.recordHistory(issue.id, transition, userId);
  }

  private async executeAction(action: any, issue: Issue, userId: string) {
    switch (action.type) {
      case 'set_field':
        await prisma.issue.update({
          where: { id: issue.id },
          data: { [action.field]: action.value },
        });
        break;

      case 'notify':
        await this.sendNotification(issue, action);
        break;

      case 'webhook':
        await this.triggerWebhook(action.webhookUrl, issue);
        break;

      case 'assign':
        await prisma.issue.update({
          where: { id: issue.id },
          data: { assigneeId: action.userId },
        });
        break;
    }
  }
}
```

---

## AI Features (Competitive Advantage)

### AI-Native Features (Not Bolt-Ons)

1. **Smart Task Decomposition**
   - User creates epic: "Build user authentication"
   - AI generates subtasks: Setup OAuth, Email verification, Password reset, etc.

2. **Intelligent Summarization**
   - Long issue discussions → AI summary
   - Sprint reports → Executive summary

3. **Semantic Search**
   - Search "login broken" → finds related issues even if they say "authentication failing"

4. **Smart Suggestions**
   - Suggest assignees based on past work
   - Suggest labels based on content
   - Estimate story points based on similar tasks

5. **Meeting Notes → Tasks**
   - Upload meeting transcript
   - AI extracts action items and creates issues

**Implementation:**

```typescript
// lib/ai/task-decomposition.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function decomposeEpic(
  epic: Issue,
  context: { project: Project; relatedIssues: Issue[] }
) {
  const prompt = `You are an expert project manager. Break down this epic into actionable subtasks.

Epic: ${epic.title}
Description: ${epic.description}

Project context:
- Type: ${context.project.type}
- Past similar work: ${context.relatedIssues.map(i => i.title).join(', ')}

Generate 5-10 subtasks as JSON array with format:
[
  {
    "title": "Task title",
    "description": "What needs to be done",
    "type": "TASK" | "BUG" | "STORY",
    "estimatedHours": number,
    "dependencies": [index of other tasks]
  }
]

Focus on tasks that are:
- Specific and actionable
- Properly scoped (not too big)
- Logically ordered
- Realistic for the project type`;

  const response = await anthropic.messages.create({
    model: process.env.AI_MODEL || 'anthropic-sonnet',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const tasks = JSON.parse(response.content[0].text);

  // Create subtasks in database
  const created = [];
  for (const task of tasks) {
    const subtask = await prisma.issue.create({
      data: {
        projectId: epic.projectId,
        parentId: epic.id,
        type: task.type,
        title: task.title,
        description: task.description,
        reporterId: epic.reporterId,
        workflowId: epic.workflowId,
        status: 'TODO',
        originalEstimate: task.estimatedHours * 60, // convert to minutes
        key: await generateIssueKey(epic.projectId),
      },
    });
    created.push(subtask);
  }

  return created;
}
```

---

## Platform Differentiators

### What Makes Onekof Unique

| Feature | Foreign PM Tools | Onekof |
|---------|-----------------|--------|
| **Setup Time** | Hours of configuration | 5-minute guided setup with templates |
| **AI Integration** | Paid add-on or unavailable | Built-in, context-aware, no extra cost |
| **Mobile Experience** | Limited functionality | Native offline-first app |
| **Document Collaboration** | Separate tools required | Integrated, real-time collaborative editing |
| **Search** | Keyword only | Semantic + keyword hybrid |
| **Calendar** | Gregorian only | Ethiopian + Gregorian toggle |
| **Language Support** | English-first | English + Amharic + Oromo + Tigrinya |
| **Pricing** | $7-$15+/user | $3-$8/user |
| **Learning Curve** | Steep (weeks to master) | Intuitive (hours to proficient) |
| **Automation** | Complex query syntax required | Visual no-code builder |
| **Async Collaboration** | Comments only | Voice notes, async video, screen recordings |

### Unique Features

1. **Ethiopian Templates**
   - NGO project tracking (donor reporting, beneficiary tracking)
   - Government procurement workflow
   - Construction project management
   - Software development (agile boards, sprints, backlog)

2. **Bi-Directional Calendar**
   - See deadlines in both Gregorian and Ethiopian calendar
   - Holidays recognized automatically
   - Fast day support (notifications adjusted)

3. **Local Payment Integration**
   - Chapa (cards, mobile money)
   - Telebirr
   - CBE Birr
   - ETB pricing (no forex fluctuation)

4. **Offline-First Mobile**
   - Full app works offline
   - Sync when connection returns
   - Critical for rural/low-connectivity areas

5. **Voice & Video Integration**
   - Record voice note on issue (like Telegram)
   - Quick Loom-style screen recordings
   - Async stand-ups (record video update)

---

## Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| **Page Load (P95)** | < 2s | SSR, edge caching, code splitting |
| **Time to Interactive** | < 3s | Minimal JS, progressive enhancement |
| **API Response (P95)** | < 200ms | Database indexing, Redis caching |
| **Search Latency** | < 500ms | Elasticsearch, optimized queries |
| **Real-time Sync** | < 100ms | WebSocket, optimistic updates |
| **Mobile App Launch** | < 1s | Lazy loading, SQLite cache |
| **Uptime** | 99.9% | Multi-region, health checks, failover |

---

## Security Architecture

1. **Authentication**
   - Bcrypt password hashing (cost: 12)
   - JWT tokens (short-lived access + long-lived refresh)
   - OAuth 2.0 (Google, Microsoft, GitHub)
   - 2FA (TOTP via authenticator apps)

2. **Authorization**
   - Row-level security in Postgres
   - Middleware permission checks
   - Schema-based tenant isolation

3. **Data Protection**
   - Encryption at rest (database level)
   - Encryption in transit (TLS 1.3)
   - Regular backups (hourly incremental, daily full)
   - GDPR compliance (data export, right to deletion)

4. **Infrastructure**
   - DDoS protection (Cloudflare)
   - Rate limiting (Redis-based)
   - WAF (Web Application Firewall)
   - Security headers (CSP, HSTS, etc.)

5. **Auditing**
   - Audit log for all sensitive operations
   - IP tracking
   - Session management
   - Anomaly detection

---

## Deployment Architecture

### Multi-Region Setup

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare (Global CDN)                 │
│              - DDoS Protection                           │
│              - SSL/TLS Termination                       │
│              - Edge Caching                              │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│   US-East    │  │   EU-West    │  │  Asia-Pacific│
│   (Primary)  │  │  (Secondary) │  │  (Tertiary)  │
│              │  │              │  │              │
│ - Vercel     │  │ - Vercel     │  │ - Vercel     │
│ - PostgreSQL │  │ - PostgreSQL │  │ - PostgreSQL │
│   (Primary)  │  │   (Replica)  │  │   (Replica)  │
│ - Redis      │  │ - Redis      │  │ - Redis      │
└──────────────┘  └──────────────┘  └──────────────┘
```

**Benefits:**
- Low latency globally (< 100ms for most users)
- High availability (multi-region failover)
- Compliance (data residency for EU)

---

## Next Steps: Implementation Plan

### Phase 1: Foundation (Weeks 1-4)
1. Set up monorepo with Turborepo
2. Initialize Next.js 14 project with App Router
3. Set up Prisma with PostgreSQL
4. Implement authentication (NextAuth.js)
5. Build basic multi-tenancy (organization + workspace)
6. Create design system (Tailwind + Radix UI)

### Phase 2: Core Features (Weeks 5-12)
1. Projects & Issues CRUD
2. Workflow engine (state machine)
3. Real-time collaboration (Yjs + WebSocket)
4. Document editor (Tiptap)
5. Search (Elasticsearch + pgvector)
6. Permission system (RBAC)

### Phase 3: Advanced Features (Weeks 13-20)
1. Kanban/Scrum boards (drag & drop)
2. Sprint management
3. Reporting & analytics
4. AI features (Anthropic integration)
5. Workflow automation builder
6. Mobile app (React Native)

### Phase 4: Polish & Launch (Weeks 21-24)
1. Ethiopian calendar integration
2. Multilingual support (i18n)
3. Performance optimization
4. Security audit
5. Beta testing with Ethiopian companies
6. Public launch

---

**Ready to build this?** Let me know which component you'd like to start with, and I'll create the actual implementation code.
