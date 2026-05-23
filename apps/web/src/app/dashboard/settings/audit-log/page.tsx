'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  Loader2,
  Download,
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/workspace-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceName: string | null;
  resourceId: string | null;
  outcome: string;
  ipAddress: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Action badge colours ─────────────────────────────────────────────────────

function actionBadgeClass(action: string): string {
  if (action.includes('DELETED') || action.includes('REMOVED') || action.includes('REJECTED')) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
  if (action.includes('CREATED') || action.includes('ADDED') || action.includes('ACCEPTED') || action.includes('APPROVED')) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
  if (action.includes('CHANGED') || action.includes('UPDATED') || action.includes('SENT') || action.includes('REVOKED')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  }
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditLogPage() {
  const { currentOrganization } = useWorkspace();
  const [entries, setEntries]       = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  const [exporting, setExporting]       = useState(false);

  // Filters
  const [actionFilter, setActionFilter]     = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [fromDate, setFromDate]             = useState('');
  const [toDate, setToDate]                 = useState('');

  const fetchLogs = useCallback(async () => {
    if (!currentOrganization?.id) return;

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (actionFilter)   params.set('action',   actionFilter);
      if (resourceFilter) params.set('resource', resourceFilter);
      if (fromDate)       params.set('from',     fromDate);
      if (toDate)         params.set('to',       toDate);

      const res = await fetch(
        `/api/organizations/${currentOrganization.id}/audit-log?${params}`
      );
      if (res.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to load audit log');
        return;
      }
      const data = await res.json();
      setEntries(data.entries);
      setPagination(data.pagination);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization?.id, page, actionFilter, resourceFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const exportCsv = async () => {
    if (!currentOrganization?.id || exporting) return;
    setExporting(true);
    try {
      const params = new URLSearchParams({ format: 'csv' });
      if (actionFilter)   params.set('action',   actionFilter);
      if (resourceFilter) params.set('resource', resourceFilter);
      if (fromDate)       params.set('from',     fromDate);
      if (toDate)         params.set('to',       toDate);

      const res = await fetch(`/api/organizations/${currentOrganization.id}/audit-log?${params}`);
      if (!res.ok) { setError('Export failed'); return; }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Export failed — please try again');
    } finally {
      setExporting(false);
    }
  };

  // Reset to page 1 when filters change
  const applyFilter = () => {
    setPage(1);
    fetchLogs();
  };

  if (accessDenied) {
    return (
      <AppLayout>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Access Denied</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Only organization Owners and Admins can view the audit log.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <ClipboardList className="h-7 w-7 text-[#1C8C7D]" />
            Audit Log
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
            A tamper-evident record of every privileged action in this organization.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#12161B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent appearance-none min-w-[200px]"
            >
              <option value="">All actions</option>
              <optgroup label="Projects">
                <option value="PROJECT_CREATED">Project Created</option>
                <option value="PROJECT_UPDATED">Project Updated</option>
                <option value="PROJECT_DELETED">Project Deleted</option>
                <option value="PROJECT_VISIBILITY_CHANGED">Visibility Changed</option>
                <option value="PROJECT_MEMBER_ADDED">Member Added</option>
                <option value="PROJECT_MEMBER_REMOVED">Member Removed</option>
                <option value="PROJECT_MEMBER_ROLE_CHANGED">Member Role Changed</option>
              </optgroup>
              <optgroup label="Teams">
                <option value="TEAM_CREATED">Team Created</option>
                <option value="TEAM_DELETED">Team Deleted</option>
                <option value="TEAM_MEMBER_ADDED">Team Member Added</option>
                <option value="TEAM_MEMBER_REMOVED">Team Member Removed</option>
                <option value="TEAM_MEMBER_ROLE_CHANGED">Team Member Role Changed</option>
              </optgroup>
              <optgroup label="Invitations">
                <option value="INVITATION_SENT">Invitation Sent</option>
                <option value="INVITATION_REVOKED">Invitation Revoked</option>
                <option value="INVITATION_ACCEPTED">Invitation Accepted</option>
              </optgroup>
              <optgroup label="Expenses">
                <option value="EXPENSE_APPROVED">Expense Approved</option>
                <option value="EXPENSE_REJECTED">Expense Rejected</option>
                <option value="EXPENSE_DELETED">Expense Deleted</option>
              </optgroup>
              <optgroup label="Organization">
                <option value="ORG_SETTINGS_UPDATED">Org Settings Updated</option>
                <option value="ORG_MEMBER_ROLE_CHANGED">Member Role Changed</option>
                <option value="ORG_MEMBER_REMOVED">Member Removed</option>
              </optgroup>
            </select>
          </div>

          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#12161B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent"
          >
            <option value="">All resources</option>
            <option value="project">Project</option>
            <option value="project_member">Project Member</option>
            <option value="team">Team</option>
            <option value="team_member">Team Member</option>
            <option value="invitation">Invitation</option>
            <option value="expense">Expense</option>
            <option value="budget">Budget</option>
            <option value="organization">Organization</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#12161B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent"
            title="From date"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#12161B] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1C8C7D] focus:border-transparent"
            title="To date"
          />

          <Button
            onClick={applyFilter}
            className="px-4 py-2 text-sm bg-[#1C8C7D] text-white rounded-lg hover:bg-[#15695E] transition-colors"
          >
            Apply
          </Button>

          <Button
            onClick={() => {
              setActionFilter('');
              setResourceFilter('');
              setFromDate('');
              setToDate('');
              setPage(1);
            }}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Clear
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={exportCsv}
              disabled={exporting || !currentOrganization?.id}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Export as CSV"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-[#12161B] rounded-xl border border-gray-200 dark:border-[#374151] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#374151] bg-gray-50 dark:bg-[#0D1117]">
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Resource</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Target</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">IP Address</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1F2937]">
                {loading && entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </td>
                  </tr>
                )}
                {!loading && entries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                      No audit entries found for the selected filters.
                    </td>
                  </tr>
                )}
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-[#1A2029] transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 dark:text-white text-xs font-medium">{entry.actorEmail}</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs">{entry.actorRole}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${actionBadgeClass(entry.action)}`}>
                        {formatAction(entry.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {entry.resource.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                      {entry.resourceName || entry.resourceId || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-400 dark:text-gray-500">
                      {entry.ipAddress || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        entry.outcome === 'SUCCESS'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : entry.outcome === 'DENIED'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {entry.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-[#374151] flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages || loading}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* INSA note */}
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          This log is append-only and cannot be modified. Retained for compliance and government audit purposes (INSA / SOC-2).
        </p>
      </div>
    </AppLayout>
  );
}
