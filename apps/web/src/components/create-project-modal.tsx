'use client';

import * as React from 'react';
import { useState } from 'react';
import { useWorkspace } from '@/contexts/workspace-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const { currentOrganization, refreshProjects } = useWorkspace();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    template: 'KANBAN' as 'KANBAN' | 'SCRUM' | 'CUSTOM',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate project key from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate key if it hasn't been manually edited
      key: prev.key === '' || prev.key === generateKey(prev.name)
        ? generateKey(name)
        : prev.key,
    }));
  };

  const generateKey = (name: string): string => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.slice(0, 3))
      .join('')
      .slice(0, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentOrganization) {
      setError('No workspace selected');
      return;
    }

    if (!formData.name || !formData.key) {
      setError('Name and key are required');
      return;
    }

    if (!/^[A-Z0-9]+$/.test(formData.key)) {
      setError('Key must contain only uppercase letters and numbers');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/organizations/${currentOrganization.id}/projects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      // Reset form
      setFormData({
        name: '',
        key: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        template: 'KANBAN',
      });

      // Refresh projects list
      await refreshProjects();

      // Close modal
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new project in {currentOrganization?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key">Project Key *</Label>
            <Input
              id="key"
              placeholder="MAP"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  key: e.target.value.toUpperCase(),
                }))
              }
              maxLength={10}
              required
            />
            <p className="text-xs text-slate-500">
              A short identifier (e.g., MAP for My Awesome Project)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                placeholder="🚀"
                value={formData.icon}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: e.target.value,
                  }))
                }
                maxLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              value={formData.template}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  template: e.target.value as 'KANBAN' | 'SCRUM' | 'CUSTOM',
                }))
              }
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              <option value="KANBAN">Kanban Board</option>
              <option value="SCRUM">Scrum Board</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
