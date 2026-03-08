'use client';

import { Wrench } from 'lucide-react';

export default function EquipmentPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Wrench className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Equipment</h1>
        <p className="mt-2 text-muted-foreground">
          Equipment management features coming soon
        </p>
      </div>
    </div>
  );
}
