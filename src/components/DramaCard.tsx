import { UnifiedMediaCard } from "./UnifiedMediaCard";
import type { Drama } from "@/types/drama";

interface DramaCardProps {
  drama: Drama;
  index?: number;
}

export function DramaCard({ drama, index = 0 }: DramaCardProps) {
  return (
    <UnifiedMediaCard 
      index={index}
      title={drama.bookName}
      cover={drama.coverWap || drama.cover || ""}
      link={`/detail/dramabox/${drama.bookId}`}
      episodes={drama.chapterCount}
      topLeftBadge={drama.corner ? {
        text: drama.corner.name,
        color: drama.corner.color || "#e5a00d"
      } : null}
      topRightBadge={drama.rankVo ? {
        text: drama.rankVo.hotCode,
        isTransparent: true
      } : null}
    />
  );
}
