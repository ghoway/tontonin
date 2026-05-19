"use client";

import { useNetShortTheaters, useNetShortForYou } from "@/hooks/useNetShort";
import { UnifiedMediaCard } from "./UnifiedMediaCard";
import { UnifiedErrorDisplay } from "./UnifiedErrorDisplay";
import { UnifiedMediaCardSkeleton } from "./UnifiedMediaCardSkeleton";
import { InfiniteNetShortSection } from "./InfiniteNetShortSection";

// ... existing emoji stripper ...
function stripEmoji(text: string): string {
  // Comprehensive emoji removal including clock symbols, misc symbols, etc.
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F550}-\u{1F567}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]|[\u{FE0F}]/gu, '').trim();
}

// Section names to exclude (causes 404)
const EXCLUDED_SECTIONS = ['segera tayang', 'coming soon', 'upcoming'];

export function NetShortHome() {
  const { data: theatersData, isLoading: loadingTheaters, error: errorTheaters, refetch: refetchTheaters } = useNetShortTheaters();
  const { data: forYouData, isLoading: loadingForYou, error: errorForYou, refetch: refetchForYou } = useNetShortForYou();

  const isLoading = loadingTheaters || loadingForYou;

  if (isLoading) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Title Skeleton */}
            <div className="h-7 w-48 bg-muted/50 rounded animate-pulse mb-4" />
            
            {/* Card Grid Skeleton */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, cardIndex) => (
                <UnifiedMediaCardSkeleton key={cardIndex} index={cardIndex} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (errorTheaters || errorForYou) {
    return (
      <UnifiedErrorDisplay 
        title="Gagal Memuat NetShort"
        message="Tidak dapat terhubung ke layanan NetShort."
        onRetry={() => {
            refetchTheaters();
            refetchForYou();
        }}
      />
    );
  }

  // Filter out excluded sections
  const filteredGroups = (theatersData?.data || []).filter((group) => {
    const sectionName = stripEmoji(group.groupName).toLowerCase();
    return !EXCLUDED_SECTIONS.some((excluded) => sectionName.includes(excluded));
  });

  return (
    <div className="space-y-10">
      {/* For You Section */}
      {forYouData?.data && forYouData.data.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">
              Rekomendasi Untukmu
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {forYouData.data.map((drama, index) => (
              <UnifiedMediaCard 
                key={drama.shortPlayId} 
                index={index}
                title={drama.title}
                cover={drama.cover}
                link={`/detail/netshort/${drama.shortPlayId}`}
                episodes={drama.totalEpisodes}
                topLeftBadge={drama.scriptName ? {
                  text: drama.scriptName,
                  color: "#E52E2E"
                } : null}
                topRightBadge={drama.heatScore ? {
                  text: drama.heatScore,
                  isTransparent: true
                } : null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Theaters Sections */}
      {filteredGroups.map((group) => (
        <section key={group.groupId}>
          {/* Section Header - removed "Lihat Semua" link */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-display text-foreground">
              {stripEmoji(group.groupName)}
            </h2>
          </div>

          {/* Drama Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {group.dramas.slice(0, 12).map((drama, index) => (
              <UnifiedMediaCard 
                key={drama.shortPlayId} 
                index={index}
                title={drama.title}
                cover={drama.cover}
                link={`/detail/netshort/${drama.shortPlayId}`}
                episodes={drama.totalEpisodes}
                topLeftBadge={drama.scriptName ? {
                  text: drama.scriptName,
                  color: "#E52E2E"
                } : null}
                topRightBadge={drama.heatScore ? {
                  text: drama.heatScore,
                  isTransparent: true
                } : null}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Infinite Scroll Section */}
      <InfiniteNetShortSection title="Lainnya" />
    </div>
  );
}
