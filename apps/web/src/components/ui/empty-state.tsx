'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
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

const getPresets = (
  t: (key: string) => string
): Record<string, { icon: LucideIcon; title: string; description: string; actionLabel?: string }> => ({
  projects: {
    icon: FolderKanban,
    title: t('emptyStates.noProjects'),
    description: t('emptyStates.noProjectsDesc'),
    actionLabel: t('emptyStates.createProject'),
  },
  issues: {
    icon: ListChecks,
    title: t('emptyStates.noIssues'),
    description: t('emptyStates.noIssuesDesc'),
    actionLabel: t('emptyStates.createIssue'),
  },
  teams: {
    icon: Users,
    title: t('emptyStates.noTeams'),
    description: t('emptyStates.noTeamsDesc'),
    actionLabel: t('emptyStates.createTeam'),
  },
  goals: {
    icon: Target,
    title: t('emptyStates.noGoals'),
    description: t('emptyStates.noGoalsDesc'),
    actionLabel: t('emptyStates.setGoal'),
  },
  automations: {
    icon: Zap,
    title: t('emptyStates.noAutomations'),
    description: t('emptyStates.noAutomationsDesc'),
    actionLabel: t('emptyStates.createAutomation'),
  },
  documents: {
    icon: FileText,
    title: t('emptyStates.noDocuments'),
    description: t('emptyStates.noDocumentsDesc'),
    actionLabel: t('emptyStates.uploadDocument'),
  },
  docs: {
    icon: BookOpen,
    title: t('emptyStates.noDocs'),
    description: t('emptyStates.noDocsDesc'),
    actionLabel: t('emptyStates.createPage'),
  },
  budget: {
    icon: BarChart3,
    title: t('emptyStates.noBudget'),
    description: t('emptyStates.noBudgetDesc'),
    actionLabel: t('emptyStates.setupBudget'),
  },
  calendar: {
    icon: Calendar,
    title: t('emptyStates.noEvents'),
    description: t('emptyStates.noEventsDesc'),
  },
  compliance: {
    icon: Shield,
    title: t('emptyStates.noCompliance'),
    description: t('emptyStates.noComplianceDesc'),
    actionLabel: t('emptyStates.configureCompliance'),
  },
  medical: {
    icon: Stethoscope,
    title: t('emptyStates.noMedical'),
    description: t('emptyStates.noMedicalDesc'),
    actionLabel: t('emptyStates.setupMedical'),
  },
  procurement: {
    icon: ShoppingCart,
    title: t('emptyStates.noProcurement'),
    description: t('emptyStates.noProcurementDesc'),
    actionLabel: t('emptyStates.createPO'),
  },
  safety: {
    icon: AlertTriangle,
    title: t('emptyStates.noSafety'),
    description: t('emptyStates.noSafetyDesc'),
    actionLabel: t('emptyStates.configureSafety'),
  },
  equipment: {
    icon: HardHat,
    title: t('emptyStates.noEquipment'),
    description: t('emptyStates.noEquipmentDesc'),
    actionLabel: t('emptyStates.addEquipment'),
  },
  facilities: {
    icon: Building,
    title: t('emptyStates.noFacilities'),
    description: t('emptyStates.noFacilitiesDesc'),
    actionLabel: t('emptyStates.addFacility'),
  },
  sites: {
    icon: MapPin,
    title: t('emptyStates.noSites'),
    description: t('emptyStates.noSitesDesc'),
    actionLabel: t('emptyStates.addSite'),
  },
  resources: {
    icon: Package,
    title: t('emptyStates.noResources'),
    description: t('emptyStates.noResourcesDesc'),
    actionLabel: t('emptyStates.addResource'),
  },
  grants: {
    icon: Award,
    title: t('emptyStates.noGrants'),
    description: t('emptyStates.noGrantsDesc'),
    actionLabel: t('emptyStates.addGrant'),
  },
  impact: {
    icon: TrendingUp,
    title: t('emptyStates.noImpact'),
    description: t('emptyStates.noImpactDesc'),
    actionLabel: t('emptyStates.configureMetrics'),
  },
});

interface EmptyStateProps {
  /** Use a preset configuration by module name */
  preset?: string;
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
  const { t } = useLanguage();
  const presets = getPresets(t);

  const config = preset ? presets[preset] : null;
  const Icon = customIcon || config?.icon || FileText;
  const title = customTitle || config?.title || t('emptyStates.nothingHereYet');
  const description = customDescription || config?.description || t('emptyStates.getStartedDefault');
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
          className="mt-2 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
