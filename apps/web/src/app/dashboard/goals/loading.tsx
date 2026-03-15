import { Skeleton, SkeletonStats, SkeletonCard } from '@/components/ui/skeleton';

export default function GoalsLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <SkeletonStats count={3} />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#22272B]"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
