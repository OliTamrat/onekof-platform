'use client';

import {
  TrendingUp
} from 'lucide-react';
import { AppLayout } from '@/components/layouts/app-layout';

export default function MarketingPage() {
  return (
    <AppLayout>
      <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage public relations, stakeholder engagement, and communications
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
            <TrendingUp className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Marketing & Communications</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            Marketing tools are coming soon. Manage social media, analytics, and campaigns.
          </p>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
