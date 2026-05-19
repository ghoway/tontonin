"use client";

import { useMemo } from "react";
import { useReelShortHomepage } from "@/hooks/useReelShort";
import { ReelShortCard } from "./ReelShortCard";
import { BannerCarousel } from "./BannerCarousel";
import { DramaCardSkeleton } from "./DramaCardSkeleton";
import type { ReelShortBook, ReelShortBanner } from "@/types/reelshort";

export function ReelShortHome() {
  const { data, isLoading, error } = useReelShortHomepage();

  // Get content for POPULER tab only (tab_id usually 1 or first tab)
  const { banners, books } = useMemo(() => {
    if (!data?.data?.lists) {
      return { banners: [], books: [] };
    }

    // Get the first/popular tab
    const tabs = data.data.tab_list || [];
    const popularTab = tabs.find((t) => t.tab_name === "POPULER") || tabs[0];
    const popularTabId = popularTab?.tab_id;

    if (!popularTabId) {
      return { banners: [], books: [] };
    }

    const tabLists = data.data.lists.filter((list) => list.tab_id === popularTabId);
    
    let allBanners: ReelShortBanner[] = [];
    let allBooks: ReelShortBook[] = [];

    tabLists.forEach((list) => {
      if (list.banners) {
        allBanners = [...allBanners, ...list.banners];
      }
      if (list.books) {
        allBooks = [...allBooks, ...list.books];
      }
    });

    return { banners: allBanners, books: allBooks };
  }, [data]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Gagal memuat data ReelShort. Silakan coba lagi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Carousel */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <DramaCardSkeleton key={i} index={i} />
            ))
          : books
              .filter((book) => book.book_id)
              .map((book, index) => (
                <ReelShortCard key={book.book_id} book={book} index={index} />
              ))}
      </div>

      {!isLoading && books.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Tidak ada drama ditemukan</p>
        </div>
      )}
    </div>
  );
}
