'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectTimelinePage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/timeline?projectId=${params.id}`);
  }, [params.id, router]);

  return null;
}
