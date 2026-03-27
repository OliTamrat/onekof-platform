'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import {
  Settings,
  Save,
  Bell,
  DollarSign,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface BudgetSettings {
  alertThresholds?: number[];
  autoApproval?: boolean;
  requireReceipts?: boolean;
  approvalLevels?: Record<string, string[]>;
  currency?: string;
  fiscalYearStartMonth?: string;
  notificationsEnabled?: boolean;
  budgetAlertThreshold?: number;
  approvalRequired?: boolean;
  approvalThresholdAmount?: number;
}

export default function BudgetSettingsPage() {
  const { t } = useLanguage();
  const { status } = useSession();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [currency, setCurrency] = useState('ETB');
  const [fiscalYearStart, setFiscalYearStart] = useState('07');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState('80');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [approvalThreshold, setApprovalThreshold] = useState('1000000');
  const [selectedBudgetId, setSelectedBudgetId] = useState('');

  // Fetch budgets
  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets', 'org'],
    queryFn: async () => {
      const res = await fetch('/api/budgets');
      if (!res.ok) throw new Error('Failed to fetch budgets');
      return res.json();
    },
    enabled: status === 'authenticated',
  });

  const budgets = budgetsData?.budgets || [];

  // Load settings from selected budget
  useEffect(() => {
    if (budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0].id);
    }
  }, [budgets, selectedBudgetId]);

  useEffect(() => {
    const budget = budgets.find((b: any) => b.id === selectedBudgetId);
    if (budget) {
      setCurrency(budget.currency || 'ETB');
      const settings: BudgetSettings = (budget.settings as BudgetSettings) || {};
      setFiscalYearStart(settings.fiscalYearStartMonth || '07');
      setNotificationsEnabled(settings.notificationsEnabled ?? true);
      setBudgetAlertThreshold(String(settings.budgetAlertThreshold ?? 80));
      setApprovalRequired(settings.approvalRequired ?? true);
      setApprovalThreshold(String(settings.approvalThresholdAmount ?? 1000000));
    }
  }, [selectedBudgetId, budgets]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBudgetId) throw new Error('No budget selected');
      const res = await fetch(`/api/budgets/${selectedBudgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            fiscalYearStartMonth: fiscalYearStart,
            notificationsEnabled,
            budgetAlertThreshold: Number(budgetAlertThreshold),
            approvalRequired,
            approvalThresholdAmount: Number(approvalThreshold),
            currency,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save settings');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(t('budgetSettings.settingsSaved'));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title={t('budgetSettings.title')}
        icon={<Settings className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="settings"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-6 max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#1C8C7D]" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('budgetSettings.noBudgetsFound')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('budgetSettings.noBudgetsFoundDesc')}</p>
          </div>
        ) : (
          <>
            {/* Budget Selector */}
            {budgets.length > 1 && (
              <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('budgetSettings.selectBudget')}
                </label>
                <select
                  value={selectedBudgetId}
                  onChange={(e) => setSelectedBudgetId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {budgets.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.project?.name || 'Unnamed'} — {b.currency} {Number(b.totalBudget).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* General Settings */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('budgetSettings.generalSettings')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('budgetSettings.currency')}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="ETB">{t('budgetSettings.etbBirr')}</option>
                    <option value="USD">{t('budgetSettings.usdDollar')}</option>
                    <option value="EUR">{t('budgetSettings.eurEuro')}</option>
                    <option value="GBP">{t('budgetSettings.gbpPound')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('budgetSettings.fiscalYearStartMonth')}
                  </label>
                  <select
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="01">{t('budgetSettings.januaryMonth')}</option>
                    <option value="02">{t('budgetSettings.februaryMonth')}</option>
                    <option value="03">{t('budgetSettings.marchMonth')}</option>
                    <option value="04">{t('budgetSettings.aprilMonth')}</option>
                    <option value="05">{t('budgetSettings.mayMonth')}</option>
                    <option value="06">{t('budgetSettings.juneMonth')}</option>
                    <option value="07">{t('budgetSettings.julyMonth')}</option>
                    <option value="08">{t('budgetSettings.augustMonth')}</option>
                    <option value="09">{t('budgetSettings.septemberMonth')}</option>
                    <option value="10">{t('budgetSettings.octoberMonth')}</option>
                    <option value="11">{t('budgetSettings.novemberMonth')}</option>
                    <option value="12">{t('budgetSettings.decemberMonth')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-[#F59E0B]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('budgetSettings.notifications')}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('budgetSettings.enableBudgetAlerts')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('budgetSettings.enableBudgetAlertsDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('budgetSettings.budgetAlertThreshold')}
                  </label>
                  <input
                    type="number"
                    value={budgetAlertThreshold}
                    onChange={(e) => setBudgetAlertThreshold(e.target.value)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('budgetSettings.budgetAlertThresholdDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Workflow */}
            <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-[#F59E0B]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('budgetSettings.approvalWorkflow')}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('budgetSettings.requireExpenseApproval')}</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('budgetSettings.requireExpenseApprovalDesc')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApprovalRequired(!approvalRequired)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      approvalRequired ? 'bg-[#1C8C7D]' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        approvalRequired ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('budgetSettings.approvalThresholdAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">ETB</span>
                    <input
                      type="number"
                      value={approvalThreshold}
                      onChange={(e) => setApprovalThreshold(e.target.value)}
                      min="0"
                      className="w-full pl-12 pr-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('budgetSettings.approvalThresholdAmountDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !selectedBudgetId}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#1C8C7D] hover:bg-[#16A085] rounded-md"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t('budgetSettings.saveSettings')}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
