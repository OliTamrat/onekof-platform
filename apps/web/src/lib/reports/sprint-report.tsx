/**
 * Branded sprint report PDF (Tier 2c of the reporting architecture).
 *
 * Rendered server-side by @react-pdf/renderer — pure Node, no headless
 * browser, and every asset (fonts, logo) is fetched from the deployment's
 * OWN origin, so it works identically on Vercel and on Tier 2 on-prem
 * with zero external calls. Ge'ez scripts (am/ti) use the vendored
 * Abyssinica SIL; other locales use Inter.
 *
 * This is the ministry artifact: header with the Onekof logo, completion
 * against the commitment snapshot, contribution table, scope changes,
 * budget line, velocity context, and a signature block — because ministry
 * reports get signed.
 */

import React from 'react';
import { Document, Page, Text, View, Image, Font, StyleSheet } from '@react-pdf/renderer';
import { makeTranslator } from './translate';

export interface SprintReportData {
  language: string;
  terminologyScheme: 'AGILE' | 'FORMAL';
  orgName: string;
  projectName: string;
  sprintName: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  completedAtDate: string | null;
  committedCount: number | null;
  completedCount: number | null;
  committedEstimate: number | null;
  completedEstimate: number | null;
  estimationUnit: 'HOURS' | 'POINTS';
  budgetPlanned: number | null;
  budgetInvested: number | null;
  budgetCurrency: string;
  churn: { added: number; removed: number };
  velocity: number | null;
  contributions: {
    name: string | null;
    issues: number;
    done: number;
    timeSpent: number;
    estimated: number;
  }[];
  /** Origin to load self-hosted fonts/logo from; null = built-in fonts, no logo (tests) */
  assetBaseUrl: string | null;
}

const TEAL = '#1C8C7D';

function registerFonts(assetBaseUrl: string | null, geez: boolean): string {
  if (!assetBaseUrl) return 'Helvetica';
  if (geez) {
    Font.register({
      family: 'AbyssinicaSIL',
      src: `${assetBaseUrl}/fonts/AbyssinicaSIL-Regular.ttf`,
    });
    return 'AbyssinicaSIL';
  }
  Font.register({
    family: 'Inter',
    fonts: [
      { src: `${assetBaseUrl}/fonts/Inter-Regular.ttf` },
      { src: `${assetBaseUrl}/fonts/Inter-Bold.ttf`, fontWeight: 700 },
    ],
  });
  return 'Inter';
}

export function buildSprintReport(data: SprintReportData) {
  const t = makeTranslator(data.language);
  const formal = data.terminologyScheme === 'FORMAL';
  const noun = t(formal ? 'sprints.nounFormal' : 'sprints.noun');
  const geez = ['am', 'ti'].includes(data.language?.toLowerCase());
  const family = registerFonts(data.assetBaseUrl, geez);

  const styles = StyleSheet.create({
    page: { fontFamily: family, fontSize: 10, padding: 40, color: '#1a1a1a' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    logo: { height: 28, marginRight: 10, objectFit: 'contain' },
    docTitle: { fontSize: 16, fontWeight: 700 },
    accent: { height: 3, backgroundColor: TEAL, marginTop: 6, marginBottom: 14 },
    metaLabel: { color: '#666666', width: 90 },
    metaRow: { flexDirection: 'row', marginBottom: 3 },
    section: { marginTop: 14 },
    sectionTitle: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: TEAL },
    bulletTrack: {
      height: 8,
      borderWidth: 1,
      borderColor: '#bbbbbb',
      borderRadius: 4,
      marginTop: 4,
      marginBottom: 2,
    },
    bulletFill: { height: 6, backgroundColor: TEAL, borderRadius: 3, margin: 0.5 },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#cccccc',
      paddingBottom: 3,
      marginBottom: 3,
    },
    tableRow: { flexDirection: 'row', paddingVertical: 2 },
    colName: { flex: 2 },
    colNum: { flex: 1, textAlign: 'right' },
    muted: { color: '#666666' },
    signatureRow: { flexDirection: 'row', marginTop: 40, justifyContent: 'space-between' },
    signatureBox: { width: '45%' },
    signatureLine: { borderBottomWidth: 1, borderBottomColor: '#999999', height: 24, marginBottom: 4 },
    footer: {
      position: 'absolute',
      bottom: 24,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      fontSize: 8,
      color: '#999999',
    },
  });

  const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');
  const fmtEstimate = (n: number | null) =>
    n == null
      ? '—'
      : data.estimationUnit === 'POINTS'
        ? t('sprints.estimatePoints', { count: n })
        : t('sprints.estimateHours', { count: n });

  const committed = data.committedCount ?? 0;
  const done = data.completedCount ?? 0;
  const pct = committed > 0 ? Math.min(100, (done / committed) * 100) : 0;

  return (
    <Document
      title={`${data.sprintName} — ${t('sprints.reportDocTitle', { noun })}`}
      author={data.orgName}
    >
      <Page size="A4" style={styles.page}>
        {/* Branded header */}
        <View style={styles.headerRow}>
          {data.assetBaseUrl && (
            <Image style={styles.logo} src={`${data.assetBaseUrl}/logo-full.png`} />
          )}
          <Text style={styles.docTitle}>{t('sprints.reportDocTitle', { noun })}</Text>
        </View>
        <View style={styles.accent} />

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('sprints.projectLabel')}</Text>
          <Text>{data.projectName} · {data.orgName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{noun}</Text>
          <Text>{data.sprintName}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('sprints.datesLabel')}</Text>
          <Text>{fmtDate(data.startDate)} → {fmtDate(data.endDate)}</Text>
        </View>
        {data.goal && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('sprints.goal')}</Text>
            <Text style={{ flex: 1 }}>{data.goal}</Text>
          </View>
        )}

        {/* Completion vs commitment snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sprints.completionOf', { done, committed })}</Text>
          <View style={styles.bulletTrack}>
            <View style={[styles.bulletFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.muted}>
            {fmtEstimate(data.completedEstimate)} / {fmtEstimate(data.committedEstimate)}
          </Text>
        </View>

        {/* Scope changes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('sprints.scopeChanges')}</Text>
          <Text>
            {data.churn.added + data.churn.removed === 0
              ? t('sprints.noScopeChanges')
              : t('sprints.scopeSummary', { added: data.churn.added, removed: data.churn.removed })}
          </Text>
        </View>

        {/* Budget */}
        {(data.budgetPlanned != null || data.budgetInvested != null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('sprints.budgetLine', {
                currency: data.budgetCurrency,
                planned: data.budgetPlanned != null ? data.budgetPlanned.toLocaleString() : '—',
                invested: data.budgetInvested != null ? data.budgetInvested.toLocaleString() : '—',
              })}
            </Text>
          </View>
        )}

        {/* Contributions */}
        {data.contributions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('sprints.contributions')}</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colName, styles.muted]}>{t('sprints.contributor')}</Text>
              <Text style={[styles.colNum, styles.muted]}>{t('sprints.issuesDone')}</Text>
              <Text style={[styles.colNum, styles.muted]}>{t('sprints.timeSpentLabel')}</Text>
              <Text style={[styles.colNum, styles.muted]}>{t('sprints.estimatedLabel')}</Text>
            </View>
            {data.contributions.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colName}>{c.name || t('sprints.unassigned')}</Text>
                <Text style={styles.colNum}>{c.done}/{c.issues}</Text>
                <Text style={styles.colNum}>{t('sprints.estimateHours', { count: c.timeSpent })}</Text>
                <Text style={styles.colNum}>{fmtEstimate(c.estimated)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Velocity context */}
        {data.velocity != null && (
          <View style={styles.section}>
            <Text style={styles.muted}>
              {t('sprints.velocityLabel', { count: data.velocity, noun })}
            </Text>
          </View>
        )}

        {/* Signature block — ministry reports get signed */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.muted}>{t('sprints.preparedBy')} · {t('sprints.dateLabel')}</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.muted}>{t('sprints.approvedBy')} · {t('sprints.dateLabel')}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{data.orgName} — Onekof</Text>
          <Text>
            {t('sprints.generatedOn', { date: data.completedAtDate ?? fmtDate(null) })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
