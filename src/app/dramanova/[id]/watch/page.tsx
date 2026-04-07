import { Suspense } from 'react';
import { WatchClient } from '@/components/WatchClient';
import { LoadingSkeleton } from '@/components/GenericWatchPage';
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

  const detailRoot = (detailData && typeof detailData === 'object') ? (detailData as Record<string, any>) : {};
  const drama =
    (detailRoot.data && typeof detailRoot.data === 'object' ? detailRoot.data : null) ||
    (Array.isArray(detailData) ? detailData[0] : detailData);

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  // DramaNova exposes episode + fileId under data.episodes
  let streams: any[] = [];
  let episodeCount = 0;

  if (Array.isArray(drama.episodes)) {
    episodeCount = drama.episodes.length;
    streams = drama.episodes
      .map((ep: any, index: number) => ({
        episode: Number(ep?.episodeNumber) || index + 1,
        providerVideoId: ep?.fileId ? String(ep.fileId) : undefined,
      }))
      .filter((s: any) => s.providerVideoId);
  }

  return (
    <>
      {/* Video Player */}
      <WatchClient
        drama={{
          bookId: drama.dramaId || id,
          bookName: drama.title || drama.name || 'Unknown',
          coverWap: drama.posterImg || drama.posterImgUrl || drama.poster || drama.cover || drama.image || '',
          chapterCount: episodeCount,
          introduction: drama.description || drama.synopsis || 'No synopsis available',
          tags: drama.categoryNames || drama.tags || drama.genres || [],
          playCount: drama.viewCount || drama.views || '',
        }}
        streams={streams}
        initialEpisode={episode || '1'}
        backHref={`/dramanova/${id}`}
        provider="dramanova"
      />
    </>
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
