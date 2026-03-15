# Onekof Onboarding & Navigation Strategy
**Based on Atlassian Best Practices**

**Date:** March 1, 2026
**Inspired by:** Atlassian Jira/Confluence onboarding flow

---

## 📋 Atlassian Onboarding Analysis (From Screenshots)

### **What Atlassian Does Well:**

1. **Role-Based Onboarding**
   - Asks: "What kind of work do you do?"
   - Options: Software dev, Product management, Marketing, Design, Project management, Operations, IT support, Other
   - Customizes experience based on role

2. **Unified Home Dashboard**
   - Personalized "For you" feed
   - Recent items
   - Starred projects
   - Quick app launcher (Jira, Confluence, Teams, Goals, Projects)

3. **Flexible Sidebar Navigation**
   - Personal section (For you, Recent, Starred, Discover)
   - App section (Jira, Confluence, Teams, Goals, Projects)
   - Customization options
   - "Try" badges for new features

4. **Multi-Product Ecosystem**
   - Jira (Project tracking)
   - Confluence (Documentation)
   - Teams (People management)
   - Goals (OKRs)
   - Projects (Overview)

---

## 🎯 Onekof Onboarding Flow (Redesigned)

### **Step 1: Welcome Screen**
```
┌──────────────────────────────────────────┐
│  Welcome to Onekof! 👋                   │
│                                          │
│  What kind of work do you do?            │
│  Choose the best fit for your team.      │
│                                          │
│  [💻 Software Development]               │
│  [⚙️  Product Management]                │
│  [📢 Marketing]                          │
│  [🎨 Design]                             │
│  [📊 Project Management]                 │
│  [🏢 Operations]                         │
│  [💼 IT Support]                         │
│  [👤 Other]                              │
│                                          │
│  [Show more roles ▼]                     │
└──────────────────────────────────────────┘
```

**Implementation:**
- Component: `OnboardingRoleSelection.tsx`
- Saves to user preferences
- Used to customize templates, dashboard widgets

---

### **Step 2: Organization Setup (Fork)**

#### **Option A: Create New Organization**
```
┌──────────────────────────────────────────┐
│  Create Your Workspace                   │
│                                          │
│  Workspace Name *                        │
│  [Acme Corporation                    ]  │
│                                          │
│  Workspace URL *                         │
│  onekof.com/[acme-corp               ]   │
│                                          │
│  What's your team size?                  │
│  ○ Just me                               │
│  ○ 2-10 people                           │
│  ○ 11-50 people                          │
│  ○ 51-200 people                         │
│  ○ 200+ people                           │
│                                          │
│  Preferred Language                      │
│  [🇬🇧 English ▼]                         │
│  (Also available: Amharic, Oromo, etc.)  │
│                                          │
│  [Cancel]  [Create Workspace]            │
└──────────────────────────────────────────┘
```

#### **Option B: Join Existing Organization (via Invite)**
```
┌──────────────────────────────────────────┐
│  You've been invited to join             │
│                                          │
│  🏢 Acme Corporation                     │
│                                          │
│  Invited by: john@acme.com               │
│  Role: Member                            │
│                                          │
│  [Decline]  [Accept & Join]              │
└──────────────────────────────────────────┘
```

**Logic:**
- Check if user has pending invitations
- If yes: Show Option B first, with "Create new workspace instead" link
- If no: Show Option A

---

### **Step 3: First Project Template**
```
┌──────────────────────────────────────────┐
│  Create Your First Project               │
│                                          │
│  Based on your role (Software Dev), we   │
│  recommend:                              │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ 🎯 Software Project (Kanban)    │    │
│  │ Track bugs, features, and       │    │
│  │ development tasks               │    │
│  │                                 │    │
│  │ [Use this template]             │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │ 🚀 Scrum Project                │    │
│  │ Sprint-based agile development  │    │
│  │                                 │    │
│  │ [Use this template]             │    │
│  └─────────────────────────────────┘    │
│                                          │
│  [Skip for now]  [Browse templates]      │
└──────────────────────────────────────────┘
```

**Templates by Role:**

| Role | Default Template | Description |
|------|-----------------|-------------|
| Software Dev | Kanban Board | Bug tracking, features, technical debt |
| Product Mgmt | Roadmap Board | Feature prioritization, releases |
| Marketing | Campaign Tracker | Campaigns, content calendar, leads |
| Design | Design Sprint | Design tasks, feedback, iterations |
| Project Mgmt | Project Board | Milestones, deliverables, resources |

---

### **Step 4: Invite Team (Optional)**
```
┌──────────────────────────────────────────┐
│  Invite Your Team                        │
│                                          │
│  [john@acme.com              ] [+ Add]   │
│  [sarah@acme.com             ] [+ Add]   │
│  [mike@acme.com              ] [+ Add]   │
│                                          │
│  Or share invite link:                   │
│  [https://onekof.com/invite/abc123] [📋]│
│                                          │
│  [Skip for now]  [Send Invitations]      │
└──────────────────────────────────────────┘
```

---

### **Step 5: Quick Tour (Skippable)**
```
┌──────────────────────────────────────────┐
│  Quick Tour (2 minutes)                  │
│                                          │
│  [▶] Watch video introduction            │
│  [📖] Read getting started guide         │
│  [🎮] Take interactive tutorial          │
│                                          │
│  [Skip tour and go to dashboard →]       │
└──────────────────────────────────────────┘
```

---

## 🏗️ Sidebar Navigation (Atlassian-Inspired)

### **Current Onekof Sidebar** (Top Bar Only)
```
[Onekof Logo] [Workspace ▼] [Project ▼] [🔍] [🔔] [👤]
```

### **Proposed Onekof Sidebar** (Vertical Left Sidebar)
```
┌─────────────────────────────┐
│ 🏠 Home                      │
│                             │
│ PERSONAL                    │
│ 👤 For You                  │
│ 🕐 Recent                   │
│ ⭐ Starred                  │
│ 🔍 Discover                 │
│                             │
│ APPS                        │
│ 📋 Projects                 │
│ 📊 Dashboards               │
│ ✅ Issues (Kanban)          │
│ 📝 Docs (Confluence-like)   │ ← NEW!
│ 👥 Team                     │
│ 📈 Reports                  │
│                             │
│ WORKSPACES                  │
│ 🏢 Acme Corp (current)      │
│ 🏭 My Side Project          │
│ [+ Create workspace]        │
│                             │
│ ⚙️ Settings                 │
└─────────────────────────────┘
```

**Key Differences from Current:**
- ✅ Vertical sidebar (more space for navigation)
- ✅ "For You" personalized feed (like Atlassian)
- ✅ Recent items across all projects
- ✅ Starred projects/issues quick access
- ✅ **Docs module** (Confluence alternative)
- ✅ Multi-workspace switcher in sidebar

---

## 📝 Confluence Alternative: "Onekof Docs"

### **Recommendation: Integrated Documentation Module**

Instead of building a separate product like Confluence, we'll integrate docs **directly into Onekof** as a module.

### **Why Integrated vs Separate Product?**

| Aspect | Integrated (Recommended) | Separate Product |
|--------|-------------------------|------------------|
| **Development Time** | ✅ Faster (4-6 weeks) | ❌ Slower (3-6 months) |
| **User Experience** | ✅ Seamless, no context switching | ❌ Need to switch apps |
| **Pricing** | ✅ Single subscription | ❌ Need to upsell separately |
| **Market Fit (Ethiopia)** | ✅ All-in-one preferred | ❌ Too complex for SMEs |
| **Maintenance** | ✅ Single codebase | ❌ Two codebases to maintain |

### **Onekof Docs Features**

#### **1. Project Wiki**
Every project gets a wiki section:
```
Project: Acme Website Redesign
├── 📋 Board (Kanban)
├── 📝 Docs (NEW!)
│   ├── 📄 Project Overview
│   ├── 📄 Technical Specs
│   ├── 📄 Meeting Notes
│   │   ├── 2026-03-01 Sprint Planning
│   │   └── 2026-02-28 Design Review
│   ├── 📄 API Documentation
│   └── 📁 Templates
├── 📊 Reports
└── ⚙️ Settings
```

#### **2. Rich Text Editor**
- Markdown support
- Headings, lists, code blocks
- @mentions (links to users)
- Task checklists
- Tables
- File attachments
- Images & videos

#### **3. Templates**
Pre-built templates for common docs:
- Meeting Notes
- Technical Specification
- Product Requirements (PRD)
- Retrospective
- Decision Log
- Troubleshooting Guide
- API Documentation

#### **4. Linking to Issues**
- Reference issues: `PROJ-123` auto-links
- Create issues from docs
- Embed issue lists in docs

#### **5. Version History**
- Track all edits
- See who changed what
- Restore previous versions
- Compare versions side-by-side

#### **6. Permissions**
- Public (everyone in workspace)
- Project members only
- Restricted (specific people)

---

### **Docs UI Mockup**

```
┌────────────────────────────────────────────────────────┐
│ 🏠 Home > Projects > Acme Website > 📝 Docs            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📝 Technical Specification                            │
│  Last edited 2 hours ago by @sarah                     │
│                                                        │
│  ┌──────────────────────────────────────────────┐     │
│  │ [B] [I] [U] [H1] [H2] [•••] [@] [🔗] [📎]    │     │
│  ├──────────────────────────────────────────────┤     │
│  │                                              │     │
│  │ # API Authentication Flow                    │     │
│  │                                              │     │
│  │ ## Overview                                  │     │
│  │ This document describes...                   │     │
│  │                                              │     │
│  │ ## Related Issues                            │     │
│  │ - ACME-45: Implement OAuth                   │     │
│  │ - ACME-67: Add JWT validation                │     │
│  │                                              │     │
│  │ ## Code Example                              │     │
│  │ ```javascript                                │     │
│  │ const token = await auth.getToken();         │     │
│  │ ```                                          │     │
│  │                                              │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
│  💬 Comments (3)                                       │
│  ───────────────────────────────────────────────────   │
│  @mike: Looks good! One question...                    │
│  @sarah: Great catch, let me update...                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### **Phase 1: Onboarding (Week 1) - PRIORITY**

**Components to Build:**
1. ✅ `OnboardingRoleSelection.tsx`
2. ✅ `CreateOrganizationFlow.tsx`
3. ✅ `InviteAcceptance.tsx`
4. ✅ `ProjectTemplateSelector.tsx`
5. ✅ `TeamInvitation.tsx`
6. ✅ `QuickTour.tsx` (optional, can skip)

**API Endpoints Needed:**
- ✅ Already exists: `POST /api/organizations`
- ✅ Already exists: `GET /api/organizations`
- 🆕 Need: `GET /api/invitations/pending`
- 🆕 Need: `POST /api/invitations/accept`
- 🆕 Need: `POST /api/projects/from-template`

**Database Updates:**
- ✅ Invitations table exists
- 🆕 Add `userRole` field to User model (to store selected role)
- 🆕 Add project templates seed data

---

### **Phase 2: Sidebar Navigation (Week 2)**

**Components to Build:**
1. `VerticalSidebar.tsx` (replace top bar for desktop)
2. `ForYouFeed.tsx` (personalized activity feed)
3. `RecentItems.tsx` (cross-project recent items)
4. `StarredItems.tsx` (favorited projects/issues)
5. `WorkspaceSwitcher.tsx` (multi-workspace in sidebar)

**Keep Top Bar for Mobile:**
- Responsive: Sidebar on desktop, top bar + drawer on mobile
- Hamburger menu opens sidebar on mobile

---

### **Phase 3: Docs Module (Week 3-4)**

**Components to Build:**
1. `DocsEditor.tsx` (rich text editor - use TipTap or Lexical)
2. `DocsTree.tsx` (folder/page tree navigation)
3. `DocTemplates.tsx` (template selector)
4. `DocVersionHistory.tsx` (track changes)
5. `DocComments.tsx` (page-level comments)

**Database Schema:**
```prisma
model Document {
  id          String   @id @default(cuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])

  title       String
  content     String   // Markdown or JSON (from editor)
  parentId    String?  // For nested pages

  createdById String
  createdBy   User     @relation("DocumentCreator", fields: [createdById], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  versions    DocumentVersion[]
  comments    DocumentComment[]

  @@map("documents")
}

model DocumentVersion {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id])

  content    String
  editedById String
  editedBy   User     @relation("DocumentEditor", fields: [editedById], references: [id])
  editedAt   DateTime @default(now())

  @@map("document_versions")
}

model DocumentComment {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id])

  content    String
  authorId   String
  author     User     @relation("DocumentCommentAuthor", fields: [authorId], references: [id])

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("document_comments")
}
```

**API Endpoints:**
- `GET /api/projects/:id/docs` - List all docs
- `GET /api/docs/:id` - Get single doc
- `POST /api/docs` - Create doc
- `PATCH /api/docs/:id` - Update doc
- `DELETE /api/docs/:id` - Delete doc
- `GET /api/docs/:id/versions` - Version history
- `POST /api/docs/:id/comments` - Add comment

---

## 🎨 Design Tokens (Updated)

### **Sidebar Colors**
```css
--sidebar-bg-light: #FFFFFF
--sidebar-bg-dark: #1B1F23
--sidebar-item-hover-light: #F1F5F9
--sidebar-item-hover-dark: #2D333B
--sidebar-item-active: #1C8C7D
--sidebar-text-light: #64748B
--sidebar-text-dark: #A0AEC0
```

### **Document Editor Colors**
```css
--editor-bg-light: #FFFFFF
--editor-bg-dark: #22272B
--editor-border-light: #E2E8F0
--editor-border-dark: #3D444D
--editor-toolbar-light: #F8FAFC
--editor-toolbar-dark: #2D333B
```

---

## 📊 User Flow Comparison

### **Before (Broken):**
```
Sign up → Email verify → Dashboard (empty, no org) → ERROR ❌
```

### **After (Fixed):**
```
Sign up → Email verify →
  ↓
Role Selection (What do you do?) →
  ↓
┌─ Has invite? ─┐
│ Yes           │ No
│ ↓             │ ↓
│ Join Org      │ Create Org
└───────────────┘
  ↓
Project Template Selection →
  ↓
Invite Team (optional) →
  ↓
Dashboard (populated with starter project) ✅
```

---

## 🚀 Next Steps

### **This Week (Week 1):**
1. ✅ Build role selection screen
2. ✅ Build organization creation flow
3. ✅ Add invitation acceptance logic
4. ✅ Create project templates
5. ✅ Test full onboarding flow

### **Next Week (Week 2):**
1. Design vertical sidebar layout
2. Build "For You" personalized feed
3. Implement recent items tracking
4. Add starred items feature

### **Week 3-4:**
1. Design docs module UI
2. Choose rich text editor (TipTap vs Lexical)
3. Build docs database schema
4. Implement basic editor
5. Add version history

---

## 💡 Key Decisions

### **1. Docs: Integrated vs Separate?**
**Decision:** ✅ **Integrated** as "Onekof Docs" module
**Reasoning:**
- Faster to build
- Better UX (no app switching)
- Single subscription = easier to sell
- Ethiopian market prefers all-in-one solutions

### **2. Sidebar: Vertical vs Top Bar?**
**Decision:** ✅ **Vertical sidebar** (desktop), keep top bar for mobile
**Reasoning:**
- More navigation space
- Follows Jira/Linear/Notion patterns
- Better for multi-workspace switching

### **3. Dashboard Variants?**
**Decision:** ✅ Keep `/dashboard/new` as default, archive `/dashboard/classic` later
**Reasoning:**
- New dashboard has better design
- Can deprecate classic once users migrate
- Keep both for now to avoid disruption

---

**Document Status:** ✅ Complete
**Last Updated:** March 1, 2026
**Ready for Implementation:** Yes - Start with Phase 1 immediately
