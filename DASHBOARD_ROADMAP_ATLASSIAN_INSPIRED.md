# Onekof Dashboard - Comprehensive Roadmap
## Inspired by Atlassian Jira & Confluence

**Date**: March 1, 2026
**Current Status**: Beautiful UI, Needs Backend Integration
**Inspiration**: Atlassian Jira, Confluence, Linear

---

## 📁 WIREFRAME DOCUMENTS LOCATION

### Homepage & Strategy Documents:
```
C:\Users\olita\onekof-platform\CURRENT_STATUS_AND_ROADMAP.md
C:\Users\olita\onekof-platform\HOMEPAGE_WIREFRAMES_AI_POWERED.md
```

### Dashboard Documents:
```
C:\Users\olita\onekof-platform\DASHBOARD_ROADMAP_ATLASSIAN_INSPIRED.md (this file)
C:\Users\olita\onekof-platform\DASHBOARD_SWITCHER_GUIDE.md
C:\Users\olita\onekof-platform\CODEBASE_AUDIT_REPORT.md
```

---

## 🎯 DASHBOARD CURRENT STATE

### ✅ What We Have (New Dashboard - 90% UI Complete)

#### 1. **Layout & Navigation** ✅
**File**: `apps/web/src/app/dashboard/new/page.tsx`

**Features Working:**
- ✅ Top navigation bar with:
  - Organization/workspace switcher (UI only)
  - Global search (Cmd+K) trigger
  - Create button dropdown
  - Notifications bell icon
  - User avatar menu
  - Theme toggle (dark/light mode) ⭐

- ✅ Collapsible sidebar with:
  - Dashboard (home)
  - Projects
  - Issues
  - Reports
  - Team
  - Settings

- ✅ Beautiful teal (#1C8C7D) design system
- ✅ Dark mode support (fully styled)
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Smooth animations and transitions

**What's NOT Connected:**
- ❌ Organization switcher - Shows UI but dropdown doesn't load real orgs
- ❌ Search - Opens modal but doesn't search
- ❌ Create button - Shows menu but doesn't create anything
- ❌ Notifications - Icon exists but no notification system
- ❌ User menu - Shows dropdown but limited functionality

---

#### 2. **Dashboard Home (Overview)** ✅ 60% Complete
**File**: `apps/web/src/app/dashboard/new/page.tsx`

**What's Working:**
- ✅ **Stats Cards** (4 cards):
  - Completed tasks (last 7 days)
  - Updated tasks (last 7 days)
  - Created tasks (last 7 days)
  - Due soon (next 7 days)
  - **Status**: Hardcoded numbers (0, 3, 3, 1)

- ✅ **Status Overview Section**:
  - Beautiful donut chart (To Do vs In Progress)
  - Color-coded legend
  - Total work items count
  - **Status**: Hardcoded data (2 To Do, 1 In Progress)

- ✅ **Priority Breakdown**:
  - Horizontal bar charts for 6 priority levels
  - Visual progress bars
  - **Status**: Hardcoded (all medium priority)

- ✅ **Recent Activity Feed**:
  - Shows recent user actions
  - Timestamps
  - Status badges
  - **Status**: Hardcoded 3 activity items

- ✅ **Types of Work**:
  - Breakdown by issue type (Task, Story, Subtask, Epic, Feature)
  - Percentage bars
  - **Status**: Hardcoded percentages

- ✅ **Favorite Projects** (conditional):
  - Shows starred projects
  - Quick access with project icon/color
  - **Status**: Shows IF projects exist with isFavorite flag

**What's Missing:**
- ❌ Real data from database
- ❌ Date range selector (filter by week/month/quarter)
- ❌ Team member filter
- ❌ Project filter
- ❌ Refresh/reload data
- ❌ Export to PDF/CSV
- ❌ Custom widgets (drag-and-drop dashboard customization)

---

#### 3. **Classic Dashboard** ✅ 50% Complete
**File**: `apps/web/src/app/dashboard/page.tsx`

**What's Working:**
- ✅ Simple layout with fixed sidebar
- ✅ Welcome message
- ✅ 4 stat cards (hardcoded)
- ✅ Recent issues list (hardcoded)
- ✅ Project progress cards (hardcoded)
- ✅ "Try New Dashboard" switcher button

**Status**: Kept for backward compatibility, but new dashboard is superior

---

### ❌ What We're Missing (Critical Gaps)

#### 1. **Projects Management** - 10% Complete
**Current File**: `apps/web/src/app/dashboard/projects/page.tsx`

**What Exists:**
- ✅ Projects list page with grid layout
- ✅ Project cards showing name, description, lead
- ✅ Progress bars, issue counts
- ✅ Search/Filter/Sort buttons (UI only)

**What's Missing:**
- ❌ Create project modal/form
- ❌ Edit project functionality
- ❌ Delete project
- ❌ Project settings page
- ❌ Project detail view
- ❌ Project templates
- ❌ Project archiving
- ❌ Project members management
- ❌ Project permissions (who can view/edit)
- ❌ Database connection (all data hardcoded)

**What Atlassian Has (Inspiration):**
```
Jira Project Features:
- Project types (Scrum, Kanban, Bug tracking)
- Project templates
- Project avatar/icon customization
- Project key (unique identifier)
- Project lead assignment
- Default assignee settings
- Issue type schemes
- Workflow schemes
- Permission schemes
- Notification schemes
- Project categories
- Components (sub-areas of project)
- Versions/Releases
- Project settings (access, details, features)
```

---

#### 2. **Issues/Tasks (Kanban Board)** - 0% Complete
**Current File**: `apps/web/src/app/dashboard/issues/page.tsx`
**Status**: Just shows "Issues page coming soon..."

**What We Need to Build:**

##### A. **Kanban Board View** (Like Jira)
```
┌─────────────────────────────────────────────────────────────┐
│ Board: Mobile App Launch                      [⚙ Settings]  │
├─────────────────────────────────────────────────────────────┤
│ [+ Create issue]  [@Assignee ▾] [🏷 Label ▾] [⋯ More]      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐│
│  │ TO DO    │   │ IN PROG  │   │ REVIEW   │   │  DONE   ││
│  │    (5)   │   │    (3)   │   │    (2)   │   │   (12)  ││
│  ├──────────┤   ├──────────┤   ├──────────┤   ├─────────┤│
│  │          │   │          │   │          │   │         ││
│  │ [Card]   │   │ [Card]   │   │ [Card]   │   │ [Card]  ││
│  │ KAN-101  │   │ KAN-102  │   │ KAN-103  │   │ KAN-104 ││
│  │          │   │          │   │          │   │         ││
│  │ [Card]   │   │ [Card]   │   │ [Card]   │   │ [Card]  ││
│  │ KAN-105  │   │ [Card]   │   │          │   │ [Card]  ││
│  │          │   │          │   │          │   │         ││
│  │ [+ Add]  │   │ [+ Add]  │   │ [+ Add]  │   │[+ Add]  ││
│  │          │   │          │   │          │   │         ││
│  └──────────┘   └──────────┘   └──────────┘   └─────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Drag-and-drop cards between columns
- Create issue inline (+ Add button)
- Issue cards with:
  - Issue key (KAN-101)
  - Title
  - Assignee avatar
  - Priority icon
  - Issue type icon
  - Labels/tags
  - Due date
  - Story points
  - Attachments count
  - Comments count
- Column customization
- WIP limits (Work In Progress)
- Swimlanes (by assignee, priority, epic)
- Quick filters (by assignee, label, etc.)
- Board settings

##### B. **Issue Detail View/Modal**
```
┌─────────────────────────────────────────────────────────────┐
│ KAN-101: Implement user authentication           [✕ Close] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────┐  ┌─────────────────────┐   │
│ │ LEFT: Details & Comments    │  │ RIGHT: Metadata     │   │
│ │                             │  │                     │   │
│ │ Description:                │  │ Status: To Do ▾     │   │
│ │ We need to build user auth  │  │ Assignee: @John ▾   │   │
│ │ with email/password and     │  │ Reporter: @Sarah    │   │
│ │ OAuth providers.            │  │ Priority: High ▾    │   │
│ │                             │  │ Labels: [backend]   │   │
│ │ [Edit description]          │  │ Sprint: Sprint 1    │   │
│ │                             │  │ Story Points: 8     │   │
│ │ ──────────────────────      │  │ Due Date: Mar 15    │   │
│ │                             │  │                     │   │
│ │ Attachments (2):            │  │ Created: Mar 1      │   │
│ │ • design.pdf                │  │ Updated: 2h ago     │   │
│ │ • mockup.png                │  │                     │   │
│ │                             │  │ [Link issue]        │   │
│ │ [+ Add attachment]          │  │ [Create subtask]    │   │
│ │                             │  │ [Delete issue]      │   │
│ │ ──────────────────────      │  └─────────────────────┘   │
│ │                             │                            │
│ │ Comments (3):               │                            │
│ │                             │                            │
│ │ @Sarah 2h ago:              │                            │
│ │ Let's use NextAuth.js       │                            │
│ │ [Reply] [⋯]                 │                            │
│ │                             │                            │
│ │ @John 1h ago:               │                            │
│ │ Good idea! I'll start       │                            │
│ │ [Reply] [⋯]                 │                            │
│ │                             │                            │
│ │ [Write a comment...]        │                            │
│ │                             │                            │
│ └─────────────────────────────┘                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Rich text editor (description, comments)
- @mentions in comments
- File attachments (drag-drop upload)
- Issue links (blocks, relates to, duplicates)
- Subtasks creation
- Issue history/activity log
- Watchers
- Time tracking
- Custom fields
- Issue voting
- Share issue (public link)

##### C. **List View** (Alternative to Kanban)
```
┌─────────────────────────────────────────────────────────────┐
│ Issues                                                       │
├─────────────────────────────────────────────────────────────┤
│ [+ Create] [Filters ▾] [Group by ▾] [Sort by ▾] [⋯]       │
├────┬────────────────────┬──────────┬─────────┬──────┬──────┤
│ ☐  │ Key                │ Summary  │ Assignee│ Stat │ Prior││
├────┼────────────────────┼──────────┼─────────┼──────┼──────┤
│ ☐  │ 🟦 KAN-101        │ Auth     │ @John   │ ToDo │ High ││
│ ☐  │ 🟩 KAN-102        │ DB       │ @Sarah  │ Prog │ Med  ││
│ ☐  │ 🟨 KAN-103        │ UI       │ @Mike   │ Rev  │ Low  ││
│ ☐  │ 🟥 KAN-104        │ Testing  │ @Anna   │ Done │ High ││
└────┴────────────────────┴──────────┴─────────┴──────┴──────┘
```

**Features Needed:**
- Bulk select checkboxes
- Inline editing
- Column customization
- Sorting by any field
- Grouping (by assignee, status, priority, etc.)
- Advanced filters
- Save custom views
- Export to CSV/Excel

##### D. **Calendar View**
```
┌─────────────────────────────────────────────────────────────┐
│ የካቲት 2017                          [Ethiopian ⇄ Gregorian]│
├─────────────────────────────────────────────────────────────┤
│  Sun  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat        │
├───────┼───────┼───────┼───────┼───────┼───────┼───────────┤
│       │   1   │   2   │   3   │   4   │   5   │   6       │
│       │ KAN-1 │       │ KAN-2 │       │       │           │
├───────┼───────┼───────┼───────┼───────┼───────┼───────────┤
│   7   │   8   │   9   │  10   │  11   │  12   │  13       │
│       │ KAN-3 │ KAN-4 │       │       │ KAN-5 │           │
└───────┴───────┴───────┴───────┴───────┴───────┴───────────┘
```

**Features Needed:**
- Ethiopian calendar view
- Gregorian calendar view
- Toggle between calendars
- Drag-drop to change due dates
- Color-coded by priority/status
- Filter by project/assignee
- Month/Week/Day views

---

#### 3. **Sprints/Iterations** - 0% Complete
**Atlassian Jira Sprint Features:**

```
┌─────────────────────────────────────────────────────────────┐
│ Sprint 1: Mobile App Launch              [Complete Sprint] │
├─────────────────────────────────────────────────────────────┤
│ Status: Active                                               │
│ Start Date: የካቲት 1, 2017 (Feb 7, 2026)                    │
│ End Date: የካቲት 14, 2017 (Feb 20, 2026)                   │
│ Duration: 2 weeks                      7 days remaining     │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Progress: ████████████░░░░░░░░░░░░░░░░░░  32/50 pts │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ Issues in Sprint (12):                                      │
│ • 5 To Do                                                   │
│ • 3 In Progress                                             │
│ • 4 Done                                                    │
│                                                              │
│ Scope Change: +2 issues, -1 issue                          │
│                                                              │
│ [View Sprint Board] [Sprint Report] [Complete Sprint]      │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Create sprint
- Start sprint (with date range)
- Add issues to sprint (drag-drop from backlog)
- Remove issues from sprint
- Complete sprint (move unfinished to backlog/next sprint)
- Sprint burndown chart
- Sprint velocity chart
- Sprint retrospective notes
- Sprint goals
- Capacity planning (team capacity vs committed story points)

---

#### 4. **Backlog** - 0% Complete
**Atlassian Jira Backlog Features:**

```
┌─────────────────────────────────────────────────────────────┐
│ Backlog                                                      │
├─────────────────────────────────────────────────────────────┤
│ [+ Create Sprint] [+ Create Epic]        [Plan Mode ▾]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ▶ Sprint 2 (Future)                                (0 pts) │
│   Empty - Drag issues here                                  │
│                                                              │
│ ▶ Backlog                                         (120 pts) │
│                                                              │
│   Epic: User Management                           (45 pts) │
│   ├─ KAN-201: User registration (8 pts)                    │
│   ├─ KAN-202: User profile (5 pts)                         │
│   └─ KAN-203: Password reset (3 pts)                       │
│                                                              │
│   Epic: Payment Integration                       (55 pts) │
│   ├─ KAN-301: Stripe setup (13 pts)                        │
│   ├─ KAN-302: Payment UI (8 pts)                           │
│   └─ KAN-303: Webhooks (8 pts)                             │
│                                                              │
│   No Epic                                         (20 pts) │
│   ├─ KAN-401: Fix bug #123 (2 pts)                         │
│   └─ KAN-402: Update docs (3 pts)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Backlog list with drag-drop prioritization
- Epics (large features broken into stories)
- Epic progress bars
- Story points estimation
- Drag issues from backlog to sprint
- Bulk actions (move, delete, estimate)
- Backlog grooming tools
- Version/Release planning

---

#### 5. **Reports & Analytics** - 0% Complete
**Current File**: `apps/web/src/app/dashboard/reports/page.tsx`
**Status**: Just shows "Reports page coming soon..."

**What Atlassian Jira Has:**

##### A. **Burndown Chart**
```
    Story Points
    │
 50 │    ●●●●●●
    │         ●●●●
 40 │             ●●●
    │                ●●●
 30 │                   ●●
    │                     ●●
 20 │                       ●●
    │                         ●● (Ideal)
 10 │                           ●
    │                            ● (Actual)
  0 └────────────────────────────●────
    Day 1  3   5   7   9  11  13  15
```

##### B. **Velocity Chart**
```
    Story Points
    │
 60 │        ██    ██
    │    ██  ██    ██  ██
 40 │    ██  ██    ██  ██
    │    ██  ██    ██  ██  ██
 20 │    ██  ██    ██  ██  ██
    │ ██ ██  ██ ██ ██  ██  ██
  0 └────────────────────────────
    S1  S2  S3  S4  S5  S6  S7
```

##### C. **Other Reports Needed:**
- Cumulative flow diagram
- Sprint report
- Epic report
- Version report
- Control chart (cycle time)
- Created vs Resolved chart
- Time tracking report
- Workload report (pie chart by assignee)
- Resolution time report
- Recently created issues

**Features Needed:**
- Date range selector
- Project filter
- Team filter
- Export to PDF/PNG/CSV
- Schedule report emails
- Custom report builder

---

#### 6. **Team Management** - 0% Complete
**Current File**: `apps/web/src/app/dashboard/team/page.tsx`
**Status**: Just shows "Team page coming soon..."

**What We Need:**
```
┌─────────────────────────────────────────────────────────────┐
│ Team Members                              [+ Invite Member] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Avatar] John Doe                              Admin  │ │
│ │          john@example.com                              │ │
│ │          Assigned: 5 issues   Workload: 32 hours     │ │
│ │          [View profile] [Edit role] [Remove]          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Sarah Smith                          Member  │ │
│ │          sarah@example.com                             │ │
│ │          Assigned: 8 issues   Workload: 45 hours     │ │
│ │          [View profile] [Edit role] [Remove]          │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Team member list
- Invite via email
- Role management (Admin, Member, Guest)
- User profiles (bio, skills, timezone)
- Workload view (who's overloaded)
- User activity tracking
- User permissions per project
- Team calendar (who's working when)
- Deactivate/Remove members

---

#### 7. **Settings** - 20% Complete
**Current**: Basic user menu dropdown

**What Atlassian Has:**
- **Account settings**: Profile, email, password, 2FA
- **Notification settings**: Email, in-app, Slack
- **Organization settings**: Name, logo, billing
- **Project settings**: Access, details, features
- **Workflow settings**: Custom workflows
- **Issue type schemes**: Custom issue types
- **Field configurations**: Custom fields
- **Screen schemes**: Custom create/edit screens
- **Permission schemes**: Who can do what
- **Notification schemes**: Who gets notified when
- **Integrations**: Slack, GitHub, Confluence
- **API keys**: For third-party apps
- **Audit log**: Who did what when

**Priority Settings to Build:**
1. User profile (name, email, avatar)
2. Password change
3. Notification preferences
4. Theme preference (dark/light)
5. Language preference
6. Organization details
7. Project permissions
8. Integrations (start with Slack)

---

#### 8. **Global Search (Cmd+K)** - 10% Complete
**Current**: Modal opens but doesn't search

**What We Need (Like Atlassian):**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search issues, projects, people...         [Cmd+K]  [✕] │
├─────────────────────────────────────────────────────────────┤
│ [payment bug                                              ] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Issues (3):                                                 │
│ ├─ KAN-101: Payment gateway integration                    │
│ ├─ KAN-203: Fix payment processing bug                     │
│ └─ KAN-305: Payment UI improvements                        │
│                                                              │
│ Projects (1):                                               │
│ └─ Payment System Rewrite                                  │
│                                                              │
│ People (2):                                                 │
│ ├─ John Doe (working on payment features)                  │
│ └─ Sarah Smith (payment specialist)                        │
│                                                              │
│ Recent:                                                     │
│ ├─ KAN-402: Update docs                                    │
│ └─ Mobile App Project                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- Full-text search (issues, projects, comments, descriptions)
- Semantic search (AI-powered, understands context)
- Search filters (by project, assignee, status, date)
- Recent searches
- Search suggestions
- Keyboard navigation
- Quick actions (assign, change status, etc.)
- JQL-like advanced search

---

#### 9. **Notifications** - 0% Complete
**Current**: Bell icon exists, no functionality

**What We Need:**
```
┌─────────────────────────────────────────────────────────────┐
│ Notifications                              [Mark all read] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ● @John assigned you KAN-101                      2m ago   │
│   "Can you review the auth implementation?"                │
│   [View issue] [Dismiss]                                   │
│                                                              │
│ ● @Sarah mentioned you in KAN-203                 1h ago   │
│   "Let's discuss this with @You tomorrow"                  │
│   [View comment] [Dismiss]                                 │
│                                                              │
│ ○ KAN-305 is due tomorrow                         2h ago   │
│   [View issue] [Dismiss]                                   │
│                                                              │
│ ○ Sprint 1 ends in 3 days                         5h ago   │
│   [View sprint] [Dismiss]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Features Needed:**
- In-app notifications (bell icon dropdown)
- Email notifications (configurable)
- Push notifications (PWA)
- Notification types:
  - @mentions
  - Assignments
  - Comments on watched issues
  - Status changes
  - Due date reminders
  - Sprint start/end
- Mark as read/unread
- Notification preferences (per type, per project)
- Digest emails (daily/weekly summary)

---

#### 10. **Real-Time Collaboration** - 0% Complete

**What Atlassian/Linear/Notion Has:**
- Live cursors (see who's editing)
- Presence indicators (who's online)
- Real-time updates (see changes instantly)
- Collaborative editing
- Live comments
- Typing indicators

**Technologies Needed:**
- Pusher / Ably (real-time service)
- WebSockets
- Optimistic UI updates
- Conflict resolution

---

## 🚀 DASHBOARD DEVELOPMENT ROADMAP

### **Phase 1: Foundation (Week 1-2)** - CRITICAL

**Goal**: Make dashboard show real data, not hardcoded mocks

#### Tasks:
1. **Install Dependencies**
   ```bash
   npm install prisma @prisma/client
   npm install @tanstack/react-query zustand
   npm install dayjs recharts
   npm install @hello-pangea/dnd (drag-and-drop)
   ```

2. **Database Setup**
   - Set up PostgreSQL (Render/Supabase)
   - Run `npx prisma generate`
   - Run `npx prisma db push`
   - Seed database with test data

3. **API Routes for Dashboard**
   ```
   /api/dashboard/stats - Get 4 stat card numbers
   /api/dashboard/activity - Get recent activity
   /api/dashboard/priorities - Get priority breakdown
   /api/dashboard/types - Get types of work
   ```

4. **Connect Dashboard to Real Data**
   - Replace hardcoded stats with API calls
   - Use React Query for data fetching
   - Add loading states
   - Add error handling

5. **Projects CRUD API**
   ```
   GET    /api/projects - List all projects
   POST   /api/projects - Create project
   GET    /api/projects/[id] - Get project details
   PATCH  /api/projects/[id] - Update project
   DELETE /api/projects/[id] - Delete project
   ```

6. **Connect Projects Page to Real Data**
   - Fetch projects from database
   - Implement search/filter/sort
   - Add create project modal
   - Add edit/delete functionality

**Deliverable**: Dashboard shows real data from database. Users can create/edit/delete projects.

---

### **Phase 2: Kanban Board (Week 3-4)**

**Goal**: Build the core PM feature - drag-and-drop issue board

#### Tasks:
1. **Issues CRUD API**
   ```
   GET    /api/issues - List issues (with filters)
   POST   /api/issues - Create issue
   GET    /api/issues/[id] - Get issue details
   PATCH  /api/issues/[id] - Update issue
   DELETE /api/issues/[id] - Delete issue
   ```

2. **Kanban Board Component**
   - Install @hello-pangea/dnd
   - Build column component
   - Build issue card component
   - Implement drag-and-drop
   - Update status on drop (optimistic UI)
   - Add quick create issue inline

3. **Issue Detail Modal**
   - Title, description (rich text editor)
   - Status, assignee, priority dropdowns
   - Labels, due date, story points
   - Comments section
   - Attachments
   - Activity log
   - Subtasks
   - Issue links

4. **Issue Card Features**
   - Issue key (KAN-101)
   - Compact/detailed view toggle
   - Priority indicator
   - Assignee avatar
   - Labels chips
   - Comments count
   - Attachments count
   - Due date indicator (red if overdue)

**Deliverable**: Full Kanban board with drag-and-drop. Users can create, edit, move issues.

---

### **Phase 3: Collaboration Features (Week 5-6)**

**Goal**: Add comments, @mentions, real-time updates

#### Tasks:
1. **Comments System**
   - API routes for comments
   - Rich text editor (TipTap or Lexical)
   - @mentions with autocomplete
   - Edit/delete comments
   - Reply to comments (threading)
   - Reactions/emoji support

2. **File Attachments**
   - Set up AWS S3 or Supabase Storage
   - Drag-drop file upload
   - Image preview
   - File size limits
   - Delete attachments

3. **Activity/History Log**
   - Track all issue changes
   - "John changed status from To Do to In Progress"
   - Show who, what, when
   - Activity feed on dashboard

4. **Watchers**
   - Watch/unwatch issues
   - Get notifications for watched issues
   - Show watchers list

**Deliverable**: Full collaboration features. Team can comment, upload files, track changes.

---

### **Phase 4: Sprints & Backlog (Week 7-8)**

**Goal**: Add agile sprint planning features

#### Tasks:
1. **Sprints API**
   ```
   GET    /api/sprints - List sprints
   POST   /api/sprints - Create sprint
   PATCH  /api/sprints/[id] - Update sprint
   POST   /api/sprints/[id]/start - Start sprint
   POST   /api/sprints/[id]/complete - Complete sprint
   ```

2. **Backlog Page**
   - List of unplanned issues
   - Drag-drop to prioritize
   - Drag issues to sprint
   - Epic grouping
   - Story point totals

3. **Sprint Board**
   - Kanban board filtered to current sprint
   - Sprint progress bar
   - Days remaining
   - Scope change indicator
   - Quick complete sprint

4. **Sprint Planning Mode**
   - View backlog + sprint side-by-side
   - Drag issues from backlog to sprint
   - Show capacity (story points)
   - Warn if over capacity

**Deliverable**: Full sprint planning. Teams can plan and execute sprints.

---

### **Phase 5: Reports & Analytics (Week 9-10)**

**Goal**: Add charts and insights

#### Tasks:
1. **Burndown Chart**
   - Install recharts or visx
   - Calculate ideal vs actual burndown
   - Interactive tooltips
   - Date range selector

2. **Velocity Chart**
   - Show completed story points per sprint
   - Average velocity calculation
   - Trend line

3. **Cumulative Flow Diagram**
   - Stacked area chart
   - Show work distribution over time
   - Identify bottlenecks

4. **Other Reports**
   - Sprint report
   - Epic progress report
   - Time tracking report
   - Workload by assignee (pie chart)

5. **Export Features**
   - Export to PNG
   - Export to CSV
   - Export to PDF
   - Schedule email reports

**Deliverable**: Full analytics suite. Teams can track velocity, burndown, etc.

---

### **Phase 6: Ethiopian Features (Week 11-12)**

**Goal**: Add unique Ethiopian calendar & language features

#### Tasks:
1. **Ethiopian Calendar Integration**
   ```bash
   npm install ethiopian-date
   ```
   - Date conversion utilities
   - Ethiopian date picker component
   - Display dates in both calendars
   - Toggle between calendars
   - Ethiopian holidays integration
   - Sprint planning in የካቲት/መጋቢት

2. **Multi-Language Support**
   ```bash
   npm install next-intl
   ```
   - Set up i18n structure
   - Create translation files (en, am, om, ti)
   - Translate all UI strings
   - Language switcher in navbar
   - Per-user language preference
   - RTL support if needed
   - Number/date formatting per locale

**Deliverable**: Fully localized in 4 languages with Ethiopian calendar.

---

### **Phase 7: Team & Permissions (Week 13-14)**

**Goal**: Add team management and role-based access

#### Tasks:
1. **Team Management**
   - Team members list
   - Invite via email
   - Role assignment (Admin, Member, Guest)
   - User profiles (avatar, bio, skills)
   - Deactivate/remove members

2. **Permissions System**
   - Project-level permissions
   - Issue-level permissions
   - Admin capabilities
   - Guest restrictions (view-only)
   - Permission schemes

3. **Workload View**
   - Show issues per person
   - Story points per person
   - Hours tracked per person
   - Identify overloaded team members
   - Rebalance work

**Deliverable**: Full team management with granular permissions.

---

### **Phase 8: AI Features (Week 15-16)** - DIFFERENTIATOR

**Goal**: Add AI-powered productivity features

#### Tasks:
1. **AI Task Generator**
   - OpenAI API integration
   - Input: Feature description
   - Output: List of subtasks with estimates
   - Add to board with one click

2. **AI Meeting Summarizer**
   - Paste meeting transcript
   - AI extracts action items
   - Auto-create issues with assignments
   - Link to meeting notes

3. **AI Description Generator**
   - User creates issue with title only
   - AI suggests detailed description
   - Acceptance criteria
   - Technical notes

4. **AI Smart Search**
   - Semantic search (not just keyword)
   - Understands context and synonyms
   - "Find all payment-related bugs"
   - Search across issues, comments, docs

**Deliverable**: AI features that save 10+ hours/week per team.

---

### **Phase 9: Real-Time & Notifications (Week 17-18)**

**Goal**: Add real-time collaboration and notifications

#### Tasks:
1. **Real-Time Updates**
   ```bash
   npm install pusher-js
   ```
   - Set up Pusher/Ably
   - Live issue updates
   - Presence indicators (who's online)
   - Typing indicators
   - Live cursors (optional)

2. **Notifications System**
   - In-app notifications (bell icon)
   - Email notifications
   - Push notifications (PWA)
   - Notification preferences
   - @mention alerts
   - Assignment alerts
   - Due date reminders
   - Digest emails

**Deliverable**: Real-time collaboration and comprehensive notifications.

---

### **Phase 10: Polish & Scale (Week 19-20)**

**Goal**: Production-ready with performance optimizations

#### Tasks:
1. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization
   - React Query caching
   - Debounce search
   - Virtual scrolling for long lists

2. **Mobile Responsive**
   - Test on mobile devices
   - Touch-friendly drag-drop
   - Responsive tables
   - Mobile navigation
   - Bottom sheet modals

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support
   - High contrast mode

4. **Error Handling**
   - Error boundaries
   - Retry logic
   - Offline support
   - Form validation
   - User-friendly error messages

5. **SEO & Meta**
   - Dynamic meta tags
   - Open Graph images
   - Twitter cards
   - Sitemap
   - robots.txt

**Deliverable**: Production-ready dashboard with excellent UX.

---

## 📊 DASHBOARD COMPARISON

### Current vs Future State

| Feature | Current | After Phase 1-2 | After Phase 10 |
|---------|---------|-----------------|----------------|
| **Dashboard Home** | Hardcoded | Real data | + Customizable widgets |
| **Projects** | Hardcoded list | Full CRUD | + Templates, archiving |
| **Kanban Board** | ❌ | Drag-drop working | + Swimlanes, WIP limits |
| **Issue Detail** | ❌ | Basic modal | + Full features |
| **Comments** | ❌ | ❌ | Rich text, @mentions |
| **Sprints** | ❌ | ❌ | Full sprint planning |
| **Reports** | ❌ | ❌ | 10+ chart types |
| **Calendar** | ❌ | ❌ | Ethiopian + Gregorian |
| **Languages** | English only | English only | 4 languages |
| **AI Features** | ❌ | ❌ | 4 AI superpowers |
| **Real-Time** | ❌ | ❌ | Live updates |
| **Notifications** | ❌ | ❌ | In-app + email |

---

## 🎯 MAKING NEW DASHBOARD THE DEFAULT

### Current Routing:
```
/dashboard → Classic dashboard (old)
/dashboard/new → New dashboard (modern)
```

### New Routing (Recommended):
```
/ dashboard → New dashboard (default)
/dashboard/classic → Classic dashboard (legacy)
```

### Migration Plan:
1. Move `/dashboard/new/page.tsx` → `/dashboard/page.tsx` (new becomes default)
2. Move old `/dashboard/page.tsx` → `/dashboard/classic/page.tsx` (classic becomes legacy)
3. Update all internal links
4. Add redirect from `/dashboard/new` → `/dashboard`
5. Update navigation menu
6. Update documentation

---

## 🚀 NEXT ACTIONS (This Week)

### Priority 1: Make New Dashboard Default ✅
1. Rename routes
2. Update links
3. Test navigation

### Priority 2: Connect to Real Data
1. Set up database (PostgreSQL)
2. Install Prisma
3. Create API routes
4. Connect dashboard stats
5. Connect projects page

### Priority 3: Build One Core Feature
**Recommendation**: Kanban Board
- Most important PM feature
- High user engagement
- Shows product value immediately

---

## 📁 FILES TO MODIFY

```
apps/web/src/app/
├── dashboard/
│   ├── page.tsx (NEW: Move from new/page.tsx)
│   ├── classic/
│   │   └── page.tsx (Move old dashboard here)
│   ├── projects/
│   │   └── page.tsx (Already exists, needs real data)
│   ├── issues/
│   │   └── page.tsx (Build Kanban board)
│   ├── reports/
│   │   └── page.tsx (Build charts)
│   └── team/
│       └── page.tsx (Build team management)
├── api/
│   ├── dashboard/
│   │   ├── stats/route.ts (NEW)
│   │   ├── activity/route.ts (NEW)
│   │   └── priorities/route.ts (NEW)
│   ├── projects/
│   │   ├── route.ts (NEW)
│   │   └── [id]/route.ts (NEW)
│   └── issues/
│       ├── route.ts (NEW)
│       └── [id]/route.ts (NEW)
```

---

## 💡 RECOMMENDATIONS

1. **Make new dashboard default** - It's superior in every way
2. **Focus on Phase 1-2 first** - Get real data, build Kanban
3. **AI features in Phase 8** - Only after core PM features work
4. **Ethiopian features in Phase 6** - After core functionality
5. **Test with real users** - After Phase 2, get feedback

---

**Timeline**: 20 weeks to full Atlassian-level PM tool
**MVP**: 4 weeks (Phase 1-2)
**Beta**: 8 weeks (Phase 1-4)
**Production**: 20 weeks (Phase 1-10)

---

Made with ❤️ by Onekof Team
March 1, 2026
