'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectWikiPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/wiki?projectId=${params.id}`);
  }, [params.id, router]);

  return null;
}
