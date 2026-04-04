import { Suspense } from 'react';
import { GenericWatchContent, LoadingSkeleton, normalizeEpisodeStreamsGeneric } from '@/components/GenericWatchPage';
import { getMeloloDetail, getMeloloStream } from '@/lib/api';

export const revalidate = 300;

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const detailData = await getMeloloDetail(bookId);

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

  // Melolo has a different structure - need to fetch stream for each episode
  // For now, try to get stream data from detail if available
  let streams: any[] = [];

  // Try to get all episodes/videos from detail
  if (drama.data && Array.isArray(drama.data)) {
    streams = normalizeEpisodeStreamsGeneric(
      drama.data,
      ['episode', 'ep', 'episodeNo', 'index', 'number'],
      ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link']
    );
  }

  // If no streams found, try another endpoint structure
  if (streams.length === 0) {
    const streamData = await getMeloloStream(bookId);
    streams = normalizeEpisodeStreamsGeneric(
      streamData,
      ['episode', 'ep', 'episodeNo', 'index', 'number'],
      ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link']
    );
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
