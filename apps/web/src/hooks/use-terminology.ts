'use client';

/**
 * Terminology hook — resolves the org's vocabulary scheme into localized
 * nouns. AGILE orgs see "Sprint"; FORMAL (government/NGO-facing) orgs see
 * "Work Cycle". Driven by OrganizationSettings.terminologyScheme so the
 * whole app switches consistently, in all 5 languages.
 *
 * Usage:
 *   const { sprintNoun } = useTerminology();
 *   t('sprints.create', { noun: sprintNoun })
 */

import { useOrganizationSettings } from '@/contexts/organization-settings-context';
import { useLanguage } from '@/contexts/language-context';

export function useTerminology() {
  const { settings } = useOrganizationSettings();
  const { t } = useLanguage();
  const formal = settings.terminologyScheme === 'FORMAL';

  return {
    scheme: formal ? ('FORMAL' as const) : ('AGILE' as const),
    sprintNoun: t(formal ? 'sprints.nounFormal' : 'sprints.noun'),
    sprintNounPlural: t(formal ? 'sprints.nounPluralFormal' : 'sprints.nounPlural'),
  };
}
