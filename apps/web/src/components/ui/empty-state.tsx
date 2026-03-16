import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FolderKanban,
  ListChecks,
  Users,
  Target,
  Zap,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  Shield,
  Stethoscope,
  ShoppingCart,
  HardHat,
  Building,
  MapPin,
  Package,
  Award,
  AlertTriangle,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

// Preset configurations for all module types
const presets: Record<
  string,
  { icon: LucideIcon; title: string; description: string; actionLabel?: string }
> = {
  projects: {
    icon: FolderKanban,
    title: 'No projects yet',
    description:
      'Projects help you organize work into manageable streams. Create your first project to start tracking tasks, budgets, and timelines.',
    actionLabel: 'Create Project',
  },
  issues: {
    icon: ListChecks,
    title: 'No issues found',
    description:
      'Issues are the building blocks of your workflow. Create tasks, bugs, stories, and epics to track progress.',
    actionLabel: 'Create Issue',
  },
  teams: {
    icon: Users,
    title: 'No teams created',
    description:
      'Teams help you organize people by function or department. Build your first team to improve collaboration.',
    actionLabel: 'Create Team',
  },
  goals: {
    icon: Target,
    title: 'No goals set',
    description:
      'Goals and OKRs keep everyone aligned on what matters. Set objectives and track key results across your organization.',
    actionLabel: 'Set a Goal',
  },
  automations: {
    icon: Zap,
    title: 'No automations configured',
    description:
      'Automate repetitive work with rules. Set triggers and actions to streamline your workflows.',
    actionLabel: 'Create Automation',
  },
  documents: {
    icon: FileText,
    title: 'No documents uploaded',
    description:
      'Upload invoices, contracts, or proposals and let AI extract budget items and milestones automatically.',
    actionLabel: 'Upload Document',
  },
  docs: {
    icon: BookOpen,
    title: 'No documentation yet',
    description:
      'Build your knowledge base with wiki pages, guides, and internal documentation for your team.',
    actionLabel: 'Create Page',
  },
  budget: {
    icon: BarChart3,
    title: 'No budget configured',
    description:
      'Track expenses, allocations, and forecasts. Set up your budget to monitor financial health across projects.',
    actionLabel: 'Set Up Budget',
  },
  calendar: {
    icon: Calendar,
    title: 'No events scheduled',
    description:
      'Your calendar shows task deadlines, milestones, and team events. Create items with due dates to see them here.',
  },
  compliance: {
    icon: Shield,
    title: 'Compliance module',
    description:
      'Track regulatory requirements, audit trails, and compliance documentation. Configure your compliance framework to get started.',
    actionLabel: 'Configure Compliance',
  },
  medical: {
    icon: Stethoscope,
    title: 'Medical records',
    description:
      'Manage patient records, appointments, and medical documentation. Set up your medical workspace to begin.',
    actionLabel: 'Set Up Medical',
  },
  procurement: {
    icon: ShoppingCart,
    title: 'No procurement records',
    description:
      'Track purchase orders, vendor management, and procurement workflows in one place.',
    actionLabel: 'Create PO',
  },
  safety: {
    icon: AlertTriangle,
    title: 'Safety management',
    description:
      'Monitor safety incidents, inspections, and compliance reports. Set up your safety program.',
    actionLabel: 'Configure Safety',
  },
  equipment: {
    icon: HardHat,
    title: 'No equipment tracked',
    description:
      'Track equipment inventory, maintenance schedules, and utilization across your organization.',
    actionLabel: 'Add Equipment',
  },
  facilities: {
    icon: Building,
    title: 'No facilities registered',
    description:
      'Manage buildings, rooms, and facility maintenance in one central location.',
    actionLabel: 'Add Facility',
  },
  sites: {
    icon: MapPin,
    title: 'No sites configured',
    description:
      'Track project sites, locations, and geographic data for field operations.',
    actionLabel: 'Add Site',
  },
  resources: {
    icon: Package,
    title: 'No resources allocated',
    description:
      'Manage resource allocation, capacity planning, and utilization tracking.',
    actionLabel: 'Add Resource',
  },
  grants: {
    icon: Award,
    title: 'No grants tracked',
    description:
      'Track grant applications, funding sources, and disbursement schedules.',
    actionLabel: 'Add Grant',
  },
  impact: {
    icon: TrendingUp,
    title: 'Impact tracking',
    description:
      'Measure and report on project impact, outcomes, and key performance indicators.',
    actionLabel: 'Configure Metrics',
  },
};

interface EmptyStateProps {
  /** Use a preset configuration by module name */
  preset?: keyof typeof presets;
  /** Custom icon (overrides preset) */
  icon?: LucideIcon;
  /** Custom title (overrides preset) */
  title?: string;
  /** Custom description (overrides preset) */
  description?: string;
  /** Action button label (overrides preset) */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Compact mode for inline use */
  compact?: boolean;
}

export function EmptyState({
  preset,
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  actionLabel: customActionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
  const config = preset ? presets[preset] : null;
  const Icon = customIcon || config?.icon || FileText;
  const title = customTitle || config?.title || 'Nothing here yet';
  const description = customDescription || config?.description || 'Get started by creating your first item.';
  const actionLabel = customActionLabel || config?.actionLabel;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-3 py-8' : 'gap-4 py-16',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800',
          compact ? 'h-12 w-12' : 'h-16 w-16'
        )}
      >
        <Icon
          className={cn(
            'text-slate-400 dark:text-slate-500',
            compact ? 'h-6 w-6' : 'h-8 w-8'
          )}
        />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3
          className={cn(
            'font-semibold text-slate-900 dark:text-white',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            'text-slate-500 dark:text-slate-400',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size={compact ? 'sm' : 'default'}
          className="mt-2 bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
