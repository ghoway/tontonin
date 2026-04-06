import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/GenericWatchPage';
import { WatchClient } from '@/components/WatchClient';
import { getFreeReelsDetailAndAllEpisode } from '@/lib/api';

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

function pickFreeReelsDetailObject(input: any, key: string): any | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return input.find((item) => item?.key === key) || input[0] || null;
  }
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.info,
    input.data?.detail,
    input.data?.item,
    input.data?.info,
    input.data,
    input.result,
    input.detail,
    input,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const matched = candidate.find((item) => item?.key === key);
      if (matched) return matched;
      if (candidate[0] && typeof candidate[0] === 'object') return candidate[0];
    }
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
  }

  return null;
}

function normalizeEpisodeStreams(raw: unknown): EpisodeStream[] {
  const root = raw && typeof raw === 'object' ? (raw as Record<string, any>) : null;
  const episodeList = Array.isArray(root?.data?.info?.episode_list) ? root.data.info.episode_list : null;
  if (episodeList) {
    const direct = episodeList
      .map((item: any) => {
        const episode = Number(item?.index || item?.episodeNumber || item?.episode || item?.pay_index);
        const streamUrl =
          (typeof item?.external_audio_h264_m3u8 === 'string' && item.external_audio_h264_m3u8) ||
          (typeof item?.external_audio_h265_m3u8 === 'string' && item.external_audio_h265_m3u8) ||
          (typeof item?.m3u8_url === 'string' && item.m3u8_url) ||
          (typeof item?.video_url === 'string' && item.video_url) ||
          (typeof item?.url === 'string' && item.url);

        if (!episode || !streamUrl) return null;

        const normalizedUrl = streamUrl.startsWith('//') ? `https:${streamUrl}` : streamUrl;
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) return null;

        return { episode, streamUrl: normalizedUrl } as EpisodeStream;
      })
      .filter((item: EpisodeStream | null): item is EpisodeStream => Boolean(item?.streamUrl))
      .sort((a: EpisodeStream, b: EpisodeStream) => a.episode - b.episode);

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
      'pay_index',
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
  const payload = await getFreeReelsDetailAndAllEpisode(bookId);

  if (!payload) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const detail = pickFreeReelsDetailObject(payload, bookId);
  if (!detail) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const streams = normalizeEpisodeStreams(payload);
  const chapterCount = Number(
    detail.episode_count || detail.chapterCount || detail.episodeCount || detail.episode || detail.pay_index || streams.length || 0
  );

  return (
    <WatchClient
      drama={{
        bookId: detail.key || bookId,
        bookName: detail.title || detail.bookName || 'Unknown',
        coverWap: detail.cover || detail.coverWap || detail.poster || '',
        chapterCount,
        introduction: detail.desc || detail.introduction || detail.description || detail.synopsis || 'No synopsis available',
        tags: Array.isArray(detail.content_tags)
          ? detail.content_tags
          : Array.isArray(detail.content_detail_tags)
            ? detail.content_detail_tags
            : [],
        playCount: String(detail.view_count || detail.playCount || ''),
      }}
      streams={streams}
      initialEpisode={episode || '1'}
      backHref={`/freereels/${bookId}`}
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
