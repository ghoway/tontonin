import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/GenericWatchPage';
import { WatchClient } from '@/components/WatchClient';
import { getShortMaxAllEpisode, getShortMaxDetail } from '@/lib/api';

export const revalidate = 300;

type EpisodeStream = {
  episode: number;
  streamUrl?: string;
};

function flattenObjects(input: unknown): any[] {
  if (Array.isArray(input)) return input.flatMap(flattenObjects);
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

function pickShortMaxDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.detail,
    input.data?.result,
    input.data,
    input.result,
    input.detail,
    input,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
  }

  return null;
}

function normalizeEpisodeStreams(raw: unknown): EpisodeStream[] {
  const root = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  const episodeList = Array.isArray(root?.episodes) ? root.episodes : null;
  if (episodeList) {
    const direct = episodeList
      .map((item: any) => {
        const episode = Number(item?.episodeNumber);
        const videoUrl = item?.videoUrl;
        const streamUrl =
          (typeof videoUrl?.video_720 === 'string' && videoUrl.video_720) ||
          (typeof videoUrl?.video_1080 === 'string' && videoUrl.video_1080) ||
          (typeof videoUrl?.video_480 === 'string' && videoUrl.video_480) ||
          (typeof item?.url === 'string' ? item.url : undefined) ||
          (typeof item?.streamUrl === 'string' ? item.streamUrl : undefined);

        if (!episode || !streamUrl) return null;
        return {
          episode,
          streamUrl: streamUrl.startsWith('//') ? `https:${streamUrl}` : streamUrl,
        } as EpisodeStream;
      })
      .filter((item): item is EpisodeStream => Boolean(item?.streamUrl))
      .sort((a, b) => a.episode - b.episode);

    if (direct.length > 0) return direct;
  }

  const objects = flattenObjects(raw);
  const map = new Map<number, EpisodeStream>();

  for (const item of objects) {
    const episode = pickFirstNumber(item, [
      'episode',
      'ep',
      'episodeNo',
      'episodeNumber',
      'number',
      'chapter',
      'chapterNo',
      'chapterNumber',
      'chapterIndex',
      'index',
      'seq',
      'no',
      'num',
    ]);
    const url = pickFirstString(item, [
      'url',
      'playUrl',
      'videoUrl',
      'streamUrl',
      'src',
      'link',
      'mediaUrl',
      'downloadUrl',
      'streamLink',
      'video',
      'stream',
      'streamingUrl',
      'watchUrl',
      'playStream',
      'source',
      'hls',
      'hlsUrl',
      'm3u8',
      'videoPath',
    ]);

    if (!episode || !url) continue;

    const normalizedUrl = url.startsWith('//') ? `https:${url}` : url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) continue;

    const existing = map.get(episode) || { episode };
    existing.streamUrl = existing.streamUrl || normalizedUrl;
    map.set(episode, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.episode - b.episode);
}

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const [detailData, allEpisodeData] = await Promise.all([
    getShortMaxDetail(bookId),
    getShortMaxAllEpisode(bookId),
  ]);

  const detail = pickShortMaxDetailObject(detailData);
  if (!detail) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const streams = normalizeEpisodeStreams(allEpisodeData);
  const chapterCount = Number(
    detail.totalEpisodes ||
      (allEpisodeData as any)?.totalEpisodes ||
      detail.chapterCount ||
      detail.episodeCount ||
      streams.length ||
      0
  );

  return (
    <WatchClient
      drama={{
        bookId: detail.shortPlayId || bookId,
        bookName: detail.shortPlayName || detail.name || detail.bookName || detail.title || 'Unknown',
        coverWap: detail.picUrl || detail.cover || detail.coverWap || detail.poster || '',
        chapterCount,
        introduction: detail.summary || detail.introduction || detail.description || detail.synopsis || 'No synopsis available',
        tags: Array.isArray(detail.tags) ? detail.tags : [],
        playCount: String(detail.playNum || detail.playCount || ''),
      }}
      streams={streams}
      initialEpisode={episode || '1'}
      backHref={`/shortmax/${bookId}`}
    />
  );
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
    <Suspense fallback={<LoadingSkeleton />}>
      <WatchContent bookId={bookId} episode={ep} />
    </Suspense>
  );
}
