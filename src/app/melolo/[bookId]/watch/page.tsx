import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { WatchClient } from '@/components/WatchClient';
import { LoadingSkeleton } from '@/components/GenericWatchPage';
import { getMeloloDetail } from '@/lib/api';

export const revalidate = 300;

function pickMeloloDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.video_data,
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
  const rawCover =
    drama.series_cover ||
    drama.thumb_url ||
    drama.coverWap ||
    drama.cover ||
    drama.book_pic ||
    drama.first_chapter_cover ||
    drama.poster ||
    drama.image ||
    drama.book_cover ||
    drama.cover_url ||
    '';
  const normalizedCover =
    typeof rawCover === 'string'
      ? rawCover.includes('x-signature=')
        ? rawCover
        : rawCover.replace(/\.heic(\?.*)?$/i, '.jpg$1')
      : '';

  return {
    ...drama,
    bookId: drama.series_id_str || drama.bookId || drama.book_id || drama.id || '',
    bookName: drama.series_title || drama.bookName || drama.book_name || drama.book_title || drama.title || drama.name || 'Unknown',
    coverWap: normalizedCover,
    chapterCount: drama.episode_cnt || drama.chapterCount || drama.episodeCount || drama.chapter_count || drama.episode_count || 0,
    introduction:
      drama.series_intro || drama.introduction || drama.description || drama.abstract || drama.summary || drama.synopsis ||
      'No synopsis available',
    tags: drama.tags || drama.genres || drama.tag_list || drama.abstract_tags || [],
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

  const videoList = Array.isArray(dramaRaw?.video_list) ? dramaRaw.video_list : [];
  const streams = videoList
    .map((item: any, index: number) => ({
      episode: Number(item?.vid_index) || index + 1,
      providerVideoId: item?.vid ? String(item.vid) : undefined,
    }))
    .filter((item: any) => !!item.providerVideoId)
    .sort((a: any, b: any) => a.episode - b.episode);

  const chapterCount = drama.chapterCount || streams.length || 0;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        <div className="mt-8">
          <WatchClient
            drama={{
              bookId: drama.bookId || bookId,
              bookName: drama.bookName,
              coverWap: drama.coverWap,
              chapterCount,
              introduction: drama.introduction,
              tags: drama.tags,
              playCount: String(drama.series_play_cnt || ''),
            }}
            streams={streams}
            initialEpisode={episode || '1'}
            backHref={`/melolo/${bookId}`}
            provider="melolo"
            providerBookId={bookId}
          />
        </div>
      </div>
    </div>
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
