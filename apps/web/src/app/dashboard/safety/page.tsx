'use client';

import { Shield } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Safety Management</h1>
        <p className="mt-2 text-muted-foreground">
          Manage safety protocols, incidents, and compliance
        </p>
      </div>
    </div>
  );
}
