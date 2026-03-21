'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
import { BUDGET_TABS } from '@/config/department-tabs';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';

// Mock forecasting data
const FORECASTS = [
  { id: 1, period: 'April 2024', projectedRevenue: 95000, projectedExpenses: 72000, variance: 23000, confidence: 85 },
  { id: 2, period: 'May 2024', projectedRevenue: 102000, projectedExpenses: 75000, variance: 27000, confidence: 78 },
  { id: 3, period: 'June 2024', projectedRevenue: 98000, projectedExpenses: 71000, variance: 27000, confidence: 72 },
  { id: 4, period: 'Q2 2024', projectedRevenue: 295000, projectedExpenses: 218000, variance: 77000, confidence: 80 },
];

export default function BudgetForecastingPage() {
  return (
    <AppLayout>
      <UnifiedPageHeader
        title="Forecasting"
        icon={<PieChart className="h-6 w-6" />}
        iconColor="#F59E0B"
        currentTab="forecasting"
        baseHref="/dashboard/budget"
        customTabs={BUDGET_TABS}
        showTabs
      />

      <div className="p-4 md:p-6">
        {/* Summary Cards */}
        <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0 md:grid md:grid-cols-3 md:gap-4 mb-6 scrollbar-hide">
          <div className="flex-shrink-0 w-[200px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Projected Revenue (Q2)</div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">$295,000</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+15% vs Q1</div>
          </div>

          <div className="flex-shrink-0 w-[200px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Projected Expenses (Q2)</div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">$218,000</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">-3% vs Q1</div>
          </div>

          <div className="flex-shrink-0 w-[200px] md:w-auto bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Net Projection (Q2)</div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400">$77,000</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">80% confidence</div>
          </div>
        </div>

        {/* Forecasting Table */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-[#22272B] dark:to-[#1B1F23] border border-slate-200/60 dark:border-slate-700/60 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Forecast</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1B1F23]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Projected Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Projected Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Net Variance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {FORECASTS.map((forecast) => (
                  <tr key={forecast.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{forecast.period}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${forecast.projectedRevenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ${forecast.projectedExpenses.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${forecast.variance > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${forecast.variance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${forecast.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">{forecast.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-6 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Forecast Visualization</h2>
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-[#1B1F23] rounded-lg">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Interactive forecast charts will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
