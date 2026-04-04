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
    // Try multiple episode number keys
    const episode = pickFirstNumber(item, [
      'episode', 'ep', 'episodeNo', 'episodeNumber', 'number',
      'chapter', 'chapterNo', 'chapterNumber', 'index',
      'seq', 'index', 'no', 'num', 'e', 'c'
    ]);
    
    // Try multiple URL keys
    const url = pickFirstString(item, [
      'url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link',
      'mediaUrl', 'downloadUrl', 'streamLink', 'video', 'stream',
      'streamingUrl', 'watchUrl', 'playStream', 'source', 'm3u8'
    ]);
    
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

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  try {
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

    // Debug: Log the allepisode response structure
    console.log('[WatchPage] allEpisodeData structure:', allEpisodeData);

    const streams = normalizeEpisodeStreams(allEpisodeData);

    // If no streams found, try alternate parsing
    let finalStreams = streams;
    if (finalStreams.length === 0 && allEpisodeData) {
      // Fallback: If allEpisodeData has a data/result/episodes property
      const dataArray = allEpisodeData?.data || allEpisodeData?.result || allEpisodeData?.episodes || allEpisodeData?.list || [];
      if (Array.isArray(dataArray)) {
        finalStreams = normalizeEpisodeStreams(dataArray);
      }
    }

    return <WatchClient drama={drama} streams={finalStreams} initialEpisode={episode || '1'} />;
  } catch (error) {
    console.error('[WatchPage] Error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Terjadi kesalahan saat memuat drama</p>
      </div>
    );
  }
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
