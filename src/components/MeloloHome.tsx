
"use client";

import { useMeloloLatest, useMeloloTrending } from "@/hooks/useMelolo";
import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import { InfiniteMeloloSection } from "./InfiniteMeloloSection";

function MeloloSectionSkeleton() {
  return (
    <section className="space-y-4">
      <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
             <div className="aspect-[3/4] rounded-xl bg-muted/30 animate-pulse mb-2" />
             <div className="h-4 w-3/4 bg-muted/30 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function MeloloHome() {
  const { 
    data: latestData, 
    isLoading: loadingLatest, 
    error: errorLatest 
  } = useMeloloLatest();

  const { 
    data: trendingData, 
    isLoading: loadingTrending, 
    error: errorTrending 
  } = useMeloloTrending();

  if (errorLatest || errorTrending) {
    return (
      <UnifiedErrorDisplay 
        onRetry={() => window.location.reload()} 
      />
    );
  }

  if (loadingLatest || loadingTrending) {
    return (
      <div className="space-y-8 animate-fade-in">
        <MeloloSectionSkeleton />
        <MeloloSectionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Trending Section */}
      {trendingData?.books && trendingData.books.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
             <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
               Sedang Hangat
             </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {trendingData.books.map((book, index) => (
              <UnifiedMediaCard
                key={book.book_id}
                title={book.book_name}
                cover={book.thumb_url}
                link={`/detail/melolo/${book.book_id}`}
                episodes={book.serial_count || 0} 
                topLeftBadge={null}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Section */}
      {latestData?.books && latestData.books.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
             <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
               Rilis Baru
             </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {latestData.books.map((book, index) => (
              <UnifiedMediaCard
                key={book.book_id}
                title={book.book_name}
                cover={book.thumb_url}
                link={`/detail/melolo/${book.book_id}`}
                episodes={book.serial_count || 0}
                topLeftBadge={null}
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* Infinite Scroll Section */}
      <InfiniteMeloloSection title="Lainnya" />

      {!loadingLatest && !loadingTrending && !latestData?.books?.length && !trendingData?.books?.length && (
         <div className="text-center py-20 text-muted-foreground">
           Tidak ada konten tersedia saat ini.
         </div>
      )}
    </div>
  );
}
