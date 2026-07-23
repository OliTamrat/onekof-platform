'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectAutomationPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/automations?projectId=${params.id}`);
  }, [params.id, router]);

  return null;
}
