"use client";

import { useShortMaxRekomendasi } from "@/hooks/useShortMax";
import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import { InfiniteShortMaxSection } from "./InfiniteShortMaxSection";

export function ShortMaxHome() {
  const {
    data: rekomendasiData,
    isLoading: loadingRekomendasi,
    error: errorRekomendasi,
    refetch: refetchRekomendasi,
  } = useShortMaxRekomendasi();

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Rekomendasi Section */}
      <section>
        {errorRekomendasi || (!loadingRekomendasi && (!rekomendasiData?.data || rekomendasiData.data.length === 0)) ? (
          <>
            <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
              Rekomendasi
            </h2>
            <UnifiedErrorDisplay
              title="Gagal Memuat Rekomendasi"
              message="Tidak dapat mengambil data drama."
              onRetry={() => refetchRekomendasi()}
            />
          </>
        ) : loadingRekomendasi ? (
          <>
            {/* Title Skeleton */}
            <div className="h-7 md:h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-4" />
            {/* Card Grid Skeleton */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <UnifiedMediaCardSkeleton key={i} index={i} />
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display font-bold text-xl md:text-2xl text-foreground mb-4">
              Rekomendasi
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {rekomendasiData!.data.map((drama, index) => (
                <UnifiedMediaCard
                  key={`rekomendasi-${drama.shortPlayId}-${index}`}
                  index={index}
                  title={drama.title}
                  cover={drama.cover}
                  link={`/detail/shortmax/${drama.shortPlayId}`}
                  episodes={drama.totalEpisodes}
                  topLeftBadge={drama.label ? {
                    text: drama.label,
                    color: drama.label === "Hot" ? "#E52E2E" : "#6366f1"
                  } : null}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Infinite Scroll Section */}
      <InfiniteShortMaxSection title="Lainnya" />
    </div>
  );
}
