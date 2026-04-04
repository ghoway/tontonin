import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { WatchClient } from '@/components/WatchClient';
import { getDramaBoxAllEpisode, getDramaBoxDetail } from '@/lib/api';

export const revalidate = 300;

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

function normalizeEpisodeStreams(raw: unknown): EpisodeStream[] {
  const objects = flattenObjects(raw);
  const map = new Map<number, EpisodeStream>();

  for (const item of objects) {
    const episode = pickFirstNumber(item, ['episode', 'ep', 'episodeNo', 'chapter', 'chapterNo', 'index']);
    const url = pickFirstString(item, ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link']);
    if (!episode || !url) continue;

    const existing = map.get(episode) || { episode };
    if (url.includes('.encrypt.')) {
      existing.encryptedUrl = existing.encryptedUrl || url;
    } else {
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

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const [detailData, allEpisodeData] = await Promise.all([
    getDramaBoxDetail(bookId),
    getDramaBoxAllEpisode(bookId),
  ]);

  if (!detailData) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const drama = Array.isArray(detailData) ? detailData[0] : detailData;

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const streams = normalizeEpisodeStreams(allEpisodeData);

  return <WatchClient drama={drama} streams={streams} initialEpisode={episode || '1'} />;
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { bookId } = await params;
  const { ep } = await searchParams;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <WatchContent bookId={bookId} episode={ep} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
