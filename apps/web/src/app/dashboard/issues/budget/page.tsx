'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layouts/app-layout';
import { DollarSign } from 'lucide-react';

export default function IssuesBudgetPage() {
  const router = useRouter();

  // Redirect to main budget page
  useEffect(() => {
    router.push('/dashboard/budget');
  }, [router]);

  return (
    <AppLayout>
      <div className="flex h-full items-center justify-center bg-white dark:bg-[#1B1F23]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
          <DollarSign className="mx-auto h-12 w-12 text-gray-400 dark:text-[#6B7684] mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting to Budget...</p>
        </div>
      </div>
    </AppLayout>
  );
}
