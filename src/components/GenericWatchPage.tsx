import { ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { WatchClient } from '@/components/WatchClient';

type EpisodeStream = {
  episode: number;
  encryptedUrl?: string;
  streamUrl?: string;
};

function flattenObjects(input: unknown): any[] {
  if (Array.isArray(input)) {
    return input.flatMap(flattenObjects);
  }
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    return [obj, ...Object.values(obj).flatMap(flattenObjects)];
  }
  return [];
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function pickFirstNumber(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

export function normalizeEpisodeStreamsGeneric(
  raw: unknown,
  episodeKeys: string[],
  urlKeys: string[]
): EpisodeStream[] {
  const objects = flattenObjects(raw);
  const map = new Map<number, EpisodeStream>();

  for (const item of objects) {
    const episode = pickFirstNumber(item, episodeKeys);
    const url = pickFirstString(item, urlKeys);
    
    if (!episode || !url || !Number.isFinite(episode)) continue;

    const existing = map.get(episode) || { episode };
    if (url.includes('.encrypt.')) {
      existing.encryptedUrl = existing.encryptedUrl || url;
    } else if (url.startsWith('http')) {
      existing.streamUrl = existing.streamUrl || url;
    }
    map.set(episode, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.episode - b.episode);
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-96 bg-zinc-800 rounded-lg animate-pulse" />
      <div className="h-12 bg-zinc-800 rounded animate-pulse w-1/3" />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export interface GenericDrama {
  id?: string;
  bookId?: string;
  bookName: string;
  title?: string;
  coverWap?: string;
  poster?: string;
  cover?: string;
  chapterCount?: number;
  episodeCount?: number;
  introduction?: string;
  description?: string;
  synopsis?: string;
  tags?: string[];
  genres?: string[];
  playCount?: string;
  views?: string;
}

interface GenericWatchContentProps {
  drama: GenericDrama;
  streams: EpisodeStream[];
  backHref: string;
  episode?: string;
}

export function GenericWatchContent({
  drama,
  streams,
  backHref,
  episode,
}: GenericWatchContentProps) {
  // Normalize drama object
  const normalizedDrama = {
    bookId: drama.id || drama.bookId || '',
    bookName: drama.bookName || drama.title || 'Unknown',
    coverWap: drama.coverWap || drama.poster || drama.cover || '',
    chapterCount: drama.chapterCount || drama.episodeCount || 0,
    introduction: drama.introduction || drama.description || drama.synopsis || 'No synopsis available',
    tags: drama.tags || drama.genres || [],
    playCount: drama.playCount || drama.views || '',
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-8">
          <WatchClient
            drama={normalizedDrama}
            streams={streams}
            initialEpisode={episode || '1'}
            backHref={backHref}
          />
        </div>
      </div>
    </div>
  );
}

export { LoadingSkeleton };
