'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-provider';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import {
  Settings,
  Save,
  Bell,
  DollarSign,
  Users,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BudgetSettingsPage() {
  const toast = useToast();
  const [currency, setCurrency] = useState('USD');
  const [fiscalYearStart, setFiscalYearStart] = useState('01');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlertThreshold, setBudgetAlertThreshold] = useState('80');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [approvalThreshold, setApprovalThreshold] = useState('1000');

  const handleSave = () => {
    // Save settings logic here
    toast.success('Settings saved');
  };

  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Budget Settings"
        icon={<Settings className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="settings"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-6 max-w-4xl">
        {/* General Settings */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-[#F59E0B]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ETB">ETB - Ethiopian Birr</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fiscal Year Start Month
              </label>
              <select
                value={fiscalYearStart}
                onChange={(e) => setFiscalYearStart(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-[#F59E0B]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Budget Alerts</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Receive notifications when budgets approach their limits
                </p>
              </div>
              <Button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Alert Threshold (%)
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
                Alert when budget reaches this percentage of the limit
              </p>
            </div>
          </div>
        </div>

        {/* Approval Workflow */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[#F59E0B]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Approval Workflow</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Expense Approval</label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  All expenses must be approved before being processed
                </p>
              </div>
              <Button
                onClick={() => setApprovalRequired(!approvalRequired)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  approvalRequired ? 'bg-primary-500' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    approvalRequired ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval Threshold Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={approvalThreshold}
                  onChange={(e) => setApprovalThreshold(e.target.value)}
                  min="0"
                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-[#1B1F23] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Expenses above this amount require approval
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <Button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md border border-gray-300 dark:border-slate-700">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
