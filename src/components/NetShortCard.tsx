"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import type { NetShortDrama } from "@/hooks/useNetShort";

interface NetShortCardProps {
  drama: NetShortDrama;
  index?: number;
}

export function NetShortCard({ drama, index = 0 }: NetShortCardProps) {
  return (
    <UnifiedMediaCard 
      index={index}
      title={drama.title}
      cover={drama.cover}
      link={`/detail/netshort/${drama.shortPlayId}`}
      episodes={drama.totalEpisodes || 0}
      topLeftBadge={drama.scriptName ? {
        text: drama.scriptName,
        color: "#E52E2E"
      } : null}
      topRightBadge={drama.heatScore ? {
        text: drama.heatScore,
        isTransparent: true
      } : null}
    />
  );
}
