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
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#1B1F23] p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome, olitamrat!
          </h1>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            What kind of work do you do?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Choose the best fit for your project or team. We'll help you get started.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {visibleRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Button
                key={role.id}
                variant="ghost"
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full h-auto flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left",
                  isSelected
                    ? "border-[#1C8C7D] bg-[#1C8C7D]/5 dark:bg-[#1C8C7D]/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                  isSelected
                    ? "bg-[#1C8C7D] text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium mb-1",
                    isSelected
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  )}>
                    {role.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {role.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex items-center justify-center h-10 w-10">
                    <div className="h-5 w-5 rounded-full bg-[#1C8C7D] flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {!showMore && (
          <Button
            variant="ghost"
            onClick={() => setShowMore(true)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Show more roles
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}

        {showMore && (
          <Button
            variant="ghost"
            onClick={() => setShowMore(false)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Show fewer roles
            <ChevronDown className="h-4 w-4 rotate-180" />
          </Button>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          {onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-slate-600 dark:text-slate-400"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="ml-auto bg-[#1C8C7D] hover:bg-[#156B60] text-white"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
