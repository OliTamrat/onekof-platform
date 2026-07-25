import { describe, it, expect } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { buildSprintReport, SprintReportData } from '@/lib/reports/sprint-report';
import { makeTranslator } from '@/lib/reports/translate';

const baseData: SprintReportData = {
  language: 'en',
  terminologyScheme: 'AGILE',
  orgName: 'Ministry of Water and Irrigation',
  projectName: 'Jira Water Dam & Irrigation',
  sprintName: 'Sprint 1',
  goal: 'Deliver the water quality monitoring setup',
  startDate: '2026-08-01T00:00:00.000Z',
  endDate: '2026-08-15T00:00:00.000Z',
  completedAtDate: '2026-08-15',
  committedCount: 3,
  completedCount: 2,
  committedEstimate: 24,
  completedEstimate: 16,
  estimationUnit: 'HOURS',
  budgetPlanned: 150000,
  budgetInvested: 120000,
  budgetCurrency: 'ETB',
  churn: { added: 1, removed: 0 },
  velocity: 2,
  contributions: [
    { name: 'Fenet Bedaso', issues: 2, done: 2, timeSpent: 10, estimated: 16 },
    { name: null, issues: 1, done: 0, timeSpent: 0, estimated: 8 },
  ],
  // null = built-in fonts + no logo, so the test needs no network/origin
  assetBaseUrl: null,
};

describe('Sprint report PDF', () => {
  it('renders a valid PDF for English', async () => {
    const buffer = await renderToBuffer(buildSprintReport(baseData));
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
    expect(buffer.length).toBeGreaterThan(1000);
  });

  it('renders with FORMAL terminology and empty sections', async () => {
    const buffer = await renderToBuffer(
      buildSprintReport({
        ...baseData,
        terminologyScheme: 'FORMAL',
        goal: null,
        budgetPlanned: null,
        budgetInvested: null,
        velocity: null,
        contributions: [],
        churn: { added: 0, removed: 0 },
      })
    );
    expect(buffer.subarray(0, 5).toString()).toBe('%PDF-');
  });
});

describe('makeTranslator', () => {
  it('resolves nested keys with interpolation', () => {
    const t = makeTranslator('en');
    expect(t('sprints.reportDocTitle', { noun: 'Sprint' })).toBe('Sprint Report');
  });

  it('falls back to English for missing keys and unknown locales', () => {
    const t = makeTranslator('xx');
    expect(t('sprints.projectLabel')).toBe('Project');
    expect(makeTranslator('am')('sprints.nonexistent.key')).toBe('sprints.nonexistent.key');
  });

  it('serves Amharic strings for am', () => {
    const t = makeTranslator('am');
    expect(t('sprints.projectLabel')).toBe('ፕሮጀክት');
  });
});
