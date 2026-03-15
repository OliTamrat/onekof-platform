'use client';

import { useParams } from 'next/navigation';
import { Target } from 'lucide-react';

export default function ProjectGoalsPage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-[#1B1F23] p-6">
      <Target className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project Goals</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        Set and track project goals and objectives. This feature is coming soon.
      </p>
    </div>
  );
}
