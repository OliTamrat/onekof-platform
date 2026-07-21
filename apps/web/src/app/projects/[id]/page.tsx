'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';

export default function ProjectDefaultPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { t } = useLanguage();

  useEffect(() => {
    // Redirect to the board (Overview) page as the default view
    router.replace(`/projects/${projectId}/board`);
  }, [projectId, router]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50 dark:bg-[#1B1F23]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1C8C7D] border-t-transparent"></div>
    </div>
  );
}
