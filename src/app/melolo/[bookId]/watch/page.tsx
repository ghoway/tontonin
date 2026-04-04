import { Suspense } from 'react';
import { GenericWatchContent, LoadingSkeleton, normalizeEpisodeStreamsGeneric } from '@/components/GenericWatchPage';
import { getMeloloDetail, getMeloloStream } from '@/lib/api';

export const revalidate = 300;

function pickMeloloDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.book,
    input.data?.detail,
    input.data,
    input.result,
    input.book,
    input.detail,
    input,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c;
  }

  return null;
}

function normalizeMeloloDrama(drama: any) {
  return {
    ...drama,
    bookId: drama.bookId || drama.book_id || drama.id || '',
    bookName: drama.bookName || drama.book_name || drama.book_title || drama.title || drama.name || 'Unknown',
    coverWap:
      drama.coverWap || drama.cover || drama.book_pic || drama.poster || drama.image || drama.book_cover || drama.cover_url || '',
    chapterCount: drama.chapterCount || drama.episodeCount || drama.chapter_count || drama.episode_count || 0,
    introduction: drama.introduction || drama.description || drama.abstract || drama.summary || drama.synopsis || 'No synopsis available',
    tags: drama.tags || drama.genres || drama.tag_list || [],
  };
}

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const detailData = await getMeloloDetail(bookId);

  if (!detailData) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const dramaRaw = pickMeloloDetailObject(detailData);
  const drama = dramaRaw ? normalizeMeloloDrama(dramaRaw) : null;

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  let streams: any[] = [];

  // Try to get all episodes/videos from detail
  if (dramaRaw?.data && Array.isArray(dramaRaw.data)) {
    streams = normalizeEpisodeStreamsGeneric(
      dramaRaw.data,
      ['episode', 'ep', 'episodeNo', 'index', 'number', 'chapter', 'chapterIndex'],
      ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link', 'videoPath', 'play_url']
    );
  }

  // If no streams found, fetch by videoId (`vid`) from detail
  if (streams.length === 0) {
    const videoId = dramaRaw?.vid || dramaRaw?.videoId || dramaRaw?.video_id;
    if (videoId) {
      const streamData = await getMeloloStream(String(videoId));
      streams = normalizeEpisodeStreamsGeneric(
        streamData,
        ['episode', 'ep', 'episodeNo', 'index', 'number', 'chapter', 'chapterIndex'],
        ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link', 'videoPath', 'play_url']
      );
    }
  }

  return (
    <GenericWatchContent
      drama={drama}
      streams={streams}
      backHref={`/melolo/${bookId}`}
      episode={episode || '1'}
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
