'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TimelinePage() {
  const router = useRouter();

  useEffect(() => {
    const projectId = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('projectId')
      : null;
    const url = projectId
      ? `/dashboard/issues/timeline?projectId=${projectId}`
      : '/dashboard/issues/timeline';
    router.replace(url);
  }, [router]);

  return null;
}
