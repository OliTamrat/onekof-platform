'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Code2,
  Settings,
  Megaphone,
  Palette,
  FolderKanban,
  Factory,
  Wrench,
  Users,
  ChevronDown,
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from './onboarding-header';

export type UserRole =
  | 'SOFTWARE_DEVELOPMENT'
  | 'PRODUCT_MANAGEMENT'
  | 'MARKETING'
  | 'DESIGN'
  | 'PROJECT_MANAGEMENT'
  | 'OPERATIONS'
  | 'IT_SUPPORT'
  | 'OTHER';

interface RoleOption {
  id: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'SOFTWARE_DEVELOPMENT',
    label: 'Software development',
    icon: Code2,
    description: 'Build and ship products with agile workflows'
  },
  {
    id: 'PRODUCT_MANAGEMENT',
    label: 'Product management',
    icon: Settings,
    description: 'Plan roadmaps and prioritize features'
  },
  {
    id: 'MARKETING',
    label: 'Marketing',
    icon: Megaphone,
    description: 'Run campaigns and track performance'
  },
  {
    id: 'DESIGN',
    label: 'Design',
    icon: Palette,
    description: 'Collaborate on design projects and feedback'
  },
  {
    id: 'PROJECT_MANAGEMENT',
    label: 'Project management',
    icon: FolderKanban,
    description: 'Manage projects, timelines, and resources'
  },
  {
    id: 'OPERATIONS',
    label: 'Operations',
    icon: Factory,
    description: 'Streamline processes and operations'
  },
  {
    id: 'IT_SUPPORT',
    label: 'IT support',
    icon: Wrench,
    description: 'Track tickets and manage requests'
  },
  {
    id: 'OTHER',
    label: 'Other',
    icon: Users,
    description: 'General team collaboration'
  }
];

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
  onSkip?: () => void;
}

export function RoleSelection({ onSelect, onSkip }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showMore, setShowMore] = useState(false);

  const visibleRoles = showMore ? ROLE_OPTIONS : ROLE_OPTIONS.slice(0, 5);

  const handleContinue = () => {
    if (selectedRole) {
      onSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1B1F23]">
      {/* Header with Theme Toggle */}
      <OnboardingHeader />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-16 pb-12 px-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Welcome to Onekof
            </h1>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
              What kind of work do you do?
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Choose the best fit for your team. We'll customize your experience.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {visibleRoles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "group w-full flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left relative overflow-hidden",
                    isSelected
                      ? "border-[#1C8C7D] bg-gradient-to-r from-[#1C8C7D]/10 to-transparent dark:from-[#1C8C7D]/20 dark:to-transparent shadow-md"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] hover:border-[#1C8C7D]/30 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-all",
                    isSelected
                      ? "bg-[#1C8C7D] text-white shadow-lg shadow-[#1C8C7D]/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-semibold text-base mb-1.5 transition-colors",
                      isSelected
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-700 dark:text-slate-200"
                    )}>
                      {role.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex items-center justify-center h-12 w-12 shrink-0">
                      <div className="h-6 w-6 rounded-full bg-[#1C8C7D] flex items-center justify-center shadow-lg">
                        <Check className="h-4 w-4 text-white stroke-[3]" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {!showMore && ROLE_OPTIONS.length > 5 && (
            <button
              onClick={() => setShowMore(true)}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-[#1C8C7D] hover:text-[#156B60] transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Show more roles
              <ChevronDown className="h-4 w-4" />
            </button>
          )}

          {showMore && (
            <button
              onClick={() => setShowMore(false)}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              Show fewer roles
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          )}

          <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
            {onSkip && (
              <Button
                variant="ghost"
                onClick={onSkip}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Skip for now
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              size="lg"
              className="ml-auto bg-[#1C8C7D] hover:bg-[#156B60] text-white shadow-lg shadow-[#1C8C7D]/30 disabled:opacity-50 disabled:shadow-none"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
