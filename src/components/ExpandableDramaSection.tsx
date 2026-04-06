'use client';

import { useMemo } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';

type ProviderType = 'dramabox' | 'reelshort' | 'shortmax' | 'netshort' | 'melolo' | 'freereels' | 'dramanova';

interface ExpandableDramaSectionProps {
  title: string;
  dramas: any[];
  type: ProviderType;
  initialVisible?: number;
}

export function ExpandableDramaSection({
  title,
  dramas,
  type,
  initialVisible = 12,
}: ExpandableDramaSectionProps) {
  const visibleItems = useMemo(() => dramas.slice(0, initialVisible), [dramas, initialVisible]);

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

  return (
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
  );
}
