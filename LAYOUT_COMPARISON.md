# 🎨 Onekof Layout Options - Comparison Guide

We've implemented **TWO professional layout architectures** for you to choose from. Both are production-ready and fully themed (light/dark mode).

## 🔄 How to Switch Layouts

Open `apps/web/src/config/layout.ts` and change:

```typescript
export const LAYOUT_CONFIG = {
  activeLayout: 'jira-style',  // or 'three-tier'
};
```

Save the file, and the app will automatically reload with the new layout!

---

## Option A: Jira-Style Layout ⭐ (Currently Active)

### Architecture:
```
┌─────────────────────────────────────────────────────────────┐
│ Logo │ Workspace▾ │ Projects▾ │  Spacer │ +Create Search 🔔│
└─────────────────────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────────────────────┐
│  Home    │                                                  │
│  My Issues│           MAIN CONTENT AREA                     │
│  Starred │                                                  │
│  Boards  │                                                  │
│          │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
     ↑
Sidebar changes based on context
```

### Key Features:
✅ **Project Selector in Top Bar** - Just like Jira/Linear
✅ **Dynamic Sidebar** - Changes based on what you're viewing:
  - When on dashboard → Shows "Home", "My Issues", "Starred", etc.
  - When in a project → Shows "Board", "Backlog", "Timeline", etc.
✅ **More Screen Real Estate** - Top bar is compact
✅ **Familiar UX** - Users coming from Jira/Linear will feel at home
✅ **Workspace switcher** in top bar

### User Flow:
1. User logs in → Sees **Dashboard** (Your Work)
2. Clicks **Projects** dropdown in top bar → Sees all projects
3. Selects a project → Goes to `/project/KEY/board`
4. **Sidebar changes** to show project navigation
5. Clicks "Home" in sidebar → Back to dashboard

### Best For:
- Teams familiar with Jira, Linear, or modern PM tools
- Users who want maximum screen space
- Projects with many workspaces/projects
- Professional SaaS applications

---

## Option B: Three-Tier Layout

### Architecture:
```
┌──────────────┬──────────────────────────────────────────────┐
│   Logo       │ Organization Name │ Spacer │ +Create Search 🔔│
│              └──────────────────────────────────────────────┘
│ ┌──────────┐ ┌────────────────────────────────────────────┐│
│ │Workspace▾│ │                                            ││
│ └──────────┘ │           MAIN CONTENT AREA                ││
│              │                                            ││
│  Home        │                                            ││
│  Projects    │                                            ││
│  Documents   │                                            ││
│  Team        │                                            ││
│  Settings    │                                            ││
│              │                                            ││
│  [User]      │                                            ││
└──────────────┴────────────────────────────────────────────┘
      ↑
Fixed sidebar with all main navigation
```

### Key Features:
✅ **Workspace Switcher in Sidebar** - Easy to see and access
✅ **Fixed Navigation** - All main sections always visible
✅ **Collapsible Sidebar** - Save space when needed
✅ **Dedicated Projects Page** - `/dashboard/projects` exists
✅ **Traditional Structure** - More like Asana, Monday.com
✅ **Clear Navigation Hierarchy**

### User Flow:
1. User logs in → Sees **Dashboard**
2. Clicks **Projects** in sidebar → See all projects in grid/list
3. Clicks a project → Goes to project detail
4. Uses sidebar to navigate between sections

### Best For:
- Teams new to PM tools
- Users who prefer traditional app navigation
- Applications with fewer workspaces
- Internal team tools

---

## 📊 Side-by-Side Comparison

| Feature | Jira-Style | Three-Tier |
|---------|-----------|------------|
| **Screen Real Estate** | ⭐⭐⭐⭐⭐ More space | ⭐⭐⭐⭐ Good |
| **Learning Curve** | ⭐⭐⭐⭐ Familiar to PM users | ⭐⭐⭐⭐⭐ Easy for everyone |
| **Project Switching** | ⭐⭐⭐⭐⭐ Dropdown in top bar | ⭐⭐⭐ Navigate to projects page |
| **Workspace Switching** | ⭐⭐⭐⭐ Top bar dropdown | ⭐⭐⭐⭐⭐ Prominent in sidebar |
| **Multi-Project Work** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **Navigation Clarity** | ⭐⭐⭐⭐ Context-dependent | ⭐⭐⭐⭐⭐ Always visible |

---

## 🎯 Our Recommendation

### Choose **Jira-Style** if:
- You want to match industry-leading PM tools
- Your users are familiar with Jira, Linear, or ClickUp
- You have many projects and need fast switching
- You want maximum content area
- **This is what Jira actually does** ✅

### Choose **Three-Tier** if:
- Your team prefers traditional navigation
- You have simpler workspace needs
- You want all navigation always visible
- Your users are less technical

---

## 🚀 What's Already Working

Both layouts include:
- ✅ Full dark/light theme support
- ✅ Theme toggle (Sun/Moon icon in header)
- ✅ Workspace management
- ✅ Project creation
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Professional styling

---

## 📝 Next Steps

1. **Try both layouts** - Switch in `config/layout.ts`
2. **Test the workflow** - Create projects, switch workspaces
3. **Get team feedback** - See which feels better
4. **Choose one** - Then we'll continue building features on your chosen layout

Need help deciding? I'm here to answer any questions! 🙏
