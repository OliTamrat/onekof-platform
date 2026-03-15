'use client';

import {
  FileText
} from 'lucide-react';
import { useParams } from 'next/navigation';

export default function DocPageDetailPage() {
  const params = useParams();
  const pageId = params.id;

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Document Page</h1>
        <p className="mt-2 text-muted-foreground">
          Page ID: {pageId}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Document page viewer coming soon
        </p>
      </div>
    </div>
  );
}
