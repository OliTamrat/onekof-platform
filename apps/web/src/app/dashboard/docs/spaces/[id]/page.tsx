'use client';

import { FolderOpen } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function DocSpaceDetailPage() {
  const params = useParams();
  const spaceId = params.id;

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FolderOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Document Space</h1>
        <p className="mt-2 text-muted-foreground">
          Space ID: {spaceId}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Document space viewer coming soon
        </p>
      </div>
    </div>
  );
}
