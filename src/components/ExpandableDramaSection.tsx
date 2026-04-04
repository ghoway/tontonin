'use client';

import { useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';

type ProviderType = 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';

interface ExpandableDramaSectionProps {
  title: string;
  dramas: any[];
  type: ProviderType;
  initialVisible?: number;
  loadStep?: number;
}

export function ExpandableDramaSection({
  title,
  dramas,
  type,
  initialVisible = 12,
  loadStep = 6,
}: ExpandableDramaSectionProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const visibleItems = useMemo(() => dramas.slice(0, visibleCount), [dramas, visibleCount]);
  const hasMore = visibleCount < dramas.length;

  const normalizeImage = (drama: any) => {
    const meloloThumb =
      type === 'melolo'
        ? drama.thumb_url || drama.series_cover || drama.book_pic || drama.coverWap || drama.cover || ''
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

  return (
    <>
      <Section title={title}>
        {visibleItems.map((drama: any, idx: number) => (
          <DramaCard
            key={getId(drama, idx)}
            id={getId(drama, idx)}
            title={getTitle(drama)}
            image={normalizeImage(drama)}
            episodes={
              drama.chapterCount ||
              drama.episodeCount ||
              drama.chapter_count ||
              drama.episode_count ||
              drama.episodes
            }
            views={drama.playCount || drama.play_count || drama.views}
            type={type}
          />
        ))}
      </Section>

      {hasMore && (
        <div className="flex justify-center -mt-4 mb-8">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + loadStep, dramas.length))}
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Show More
          </button>
        </div>
      )}
    </>
  );
}
