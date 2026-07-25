/**
 * Settings resolution — the ONE place the Org → Project inheritance is
 * computed against the database. The merge rules themselves live in
 * ./effective.ts (pure, unit-tested). Every consumer (API routes, server
 * components, reports) calls resolveProjectSettings so the effective value
 * is computed identically everywhere.
 * See docs/architecture/SPRINT_AND_SETTINGS_ARCHITECTURE.md §4.
 */

import { prisma } from '@onekof/database';
import {
  computeEffectiveSettings,
  ORG_DEFAULTS,
  type EffectiveProjectSettings,
  type EstimationUnit,
  type TerminologyScheme,
} from './effective';

export {
  computeEffectiveSettings,
  ORG_DEFAULTS,
  type EffectiveProjectSettings,
  type EstimationUnit,
  type TerminologyScheme,
};

export async function resolveProjectSettings(
  projectId: string
): Promise<EffectiveProjectSettings | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      template: true,
      projectSettings: true,
      organization: { select: { organizationSettings: true } },
    },
  });

  if (!project) return null;

  return computeEffectiveSettings(
    project.organization.organizationSettings ?? ORG_DEFAULTS,
    project.projectSettings,
    project.template
  );
}
