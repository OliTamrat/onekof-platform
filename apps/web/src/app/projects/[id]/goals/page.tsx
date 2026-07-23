'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectGoalsPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/goals?projectId=${params.id}`);
  }, [params.id, router]);

  return null;
}
