/**
 * Pure settings-inheritance rules — no database imports, unit-testable.
 * The DB-backed resolver in ./resolve.ts is the only production caller.
 * See docs/architecture/SPRINT_AND_SETTINGS_ARCHITECTURE.md §4.
 */

export type EstimationUnit = 'HOURS' | 'POINTS';
export type TerminologyScheme = 'AGILE' | 'FORMAL';

export interface EffectiveProjectSettings {
  sprintsEnabled: boolean;
  estimationUnit: EstimationUnit;
  enforceWorkflow: boolean;
  /** null = use the workflow engine's default transition table */
  workflowTransitions: Record<string, string[]> | null;
  terminologyScheme: TerminologyScheme;
}

/** Org-level fallbacks when an organization has no settings row yet. */
export const ORG_DEFAULTS = {
  sprintsEnabledDefault: false,
  estimationUnitDefault: 'HOURS' as EstimationUnit,
  enforceWorkflowDefault: false,
  terminologyScheme: 'AGILE' as TerminologyScheme,
};

export interface OrgSettingsLayer {
  sprintsEnabledDefault: boolean;
  estimationUnitDefault: EstimationUnit | string;
  enforceWorkflowDefault: boolean;
  terminologyScheme: TerminologyScheme | string;
}

export interface ProjectSettingsLayer {
  sprintsEnabled: boolean | null;
  estimationUnit: EstimationUnit | string | null;
  enforceWorkflow: boolean | null;
  workflowTransitions: unknown;
}

/**
 * Pure merge of the two layers — null at the project layer falls through
 * to the organization default.
 */
export function computeEffectiveSettings(
  org: OrgSettingsLayer,
  proj: ProjectSettingsLayer | null,
  projectTemplate: string
): EffectiveProjectSettings {
  return {
    // SCRUM projects get sprints even before the org flips its default —
    // the template already declares the intent.
    sprintsEnabled:
      proj?.sprintsEnabled ??
      (org.sprintsEnabledDefault || projectTemplate === 'SCRUM'),
    estimationUnit:
      (proj?.estimationUnit as EstimationUnit | null) ??
      (org.estimationUnitDefault as EstimationUnit),
    enforceWorkflow: proj?.enforceWorkflow ?? org.enforceWorkflowDefault,
    workflowTransitions:
      (proj?.workflowTransitions as Record<string, string[]> | null) ?? null,
    terminologyScheme: org.terminologyScheme as TerminologyScheme,
  };
}
