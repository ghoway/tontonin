"use client";

import { UnifiedMediaCard } from "./UnifiedMediaCard";
import type { ReelShortBook } from "@/types/reelshort";

interface ReelShortCardProps {
  book: ReelShortBook;
  index?: number;
}

export function ReelShortCard({ book, index = 0 }: ReelShortCardProps) {
  return (
    <UnifiedMediaCard 
      index={index}
      title={book.book_title}
      cover={book.book_pic}
      link={`/detail/reelshort/${book.book_id}`}
      episodes={book.chapter_count}
      topLeftBadge={book.book_mark?.text ? {
        text: book.book_mark.text,
        color: book.book_mark.color || "#E52E2E",
        textColor: book.book_mark.text_color
      } : null}
      topRightBadge={book.rank_level ? {
        text: book.rank_level,
        isTransparent: true
      } : null}
    />
  );
}
