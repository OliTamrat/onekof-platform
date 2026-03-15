'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { UnifiedPageHeader } from '@/components/navigation/unified-page-header';
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
      />

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Projected Revenue (Q2)</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$295,000</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">+15% vs Q1</div>
          </div>

          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Projected Expenses (Q2)</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$218,000</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">-3% vs Q1</div>
          </div>

          <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div className="text-sm text-gray-600 dark:text-[#9FADBC]">Net Projection (Q2)</div>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">$77,000</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">80% confidence</div>
          </div>
        </div>

        {/* Forecasting Table */}
        <div className="bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2C333A]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Forecast</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#1B1F23]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                    Projected Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                    Projected Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                    Net Variance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#9FADBC] uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#2C333A]">
                {FORECASTS.map((forecast) => (
                  <tr key={forecast.id} className="hover:bg-gray-50 dark:hover:bg-[#2C333A] cursor-pointer">
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
                        <div className="w-full bg-gray-200 dark:bg-[#2C333A] rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${forecast.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-[#9FADBC]">{forecast.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-6 bg-white dark:bg-[#22272B] border border-gray-200 dark:border-[#2C333A] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Forecast Visualization</h2>
          <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-[#1B1F23] rounded-lg">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-[#9FADBC]">
                Interactive forecast charts will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
