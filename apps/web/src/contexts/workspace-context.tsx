'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

// Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  memberCount?: number;
  projectCount?: number;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  template: 'KANBAN' | 'SCRUM' | 'CUSTOM';
  type?: string;
  priority?: string;
  isArchived: boolean;
  isFavorite: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  status?: string;
  // Ownership
  ownerId?: string | null;
  leadId?: string | null;
  lead?: { name?: string; email?: string } | null;
  defaultAssignee?: string | null;
  // Organization
  department?: string | null;
  category?: string | null;
  entityType?: string | null;
  visibility?: string | null;
  riskLevel?: string | null;
  budgetCode?: string | null;
  tags?: string[];
  // Timeline
  startDate?: string | null;
  dueDate?: string | null;
  // Metadata
  settings?: Record<string, unknown>;
  _count?: { members?: number; tasks?: number };
}

interface WorkspaceContextType {
  // Current workspace/organization
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;

  // All user's organizations
  organizations: Organization[];
  setOrganizations: (orgs: Organization[]) => void;

  // Current project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // All projects in current organization
  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Loading states
  isLoadingOrganizations: boolean;
  isLoadingProjects: boolean;

  // Actions
  refreshOrganizations: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Fetch organizations on mount
  const refreshOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      const response = await fetch('/api/organizations');

      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);

        // Multi-tenant: Check if we're on a subdomain
        const hostname = window.location.hostname;
        let organizationSlug: string | null = null;

        // Extract subdomain from hostname
        if (hostname.endsWith('.onekof.com')) {
          organizationSlug = hostname.replace('.onekof.com', '');
        } else if (hostname.endsWith('.localhost')) {
          organizationSlug = hostname.replace('.localhost', '');
        }

        // If on subdomain, find organization by slug
        if (organizationSlug && organizationSlug !== 'www') {
          const orgBySlug = data.organizations?.find((org: Organization) => org.slug === organizationSlug);
          if (orgBySlug) {
            setCurrentOrganization(orgBySlug);
            return;
          }
        }

        // Fallback: Set default organization (user's default or first one)
        if (data.defaultOrganization) {
          setCurrentOrganization(data.defaultOrganization);
        } else if (data.organizations && data.organizations.length > 0) {
          setCurrentOrganization(data.organizations[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  // Fetch projects for current organization
  const refreshProjects = async () => {
    if (!currentOrganization) {
      setProjects([]);
      return;
    }

    try {
      setIsLoadingProjects(true);
      const response = await fetch(`/api/organizations/${currentOrganization.id}/projects`);

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);
    if (org) {
      setCurrentOrganization(org);
      setCurrentProject(null); // Clear current project when switching orgs

      // Update user's default organization
      try {
        await fetch('/api/user/default-organization', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId }),
        });
      } catch (error) {
        console.error('Failed to update default organization:', error);
      }
    }
  };

  // Load organizations when session is ready
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      refreshOrganizations();
    } else if (status === 'unauthenticated') {
      setIsLoadingOrganizations(false);
    }
  }, [status, session]);

  // Load projects when organization changes
  useEffect(() => {
    if (currentOrganization) {
      refreshProjects();
    }
  }, [currentOrganization]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentOrganization,
        setCurrentOrganization,
        organizations,
        setOrganizations,
        currentProject,
        setCurrentProject,
        projects,
        setProjects,
        isLoadingOrganizations,
        isLoadingProjects,
        refreshOrganizations,
        refreshProjects,
        switchOrganization,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
