'use client';

import { Heart } from 'lucide-react';

export default function PatientsPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Patients</h1>
        <p className="mt-2 text-muted-foreground">
          Patient management features coming soon
        </p>
      </div>
    </div>
  );
}
