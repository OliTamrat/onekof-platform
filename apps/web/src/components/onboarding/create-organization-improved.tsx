'use client';

import * as React from 'react';
import { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, ChevronRight, Loader2, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingHeader } from './onboarding-header';

type TeamSize = 'SOLO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

interface TeamSizeOption {
  id: TeamSize;
  label: string;
  description: string;
  icon: string;
}

const TEAM_SIZE_OPTIONS: TeamSizeOption[] = [
  { id: 'SOLO', label: 'Just me', description: '1 person', icon: '👤' },
  { id: 'SMALL', label: '2-10 people', description: 'Small team', icon: '👥' },
  { id: 'MEDIUM', label: '11-50 people', description: 'Growing team', icon: '👨‍👩‍👧‍👦' },
  { id: 'LARGE', label: '51-200 people', description: 'Large team', icon: '🏢' },
  { id: 'ENTERPRISE', label: '200+ people', description: 'Enterprise', icon: '🏛️' },
];

interface CreateOrganizationProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function CreateOrganization({ onComplete, onBack }: CreateOrganizationProps) {
  const { refreshOrganizations } = useWorkspace();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    teamSize: null as TeamSize | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug if it hasn't been manually edited
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name)
        ? generateSlug(name)
        : prev.slug,
    }));
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.slug) {
      setError('Workspace name and URL are required');
      return;
    }

    if (!formData.teamSize) {
      setError('Please select your team size');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      setError('Workspace URL must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          settings: {
            teamSize: formData.teamSize,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create workspace');
      }

      // Refresh organizations list
      await refreshOrganizations();

      // Complete onboarding
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D1117]">
      {/* Header with Theme Toggle */}
      <OnboardingHeader />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen pt-16 pb-12 px-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C8C7D] to-[#16A085] mb-6 shadow-xl shadow-[#1C8C7D]/30">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Create your workspace
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              A workspace is where your team collaborates on projects and tracks work
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Workspace Name */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-white">
                Workspace name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Acme Corporation"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                autoFocus
                className="h-14 text-base bg-white dark:bg-[#161B22] border-slate-300 dark:border-slate-700 focus:border-[#1C8C7D] focus:ring-[#1C8C7D]"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The name of your company or team
              </p>
            </div>

            {/* Workspace URL */}
            <div className="space-y-3">
              <Label htmlFor="slug" className="text-sm font-semibold text-slate-900 dark:text-white">
                Workspace URL <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-0 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 focus-within:border-[#1C8C7D] transition-colors">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-4 text-sm font-medium border-r border-slate-300 dark:border-slate-700">
                  onekof.com/
                </span>
                <input
                  id="slug"
                  type="text"
                  placeholder="acme-corp"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase(),
                    }))
                  }
                  maxLength={50}
                  required
                  className="flex-1 h-14 px-4 text-base bg-white dark:bg-[#161B22] border-0 focus:outline-none focus:ring-0"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A unique identifier (lowercase letters, numbers, and hyphens only)
              </p>
            </div>

            {/* Team Size */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                Team size <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEAM_SIZE_OPTIONS.map((option) => {
                  const isSelected = formData.teamSize === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, teamSize: option.id }))}
                      className={cn(
                        "relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group",
                        isSelected
                          ? "border-[#1C8C7D] bg-gradient-to-r from-[#1C8C7D]/10 to-transparent dark:from-[#1C8C7D]/20 dark:to-transparent shadow-md"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B22] hover:border-[#1C8C7D]/30 hover:shadow-sm"
                      )}
                    >
                      <div className="text-3xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-semibold text-base mb-0.5",
                          isSelected
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-700 dark:text-slate-200"
                        )}>
                          {option.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="h-5 w-5 rounded-full bg-[#1C8C7D] flex items-center justify-center shadow-lg">
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <svg className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.slug || !formData.teamSize}
                size="lg"
                className="ml-auto bg-[#1C8C7D] hover:bg-[#156B60] text-white shadow-lg shadow-[#1C8C7D]/30 disabled:opacity-50 disabled:shadow-none px-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating workspace...
                  </>
                ) : (
                  <>
                    Create workspace
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
