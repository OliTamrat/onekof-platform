'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectCalendarPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/calendar?projectId=${params.id}`);
  }, [params.id, router]);

  return null;
}
