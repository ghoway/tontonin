interface DramaCardSkeletonProps {
  index?: number;
}

export function DramaCardSkeleton({ index = 0 }: DramaCardSkeletonProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-up w-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Cover Skeleton */}
      <div className="aspect-[2/3] bg-muted/50 relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }} />
      </div>

      {/* Content Skeleton */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="h-3 sm:h-4 bg-muted/50 rounded-lg w-full" />
        <div className="h-3 sm:h-4 bg-muted/50 rounded-lg w-2/3" />
        <div className="flex gap-1.5 sm:gap-2">
          <div className="h-5 sm:h-6 bg-muted/50 rounded-full w-12 sm:w-16" />
          <div className="h-5 sm:h-6 bg-muted/50 rounded-full w-10 sm:w-14" />
        </div>
      </div>
    </div>
  );
}
