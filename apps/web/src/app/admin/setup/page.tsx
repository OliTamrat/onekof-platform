'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'project' | 'expenses' | 'done'>('project');

  const createProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/create-ministry-project', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create project');
      }

      setResult((prev: any) => ({ ...prev, project: data }));
      setStep('expenses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/create-sample-expenses', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create expenses');
      }

      setResult((prev: any) => ({ ...prev, expenses: data }));
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const projectData = result?.project?.data;
  const expensesData = result?.expenses?.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1B1F23] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#22272B] rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">
            🏛️ Ministry of Water & Irrigation Setup
          </h1>
          <p className="text-slate-500 mb-8">
            Set up the Jira Water Dam & Irrigation project with budget management
          </p>

          {/* Step 1: Create Project */}
          <div className="mb-8 p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Step 1: Create Ministry Organization & Project
                </h2>
                <p className="text-sm text-slate-500">
                  This will create the organization, project, and budget with 6 categories
                </p>
              </div>
              {step === 'project' && !result?.project && (
                <Button
                  onClick={createProject}
                  disabled={loading}
                  className="px-6 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              )}
              {result?.project && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>

            {projectData && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  ✅ {result.project.message}
                </p>
                <div className="text-sm space-y-1 text-green-700 dark:text-green-400">
                  <p>• Organization: {projectData.organization.name}</p>
                  <p>• Project: {projectData.project.name} ({projectData.project.key})</p>
                  <p>
                    • Budget: {projectData.budget.totalBudget.toLocaleString()} {projectData.budget.currency}
                  </p>
                  <p>• Categories: {projectData.budget.categoriesCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Create Sample Expenses */}
          <div className="mb-8 p-6 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Step 2: Create Sample Expenses
                </h2>
                <p className="text-sm text-slate-500">
                  Add 16 realistic sample expenses (~70M ETB) to demonstrate the budget tracking
                </p>
              </div>
              {step === 'expenses' && !result?.expenses && (
                <Button
                  onClick={createExpenses}
                  disabled={loading || !result?.project}
                  className="px-6 py-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Expenses'
                  )}
                </Button>
              )}
              {result?.expenses && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
            </div>

            {expensesData && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  ✅ {result.expenses.message}
                </p>
                <div className="text-sm space-y-1 text-green-700 dark:text-green-400">
                  <p>• Expenses Created: {expensesData.expenses.count}</p>
                  <p>• Total Amount: {expensesData.expenses.totalAmount.toLocaleString()} {expensesData.budget.currency}</p>
                  <p>• Budget Utilization: {expensesData.expenses.utilization}</p>
                </div>
              </div>
            )}
          </div>

          {/* Completion */}
          {step === 'done' && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-500">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-12 w-12 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-2">
                    🎉 Setup Complete!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 mb-4">
                    The Ministry of Water & Irrigation with the Jira Water Dam & Irrigation project is ready!
                  </p>
                  {projectData && (
                    <a
                      href={`/projects/${projectData.project.id}/budget`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C8C7D] text-white rounded-md hover:bg-[#16A085] transition-colors"
                    >
                      View Budget Dashboard
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            What This Creates:
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• New organization: Ministry of Water & Irrigation</li>
            <li>• Project: Jira Water Dam & Irrigation (250M ETB budget)</li>
            <li>• 6 budget categories with Ethiopian government codes</li>
            <li>• 16 sample expenses showing different statuses (Paid, Approved, Pending)</li>
            <li>• Full budget dashboard with real-time analytics</li>
            <li>• AI-powered budget watchers and activity timeline</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
