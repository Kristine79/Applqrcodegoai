'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
  );
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white p-3 md:p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="w-20 h-8 rounded-full" />
        </div>

        {/* Main card skeleton */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-64 h-4" />
          </div>

          {/* Section skeletons */}
          <Skeleton className="w-full h-10 rounded-xl" />
          
          {/* Form field skeletons */}
          <div className="space-y-3">
            <Skeleton className="w-full h-10 rounded-xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="w-24 h-3" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-full h-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-16 h-3" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="w-28 h-3" />
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
          </div>

          {/* Button skeleton */}
          <Skeleton className="w-full h-14 rounded-xl" />
        </div>

        {/* Footer skeleton */}
        <div className="flex flex-col items-center gap-3 mt-8">
          <Skeleton className="w-64 h-6 rounded-full" />
          <Skeleton className="w-40 h-3" />
        </div>
      </div>
    </div>
  );
}
