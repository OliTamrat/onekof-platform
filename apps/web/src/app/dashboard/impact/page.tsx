'use client';

import { TrendingUp } from 'lucide-react';

export default function ImpactPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Impact Measurement</h1>
        <p className="mt-2 text-muted-foreground">
          Track and measure the impact of your projects and initiatives
        </p>
      </div>
    </div>
  );
}
