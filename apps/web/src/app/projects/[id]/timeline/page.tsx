'use client';

import { useParams } from 'next/navigation';
import { Calendar } from 'lucide-react';

export default function ProjectTimelinePage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-[#1B1F23] p-6">
      <Calendar className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Timeline View</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        Timeline view for project milestones and deadlines. This feature is coming soon.
      </p>
    </div>
  );
}
