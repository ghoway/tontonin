interface UnifiedMediaCardSkeletonProps {
  index?: number;
}

export function UnifiedMediaCardSkeleton({ index = 0 }: UnifiedMediaCardSkeletonProps) {
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
      <div className="pt-3 pb-1 space-y-2">
        {/* Title line 1 */}
        <div className="h-3 bg-muted/50 rounded-lg w-full" />
        {/* Title line 2 (shorter) */}
        <div className="h-3 bg-muted/50 rounded-lg w-2/3" />
      </div>
    </div>
  );
}
