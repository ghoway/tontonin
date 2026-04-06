import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/GenericWatchPage';
import { WatchClient } from '@/components/WatchClient';
import { getNetShortAllEpisode } from '@/lib/api';

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

function normalizeEpisodeStreams(raw: unknown): EpisodeStream[] {
  const root = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  const episodeList = Array.isArray(root?.shortPlayEpisodeInfos) ? root.shortPlayEpisodeInfos : null;
  if (episodeList) {
    const direct = episodeList
      .map((item: any) => {
        const episode = Number(item?.episodeNo || item?.playEpisodeNo || item?.episodeNumber || item?.episode);
        const voucher = item?.playVoucher;
        const streamUrl =
          (typeof voucher === 'string' && voucher) ||
          (typeof voucher?.playUrl === 'string' && voucher.playUrl) ||
          (typeof voucher?.url === 'string' && voucher.url) ||
          (typeof voucher?.hls === 'string' && voucher.hls) ||
          (typeof voucher?.m3u8 === 'string' && voucher.m3u8) ||
          (typeof item?.videoUrl === 'string' && item.videoUrl) ||
          (typeof item?.streamUrl === 'string' && item.streamUrl);

        if (!episode || !streamUrl) return null;

        const normalizedUrl = streamUrl.startsWith('//') ? `https:${streamUrl}` : streamUrl;
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) return null;

        return { episode, streamUrl: normalizedUrl } as EpisodeStream;
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
  const payload = await getNetShortAllEpisode(bookId);

  if (!payload) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const root = typeof payload === 'object' && payload !== null ? (payload as Record<string, any>) : {};
  const streams = normalizeEpisodeStreams(payload);
  const chapterCount = Number(root.totalEpisode || root.totalEpisodes || streams.length || 0);

  return (
    <WatchClient
      drama={{
        bookId: root.shortPlayId || bookId,
        bookName: root.shortPlayName || root.contentName || root.title || 'Unknown',
        coverWap: root.shortPlayCover || root.cover || root.poster || '',
        chapterCount,
        introduction: root.script || root.description || root.summary || root.synopsis || 'No synopsis available',
        tags: Array.isArray(root.shortPlayLabels) ? root.shortPlayLabels : [],
        playCount: String(root.heatScoreShow || root.playCount || ''),
      }}
      streams={streams}
      initialEpisode={episode || '1'}
      backHref={`/netshort/${bookId}`}
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
