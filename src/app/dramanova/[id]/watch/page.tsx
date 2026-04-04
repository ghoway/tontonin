'use client';

import { Suspense } from 'react';
import { GenericWatchContent, LoadingSkeleton, normalizeEpisodeStreamsGeneric } from '@/components/GenericWatchPage';
import { getDramaNovaDetail } from '@/lib/api';

export const revalidate = 300;

async function WatchContent({ id, episode }: { id: string; episode?: string }) {
  const detailData = await getDramaNovaDetail(id);

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

  // DramaNova returns subtitle list and file IDs
  // We need to map subtitle list to episode numbers
  let streams: any[] = [];

  if (drama.subtitle && Array.isArray(drama.subtitle)) {
    // Map subtitle entries to episodes
    streams = drama.subtitle
      .map((sub: any, index: number) => ({
        episode: index + 1,
        streamUrl: sub.fileId ? `/api/dramanova/getvideo?fileId=${sub.fileId}` : undefined,
      }))
      .filter((s: any) => s.streamUrl);
  }

  return (
    <GenericWatchContent
      drama={drama}
      streams={streams}
      backHref={`/dramanova/${id}`}
      episode={episode || '1'}
    />
  );
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WatchContent id={id} episode={ep} />
    </Suspense>
  );
}
