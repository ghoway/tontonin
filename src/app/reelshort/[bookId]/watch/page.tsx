import { Suspense } from 'react';
import { GenericWatchContent, LoadingSkeleton, normalizeEpisodeStreamsGeneric } from '@/components/GenericWatchPage';
import { getReelShortDetail, getReelShortAllEpisode } from '@/lib/api';

export const revalidate = 300;

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const [detailData, allEpisodeData] = await Promise.all([
    getReelShortDetail(bookId),
    getReelShortAllEpisode(bookId),
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

  // ReelShort uses: episode, url, playUrl, streamUrl
  const streams = normalizeEpisodeStreamsGeneric(
    allEpisodeData,
    ['episode', 'ep', 'episodeNo', 'episodeNumber', 'number', 'index'],
    ['url', 'playUrl', 'videoUrl', 'streamUrl', 'src', 'link', 'mediaUrl']
  );

  return (
    <GenericWatchContent
      drama={drama}
      streams={streams}
      backHref={`/reelshort/${bookId}`}
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
