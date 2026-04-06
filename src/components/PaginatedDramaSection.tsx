'use client';

import { useCallback, useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';

type ProviderType = 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';

interface PaginatedDramaSectionProps {
  title: string;
  initialDramas: any[];
  type: ProviderType;
  initialVisible?: number;
  loadStep?: number;
  fetchEndpoint: string;
}

export function PaginatedDramaSection({
  title,
  initialDramas,
  type,
  initialVisible = 10,
  loadStep = 10,
  fetchEndpoint,
}: PaginatedDramaSectionProps) {
  const [allDramas, setAllDramas] = useState(initialDramas);
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const [currentPage, setCurrentPage] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReachedMax, setHasReachedMax] = useState(false);

  const visibleItems = useMemo(() => allDramas.slice(0, visibleCount), [allDramas, visibleCount]);
  const hasMore = visibleCount < allDramas.length || !hasReachedMax;

  const normalizeImage = (drama: any) => {
    const meloloThumb =
      type === 'melolo'
        ? drama.series_cover ||
          drama.book_pic ||
          drama.first_chapter_cover ||
          drama.coverWap ||
          drama.cover ||
          drama.poster ||
          drama.thumb_url ||
          ''
        : '';

    const raw =
      meloloThumb ||
      drama.coverWap ||
      drama.cover ||
      drama.book_pic ||
      drama.thumb_url ||
      drama.first_chapter_cover ||
      drama.poster ||
      drama.image ||
      drama.book_cover ||
      drama.cover_url ||
      drama.thumbnail ||
      drama.poster_url ||
      '';

    if (typeof raw !== 'string' || !raw.trim()) return '/placeholder.svg';
    const normalized = raw.startsWith('//') ? `https:${raw}` : raw;
    if (normalized.includes('x-signature=')) return normalized;
    return normalized.replace(/\.heic(\?.*)?$/i, '.jpg$1');
  };

  const getId = (drama: any, idx: number) => {
    if (type === 'melolo') {
      const id =
        drama.bookId ||
        drama.book_id ||
        drama.series_id_str ||
        drama.seriesId ||
        (typeof drama.series_id === 'string' ? drama.series_id : '');
      return typeof id === 'string' && id.trim() ? id : `melolo-${idx}`;
    }

    return drama.bookId || drama.book_id || drama.shortPlayId || drama.shortplayid || drama.id || String(idx);
  };

  const getTitle = (drama: any) => {
    if (type === 'melolo') {
      return (
        drama.bookName ||
        drama.book_name ||
        drama.series_title ||
        drama.title ||
        drama.name ||
        'Unknown'
      );
    }

    return (
      drama.bookName ||
      drama.book_name ||
      drama.book_title ||
      drama.shortPlayName ||
      drama.short_play_name ||
      drama.title ||
      drama.name ||
      'Unknown'
    );
  };

  const handleShowMore = useCallback(async () => {
    // First, if we have more items in current data, just show them
    if (visibleCount < allDramas.length) {
      setVisibleCount((prev) => Math.min(prev + loadStep, allDramas.length));
      return;
    }

    // Otherwise, load the next page
    setIsLoading(true);
    try {
      const response = await fetch(`${fetchEndpoint}?page=${currentPage}`);
      const newDramas = await response.json();
      
      if (!Array.isArray(newDramas) || newDramas.length === 0) {
        setHasReachedMax(true);
        setIsLoading(false);
        return;
      }

      // Deduplicate based on ID
      const existingIds = new Set(allDramas.map((d, idx) => getId(d, idx)));
      const deduplicated = newDramas.filter((drama: any, idx: number) => {
        const id = getId(drama, idx);
        if (existingIds.has(id)) return false;
        existingIds.add(id);
        return true;
      });

      setAllDramas((prev) => [...prev, ...deduplicated]);
      setCurrentPage((prev) => prev + 1);
      setVisibleCount((prev) => Math.min(prev + loadStep, allDramas.length + deduplicated.length));
    } catch (error) {
      console.error('Failed to load more dramas:', error);
      setHasReachedMax(true);
    } finally {
      setIsLoading(false);
    }
  }, [visibleCount, allDramas, currentPage, loadStep, fetchEndpoint]);

  return (
    <>
      <Section title={title}>
        {visibleItems.map((drama, idx) => (
          <DramaCard
            key={getId(drama, idx)}
            id={getId(drama, idx)}
            title={getTitle(drama)}
            image={normalizeImage(drama)}
            type={type}
          />
        ))}
      </Section>

      {hasMore && (
        <div className="flex justify-center mt-8 mb-8">
          <button
            onClick={handleShowMore}
            disabled={isLoading}
            className="px-6 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isLoading ? '⏳ Memuat...' : 'Tampilkan Lebih Banyak'}
          </button>
        </div>
      )}
    </>
  );
}
