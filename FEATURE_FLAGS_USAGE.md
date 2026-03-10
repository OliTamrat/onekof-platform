# Feature Flags & Organization Customization - Usage Guide

## Overview

The customization system allows each organization to configure their dashboard with exactly the features they need. This is implemented through a three-tier architecture:

1. **Universal Foundation** - All pages exist for everyone
2. **Organization Presets** - Pre-configured templates (Ministry, NGO, Business, Education)
3. **Per-Org Customization** - Admins can fine-tune via Settings

## Core Components

### 1. Organization Settings Types
**Location:** `apps/web/src/types/organization-settings.ts`

Defines the complete structure for organization settings:
- `OrganizationType` - ministry, ngo, business, education, etc.
- `DashboardSectionId` - teams, budget, goals, automations, documents, docs, etc.
- `OrganizationSettings` - Complete settings structure
- Feature flag interfaces for each section

### 2. Organization Presets
**Location:** `apps/web/src/lib/presets/organization-presets.ts`

Pre-configured dashboard templates:
- **MINISTRY_PRESET** - Government ministries (public transparency, procurement)
- **NGO_PRESET** - Non-profits (grants, donations, impact tracking)
- **BUSINESS_PRESET** - Startups/companies (full automation, AI, analytics)
- **EDUCATION_PRESET** - Schools/universities (simplified, grants only)

### 3. Context Provider
**Location:** `apps/web/src/contexts/organization-settings-context.tsx`

React Context that provides organization settings throughout the app.

### 4. Navigation Configuration
**Location:** `apps/web/src/lib/dashboard-navigation.ts`

Updated to support feature flags with `getDashboardNavigation()` function.

### 5. Admin Customization Page
**Location:** `apps/web/src/app/dashboard/settings/customization/page.tsx`

UI for admins to customize their organization's dashboard.

## How to Use

### 1. Access Organization Settings in Components

```tsx
'use client';

import { useOrganizationSettings } from '@/contexts/organization-settings-context';

export function MyComponent() {
  const { settings } = useOrganizationSettings();

  // Check if a section is enabled
  const budgetEnabled = settings.enabledSections.includes('budget');

  // Check specific features
  const forecastingEnabled = settings.features.budget?.forecasting;

  return (
    <div>
      {budgetEnabled && <BudgetSection />}
      {forecastingEnabled && <ForecastingWidget />}
    </div>
  );
}
```

### 2. Use Helper Hooks

```tsx
'use client';

import {
  useOrganizationSettings,
  useSectionEnabled,
  useFeatureEnabled
} from '@/contexts/organization-settings-context';

export function Dashboard() {
  // Check if entire sections are enabled
  const budgetEnabled = useSectionEnabled('budget');
  const automationsEnabled = useSectionEnabled('automations');

  // Check specific features
  const forecastingEnabled = useFeatureEnabled('budget', 'forecasting');
  const workflowsEnabled = useFeatureEnabled('automations', 'workflows');

  return (
    <div className="grid gap-6">
      {budgetEnabled && <BudgetCard />}
      {automationsEnabled && <AutomationsCard />}
    </div>
  );
}
```

### 3. Filter Navigation Based on Settings

```tsx
'use client';

import { getDashboardNavigation } from '@/lib/dashboard-navigation';
import { useOrganizationSettings } from '@/contexts/organization-settings-context';

export function NavigationMenu() {
  const { settings } = useOrganizationSettings();

  // Get filtered navigation items for budget section
  const budgetNavItems = getDashboardNavigation('budget', settings);

  return (
    <nav>
      {budgetNavItems.map(item => (
        <Link key={item.id} href={item.href}>
          {item.icon && <item.icon />}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### 4. Apply Presets Programmatically

```tsx
'use client';

import { useOrganizationSettings } from '@/contexts/organization-settings-context';

export function OnboardingWizard() {
  const { applyPreset } = useOrganizationSettings();

  const handleOrgTypeSelection = (orgType: 'ministry' | 'ngo' | 'business') => {
    // Automatically apply the appropriate preset
    applyPreset(orgType);
  };

  return (
    <div>
      <button onClick={() => handleOrgTypeSelection('ministry')}>
        Ministry / Government
      </button>
      <button onClick={() => handleOrgTypeSelection('ngo')}>
        NGO / Non-Profit
      </button>
      <button onClick={() => handleOrgTypeSelection('business')}>
        Business / Startup
      </button>
    </div>
  );
}
```

### 5. Update Settings

```tsx
'use client';

import { useOrganizationSettings } from '@/contexts/organization-settings-context';

export function SettingsPage() {
  const { settings, updateSettings, saveSettings, hasUnsavedChanges } = useOrganizationSettings();

  const toggleBudgetForecasting = () => {
    updateSettings({
      ...settings,
      features: {
        ...settings.features,
        budget: {
          ...settings.features.budget,
          forecasting: !settings.features.budget?.forecasting,
        },
      },
    });
  };

  return (
    <div>
      <button onClick={toggleBudgetForecasting}>
        Toggle Forecasting
      </button>

      {hasUnsavedChanges && (
        <button onClick={saveSettings}>
          Save Changes
        </button>
      )}
    </div>
  );
}
```

## Feature Flag Structure

### Budget Features
```typescript
{
  expenses: boolean;         // Expense tracking
  income: boolean;          // Revenue/income tracking
  reports: boolean;         // Financial reports
  forecasting: boolean;     // Budget projections
  procurement: boolean;     // Government procurement
  grants: boolean;          // Grant management (NGOs)
  donations: boolean;       // Donation tracking (NGOs)
  publicTransparency: boolean; // Public budget visibility
  multiCurrency: boolean;   // Multiple currencies
  approvalWorkflow: boolean; // Budget approval process
}
```

### Teams Features
```typescript
{
  goals: boolean;          // Team goals
  activity: boolean;       // Activity feed
  performance: boolean;    // Performance metrics
  workload: boolean;       // Workload tracking
}
```

### Goals Features
```typescript
{
  activeGoals: boolean;    // Active goals page
  completedGoals: boolean; // Completed goals page
  teamGoals: boolean;      // Team goals page
  okrs: boolean;           // OKR framework
  milestones: boolean;     // Milestone tracking
}
```

### Automations Features
```typescript
{
  workflows: boolean;      // Automation workflows
  triggers: boolean;       // Event triggers
  history: boolean;        // Execution history
  scheduling: boolean;     // Scheduled automation
}
```

### Documents Features
```typescript
{
  aiProcessing: boolean;   // AI document processing
  templates: boolean;      // Document templates
  versionControl: boolean; // Version tracking
  collaboration: boolean;  // Collaborative editing
  ocr: boolean;           // OCR capabilities
}
```

### Docs Features
```typescript
{
  wiki: boolean;          // Wiki functionality
  search: boolean;        // Documentation search
  publicDocs: boolean;    // Public documentation
  apiDocs: boolean;       // API documentation
}
```

## Preset Configurations

### Ministry / Government
- **Enabled Sections:** teams, budget, goals, projects, documents, docs, compliance, timeline
- **Key Features:**
  - Public budget transparency
  - Procurement tracking
  - Budget forecasting
  - Approval workflows
  - NO automations (government restrictions)

### NGO / Non-Profit
- **Enabled Sections:** teams, budget, goals, projects, documents, impact, timeline
- **Key Features:**
  - Grant management
  - Donation tracking
  - Public transparency
  - Multi-currency support
  - Impact reporting
  - NO automations

### Business / Startup
- **Enabled Sections:** All sections including automations and analytics
- **Key Features:**
  - Full automation suite
  - AI assistant
  - Revenue forecasting
  - Advanced analytics
  - API integrations
  - Custom branding

### Education
- **Enabled Sections:** teams, budget, goals, projects, documents, docs
- **Key Features:**
  - Grant tracking
  - Simplified budget
  - Basic features only
  - NO automations
  - NO advanced analytics

## Admin Customization UI

Navigate to `/dashboard/settings/customization` to access the admin panel where you can:

1. **Quick Start with Presets** - Select a preset template
2. **Enable/Disable Sections** - Toggle entire dashboard sections
3. **Fine-tune Features** - Control specific features within sections
4. **Global Settings** - AI Assistant, Analytics, Integrations

## Implementation Complete! ✅

All core features have been implemented:

### ✅ Database Schema
- Added `OrganizationSettings` model to Prisma schema
- Includes all feature flags, customization options, and permissions
- Automatic cascading delete when organization is deleted

### ✅ API Endpoints
- **GET** `/api/organizations/[orgId]/settings` - Fetch settings
- **PUT** `/api/organizations/[orgId]/settings` - Update settings
- Auto-creates default settings based on organization type on first access
- Requires admin/owner role for updates

### ✅ Sidebar Integration
- Updated `getSidebarNavigation()` to filter based on organization settings
- Integrated with `OrganizationSettingsContext` in `CollapsibleSidebar`
- Navigation automatically respects enabled sections

### Feature Gate Components

We've created reusable components for conditional rendering based on feature flags:

**Location:** `apps/web/src/components/feature-gate.tsx`

#### Available Components:

1. **SectionGate** - Render only if a section is enabled:
```tsx
import { SectionGate } from '@/components/feature-gate';

<SectionGate section="budget" fallback={<p>Budget not available</p>}>
  <BudgetDashboard />
</SectionGate>
```

2. **FeatureGate** - Render only if a specific feature is enabled:
```tsx
import { FeatureGate } from '@/components/feature-gate';

<FeatureGate section="budget" feature="forecasting">
  <ForecastingWidget />
</FeatureGate>
```

3. **AnySectionGate** - Render if ANY section is enabled:
```tsx
import { AnySectionGate } from '@/components/feature-gate';

<AnySectionGate sections={['budget', 'analytics']}>
  <FinancialReports />
</AnySectionGate>
```

4. **AllSectionsGate** - Render only if ALL sections are enabled:
```tsx
import { AllSectionsGate } from '@/components/feature-gate';

<AllSectionsGate sections={['budget', 'teams']}>
  <TeamBudgetView />
</AllSectionsGate>
```

5. **GlobalFeatureGate** - Render only if a global feature is enabled:
```tsx
import { GlobalFeatureGate } from '@/components/feature-gate';

<GlobalFeatureGate feature="aiAssistant">
  <AIAssistantWidget />
</GlobalFeatureGate>
```

6. **Higher-Order Components** for wrapping entire components:
```tsx
import { withSectionGate, withFeatureGate } from '@/components/feature-gate';

// Wrap a component with section gate
const GatedBudgetPage = withSectionGate(BudgetPage, 'budget', <p>Not available</p>);

// Wrap a component with feature gate
const GatedForecastingWidget = withFeatureGate(
  ForecastingWidget,
  'budget',
  'forecasting',
  <p>Forecasting not enabled</p>
);
```

## Benefits

✅ **Instant Onboarding** - New organizations get full dashboard immediately
✅ **Zero Configuration** - Smart defaults based on org type
✅ **Flexible Customization** - Admins can fine-tune as needed
✅ **Consistent Experience** - Same structure across all organizations
✅ **Easy Maintenance** - One codebase for all organizations
✅ **Scalable** - Add thousands of orgs with no extra work
✅ **Feature Control** - Granular control over each feature
✅ **Type Safe** - Full TypeScript support throughout
