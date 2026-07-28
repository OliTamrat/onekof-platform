'use client';

/**
 * Compact classification chip (D5) — shown wherever an issue is
 * summarized. Renders nothing for unclassified (general) work.
 */

import { useLanguage } from '@/contexts/language-context';
import { isDepartment, WORKSTREAM_LABEL_KEYS } from '@/lib/departments/catalog';

export function DepartmentChip({
  department,
  workstream,
  className = '',
}: {
  department?: string | null;
  workstream?: string | null;
  className?: string;
}) {
  const { t } = useLanguage();
  if (!department || !isDepartment(department)) return null;

  const deptLabel = t('sidebar.' + department);
  const wsKey = workstream ? WORKSTREAM_LABEL_KEYS[workstream] : undefined;
  const label = wsKey ? `${deptLabel} / ${t(wsKey)}` : deptLabel;

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 max-w-[160px] truncate ${className}`}
      title={label}
    >
      {label}
    </span>
  );
}
