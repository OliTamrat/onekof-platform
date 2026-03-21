'use client';

import * as React from 'react';
import { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type TeamSize = 'SOLO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';

interface TeamSizeOption {
  id: TeamSize;
  label: string;
  description: string;
}

const TEAM_SIZE_OPTIONS: TeamSizeOption[] = [
  { id: 'SOLO', label: 'Just me', description: '1 person' },
  { id: 'SMALL', label: '2-10 people', description: 'Small team' },
  { id: 'MEDIUM', label: '11-50 people', description: 'Growing team' },
  { id: 'LARGE', label: '51-200 people', description: 'Large team' },
  { id: 'ENTERPRISE', label: '200+ people', description: 'Enterprise' },
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#1B1F23] p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1C8C7D]/10 dark:bg-[#1C8C7D]/20 mb-4">
            <Building2 className="h-8 w-8 text-[#1C8C7D]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create your workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            A workspace is where your team collaborates on projects
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Workspace name
            </Label>
            <Input
              id="name"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              autoFocus
              className="h-12 text-base"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The name of your company or team
            </p>
          </div>

          {/* Workspace URL */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Workspace URL
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                onekof.com/
              </span>
              <Input
                id="slug"
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
                className="h-12 text-base flex-1"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              A unique URL identifier (lowercase letters, numbers, and hyphens only)
            </p>
          </div>

          {/* Team Size */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              What's your team size?
            </Label>
            <div className="space-y-2">
              {TEAM_SIZE_OPTIONS.map((option) => {
                const isSelected = formData.teamSize === option.id;

                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setFormData((prev) => ({ ...prev, teamSize: option.id }))}
                    className={cn(
                      "w-full h-auto flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? "border-[#1C8C7D] bg-[#1C8C7D]/5 dark:bg-[#1C8C7D]/10"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#22272B] hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <div className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0",
                      isSelected
                        ? "border-[#1C8C7D] bg-[#1C8C7D]"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        isSelected
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-700 dark:text-slate-300"
                      )}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
            {onBack && (
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isSubmitting}
                className="text-slate-600 dark:text-slate-400"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.slug || !formData.teamSize}
              className="ml-auto bg-[#1C8C7D] hover:bg-[#156B60] text-white h-12 px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating workspace...
                </>
              ) : (
                <>
                  Create workspace
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
