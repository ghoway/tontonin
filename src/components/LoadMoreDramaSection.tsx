'use client';

import { useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';

type ProviderType = 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';

interface LoadMoreDramaSectionProps {
  title: string;
  dramas: any[];
  type: ProviderType;
  initialVisible?: number;
  loadStep?: number;
}

export function LoadMoreDramaSection({
  title,
  dramas,
  type,
  initialVisible = 12,
  loadStep = 6,
}: LoadMoreDramaSectionProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);
  const visibleItems = useMemo(() => dramas.slice(0, visibleCount), [dramas, visibleCount]);
  const hasMore = visibleCount < dramas.length;

  const normalizeImage = (drama: any) => {
    const raw =
      drama.shortPlayCover ||
      drama.groupShortPlayCover ||
      drama.posterImgUrl ||
      drama.posterImg ||
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

    return drama.key || drama.bookId || drama.book_id || drama.shortPlayId || drama.shortplayid || drama.id || String(idx);
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
      drama.shortPlayName ||
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

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + loadStep, dramas.length));
  };

  return (
    <>
      <Section title={title}>
        {visibleItems.map((drama, idx) => (
          <DramaCard
            key={`${getId(drama, idx)}-${idx}`}
            id={getId(drama, idx)}
            title={getTitle(drama)}
            image={normalizeImage(drama)}
            episodes={
              drama.totalEpisodes ||
              drama.chapterCount ||
              drama.episodeCount ||
              drama.chapter_count ||
              drama.episode_count ||
              drama.episodes
            }
            views={
              drama.heatScoreShow ||
              drama.view_count ||
              drama.playNum ||
              drama.playCount ||
              drama.play_count ||
              drama.views
            }
            type={type}
          />
        ))}
      </Section>

      {hasMore && visibleItems.length > 0 && (
        <div className="flex justify-center py-8">
          <button
            onClick={showMore}
            className="px-6 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Tampilkan Lebih Banyak
          </button>
        </div>
      )}
    </>
  );
}
