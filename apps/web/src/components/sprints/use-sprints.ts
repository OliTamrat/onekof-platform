'use client';

/**
 * React Query hooks for sprint planning. Server rules these rely on:
 * one ACTIVE sprint per project is DB-enforced (409 on second start),
 * completion/deletion are ADMIN+ (403 surfaces as a toast), and the
 * commitment snapshot is written server-side at start.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  position: number;
  startDate: string | null;
  endDate: string | null;
  committedCount: number | null;
  committedEstimate: number | null;
  completedCount: number | null;
  completedEstimate: number | null;
  completedAt: string | null;
  taskCount: number;
}

export interface EffectiveProjectSettings {
  sprintsEnabled: boolean;
  estimationUnit: 'HOURS' | 'POINTS';
  enforceWorkflow: boolean;
  terminologyScheme: 'AGILE' | 'FORMAL';
}

export function useProjectSettings(projectId: string | null) {
  return useQuery({
    queryKey: ['project-settings', projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<{ effective: EffectiveProjectSettings }> => {
      const res = await fetch(`/api/projects/${projectId}/settings`);
      if (!res.ok) throw new Error('Failed to fetch project settings');
      return res.json();
    },
  });
}

export function useSprints(projectId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['sprints', projectId],
    enabled: !!projectId && enabled,
    queryFn: async (): Promise<{ sprints: Sprint[] }> => {
      const res = await fetch(`/api/projects/${projectId}/sprints`);
      if (!res.ok) throw new Error('Failed to fetch sprints');
      return res.json();
    },
  });
}

export function useCreateSprint(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; goal?: string | null; startDate?: string | null; endDate?: string | null }) => {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create sprint');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sprints', projectId] }),
  });
}

export function useUpdateSprint(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sprintId, ...body }: { sprintId: string; name?: string; goal?: string | null; startDate?: string | null; endDate?: string | null }) => {
      const res = await fetch(`/api/sprints/${sprintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update sprint');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sprints', projectId] }),
  });
}

export function useStartSprint(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sprintId: string) => {
      const res = await fetch(`/api/sprints/${sprintId}/start`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error || 'Failed to start sprint') as Error & { status?: number };
        err.status = res.status;
        throw err;
      }
      return data;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['sprints', projectId] }),
  });
}

export function useDeleteSprint(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sprintId: string) => {
      const res = await fetch(`/api/sprints/${sprintId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete sprint');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function useCompleteSprint(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sprintId, rolloverTo }: { sprintId: string; rolloverTo: 'backlog' | string }) => {
      const res = await fetch(`/api/sprints/${sprintId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rolloverTo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete sprint');
      return data as { sprint: Sprint; rolledOver: number };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

/** Flip sprintsEnabled on for a project (server enforces project ADMIN+). */
export function useEnableSprints(projectId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprintsEnabled: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to enable sprints');
      return res.json();
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['project-settings', projectId] }),
  });
}

/**
 * Move an issue between backlog and a sprint (or between sprints).
 * Optimistically updates every issues query so both the backlog list and
 * the sprint sections reflow instantly; rolls back on error.
 */
export function useMoveIssueToSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, sprintId, sprintOrder }: { issueId: string; sprintId: string | null; sprintOrder?: number | null }) => {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprintId, ...(sprintOrder !== undefined && { sprintOrder }) }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to move issue');
      return res.json();
    },
    onMutate: async ({ issueId, sprintId, sprintOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['issues'] });
      const prev = queryClient.getQueriesData({ queryKey: ['issues'] });
      queryClient.setQueriesData({ queryKey: ['issues'] }, (old: any) => {
        if (!old?.issues) return old;
        return {
          ...old,
          issues: old.issues.map((i: any) =>
            i.id === issueId ? { ...i, sprintId, sprintOrder: sprintOrder ?? null } : i
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prev?.forEach(([key, data]: [any, any]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
    },
  });
}
