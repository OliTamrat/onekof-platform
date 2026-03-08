'use client';

import { Activity } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Activity className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and allocate resources across projects
        </p>
      </div>
    </div>
  );
}
